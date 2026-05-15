import { ethers } from 'ethers'
import { ERC20_ABI, ROUTER_PANCAKE_V2_ABI } from './abi'

const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

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

    for (const token of params.tokens) {
        onLog(`\n=== Token: ${token.name} (decimal=${token.decimal}) ===`)
        updateStatus(token.id, 'running')

        let currentStep = 0

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
            const deployed = await factory.deploy()
            await deployed.deployed()
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
                params.chainId
            )
            await tx.wait()
            onLog(`[1] ✓ initialize | tx: ${tx.hash}`)

            onStepChange(token.id, 0, 'finish')

            // ── Step 2: Set Whitelist cho ví swap ──────────────────────────
            currentStep = 1
            onStepChange(token.id, 1, 'process')

            onLog(`[2] setW(${swapWallet.address})`)
            tx = await deployed.setW(swapWallet.address)
            await tx.wait()
            onLog(`[2] ✓ Whitelist set | tx: ${tx.hash}`)

            onStepChange(token.id, 1, 'finish')

            // ── Step 3: Mint/transfer token cho ví mint ────────────────────
            currentStep = 2
            onStepChange(token.id, 2, 'process')

            onLog(`[3] transfer(mintWallet, ${token.mintAmount} tokens)`)
            tx = await deployed.transfer(mintWallet.address, mintAmtRaw)
            await tx.wait()
            onLog(`[3] ✓ Minted to mint wallet | tx: ${tx.hash}`)

            onStepChange(token.id, 2, 'finish')

            // ── Step 4: Add Liquidity với BNB ──────────────────────────────
            currentStep = 3
            onStepChange(token.id, 3, 'process')

            onLog('[4] approve(PancakeRouter)')
            const erc20 = new ethers.Contract(contractAddress, ERC20_ABI, mainWallet)
            tx = await erc20.approve(PANCAKE_ROUTER, liqTokenRaw)
            await tx.wait()
            onLog(`[4] ✓ Approved | tx: ${tx.hash}`)

            const deadline = Math.floor(Date.now() / 1000) + 600
            onLog(`[4] addLiquidityETH(${token.liquidityToken} tokens + ${token.liquidityBNB} BNB)`)
            const router = new ethers.Contract(PANCAKE_ROUTER, ROUTER_PANCAKE_V2_ABI, mainWallet)
            tx = await router.addLiquidityETH(
                contractAddress,
                liqTokenRaw,
                0,
                0,
                mainWallet.address,
                deadline,
                { value: liqBNB }
            )
            await tx.wait()
            onLog(`[4] ✓ Liquidity added | tx: ${tx.hash}`)

            onStepChange(token.id, 3, 'finish')

            onLog(`=== ✓ Token "${token.name}" hoàn thành! Contract: ${contractAddress} ===`)
            updateStatus(token.id, 'success', contractAddress)
        } catch (err: any) {
            const errMsg = err.reason || err.error?.message || err.message || 'Unknown error'
            onStepChange(token.id, currentStep, 'error')
            onLog(`=== ✗ Token "${token.name}" thất bại tại step ${currentStep + 1}: ${errMsg} ===`)
            updateStatus(token.id, 'error', undefined, errMsg)
        }
    }

    onLog('\n✓ Automation hoàn thành!')
}
