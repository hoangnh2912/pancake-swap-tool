import { Button, useToast } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useMemo, useRef } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import { StepDetail } from "../redux/model";
import { getERC20Contract, getProvider } from "../web3";
import { TOKEN_ADDRESS } from "../utils/constants";

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
  const updateStep = useStoreActions((action) => action.steps.update);

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

  const provider = useMemo(
    () => getProvider("https://bsc-dataseed.binance.org/"),
    []
  );

  const USDTContract = useMemo(
    () => getERC20Contract(TOKEN_ADDRESS.BSC.USDT, provider),
    [provider]
  );

  const USDCContract = useMemo(
    () => getERC20Contract(TOKEN_ADDRESS.BSC.USDC, provider),
    [provider]
  );
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
      const balance = await provider.getBalance(wallet.address);
      let payloadBSCAmount: {
        [token: string]: string;
      } = {};
      if (balance.gt(0)) {
        payloadBSCAmount = {
          ...payloadBSCAmount,
          BNB: ethers.utils.formatEther(balance),
        };
      }
      const balanceUSDT = await USDTContract.balanceOf(wallet.address);
      if (balanceUSDT.gt(0)) {
        payloadBSCAmount = {
          ...payloadBSCAmount,
          USDT: ethers.utils.formatEther(balance),
        };
      }
      const balanceUSDC = await USDCContract.balanceOf(wallet.address);
      if (balanceUSDC.gt(0)) {
        payloadBSCAmount = {
          ...payloadBSCAmount,
          USDC: ethers.utils.formatEther(balance),
        };
      }
      if (Object.keys(payloadBSCAmount).length > 0) {
        updateStep({
          id: stepId,
          amount: {
            BSC: payloadBSCAmount,
          },
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
    <Button colorScheme="green" onClick={onStartScan} variant="solid">
      Bắt đầu quét
    </Button>
  );
};

export default StartProcess;
