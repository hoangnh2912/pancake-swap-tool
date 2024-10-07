import { Button, useToast } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useMemo, useRef } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import { StepDetail } from "../redux/model";
import { RPC_URL, TOKEN_ADDRESS } from "../utils/constants";
import {
  getERC20Contract,
  getProvider,
  getSolanaProvider,
  getSolanaToken,
  getSolanaWallet,
} from "../web3";
import { PublicKey } from "@solana/web3.js";
const StartProcess = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isScanning = useStoreState(
    (state) => state.currentScanWallet.isScanning
  );
  const currentScanWalletId = useStoreState(
    (state) => state.currentScanWallet.currentScanWalletId
  );
  const setIsScanning = useStoreActions(
    (action) => action.currentScanWallet.setIsScanning
  );
  const setCurrentScanWalletId = useStoreActions(
    (action) => action.currentScanWallet.setCurrentScanWalletId
  );
  const addStep = useStoreActions((action) => action.steps.add);
  const addOutWallet = useStoreActions((action) => action.outputWallet.add);
  const updateStep = useStoreActions((action) => action.steps.update);
  const selectedChain = useStoreState((state) => state.selectedChain);
  const selectedToken = useStoreState((state) => state.selectedToken);
  const toast = useToast();

  const onStartScan = () => {
    setCurrentScanWalletId(Math.floor(Math.random() * 1000000).toString(16));
    startTx();
    intervalRef.current = setInterval(startTx, 1000);
  };
  const stopScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentScanWalletId("");
  };

  const providers = useMemo(() => {
    const provider: {
      [chain: string]: any;
    } = {};
    selectedChain.forEach((chain: string) => {
      if (chain == "SOL") {
        provider[chain] = getSolanaProvider(RPC_URL.SOL);
      } else {
        provider[chain] = getProvider((RPC_URL as any)[chain]);
      }
    });
    return provider;
  }, [selectedChain.length]);

  const USDTContract = useMemo(() => {
    const contract: {
      [chain: string]: {
        balanceOf: (address: string) => Promise<string>;
      };
    } = {};

    selectedChain.forEach((chain: string) => {
      if (chain == "SOL") {
        contract["SOL"] = getSolanaToken(
          (TOKEN_ADDRESS as any)[chain].USDT,
          (providers["SOL"] as any).connection
        );
      } else {
        contract[chain] = getERC20Contract(
          (TOKEN_ADDRESS as any)[chain].USDT,
          providers[chain] as any
        );
      }
    });
    return contract;
  }, [providers]);

  const USDCContract = useMemo(() => {
    const contract: {
      [chain: string]: {
        balanceOf: (address: string) => Promise<string>;
      };
    } = {};

    selectedChain.forEach((chain: string) => {
      if (chain == "SOL") {
        contract[chain] = getSolanaToken(
          (TOKEN_ADDRESS as any)[chain].USDC,
          (providers["SOL"] as any).connection
        );
      } else
        contract[chain] = getERC20Contract(
          (TOKEN_ADDRESS as any)[chain].USDC,
          providers[chain] as any
        );
    });
    return contract;
  }, [providers]);

  const WBTCContract = useMemo(() => {
    const contract: {
      [chain: string]: {
        balanceOf: (address: string) => Promise<string>;
      };
    } = {};
    selectedChain.forEach((chain: string) => {
      if (chain == "SOL") {
        contract[chain] = getSolanaToken(
          (TOKEN_ADDRESS as any)[chain].WBTC,
          (providers["SOL"] as any).connection
        );
      } else
        contract[chain] = getERC20Contract(
          (TOKEN_ADDRESS as any)[chain].WBTC,
          providers[chain] as any
        );
    });
    return contract;
  }, [providers]);

  const startTx = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const wallet = ethers.Wallet.createRandom();
      const stepId = Math.floor(Math.random() * 1000000).toString(16);
      const step: StepDetail = {
        address: wallet.address,
        id: stepId,
        mnemonic: wallet.mnemonic.phrase,
        privateKey: wallet.privateKey,
        amount: {},
      };
      addStep(step);
      setCurrentScanWalletId(stepId);

      let nativeBalances: {
        balance: string;
        chain: string;
        usdtBalance: string;
        usdcBalance: string;
        wbtcBalance: string;
      }[] = await Promise.all(
        selectedChain.map(async (chain: string) => {
          const walletAddress =
            chain == "SOL"
              ? getSolanaWallet(wallet.mnemonic.phrase).publicKey.toBase58()
              : wallet.address;

          const native = await (providers[chain] as any).getBalance(
            walletAddress
          );
          const usdtBalance = selectedToken.includes("USDT")
            ? await USDTContract[chain].balanceOf(walletAddress)
            : "0";
          const usdcBalance = selectedToken.includes("USDC")
            ? await USDCContract[chain].balanceOf(walletAddress)
            : "0";
          const wbtcBalance = selectedToken.includes("WBTC")
            ? await WBTCContract[chain].balanceOf(walletAddress)
            : "0";

          return {
            chain,
            balance: ethers.utils.formatEther(native),
            usdtBalance,
            usdcBalance,
            wbtcBalance,
          };
        })
      );
      nativeBalances = nativeBalances.filter(
        (b) =>
          b.balance !== "0.0" &&
          b.usdcBalance !== "0" &&
          b.usdtBalance !== "0" &&
          b.wbtcBalance !== "0"
      );

      let payloadAmount: {
        [chain: string]: {
          [token: string]: string;
        };
      } = {};

      nativeBalances.forEach((b) => {
        payloadAmount = {
          ...payloadAmount,
          [b.chain]: {
            [b.chain]: b.balance,
            USDT: b.usdtBalance,
            USDC: b.usdcBalance,
            WBTC: b.wbtcBalance,
          },
        };
      });
      updateStep({
        id: stepId,
        amount: payloadAmount,
      });
      if (Object.keys(payloadAmount).length > 0) {
        addOutWallet({
          id: stepId,
          mnemonic: wallet.mnemonic.phrase,
          privateKey: wallet.privateKey,
          amount: payloadAmount,
          address: wallet.address,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setIsScanning(false);
  };

  if (currentScanWalletId) {
    return (
      <Button colorScheme="yellow" onClick={stopScan} variant="solid">
        Dừng quét
      </Button>
    );
  }

  return (
    <Button
      colorScheme="green"
      isDisabled={selectedChain.length === 0}
      onClick={onStartScan}
      variant="solid"
    >
      Bắt đầu quét
    </Button>
  );
};

export default StartProcess;
