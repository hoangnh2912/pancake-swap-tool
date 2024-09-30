import { Action } from "easy-peasy";
import { ethers, providers } from "ethers";

interface StepDetail {
  id: string;
  method: string;
  amount: string;
  slippage: string;
  privateKey: string;
  amountCalculate: {
    value: ethers.BigNumber;
  };
}

interface Steps {
  data: StepDetail[];
  tokenAddress: string;
  setTokenAddress: Action<Steps, string>;
  delay: number;
  setDelay: Action<Steps, number>;
  pairData: {
    pairBalance: {
      [symbol: string]: ethers.BigNumber;
    };
    address: string;
  };
  setPair: Action<
    Steps,
    {
      pairBalance: {
        [symbol: string]: ethers.BigNumber;
      };
      address: string;
    }
  >;
  add: Action<Steps, StepDetail>;
  update: Action<Steps, StepDetail>;
  delete: Action<Steps, string>;
  deleteAll: Action<Steps>;
}

enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

interface TransactionDetail {
  status: TransactionStatus;
  id: string;
  rpc: string;
  method: string;
  amount: string;
  slippage: string;
  tokenAddress: string;
  tokenAmount: string;
  transactionReceipt: Partial<providers.TransactionReceipt> & {
    timestamp?: number;
  };
  chainNetworkName: string;
}

interface Transaction {
  data: Partial<TransactionDetail>[];
  add: Action<Transaction, Partial<TransactionDetail>>;
  update: Action<Transaction, Partial<TransactionDetail>>;
  delete: Action<Transaction, string>;
  deleteAll: Action<Transaction>;
}

interface WalletDetail {
  balance: {
    [symbol: string]: ethers.BigNumber;
  };
  address: string;
}

interface Wallet {
  data: {
    [address: string]: WalletDetail;
  };
  setData: Action<
    Wallet,
    {
      [address: string]: WalletDetail;
    }
  >;
}

interface ChainNetwork {
  name: string;
  rpc: string;
  explorer: string;
  router: string;
  weth: string;
  factory: string;
  symbol: string;
  gasPrice: string;
  setChainNetwork: Action<
    ChainNetwork,
    {
      name?: string;
      rpc?: string;
      explorer?: string;
      router?: string;
      weth?: string;
      factory?: string;
      symbol?: string;
      gasPrice?: string;
    }
  >;
}


interface CurrentTx {
  currentTxId: string;
  setCurrentTxId: Action<CurrentTx, string>;
}



interface Tabs{
  tabs: {
    title: string;
    data: StoreModel
  }
}

interface StoreModel {
  steps: Steps;
  txs: Transaction;
  wallets: Wallet;
  chainNetwork: ChainNetwork;
  currentTx: CurrentTx;
  tabId: string;
}

export type { StepDetail, TransactionDetail, WalletDetail };
export { TransactionStatus };

export default StoreModel;
