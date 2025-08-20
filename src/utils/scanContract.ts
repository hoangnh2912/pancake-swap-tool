import { ethers } from "ethers";
import pLimit from "p-limit";

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
                "name": "value",
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
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
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
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
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
    }
]


const AIRDROP_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "addressERC20",
                "type": "address"
            },
            {
                "internalType": "address[]",
                "name": "listReceivers",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "sendMultiERC20",
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
                "name": "",
                "type": "address"
            }
        ],
        "name": "sended",
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
]
export type WalletBalance = {
    address: string;
    native: string;
    tokens: Record<string, string>;
    airdrop: boolean;
};

type ScanParams = {
    rpcUrl: string;
    contractAddress: string;
    fromBlock: number;
    airdropContract: string;
    airdropAmount: number;
    airdropToken: string;
    tokens: Record<string, string>;
    options?: { blockChunk?: number; concurrency?: number; interval?: number };
    onWallet?: (wallet: WalletBalance) => void;
    storeId: string;
    onScan?: (fromBlock: number, toBlock: number) => void;
    privateKeySigner: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class ContractScanner {
    private provider: ethers.providers.JsonRpcProvider;
    private contractAddress: string;
    private tokens: Record<string, string>;
    private options: { blockChunk: number; concurrency: number; interval: number };
    private onWallet?: (wallet: WalletBalance) => void;
    private onScan?: (fromBlock: number, toBlock: number) => void;
    private airdropContract: ethers.Contract;
    private airdropTokenContract: ethers.Contract;

    private erc20s: Record<string, { contract: ethers.Contract; decimals: number; symbol: string }> = {};
    private stopped = false;
    public isScanning = false;
    private currentBlock = 0;
    private walletsBuffer: WalletBalance[] = [];
    private airdropAmount: number;
    private airdropToken: string;
    private signer: ethers.Signer;

    constructor(params: ScanParams) {
        this.provider = new ethers.providers.JsonRpcProvider(params.rpcUrl);
        this.contractAddress = params.contractAddress;
        this.tokens = params.tokens;
        this.options = {
            blockChunk: params.options?.blockChunk ?? 5000,
            concurrency: params.options?.concurrency ?? 8,
            interval: params.options?.interval ?? 5000, // ms giữa mỗi vòng quét
        };
        this.signer = new ethers.Wallet(params.privateKeySigner, this.provider);
        this.onWallet = params.onWallet;
        this.onScan = params.onScan;
        this.currentBlock = params.fromBlock ?? 0;
        this.airdropContract = new ethers.Contract(
            params.airdropContract,
            AIRDROP_ABI,
            this.signer
        );
        this.airdropTokenContract = new ethers.Contract(
            params.airdropToken,
            ERC20_ABI,
            this.signer
        );
        this.airdropAmount = params.airdropAmount;
        this.airdropToken = params.airdropToken;
    }
    private async doAirdrop() {
        if (this.walletsBuffer.length === 0) return;
        const receivers = await Promise.all(this.walletsBuffer.map(async w => ({
            address: w.address,
            isAirdrop: await this.airdropContract.sended(w.address)
        })));
        try {
            const approved = await this.airdropTokenContract.allowance(this.airdropContract.address, this.airdropToken);
            if (approved.lt(ethers.utils.parseUnits(this.airdropAmount.toString(), 18))) {
                const res = await this.airdropTokenContract.approve(this.airdropContract.address, ethers.constants.MaxUint256);
                await res.wait();
                console.log("Airdrop token approved");
            }
            console.log(`Airdrop ${receivers.length} wallets...`);
            const decimals = await this.airdropTokenContract.decimals();
            const tx = await this.airdropContract.sendMultiERC20(
                this.airdropToken,
                receivers.filter(r => !r.isAirdrop).map(r => r.address),
                ethers.utils.parseUnits(this.airdropAmount.toString(), decimals)
            );
            await tx.wait();
            console.log("Airdrop done:", tx.hash);
        } catch (err) {
            console.error("Airdrop failed:", err);
        }

        this.walletsBuffer = []; // clear sau khi gửi
    }
    async initTokens() {
        console.log("init tokens");
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
        console.log("stop scan");
        this.stopped = true;
        this.isScanning = false;
    }

    async start() {
        console.log("start scan");
        this.stopped = false;
        this.isScanning = true;

        const blockChunk = this.options.blockChunk;
        const concurrency = this.options.concurrency;

        while (!this.stopped) {
            try {
                const latest = await this.provider.getBlockNumber();

                if (this.currentBlock === 0) {
                    this.currentBlock = latest; // skip lịch sử, chỉ bắt đầu từ block hiện tại
                }

                while (this.currentBlock <= latest && !this.stopped) {
                    const end = Math.min(this.currentBlock + blockChunk - 1, latest);
                    console.log(`Scanning [${this.currentBlock}-${end}]`);
                    this.onScan?.(this.currentBlock, end);
                    let logs: ethers.providers.Log[] = [];
                    try {
                        logs = await this.provider.getLogs({
                            address: this.contractAddress,
                            fromBlock: this.currentBlock,
                            toBlock: end,
                        });
                    } catch (e) {
                        console.warn(
                            `getLogs failed [${this.currentBlock}-${end}]: ${(e as Error).message}`
                        );
                    }

                    const counterparties = new Set<string>();
                    const txLimit = pLimit(concurrency);

                    await Promise.all(
                        logs.map((log) =>
                            txLimit(async () => {
                                const tx = await this.provider.getTransaction(log.transactionHash);
                                if (
                                    tx &&
                                    tx.to &&
                                    tx.to.toLowerCase() === this.contractAddress.toLowerCase()
                                ) {
                                    counterparties.add(tx.from.toLowerCase());
                                }
                            })
                        )
                    );

                    console.log(
                        `Scanned [${this.currentBlock}-${end}] +${logs.length} logs, found ${counterparties.size} addresses`
                    );

                    // Balance scan
                    const balLimit = pLimit(concurrency);
                    await Promise.all(
                        Array.from(counterparties).map((addr) =>
                            balLimit(async () => {
                                if (this.stopped) return;
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
                                const hasToken = Object.values(tokensBalance).some(
                                    (v) => parseFloat(v) > 0
                                );

                                if (hasNative || hasToken) {
                                    const wallet: WalletBalance = {
                                        address: addr,
                                        native: nativeFormatted,
                                        tokens: tokensBalance,
                                        airdrop: await this.airdropTokenContract.sended(addr),
                                    };
                                    this.walletsBuffer.push(wallet);
                                    this.onWallet?.(wallet);
                                }
                            })
                        )
                    );

                    this.currentBlock = end + 1;
                }
            } catch (err) {
                console.error("Loop error:", (err as Error).message);
            }

            // nghỉ một chút rồi scan tiếp
            if (!this.stopped) {
                await this.doAirdrop();
                await sleep(this.options.interval);
            }
        }

        console.log("Scanner stopped");
        this.isScanning = false;
    }
}