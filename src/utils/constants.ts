const PANCAKE_ADDRESS = {
  BASE: {
    Mainnet: {
      Router: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb",
      Factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E",
      WETH: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      RPC: "https://8453.rpc.thirdweb.com/cce88ba586b9a9772e27e52376f7f39aa9fcaacc6097af98866edc47fab20cbfdc4a85d41ea11f49148cfc9fb25499d93248ef1080eec4978bc4b978b9d6770b",
      Explorer: "https://basescan.org",
      Name: "BASE",
      Symbol: "USDT",
    },
    Testnet: {
      Router: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb",
      Factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E",
      WETH: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      RPC: "https://84532.rpc.thirdweb.com/cce88ba586b9a9772e27e52376f7f39aa9fcaacc6097af98866edc47fab20cbfdc4a85d41ea11f49148cfc9fb25499d93248ef1080eec4978bc4b978b9d6770b",
      Explorer: "https://sepolia.basescan.org",
      Name: "Sepolia BASE Testnet",
      Symbol: "USDT",
    },
  },
};
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ENVIRONMENT_TYPE = {
  Mainnet: "Mainnet",
  Testnet: "Testnet",
};

const ENVIRONMENT: string = ENVIRONMENT_TYPE.Mainnet;
const DEFAULT_PAGINATE_SIZE = 10;
const Shell: {
  openExternal: (url: string) => void;
  setProcessBar: (value: number) => void;
} = (window as any).Shell;
export {
  PANCAKE_ADDRESS,
  ENVIRONMENT as ENVIROMENT,
  Shell,
  ZERO_ADDRESS,
  ENVIRONMENT_TYPE,
  DEFAULT_PAGINATE_SIZE,
};
