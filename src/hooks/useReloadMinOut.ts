import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useRef } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import { calculateAmount, getOfPairBalance, getProvider } from "../web3";

const useReloadFetchOnchain = ({ privateKeys }: { privateKeys: string[] }) => {
  const intervalCheck = useRef<NodeJS.Timeout>();
  const stepsData = useStoreState((state) => state.steps.data);
  const txsData = useStoreState((state) => state.txs.data);
  const chainNetwork = useStoreState((state) => state.chainNetwork);

  const tokenAddress = useStoreState((state) => state.steps.tokenAddress);

  const updateStep = useStoreActions((action) => action.steps.update);
  const updateTx = useStoreActions((action) => action.txs.update);
  const setPair = useStoreActions((action) => action.steps.setPair);
  const setDataWallet = useStoreActions((action) => action.wallets.setData);
  const isCalculating = useRef<boolean>(false);

  const onStartCheck = useCallback(async () => {
    if (
      isCalculating.current ||
      !tokenAddress ||
      !chainNetwork.rpc ||
      !chainNetwork.router
    )
      return;
    isCalculating.current = true;
    const provider = getProvider(chainNetwork.rpc);
    const resSettled = await Promise.allSettled([
      getOfPairBalance(
        provider,
        chainNetwork.weth,
        tokenAddress,
        chainNetwork.factory,
        chainNetwork.symbol
      ),
      ...privateKeys.map(async (privateKey) => {
        const wallet = new ethers.Wallet(privateKey);
        setDataWallet({
          [wallet.address]: {
            address: wallet.address,
            balance: {
              [chainNetwork.symbol]: await provider.getBalance(wallet.address),
            },
          },
        });
      }),
      ...stepsData
        .filter((step) => BigNumber.from(step.amountCalculate.value).isZero())
        .map(async (step) => {
          const { maxInDisplay, minOutDisplay } = await calculateAmount({
            provider,
            weth: chainNetwork.weth,
            tokenAddress,
            addressRouter: chainNetwork.router,
            amount: step.amount,
            factoryAddress: chainNetwork.factory,
          });

          updateStep({
            ...step,
            amountCalculate: {
              value: step.method == "buy" ? minOutDisplay : maxInDisplay,
            },
          });
        }),
      ...txsData
        .filter((txs) => !txs.transactionReceipt.timestamp)
        .map(async (txs) => {
          try {
            if (txs.transactionReceipt.timestamp) return;
            const rc = await provider.getTransactionReceipt(
              txs.transactionReceipt.transactionHash
            );
            const block = await provider.getBlock(rc.blockNumber);
            const timestamp = block.timestamp;
            updateTx({
              ...txs,
              transactionReceipt: {
                ...txs.transactionReceipt,
                timestamp,
              },
            });
          } catch (error) {
            console.error("[useReloadMinOut][txsData]", error);
          }
        }),
    ]);
    const { pairBalance, pairAddress } =
      resSettled[0].status == "fulfilled"
        ? resSettled[0].value
        : { pairBalance: {}, pairAddress: "" };
    setPair({
      address: pairAddress,
      pairBalance,
    });
    resSettled.map(
      (res) =>
        res.status == "rejected" &&
        console.error(`[useReloadMinOut][resSettled]${res.reason}`)
    );
    isCalculating.current = false;
  }, [stepsData, chainNetwork, updateStep, tokenAddress]);

  useEffect(() => {
    if (intervalCheck.current) clearInterval(intervalCheck.current);
    intervalCheck.current = setInterval(onStartCheck, 2000);
    return () => {
      if (intervalCheck.current) clearInterval(intervalCheck.current);
    };
  }, [onStartCheck]);
};

export default useReloadFetchOnchain;
