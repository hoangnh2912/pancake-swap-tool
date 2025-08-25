import { message } from 'antd/es'
import { ethers } from 'ethers'
import pLimit from 'p-limit'
import { electronAPI } from './constants'

const ERC20_ABI = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'initialSupply',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'allowance',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'needed',
                type: 'uint256',
            },
        ],
        name: 'ERC20InsufficientAllowance',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'needed',
                type: 'uint256',
            },
        ],
        name: 'ERC20InsufficientBalance',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'approver',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidApprover',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'receiver',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidReceiver',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidSender',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidSpender',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]

const AIRDROP_ABI = [
    {
        constant: false,
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'recipients', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
        ],
        name: 'disperseTokenSimple',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'recipients', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
        ],
        name: 'disperseToken',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'recipients', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
        ],
        name: 'disperseEther',
        outputs: [],
        payable: true,
        stateMutability: 'payable',
        type: 'function',
    },
] as const
export type WalletBalanceAirdrop = {
    address: string
    native: string
    tokens: Record<string, string>
    airdrop: boolean
}

type ScanParams = {
    rpcUrl: string
    contractAddress: string
    fromBlock: number
    airdropAmount: number
    airdropToken: string
    tokens: Record<string, string>
    options?: { blockChunk?: number; concurrency?: number; interval?: number }
    storeId: string
    onScan?: (fromBlock: number, toBlock: number) => void
    privateKeySigner: string
    isAirdrop: boolean
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class ContractScanner {
    private provider: ethers.providers.JsonRpcProvider
    private contractAddress: string
    private tokens: Record<string, string>
    private options: { blockChunk: number; concurrency: number; interval: number }
    private onScan?: (fromBlock: number, toBlock: number) => void
    private airdropContract: ethers.Contract
    private airdropTokenContract: ethers.Contract

    private erc20s: Record<
        string,
        { contract: ethers.Contract; decimals: number; symbol: string }
    > = {}
    private stopped = false
    public isScanning = false
    private currentBlock = 0
    private airdropAmount: number
    private airdropToken: string
    private signer: ethers.Signer
    private isAirdrop: boolean

    constructor(params: ScanParams) {
        this.provider = new ethers.providers.JsonRpcProvider(params.rpcUrl)
        this.contractAddress = params.contractAddress
        this.tokens = params.tokens
        this.options = {
            blockChunk: params.options?.blockChunk ?? 5000,
            concurrency: params.options?.concurrency ?? 8,
            interval: params.options?.interval ?? 2000, // ms giữa mỗi vòng quét
        }
        this.signer = params.privateKeySigner
            ? new ethers.Wallet(params.privateKeySigner, this.provider)
            : undefined
        this.onScan = params.onScan
        this.currentBlock = params.fromBlock ?? 0
        this.airdropContract = new ethers.Contract(
            '0xD152f549545093347A162Dce210e7293f1452150',
            AIRDROP_ABI,
            this.signer
        )
        this.airdropTokenContract = params.airdropToken
            ? new ethers.Contract(params.airdropToken, ERC20_ABI, this.signer)
            : undefined
        this.airdropAmount = params.airdropAmount
        this.airdropToken = params.airdropToken
        this.isAirdrop = params.isAirdrop
    }

    public async approveAirdrop() {
        if (!this.isAirdrop) return
        try {
            const res = await this.airdropTokenContract.approve(
                this.airdropContract.address,
                ethers.constants.MaxUint256,
                {
                    gasPrice: ethers.utils.parseUnits('0.1', 'gwei'),
                }
            )
            await res.wait()
            console.log('Airdrop token approved')
            message.success(`Phê duyệt token airdrop thành công: ${res.hash}`)
            return ethers.utils.formatUnits(
                ethers.constants.MaxUint256,
                await this.airdropTokenContract.decimals()
            )
        } catch (error) {
            console.error('Airdrop token approval failed:', error)
            message.error(
                `Phê duyệt token airdrop thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
            return
        }
    }

    private async doAirdrop() {
        if (!this.isAirdrop) return
        const wallets = await electronAPI.readSheet(this.airdropToken)
        if (wallets.length === 0) return
        message.info(`Bắt đầu airdrop cho ${wallets.length} ví`)
        const receivers = wallets.map((w) => w)
        try {
            const decimals = await this.airdropTokenContract.decimals()
            console.log(`Airdrop ${receivers.length} wallets...`)
            const tx = await this.airdropContract.disperseTokenSimple(
                this.airdropToken,
                receivers,
                new Array(receivers.length).fill(
                    ethers.utils.parseUnits(this.airdropAmount.toString(), decimals)
                ),
                {
                    gasPrice: ethers.utils.parseUnits('0.1', 'gwei'),
                }
            )
            await tx.wait()
            console.log('Airdrop done:', tx.hash)
            message.success(`Airdrop thành công: ${tx.hash}, cho ${wallets.length} ví`)
            for (const element of wallets) {
                electronAPI.writeSheet(this.airdropToken, element, '', 'TRUE')
            }
        } catch (err) {
            message.error(
                `Airdrop thất bại: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
            console.error('Airdrop failed:', err)
        }
    }
    async initTokens() {
        console.log('init tokens')
        for (const [sym, addr] of Object.entries(this.tokens)) {
            if (!ethers.utils.isAddress(addr)) continue
            const c = new ethers.Contract(addr, ERC20_ABI, this.provider)
            let decimals = 18
            let symbol = sym
            try {
                decimals = await c.decimals()
            } catch {}
            try {
                symbol = await c.symbol()
            } catch {}
            this.erc20s[sym] = { contract: c, decimals, symbol }
        }
        if (this.airdropToken) {
            const allowance = await this.airdropTokenContract.allowance(
                await this.signer.getAddress(),
                this.airdropContract.address
            )
            return ethers.utils.formatUnits(allowance, await this.airdropTokenContract.decimals())
        }
        return
    }

    stop() {
        console.log('stop scan')
        this.stopped = true
        this.isScanning = false
    }

    async start() {
        if (this.isScanning) return
        console.log('start scan')
        this.stopped = false
        this.isScanning = true

        const blockChunk = this.options.blockChunk
        const concurrency = this.options.concurrency

        while (!this.stopped) {
            try {
                const latest = await this.provider.getBlockNumber()

                if (this.currentBlock === 0) {
                    this.currentBlock = latest // skip lịch sử, chỉ bắt đầu từ block hiện tại
                }

                while (this.currentBlock <= latest && !this.stopped) {
                    const end = Math.min(this.currentBlock + blockChunk - 1, latest)
                    console.log(`Scanning [${this.currentBlock}-${end}]`)
                    message.info(`Bắt đầu quét từ block ${this.currentBlock} đến ${end}`)
                    this.onScan?.(this.currentBlock, end)
                    const counterparties = new Set<string>()
                    const txLimit = pLimit(concurrency)

                    await Promise.all(
                        new Array(end - this.currentBlock + 1).fill(0).map((_, i) =>
                            txLimit(async () => {
                                const block = await this.provider.getBlockWithTransactions(
                                    this.currentBlock + i
                                )
                                for (const tx of block.transactions) {
                                    if (
                                        tx.to?.toLowerCase() ===
                                            this.contractAddress.toLowerCase() &&
                                        (await electronAPI.checkSheet(
                                            tx.from.toLowerCase(),
                                            this.airdropToken
                                                ? this.airdropToken
                                                : `ct_${this.contractAddress}`
                                        ))
                                    ) {
                                        counterparties.add(tx.from.toLowerCase())
                                    }
                                }
                            })
                        )
                    )
                    console.log(
                        `Scanned [${this.currentBlock}-${end}] found ${counterparties.size} addresses`
                    )
                    message.info(
                        `Quét từ block ${this.currentBlock} đến ${end}, tìm thấy ${counterparties.size} ví, đang tiến hành quét balance`
                    )
                    // Balance scan
                    const balLimit = pLimit(concurrency)
                    await Promise.all(
                        Array.from(counterparties).map((addr) =>
                            balLimit(async () => {
                                if (this.stopped) return
                                if (this.isAirdrop) {
                                    const isAirdropped = await this.airdropContract.sended(
                                        addr,
                                        this.airdropToken
                                    )
                                    if (isAirdropped) return
                                }
                                const nativeWei = await this.provider.getBalance(addr)
                                const tokensBalance: Record<string, string> = {}

                                for (const [sym, t] of Object.entries(this.erc20s)) {
                                    let bn = ethers.constants.Zero
                                    try {
                                        bn = await t.contract.balanceOf(addr)
                                    } catch {}
                                    tokensBalance[sym] = ethers.utils.formatUnits(bn, t.decimals)
                                }

                                const nativeFormatted = ethers.utils.formatEther(nativeWei)
                                const hasNative = !nativeWei.isZero()
                                const hasToken = Object.values(tokensBalance).some(
                                    (v) => Number.parseFloat(v) > 0
                                )

                                if (hasNative || hasToken) {
                                    const wallet: WalletBalanceAirdrop = {
                                        address: addr,
                                        native: nativeFormatted,
                                        tokens: tokensBalance,
                                        airdrop: false,
                                    }
                                    electronAPI.writeSheet(
                                        this.isAirdrop
                                            ? this.airdropToken
                                            : `ct_${this.contractAddress}`,
                                        wallet.address,
                                        wallet.native,
                                        wallet.airdrop ? 'TRUE' : 'FALSE'
                                    )
                                }
                            })
                        )
                    )

                    this.currentBlock = end + 1
                }
            } catch (err) {
                console.error('Loop error:', (err as Error).message)
            }

            // nghỉ một chút rồi scan tiếp
            if (!this.stopped) {
                await this.doAirdrop()
                await sleep(this.options.interval)
            }
        }

        console.log('Scanner stopped')
        this.isScanning = false
    }
}
