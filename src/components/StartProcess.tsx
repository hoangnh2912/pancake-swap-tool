import { Button, Checkbox, HStack, Spinner, useToast } from "@chakra-ui/react";
import { useMemo, useRef, useState } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import { TransactionStatus } from "../redux/model";
import { sleep } from "../utils/utils";
import { getProvider, getWallet, startSendTx } from "../web3";

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
  const [repeat, setRepeat] = useState(false);
  const stopRef = useRef(false);

  const stopTx = () => {
    stopRef.current = true;
  };

  const startTx = async () => {
    stopRef.current = false;
    try {
      setIsFetching(true);
      do {
        for (let i = 0; i < stepData.length; i++) {
          if (stopRef.current) break;
          setCurrentTxId(stepData[i].id);
          const step = stepData[i];
          console.log("Start step", i);
          const wallet = getWallet(
            getProvider(chainNetwork.rpcSubmit),
            step.privateKey
          );
          try {
            const res = await startSendTx({
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
                  rpc: chainNetwork.rpcSubmit,
                  method: stepResult.method,
                  amount: stepResult.amount,
                  slippage: stepResult.slippage,
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
              slippage: step.slippage,
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
              slippage: step.slippage,
              tokenAddress,
              transactionReceipt: {},
              tokenAmount: "0",
              chainNetworkName: chainNetwork.name,
            });
          }
          console.log("Done step", i);
          console.log("Start delay", delay);
          if (i < stepData.length - 1) await sleep(delay);
        }
      } while (repeat && !stopRef.current);
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
    return (
      <HStack>
        <Spinner />
        <Button colorScheme="red" variant="solid" onClick={stopTx}>
          Dừng
        </Button>
      </HStack>
    );
  }

  return (
    <HStack>
      <Button
        colorScheme="green"
        isDisabled={isDisabled}
        onClick={startTx}
        variant="solid"
      >
        Start
      </Button>
      <Checkbox isChecked={repeat} onChange={(e) => setRepeat(e.target.checked)}>
        Lặp lại
      </Checkbox>
    </HStack>
  );
};

export default StartProcess;
