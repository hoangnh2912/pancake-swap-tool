import { notification } from 'antd/es'
import { ethers } from 'ethers'
import zenStackFunction from './zenstack-function'
import type { Prisma } from '../../prisma/client'

export type BatchProgress = {
    batchIndex: number
    totalBatches: number
    recipientCount: number
    status: 'sending' | 'confirmed' | 'error'
    txHash?: string
    error?: string
    timestamp: number
}

type ScanParams = {
    rpcUrl: string
    wallets: string[]
    fromBlock: number
    options?: { blockChunk?: number; concurrency?: number; interval?: number }
    storeId: string
    onScan?: (fromBlock: number, toBlock: number) => void
    onSave?: (transfers: TokenTransfer[]) => Promise<void>
    onBatchProgress?: (progress: BatchProgress) => void
    privateKey: string
    tokenAddress: string
    amount: string
    transferDelayMs: number
    transferBatchSize?: number
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
    private wallets: string[] = []
    private signer: ethers.Wallet
    private tokenContract: ethers.Contract
    private tokenDecimals: number
    private amount: string
    private transferDelayMs = 1 * 1000 * 60
    private transferBatchSize = 300

    // Local variables to store scan results
    private tokenTransfers: TokenTransfer[] = []

    private lastTransferUpdate = 0
    private onBatchProgress?: (progress: BatchProgress) => void

    private static singleton: WalletScanner // ①
    public static getInstance(): WalletScanner {
        // ③
        if (!WalletScanner.singleton) {
            WalletScanner.singleton = new WalletScanner()
        }
        return WalletScanner.singleton
    }

    public async save(params: ScanParams) {
        this.provider = new ethers.providers.JsonRpcProvider(params.rpcUrl)
        this.signer = new ethers.Wallet(params.privateKey, this.provider)
        this.tokenContract = new ethers.Contract(
            params.tokenAddress,
            [
                'function decimals() view returns (uint8)',
                'function transfer(address to, uint amount) returns (bool)',
                'function allowance(address owner, address spender) view returns (uint256)',
                'function approve(address spender, uint256 amount) returns (bool)',
            ],
            this.signer
        )
        this.tokenDecimals = await this.tokenContract.decimals()
        this.amount = String(params.amount)
        this.options = {
            blockChunk: params.options?.blockChunk ?? 5000,
            concurrency: params.options?.concurrency ?? 8,
            interval: params.options?.interval ?? 2000, // ms giữa mỗi vòng quét
        }
        this.wallets = params.wallets
        this.onScan = params.onScan
        this.onBatchProgress = params.onBatchProgress
        this.transferDelayMs = params.transferDelayMs
        this.transferBatchSize = params.transferBatchSize ?? 300
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
     * Clear all stored scan results
     */
    clearResults() {
        this.tokenTransfers = []
        this.currentBlock = 0
    }

    async start() {
        if (this.isScanning) return
        console.log('start scan')
        this.stopped = false
        this.isScanning = true

        // Clear previous scan results
        this.tokenTransfers = []

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
                        `Scanned [${this.currentBlock}-${end}] found ${this.tokenTransfers.length} destination addresses`
                    )
                    message.info(
                        `Quét từ block ${this.currentBlock} đến ${end}, tìm thấy ${this.tokenTransfers.length} ví nhận token`
                    )
                    await this.transferToken()
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
        await Promise.all(
            this.wallets.map((wallet) => this._scanSingleWallet(wallet, fromBlock, toBlock))
        )
    }

    private async _scanSingleWallet(wallet: string, fromBlock: number, toBlock: number) {
        try {
            const logs = await this.provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                topics: [
                    ERC20_TRANSFER_TOPIC,
                    ethers.utils.hexZeroPad(wallet, 32), // from address (indexed, position 1)
                    null, // to address (indexed, position 2) - any value
                ],
            })

            console.log(`Found ${logs.length} transfer events from wallet ${wallet}`)

            for (const log of logs) {
                try {
                    const topics = log.topics
                    const from = ethers.utils.getAddress('0x' + topics[1].slice(26))
                    const to = ethers.utils.getAddress('0x' + topics[2].slice(26))
                    const amount = ethers.BigNumber.from(log.data).toString()

                    const tokenAddress = log.address

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
            console.error(`Error scanning wallet ${wallet} [${fromBlock}-${toBlock}]:`, err)
            throw err
        }
    }

    /**
     * Transfer ERC20 token to all destination wallets that not yet received tokens
     * Ensures a delay between transfers to avoid spamming the network
     * Using Disperse contract for batch transfers, with disperseTokenSimple method
     */
    private async transferToken() {
        const now = Date.now()
        if (now - this.lastTransferUpdate < this.transferDelayMs) {
            console.log('Waiting before next transfer batch...')
            return
        }
        this.lastTransferUpdate = now

        const disperseAbi = [
            'function disperseTokenSimple(address token, address[] recipients, uint256 amount) public payable',
        ]
        const disperseAddress = '0xD152f549545093347A162Dce210e7293f1452150' // Disperse.app contract
        const disperseContract = new ethers.Contract(disperseAddress, disperseAbi, this.signer)

        const data = await zenStackFunction<
            Prisma.ScanWalletFindManyArgs,
            Prisma.ScanWalletGetPayload<{}>[]
        >('ScanWallet', 'findMany', {
            where: {
                wallet: { in: this.wallets },
                isTransferred: false,
            },
            select: {
                destination: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const BATCH_SIZE = this.transferBatchSize
        const allRecipients = [
            ...new Set(data.map((item) => item.destination).filter((d): d is string => d !== null)),
        ]
        if (allRecipients.length === 0) {
            console.log('No destination wallets to transfer tokens to.')
            return
        }

        const batches: string[][] = []
        for (let i = 0; i < allRecipients.length; i += BATCH_SIZE) {
            batches.push(allRecipients.slice(i, i + BATCH_SIZE))
        }
        console.log(
            `Transferring tokens to ${allRecipients.length} destination wallets in ${batches.length} batch(es)...`
        )

        try {
            const approval = await this.tokenContract.allowance(
                this.signer.address,
                disperseAddress
            )
            const totalAmount = ethers.utils
                .parseUnits(this.amount, this.tokenDecimals)
                .mul(allRecipients.length)
            if (approval.lt(totalAmount)) {
                console.log('Approving tokens for Disperse contract...')
                const approveTx = await this.tokenContract.approve(
                    disperseAddress,
                    ethers.constants.MaxUint256,
                    {
                        gasPrice: 50000000,
                    }
                )
                console.log('Approval transaction sent:', approveTx.hash)
                message.success(`Đã gửi giao dịch phê duyệt token: ${approveTx.hash}`)
                await approveTx.wait()
                console.log('Approval transaction confirmed')
                message.success('Giao dịch phê duyệt token đã được xác nhận')
            }

            for (let i = 0; i < batches.length; i++) {
                const recipients = batches[i]
                console.log(
                    `Sending batch ${i + 1}/${batches.length} with ${recipients.length} recipients...`
                )
                let tx: any
                try {
                    tx = await disperseContract.disperseTokenSimple(
                        this.tokenContract.address,
                        recipients,
                        ethers.utils.parseUnits(this.amount, this.tokenDecimals),
                        {
                            gasPrice: 50000000,
                        }
                    )
                } catch (err) {
                    this.onBatchProgress?.({
                        batchIndex: i + 1,
                        totalBatches: batches.length,
                        recipientCount: recipients.length,
                        status: 'error',
                        error: err instanceof Error ? err.message : 'Unknown error',
                        timestamp: Date.now(),
                    })
                    throw err
                }
                console.log(`Batch ${i + 1} transaction sent:`, tx.hash)
                message.success(
                    `Batch ${i + 1}/${batches.length} — Đã gửi giao dịch chuyển token: ${tx.hash}`
                )
                this.onBatchProgress?.({
                    batchIndex: i + 1,
                    totalBatches: batches.length,
                    recipientCount: recipients.length,
                    status: 'sending',
                    txHash: tx.hash,
                    timestamp: Date.now(),
                })
                await tx.wait()
                await zenStackFunction<Prisma.ScanWalletUpdateManyArgs>(
                    'ScanWallet',
                    'updateMany',
                    {
                        where: {
                            destination: {
                                in: recipients,
                            },
                        },
                        data: {
                            isTransferred: true,
                        },
                    }
                )
                console.log(`Batch ${i + 1} confirmed`)
                message.success(
                    `Batch ${i + 1}/${batches.length} — Giao dịch chuyển token đã được xác nhận`
                )
                this.onBatchProgress?.({
                    batchIndex: i + 1,
                    totalBatches: batches.length,
                    recipientCount: recipients.length,
                    status: 'confirmed',
                    txHash: tx.hash,
                    timestamp: Date.now(),
                })
            }
        } catch (err) {
            console.error('Error during token disperse:', err)
            message.error(
                `Lỗi trong quá trình chuyển token: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
        }
    }
}
