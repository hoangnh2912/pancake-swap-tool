import { EasyPeasyConfig, Store, action, createStore } from "easy-peasy";
import { PANCAKE_ADDRESS } from "../utils/constants";
import StoreModel from "./model";

const storePayload: StoreModel = {
  currentTx: {
    currentTxId: "",
    setCurrentTxId: action((state, payload) => {
      state.currentTxId = payload;
    }),
  },
  steps: {
    tokenAddress: "",
    setTokenAddress: action((state, payload) => {
      state.tokenAddress = payload;
    }),
    delay: 60 * 1000,
    setDelay: action((state, payload) => {
      state.delay = payload;
    }),
    add: action((state, payload) => {
      state.data.push(payload);
    }),
    update: action((state, payload) => {
      state.data = state.data.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            ...payload,
          };
        }
        return item;
      });
    }),
    data: [],
    delete: action((state, payload) => {
      state.data = state.data.filter((item) => item.id !== payload);
    }),
    deleteAll: action((state) => {
      state.data = [];
    }),
    pairData: {
      pairBalance: {},
      address: "",
    },
    setPair: action((state, payload) => {
      state.pairData = payload;
    }),
  },
  txs: {
    add: action((state, payload) => {
      let isExist = false;
      state.data = state.data.map((item) => {
        if (item.id === payload.id) {
          isExist = true;
          return payload;
        }
        return item;
      });
      if (state.data.length == 300) {
        state.data.shift();
      }
      if (!isExist) state.data.push(payload);
    }),
    data: [],
    delete: action((state, payload) => {
      state.data = state.data.filter(
        (item) => item.transactionReceipt.transactionHash !== payload
      );
    }),
    deleteAll: action((state) => {
      state.data = [];
    }),
    update: action((state, payload) => {
      state.data = state.data.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            ...payload,
          };
        }
        return item;
      });
    }),
  },
  wallets: {
    data: {},
    setData: action((state, payload) => {
      state.data = {
        ...state.data,
        ...payload,
      };
    }),
  },
  chainNetwork: {
    explorer: PANCAKE_ADDRESS.BSC.Mainnet.Explorer,
    name: PANCAKE_ADDRESS.BSC.Mainnet.Name,
    rpc: PANCAKE_ADDRESS.BSC.Mainnet.RPC,
    factory: PANCAKE_ADDRESS.BSC.Mainnet.Factory,
    router: PANCAKE_ADDRESS.BSC.Mainnet.Router,
    weth: PANCAKE_ADDRESS.BSC.Mainnet.WETH,
    symbol: PANCAKE_ADDRESS.BSC.Mainnet.Symbol,
    gasPrice: "5",
    gasLimit: "300000",
    rpcSubmit: PANCAKE_ADDRESS.BSC.Mainnet.RPC,
    setChainNetwork: action((state, payload) => {
      if (payload.explorer) state.explorer = payload.explorer;
      if (payload.name) state.name = payload.name;
      if (payload.rpc) state.rpc = payload.rpc;
      if (payload.factory) state.factory = payload.factory;
      if (payload.router) state.router = payload.router;
      if (payload.weth) state.weth = payload.weth;
      if (payload.symbol) state.symbol = payload.symbol;
      if (payload.gasPrice) state.gasPrice = payload.gasPrice;
      if (payload.gasLimit != undefined) state.gasLimit = payload.gasLimit;
      if (payload.rpcSubmit) state.rpcSubmit = payload.rpcSubmit;
    }),
  },
  tabId: "1a2b3c4d",
  scan: {
    isScanning: false,
    setIsScanning: action((state, payload) => {
      state.isScanning = payload;
    }),
  },
};

type StorePayload = Store<StoreModel, EasyPeasyConfig<undefined, {}>>;

const getStore = (id: string) =>
  createStore<StoreModel>({ ...storePayload, tabId: id });

export { getStore };
export type { StorePayload };
