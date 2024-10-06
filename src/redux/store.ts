import { EasyPeasyConfig, Store, action, createStore } from "easy-peasy";
import StoreModel from "./model";

const storePayload: StoreModel = {
  currentScanWallet: {
    isScanning: false,
    setIsScanning: action((state, payload) => {
      state.isScanning = payload;
    }),
    currentScanWalletId: "",
    setCurrentScanWalletId: action((state, payload) => {
      state.currentScanWalletId = payload;
    }),
  },
  steps: {
    add: action((state, payload) => {
      state.data.push(payload);
    }),
    update: action((state, payload) => {
      state.data = state.data.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            ...payload,
            amount: {
              ...item.amount,
              ...payload.amount,
            },
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
  },
  outputWallet: {
    add: action((state, payload) => {
      state.data.push(payload);
    }),
    update: action((state, payload) => {
      state.data = state.data.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            ...payload,
            amount: {
              ...item.amount,
              ...payload.amount,
            },
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
  },
  tabId: "1a2b3c4d",
};

type StorePayload = Store<StoreModel, EasyPeasyConfig<undefined, {}>>;
const getStore = (id: string) => createStore<StoreModel>({ ...storePayload, tabId: id })

export { getStore };
export type { StorePayload };
