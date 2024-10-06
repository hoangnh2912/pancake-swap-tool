import { ethers, providers } from "ethers";
import { ERC20_ABI } from "./utils/abi";
import { getStore } from "./redux/store";
import { StepDetail } from "./redux/model";
import { sleep } from "./utils/utils";

const getProvider = (rpc: string) => {
  return new ethers.providers.JsonRpcProvider(rpc);
};

const getWallet = (provider: providers.JsonRpcProvider, privateKey: string) => {
  return new ethers.Wallet(privateKey, provider);
};

const getERC20Contract = (address: string, provider: providers.Provider) => {
  return new ethers.Contract(address, ERC20_ABI, provider);
};



export { getProvider, getWallet, getERC20Contract,  };
