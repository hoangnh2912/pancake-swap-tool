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

export type WalletBalance = {
    address: string
    native: string
    tokens: Record<string, string>
}

type ScanParams = {
    rpcUrl: string
    tokens: Record<string, string>
    options?: { concurrency?: number; interval?: number }
    storeId: string
}

export class WalletBalanceScanner {
    private provider: ethers.providers.JsonRpcProvider
    private tokens: Record<string, string>
    private options: { concurrency: number; interval: number }
    private erc20s: Record<
        string,
        { contract: ethers.Contract; decimals: number; symbol: string }
    > = {}
    private stopped = false
    public isScanning = false

    constructor(params: ScanParams) {
        this.provider = new ethers.providers.JsonRpcProvider(params.rpcUrl)
        this.tokens = params.tokens
        this.options = {
            concurrency: params.options?.concurrency ?? 8,
            interval: params.options?.interval ?? 5000, // ms
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
    }

    stop() {
        console.log('stop scan')
        this.stopped = true
        this.isScanning = false
    }

    private async fetchBalance(addr: string): Promise<WalletBalance | null> {
        try {
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
            const hasToken = Object.values(tokensBalance).some((v) => Number.parseFloat(v) > 0)

            if (hasNative || hasToken) {
                return { address: addr, native: nativeFormatted, tokens: tokensBalance }
            }
        } catch (err) {
            console.error(`Error fetching ${addr}:`, (err as Error).message)
        }
        return null
    }

    async start() {
        if (this.isScanning) return
        console.log('start scan')
        this.stopped = false
        this.isScanning = true
        const addresses = electronAPI.readSheet('Balance')
        const balLimit = pLimit(this.options.concurrency)

        for (const addr of addresses) {
            if (this.stopped) break
            const wallet = await balLimit(() => this.fetchBalance(addr))
            electronAPI.writeBalance(wallet.address, JSON.stringify(wallet.tokens), wallet.native)
        }
        this.stop()
    }
}
