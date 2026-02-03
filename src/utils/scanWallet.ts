import { notification } from 'antd/es'
import { ethers } from 'ethers'

type ScanParams = {
    rpcUrl: string
    wallet: string
    fromBlock: number
    options?: { blockChunk?: number; concurrency?: number; interval?: number }
    storeId: string
    onScan?: (fromBlock: number, toBlock: number) => void
    onSave?: (transfers: TokenTransfer[]) => Promise<void>
}

type TokenTransfer = {
    blockNumber: number
    transactionHash: string
    tokenAddress: string
    from: string
    to: string
    amount: string
    decimals?: number
}

type WalletScanResult = {
    destinationWallets: Set<string>
    tokenTransfers: TokenTransfer[]
    uniqueTokens: Set<string>
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const message = {
    success: (content: string) => notification.success({ message: content, duration: 2 }),
    error: (content: string) => notification.error({ message: content, duration: 4 }),
    info: (content: string) => notification.info({ message: content, duration: 2 }),
}

const ERC20_TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)'
const ERC20_TRANSFER_TOPIC = ethers.utils.id(ERC20_TRANSFER_EVENT_SIGNATURE)

export class WalletScanner {
    private provider: ethers.providers.JsonRpcProvider
    private options?: { blockChunk: number; concurrency: number; interval: number }
    private onScan?: (fromBlock: number, toBlock: number) => void
    private onSave?: (transfers: TokenTransfer[]) => Promise<void>
    private stopped = false
    public isScanning = false
    private currentBlock = 0
    private wallet: string

    // Local variables to store scan results
    private destinationWallets: Set<string> = new Set()
    private tokenTransfers: TokenTransfer[] = []
    private uniqueTokens: Set<string> = new Set()

    private static singleton: WalletScanner // ①
    public static getInstance(): WalletScanner {
        // ③
        if (!WalletScanner.singleton) {
            WalletScanner.singleton = new WalletScanner()
        }
        return WalletScanner.singleton
    }

    public save(params: ScanParams) {
        this.provider = new ethers.providers.JsonRpcProvider(params.rpcUrl)
        this.options = {
            blockChunk: params.options?.blockChunk ?? 5000,
            concurrency: params.options?.concurrency ?? 8,
            interval: params.options?.interval ?? 2000, // ms giữa mỗi vòng quét
        }
        this.wallet = params.wallet
        this.onScan = params.onScan
        this.currentBlock = params.fromBlock ?? 0
        this.onSave = params.onSave
        message.success('Cấu hình scanner đã được lưu')
        return WalletScanner.singleton
    }

    stop() {
        console.log('stop scan')
        this.stopped = true
        this.isScanning = false
    }

    /**
     * Get all destination wallets that received tokens from the scanned wallet
     */
    getDestinationWallets(): string[] {
        return Array.from(this.destinationWallets)
    }

    /**
     * Get all token transfer events
     */
    getTokenTransfers(): TokenTransfer[] {
        return [...this.tokenTransfers]
    }

    /**
     * Get all unique token addresses involved in transfers
     */
    getUniqueTokens(): string[] {
        return Array.from(this.uniqueTokens)
    }

    /**
     * Get scan results as an object
     */
    getScanResults(): WalletScanResult {
        return {
            destinationWallets: new Set(this.destinationWallets),
            tokenTransfers: [...this.tokenTransfers],
            uniqueTokens: new Set(this.uniqueTokens),
        }
    }

    /**
     * Clear all stored scan results
     */
    clearResults() {
        this.destinationWallets.clear()
        this.tokenTransfers = []
        this.uniqueTokens.clear()
        this.currentBlock = 0
    }

    async start() {
        if (this.isScanning) return
        console.log('start scan')
        this.stopped = false
        this.isScanning = true

        // Clear previous scan results
        this.destinationWallets.clear()
        this.tokenTransfers = []
        this.uniqueTokens.clear()

        const blockChunk = this.options?.blockChunk || 5000
        const concurrency = this.options?.concurrency || 8

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

                    // Get all ERC20 Transfer events from this wallet
                    await this.scanERC20Transfers(this.currentBlock, end)
                    await this.onSave?.(this.tokenTransfers)
                    console.log(
                        `Scanned [${this.currentBlock}-${end}] found ${this.destinationWallets.size} destination addresses`
                    )
                    message.info(
                        `Quét từ block ${this.currentBlock} đến ${end}, tìm thấy ${this.destinationWallets.size} ví nhận token, ${this.uniqueTokens.size} token khác nhau`
                    )
                    this.clearResults()
                    this.currentBlock = end + 1
                }
            } catch (err) {
                message.error(
                    `Lỗi trong quá trình quét: ${err instanceof Error ? err.message : 'Unknown error'}`
                )
                console.error('Loop error:', (err as Error).message)
            }

            // nghỉ một chút rồi scan tiếp
            if (!this.stopped) {
                await sleep(this.options?.interval || 1000)
            }
        }

        console.log('Scanner stopped')
        this.isScanning = false
    }

    /**
     * Scan for ERC20 Transfer events in the block range
     * Extracts all token transfers from the wallet address
     * Populates: destinationWallets, tokenTransfers, uniqueTokens
     */
    private async scanERC20Transfers(fromBlock: number, toBlock: number) {
        try {
            // Query all logs matching the Transfer event signature
            // where the wallet is the 'from' address (indexed topic at position 1)
            const logs = await this.provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                topics: [
                    ERC20_TRANSFER_TOPIC,
                    ethers.utils.hexZeroPad(this.wallet, 32), // from address (indexed, position 1)
                    null, // to address (indexed, position 2) - any value
                ],
            })

            console.log(`Found ${logs.length} transfer events from wallet ${this.wallet}`)

            // Process each transfer event
            for (const log of logs) {
                try {
                    // Decode the Transfer event
                    // Transfer(address indexed from, address indexed to, uint256 value)
                    const topics = log.topics
                    const from = ethers.utils.getAddress('0x' + topics[1].slice(26)) // Remove '0x' and take last 40 chars
                    const to = ethers.utils.getAddress('0x' + topics[2].slice(26))
                    const amount = ethers.BigNumber.from(log.data).toString()

                    const tokenAddress = log.address

                    // Add destination wallet to set
                    this.destinationWallets.add(to)
                    this.uniqueTokens.add(tokenAddress)

                    // Store the transfer details
                    const transfer: TokenTransfer = {
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash,
                        tokenAddress: tokenAddress,
                        from: from,
                        to: to,
                        amount: amount,
                    }

                    this.tokenTransfers.push(transfer)

                    console.log(
                        `Transfer: ${transfer.from} -> ${transfer.to} | Token: ${tokenAddress} | Amount: ${amount}`
                    )
                } catch (err) {
                    console.warn('Error parsing transfer log:', err)
                }
            }
        } catch (err) {
            console.error(`Error scanning ERC20 transfers [${fromBlock}-${toBlock}]:`, err)
            throw err
        }
    }
}
