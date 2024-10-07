import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { ethers, providers } from "ethers";
import { ERC20_ABI } from "./utils/abi";
import { HDKey } from "micro-ed25519-hdkey";

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

const getSolanaWallet = (mnemonic: string) => {
  const path = `m/44'/501'/0'/0'`;
  const hd = HDKey.fromMasterSeed(
    ethers.utils.mnemonicToSeed(mnemonic).replace("0x", "")
  );
  const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
  return keypair;
};

const getSolanaProvider = (rpc: string) => {
  const connection = new Connection(rpc);
  return {
    getBalance: async (pubKey: string) => {
      return (await connection.getBalance(new PublicKey(pubKey))).toString();
    },
    connection,
  };
};

const getSolanaToken = (tokenAddress: string, provider: Connection) => {
  return {
    balanceOf: async (address: string) => {
      const res = await provider.getParsedTokenAccountsByOwner(
        new PublicKey(address),
        {
          mint: new PublicKey(tokenAddress),
        }
      );
      return res.value[0].account.data.parsed.info.tokenAmount.amount;
    },
  };
};

export {
  getERC20Contract,
  getProvider,
  getSolanaProvider,
  getSolanaToken,
  getSolanaWallet,
  getWallet,
};
