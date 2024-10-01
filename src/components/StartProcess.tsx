import { Button, Spinner, useToast } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import { TransactionStatus } from "../redux/model";
import { sleep } from "../utils/utils";
import { getProvider, getWallet, startSendTx } from "../web3";
import { Shell } from "../utils/constants";
import { Wallet } from "ethers";

const StartProcess = () => {
  const chainNetwork = useStoreState((state) => state.chainNetwork);
  const tokenAddress = useStoreState((state) => state.steps.tokenAddress);
  const delay = useStoreState((state) => state.steps.delay);
  const stepData = useStoreState((state) => state.steps.data);
  const addTxs = useStoreActions((action) => action.txs.add);
  const setCurrentTxId = useStoreActions(
    (action) => action.currentTx.setCurrentTxId
  );

  const toast = useToast();

  const [isFetching, setIsFetching] = useState(false);

  const startTx = async () => {
    try {
      setIsFetching(true);
      Shell.setProcessBar(0);
      for (let i = 0; i < stepData.length; i++) {
        setCurrentTxId(stepData[i].id);
        const step = stepData[i];
        console.log("Start step", i);

        const childWallet = getWallet(
          getProvider(chainNetwork.rpc),
          Wallet.createRandom().privateKey
        );

        const wallet = getWallet(
          getProvider(chainNetwork.rpc),
          step.privateKey
        );
        try {
          const res = await startSendTx({
            childWallet,
            wallet,
            step,
            addressRouter: chainNetwork.router,
            WETH: chainNetwork.weth,
            tokenAddress,
            factoryAddress: chainNetwork.factory,
            gasPrice: chainNetwork.gasPrice,
            gasLimit: chainNetwork.gasLimit,
            onResult: (result, stepResult) => {
              addTxs({
                id: stepResult.id,
                status: TransactionStatus.PENDING,
                rpc: chainNetwork.rpc,
                method: stepResult.method,
                amount: stepResult.amount,
                tokenAddress,
                tokenAmount: "0",
                transactionReceipt: {
                  transactionHash: result.hash,
                  blockHash: result.blockHash,
                },
                chainNetworkName: chainNetwork.name,
              });
            },
          });
          addTxs({
            id: step.id,
            status: TransactionStatus.SUCCESS,
            rpc: chainNetwork.rpc,
            method: step.method,
            amount: step.amount,
            transactionReceipt: {
              transactionHash: res.hash,
              blockHash: res.blockHash,
            },
            tokenAddress,
            tokenAmount: "0",
            chainNetworkName: chainNetwork.name,
          });
        } catch (error) {
          console.error("[startTx]", step, error);
          addTxs({
            id: step.id,
            status: TransactionStatus.FAILED,
            rpc: chainNetwork.rpc,
            method: step.method,
            amount: step.amount,
            tokenAddress,
            transactionReceipt: {},
            tokenAmount: "0",
            chainNetworkName: chainNetwork.name,
          });
        }
        console.log("Done step", i);
        console.log("Start delay", delay);
        Shell.setProcessBar((i + 1) / stepData.length);
        if (i < stepData.length - 1) await sleep(delay);
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
    setIsFetching(false);
    Shell.setProcessBar(-1);
    setCurrentTxId("");
  };
  const isDisabled = useMemo(() => {
    return (
      stepData.length == 0 ||
      stepData.some(
        (step) =>
          step &&
          step.amountCalculate &&
          step.amountCalculate.value &&
          step.amountCalculate.value.eq &&
          step.amountCalculate.value.eq(0)
      )
    );
  }, [stepData]);

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <Button
      colorScheme="green"
      isDisabled={isDisabled}
      onClick={startTx}
      variant="solid"
    >
      Start
    </Button>
  );
};

export default StartProcess;
