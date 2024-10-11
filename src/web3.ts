import { ethers, providers } from "ethers";
import { ERC20_ABI } from "./utils/abi";

const getProvider = (rpc: string) => {
  return new ethers.providers.JsonRpcProvider(rpc);
};

const getWallet = (provider: providers.JsonRpcProvider, privateKey: string) => {
  return new ethers.Wallet(privateKey, provider);
};

const getERC20Contract = (address: string, provider: providers.Provider) => {
  const contract = new ethers.Contract(address, ERC20_ABI, provider);
  return {
    balanceOf: async (address: string) => {
      return (await contract.balanceOf(address)) as string;
    },
  };
};



export {
  getERC20Contract,
  getProvider,
  getWallet,
};
