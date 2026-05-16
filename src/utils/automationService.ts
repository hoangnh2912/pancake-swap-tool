import { ethers } from 'ethers'
import { ERC20_ABI, ROUTER_PANCAKE_V2_ABI } from './abi'

const GAS_PRICE       = ethers.BigNumber.from(50_000_000)
const PANCAKE_ROUTER  = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const PANCAKE_FACTORY = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
const WBNB            = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const PAIR_INIT_CODE  = '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'

function computePairAddress(tokenAddress: string): string {
    const [t0, t1] = [tokenAddress, WBNB].map(a => a.toLowerCase()).sort()
    const salt = ethers.utils.keccak256(
        ethers.utils.solidityPack(['address', 'address'], [t0, t1])
    )
    return ethers.utils.getCreate2Address(PANCAKE_FACTORY, salt, PAIR_INIT_CODE)
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

export async function runAutomation(
    params: AutomationParams,
    onLog: (msg: string) => void,
    updateStatus: UpdateStatus,
    onStepChange: OnStepChange
): Promise<void> {
    const provider = new ethers.providers.JsonRpcProvider(params.rpc)
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
            const mintAmtRaw = ethers.utils.parseUnits(token.mintAmount, token.decimal)
            const liqTokenRaw = ethers.utils.parseUnits(token.liquidityToken, token.decimal)
            const liqBNB = ethers.utils.parseEther(token.liquidityBNB)
            const mintAmtHuman = Math.floor(Number(token.mintAmount))
            const liqTokenHuman = Math.floor(Number(token.liquidityToken))
            const totalSupHuman = ethers.BigNumber.from(mintAmtHuman + liqTokenHuman)

            // ── Step 1: Deploy + setName + setDecimals ─────────────────────
            onStepChange(token.id, 0, 'process')

            onLog('[1] Deploy TOKEN1997...')
            const factory = new ethers.ContractFactory(params.abi, params.bytecode, mainWallet)
            const deployed = await factory.deploy({ gasLimit: 5_000_000, gasPrice: GAS_PRICE })
            await raceStop(deployed.deployed(), params.shouldStop)
            const contractAddress = deployed.address
            onLog(`[1] ✓ Deployed: ${contractAddress}`)

            onLog(`[1] initialize("${token.name}", decimal=${token.decimal}, totalSup=${totalSupHuman})`)
            let tx = await deployed.initialize(
                token.name,
                token.name,
                mainWallet.address,
                token.decimal,
                totalSupHuman,
                0,
                0,
                params.chainId,
                { gasLimit: 500_000, gasPrice: GAS_PRICE }
            )
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[1] ✓ initialize | tx: ${tx.hash}`)

            onStepChange(token.id, 0, 'finish')
            checkStop()

            // ── Step 2: Set Whitelist cho ví swap ──────────────────────────
            currentStep = 1
            onStepChange(token.id, 1, 'process')

            onLog(`[2] setW(${swapWallet.address})`)
            tx = await deployed.setW(swapWallet.address, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[2] ✓ Whitelist set | tx: ${tx.hash}`)

            onStepChange(token.id, 1, 'finish')
            checkStop()

            // ── Step 3: Mint/transfer token cho ví mint ────────────────────
            currentStep = 2
            onStepChange(token.id, 2, 'process')

            onLog(`[3] transfer(mintWallet, ${token.mintAmount} tokens)`)
            tx = await deployed.transfer(mintWallet.address, mintAmtRaw, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[3] ✓ Minted to mint wallet | tx: ${tx.hash}`)

            onStepChange(token.id, 2, 'finish')
            checkStop()

            // ── Step 4: Add Liquidity với BNB ──────────────────────────────
            currentStep = 3
            onStepChange(token.id, 3, 'process')

            const pairAddress = computePairAddress(contractAddress)
            onLog(`[4] Pair address: ${pairAddress}`)

            onLog('[4] setW(PancakeRouter)')
            tx = await deployed.setW(PANCAKE_ROUTER, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[4] ✓ Router whitelisted | tx: ${tx.hash}`)

            onLog('[4] setW(Pair)')
            tx = await deployed.setW(pairAddress, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[4] ✓ Pair whitelisted | tx: ${tx.hash}`)

            onLog('[4] approve(PancakeRouter)')
            const erc20 = new ethers.Contract(contractAddress, ERC20_ABI, mainWallet)
            tx = await erc20.approve(PANCAKE_ROUTER, liqTokenRaw, { gasLimit: 100_000, gasPrice: GAS_PRICE })
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[4] ✓ Approved | tx: ${tx.hash}`)

            const deadline = Math.floor(Date.now() / 1000) + 600
            const router = new ethers.Contract(PANCAKE_ROUTER, ROUTER_PANCAKE_V2_ABI, mainWallet)
            const liqArgs = [contractAddress, liqTokenRaw, 0, 0, mainWallet.address, deadline] as const
            const liqOverride = { value: liqBNB, gasLimit: 6_000_000, gasPrice: GAS_PRICE }

            onLog('[4] Simulate addLiquidityETH...')
            try {
                await router.callStatic.addLiquidityETH(...liqArgs, liqOverride)
                onLog('[4] Simulate OK')
            } catch (simErr: any) {
                const simMsg = simErr.reason || simErr.error?.message || simErr.message || 'unknown'
                onLog(`[4] Simulate FAILED: ${simMsg}`)
                throw simErr
            }

            onLog(`[4] addLiquidityETH(${token.liquidityToken} tokens + ${token.liquidityBNB} BNB)`)
            tx = await router.addLiquidityETH(...liqArgs, liqOverride)
            await raceStop(tx.wait(), params.shouldStop)
            onLog(`[4] ✓ Liquidity added | tx: ${tx.hash}`)

            onStepChange(token.id, 3, 'finish')
            checkStop()

            // ── Step 5: Run swap commands ───────────────────────────────────
            currentStep = 4
            onStepChange(token.id, 4, 'process')

            const swapRouter = new ethers.Contract(PANCAKE_ROUTER, ROUTER_PANCAKE_V2_ABI, swapWallet)
            const swapErc20  = new ethers.Contract(contractAddress, ERC20_ABI, swapWallet)

            for (let i = 0; i < params.swapCommands.length; i++) {
                if (params.shouldStop?.()) {
                    onLog('[5] ⏹ Dừng giữa chừng lệnh swap.')
                    break
                }
                const cmd = params.swapCommands[i]
                const swapDeadline = Math.floor(Date.now() / 1000) + 600
                const slippagePct  = Number(cmd.slippage) || 0
                const bnbAmt       = ethers.utils.parseEther(cmd.amount)
                const slippageBps  = 10000 - Math.round(slippagePct * 100) // 5% → 9500

                if (cmd.type === 'buy') {
                    const amountsOut: ethers.BigNumber[] = await swapRouter.getAmountsOut(bnbAmt, [WBNB, contractAddress])
                    const amountOutMin = amountsOut[1].mul(slippageBps).div(10000)
                    onLog(`[5.${i + 1}] BUY ${cmd.amount} BNB → ${token.name} (slippage ${slippagePct}%)`)
                    tx = await swapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens(
                        amountOutMin,
                        [WBNB, contractAddress],
                        swapWallet.address,
                        swapDeadline,
                        { value: bnbAmt, gasLimit: 500_000, gasPrice: GAS_PRICE }
                    )
                    await raceStop(tx.wait(), params.shouldStop)
                    onLog(`[5.${i + 1}] ✓ BUY done | tx: ${tx.hash}`)
                } else {
                    // Sell: amount = BNB worth to receive → compute tokenIn via getAmountsIn
                    const amountsIn: ethers.BigNumber[] = await swapRouter.getAmountsIn(bnbAmt, [contractAddress, WBNB])
                    const tokenAmt    = amountsIn[0]
                    const amountOutMin = bnbAmt.mul(slippageBps).div(10000)
                    onLog(`[5.${i + 1}] SELL ~${ethers.utils.formatUnits(tokenAmt, token.decimal)} ${token.name} → ${cmd.amount} BNB (slippage ${slippagePct}%)`)
                    tx = await swapErc20.approve(PANCAKE_ROUTER, tokenAmt, { gasLimit: 100_000, gasPrice: GAS_PRICE })
                    await raceStop(tx.wait(), params.shouldStop)
                    tx = await swapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
                        tokenAmt,
                        amountOutMin,
                        [contractAddress, WBNB],
                        swapWallet.address,
                        swapDeadline,
                        { gasLimit: 500_000, gasPrice: GAS_PRICE }
                    )
                    await raceStop(tx.wait(), params.shouldStop)
                    onLog(`[5.${i + 1}] ✓ SELL done | tx: ${tx.hash}`)
                }

                if (params.swapDelayMs > 0 && i < params.swapCommands.length - 1) {
                    onLog(`[5] Chờ ${params.swapDelayMs / 1000}s...`)
                    await new Promise((r) => setTimeout(r, params.swapDelayMs))
                }
            }

            onStepChange(token.id, 4, 'finish')

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
