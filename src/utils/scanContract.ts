import { ethers } from "ethers";
import pLimit from "p-limit";

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
];

export type WalletBalance = {
    address: string;
    native: string;
    tokens: Record<string, string>;
};

type ScanParams = {
    rpcUrl: string;
    contractAddress: string;
    fromBlock: number;
    toBlock: number | "latest";
    tokens: Record<string, string>;
    options?: { blockChunk?: number; concurrency?: number };
    onWallet?: (wallet: WalletBalance) => void;
    storeId: string
};

export class ContractScanner {
    private provider: ethers.providers.JsonRpcProvider;
    private contractAddress: string;
    private fromBlock: number;
    private toBlock: number | "latest";
    private tokens: Record<string, string>;
    private options: { blockChunk: number; concurrency: number };
    private onWallet?: (wallet: WalletBalance) => void;

    private erc20s: Record<string, { contract: ethers.Contract; decimals: number; symbol: string }> = {};
    private stopped = false;
    public isScanning = false;
    private currentBlock = 0;

    constructor(params: ScanParams) {
        this.provider = new ethers.providers.JsonRpcProvider(params.rpcUrl);
        this.contractAddress = params.contractAddress;
        this.fromBlock = params.fromBlock;
        this.toBlock = params.toBlock;
        this.tokens = params.tokens;
        this.options = {
            blockChunk: params.options?.blockChunk ?? 5000,
            concurrency: params.options?.concurrency ?? 8,
        };
        this.onWallet = params.onWallet;
    }

    async initTokens() {
        console.log('init tokens');

        for (const [sym, addr] of Object.entries(this.tokens)) {
            if (!ethers.utils.isAddress(addr)) continue;
            const c = new ethers.Contract(addr, ERC20_ABI, this.provider);
            let decimals = 18;
            let symbol = sym;
            try {
                decimals = await c.decimals();
            } catch { }
            try {
                symbol = await c.symbol();
            } catch { }
            this.erc20s[sym] = { contract: c, decimals, symbol };
        }
    }

    stop() {
        console.log('stop scan');

        this.stopped = true;
        this.isScanning = false;
    }

    async start(
        onProgress?: (progress: number) => void
    ) {
        console.log('start scan');
        this.stopped = false;
        this.isScanning = true;

        const latest = this.toBlock === "latest" ? await this.provider.getBlockNumber() : Number(this.toBlock);
        this.currentBlock = this.currentBlock || this.fromBlock;

        const blockChunk = this.options.blockChunk;
        const concurrency = this.options.concurrency;
        const counterparties = new Set<string>();

        // Quét log theo chunk
        while (this.currentBlock <= latest && !this.stopped) {
            const end = Math.min(this.currentBlock + blockChunk - 1, latest);
            console.log(`Scanning [${this.currentBlock}-${end}]`);
            try {
                const logs = await this.provider.getLogs({
                    address: this.contractAddress,
                    fromBlock: this.currentBlock,
                    toBlock: end,
                });
                for (let i = 0; i < logs.length; i++) {
                    const log = logs[i];
                    if (onProgress) {
                        // Tiến độ trong chunk hiện tại
                        const logProgress = (i + 1) / logs.length;
                        const percent = Math.floor(
                            ((this.currentBlock - this.fromBlock) + (end - this.currentBlock) * logProgress)
                            / (latest - this.fromBlock) * 100
                        );
                        onProgress(percent);
                    }
                    const tx = await this.provider.getTransaction(log.transactionHash);
                    if (tx && tx.to && tx.to.toLowerCase() === this.contractAddress.toLowerCase()) {
                        counterparties.add(tx.from.toLowerCase());
                    }
                }
                console.log(`Scanned [${this.currentBlock}-${end}] +${logs.length} logs`);
            } catch (e) {
                console.warn(`getLogs failed [${this.currentBlock}-${end}]: ${(e as Error).message}`);
            }
            this.currentBlock = end + 1;
        }

        console.log("Done scanning logs");

        onProgress?.((99));

        if (this.stopped) {
            console.log("⏸ Scan stopped at block", this.currentBlock);
            return;
        }

        // Quét balance
        const limitBal = pLimit(concurrency);
        await Promise.all(
            Array.from(counterparties).map((addr) =>
                limitBal(async () => {
                    const nativeWei = await this.provider.getBalance(addr);
                    const tokensBalance: Record<string, string> = {};

                    for (const [sym, t] of Object.entries(this.erc20s)) {
                        let bn = ethers.constants.Zero;
                        try {
                            bn = await t.contract.balanceOf(addr);
                        } catch { }
                        tokensBalance[sym] = ethers.utils.formatUnits(bn, t.decimals);
                    }

                    const nativeFormatted = ethers.utils.formatEther(nativeWei);
                    const hasNative = !nativeWei.isZero();
                    const hasToken = Object.values(tokensBalance).some((v) => parseFloat(v) > 0);

                    if (hasNative || hasToken) {
                        const wallet: WalletBalance = {
                            address: addr,
                            native: nativeFormatted,
                            tokens: tokensBalance,
                        };
                        this.onWallet?.(wallet);
                    }
                })
            )
        );
        onProgress?.((100));
        this.isScanning = false;
    }
}