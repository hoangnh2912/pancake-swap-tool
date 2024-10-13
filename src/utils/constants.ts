const TOKEN_ADDRESS = {
  ETH: {
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  BSC: {
    USDT: "0x55d398326f99059ff775485246999027b3197955",
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    WBTC: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
  },
  MATIC: {
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  },
};

const RPC_URL = {
  ETH: "https://1.rpc.thirdweb.com/dadfeca037b78c93e1a05061d7af37a0",
  BSC: "https://56.rpc.thirdweb.com/dadfeca037b78c93e1a05061d7af37a0",
  MATIC: "https://137.rpc.thirdweb.com/dadfeca037b78c93e1a05061d7af37a0",
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEFAULT_PAGINATE_SIZE = 10;
const Shell: {
  openExternal: (url: string) => void;
  setProcessBar: (value: number) => void;
  getPcUUID: () => void;
} = (window as any).Shell;
export { TOKEN_ADDRESS, Shell, ZERO_ADDRESS, DEFAULT_PAGINATE_SIZE, RPC_URL };
