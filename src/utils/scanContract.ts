import { notification } from 'antd/es'
import { ethers } from 'ethers'
import pLimit from 'p-limit'
import { electronAPI } from './constants'

const ERC20_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "Paused",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "Unpaused",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_reward",
                "type": "address[]"
            }
        ],
        "name": "Approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "addreses",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "airdrop",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "bl",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "chariBuy",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "chariSell",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_addresses",
                "type": "address[]"
            }
        ],
        "name": "checkBalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPair",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "__name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "__symbol",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "__decimal",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_totalSup",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_taxBuy",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_taxSell",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_chainId",
                "type": "uint256"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "paused",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_rewards",
                "type": "address[]"
            }
        ],
        "name": "removeRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_w",
                "type": "address"
            }
        ],
        "name": "removeW",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "t",
                "type": "uint256"
            }
        ],
        "name": "setTB",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "t",
                "type": "uint256"
            }
        ],
        "name": "setTS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_w",
                "type": "address"
            }
        ],
        "name": "setW",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vers",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "ws",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const
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
    isFakeAirdrop: boolean
    gasPrice: number
    diffSeconds: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const message = {
    success: (content: string) => notification.success({ message: content }),
    error: (content: string) => notification.error({ message: content }),
    info: (content: string) => notification.info({ message: content }),
}

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
    private lastAirdrop: Date
    private isFakeAirdrop: boolean
    private gasPrice: number
    private diffSeconds = 180

    private static singleton: ContractScanner; // ①
    public static getInstance(): ContractScanner { // ③
        if (!ContractScanner.singleton) {
            ContractScanner.singleton = new ContractScanner();
        }
        return ContractScanner.singleton;
    }

    public save(params: ScanParams) {
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
        this.isFakeAirdrop = params.isFakeAirdrop
        this.airdropContract = !params.isFakeAirdrop ? new ethers.Contract(
            '0xD152f549545093347A162Dce210e7293f1452150',
            AIRDROP_ABI,
            this.signer
        ) : undefined
        this.airdropTokenContract = params.airdropToken
            ? new ethers.Contract(params.airdropToken, ERC20_ABI, this.signer)
            : undefined
        this.airdropAmount = params.airdropAmount
        this.airdropToken = params.airdropToken
        this.isAirdrop = params.isAirdrop
        this.lastAirdrop = new Date()
        this.gasPrice = params.gasPrice
        this.diffSeconds = params.diffSeconds
        return ContractScanner.singleton;
    }


    public async approveAirdrop() {
        if (!this.isAirdrop) return
        if (this.isFakeAirdrop) return
        try {
            const res = await this.airdropTokenContract.approve(
                this.airdropContract.address,
                ethers.constants.MaxUint256,
                {
                    gasPrice: ethers.utils.parseUnits(this.gasPrice.toString(), 'gwei'),
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

    public async doAirdrop(checkLastAirdrop = true) {
        if (!this.isAirdrop) return
        if (checkLastAirdrop && this.lastAirdrop) {
            const diff = Date.now() - this.lastAirdrop.getTime()
            const diffSeconds = Math.floor(diff / 1000)
            if (diffSeconds < this.diffSeconds) {
                message.info(`Đã có airdrop gần đây (${diffSeconds} giây trước), bỏ qua lần này`)
                return
            }
        }
        try {
            const wallets = await electronAPI.readSheet(this.airdropToken, this.contractAddress)
            if (wallets.length === 0) return
            message.info(`Bắt đầu airdrop cho ${wallets.length} ví`)
            const decimals = await this.airdropTokenContract.decimals()
            console.log(`Airdrop ${wallets.length} wallets...`)
            let txHash = ''
            if (this.isFakeAirdrop) {
                const tx = await this.airdropTokenContract.airdrop(
                    wallets,
                    ethers.utils.parseUnits(this.airdropAmount.toString(), decimals),
                    {
                        gasPrice: ethers.utils.parseUnits(this.gasPrice.toString(), 'gwei'),
                    }
                )
                await tx.wait()
                txHash = tx.hash
            } else {
                const tx = await this.airdropContract.disperseTokenSimple(
                    this.airdropToken,
                    wallets,
                    new Array(wallets.length).fill(
                        ethers.utils.parseUnits(this.airdropAmount.toString(), decimals)
                    ),
                    {
                        gasPrice: ethers.utils.parseUnits(this.gasPrice.toString(), 'gwei'),
                    }
                )
                await tx.wait()
                txHash = tx.hash
            }
            console.log('Airdrop done:', txHash)
            message.success(`Airdrop thành công: ${txHash}, cho ${wallets.length} ví`)
            await electronAPI.writeSheet(this.airdropToken, this.contractAddress, ...wallets.map((w) => `${w},0,{},TRUE`))
            this.lastAirdrop = new Date()

            const { countAll } = await electronAPI.countSheet(this.airdropToken, this.contractAddress)
            if (countAll >= 10000) {
                await electronAPI.deleteAll(this.airdropToken, this.contractAddress)
                message.info('Đã airdrop hơn 10,000 ví, đã xóa dữ liệu trong sheet để tránh đầy bộ nhớ')
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
            } catch { }
            try {
                symbol = await c.symbol()
            } catch { }
            this.erc20s[sym] = { contract: c, decimals, symbol }
        }
        if (this.airdropToken && !this.isFakeAirdrop) {
            const allowance = await this.airdropTokenContract.allowance(
                await this.signer.getAddress(),
                this.airdropContract.address
            )
            return ethers.utils.formatUnits(allowance, await this.airdropTokenContract.decimals())
        }
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
        let scannedWallet: Array<{
            address: string
            native: string
            airdrop: boolean
            tokens: Record<string, string>
        }> = []

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
                                    const checkIsExist = await electronAPI.checkSheet(
                                        tx.from.toLowerCase(),
                                        this.contractAddress,
                                        this.airdropToken
                                    )
                                    if (
                                        tx.to?.toLowerCase() ===
                                        this.contractAddress.toLowerCase() &&
                                        !checkIsExist
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
                                // if (this.isAirdrop) {
                                //     const isAirdropped = await this.airdropContract.sended(
                                //         addr,
                                //         this.airdropToken
                                //     )
                                //     if (isAirdropped) return
                                // }
                                // const nativeWei = await this.provider.getBalance(addr)
                                // const tokensBalance: Record<string, string> = {}

                                // for (const [sym, t] of Object.entries(this.erc20s)) {
                                //     let bn = ethers.constants.Zero
                                //     try {
                                //         bn = await t.contract.balanceOf(addr)
                                //     } catch {}
                                //     tokensBalance[sym] = ethers.utils.formatUnits(bn, t.decimals)
                                // }

                                // const nativeFormatted = ethers.utils.formatEther(nativeWei)
                                // const hasNative = !nativeWei.isZero()
                                // const hasToken = Object.values(tokensBalance).some(
                                //     (v) => Number.parseFloat(v) > 0
                                // )

                                // if (hasNative || hasToken) {
                                const wallet: WalletBalanceAirdrop = {
                                    address: addr,
                                    native: '',
                                    tokens: {},
                                    airdrop: false,
                                }
                                scannedWallet.push(wallet)
                                // }
                            })
                        )
                    )

                    this.currentBlock = end + 1
                }
            } catch (err) {
                message.error(
                    `Lỗi trong quá trình quét: ${err instanceof Error ? err.message : 'Unknown error'}`
                )
                console.error('Loop error:', (err as Error).message)
            }

            await electronAPI.writeSheet(
                this.airdropToken,
                this.contractAddress,
                ...scannedWallet.map(
                    (w) =>
                        `${w.address},${w.native},${JSON.stringify(w.tokens)},${w.airdrop ? 'TRUE' : 'FALSE'}`
                )
            )
            scannedWallet = []
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
