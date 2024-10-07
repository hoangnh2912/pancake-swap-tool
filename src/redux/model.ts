import { Action } from "easy-peasy";

interface StepDetail {
  id: string;
  mnemonic: string;
  privateKey: string;
  address: string;
  amount: {
    [network: string]: {
      [token: string]: string;
    }
  };
}

interface Steps {
  data: StepDetail[];
  add: Action<Steps, StepDetail>;
  update: Action<Steps, Partial<StepDetail>>;
  delete: Action<Steps, string>;
  deleteAll: Action<Steps>;
}

interface CurrentScanWallet {
  isScanning: boolean;
  setIsScanning: Action<CurrentScanWallet, boolean>;
  currentScanWalletId: string;
  setCurrentScanWalletId: Action<CurrentScanWallet, string>;
}

interface StoreModel {
  steps: Steps;
  outputWallet : Steps;
  currentScanWallet: CurrentScanWallet;
  tabId: string;
  selectedChain: string[];
  setSelectedChain: Action<StoreModel, string[]>;
  selectedToken: string[];
  setSelectedToken: Action<StoreModel, string[]>;
}

export type { StepDetail };

export default StoreModel;
