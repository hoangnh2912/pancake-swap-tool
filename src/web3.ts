import { BigNumber, Wallet, ethers, providers } from "ethers";
import { StepDetail } from "./redux/model";
import {
  ERC20_ABI,
  FACTORY_PANCAKE_V2_ABI,
  ROUTER_PANCAKE_V2_ABI,
} from "./utils/abi";
import { sleep } from "./utils/utils";

const getProvider = (rpc: string) => {
  return new ethers.providers.JsonRpcProvider(rpc);
};

const getWallet = (provider: providers.JsonRpcProvider, privateKey: string) => {
  return new ethers.Wallet(privateKey, provider);
};

const getRouterContract = (address: string, provider: providers.Provider) => {
  return new ethers.Contract(address, ROUTER_PANCAKE_V2_ABI, provider);
};

const getERC20Contract = (address: string, provider: providers.Provider) => {
  return new ethers.Contract(address, ERC20_ABI, provider);
};

const getFactoryContract = (address: string, provider: providers.Provider) => {
  return new ethers.Contract(address, FACTORY_PANCAKE_V2_ABI, provider);
};

const getOfPairBalance = async (
  provider: providers.Provider,
  weth: string,
  tokenAddress: string,
  factoryAddress: string,
  symbol: string
) => {
  const factoryContract = getFactoryContract(factoryAddress, provider);
  const wethContract = getERC20Contract(weth, provider);
  const tokenAddressContract = getERC20Contract(tokenAddress, provider);
  const pairAddress = await factoryContract.getPair(weth, tokenAddress);

  const pairBalance = {
    [symbol]: ethers.BigNumber.from(await wethContract.balanceOf(pairAddress)),
    [await tokenAddressContract.symbol()]: ethers.BigNumber.from(
      await tokenAddressContract.balanceOf(pairAddress)
    ).mul(
      ethers.BigNumber.from(10).pow(
        18 - (await tokenAddressContract.decimals())
      )
    ),
    Native: await provider.getBalance(pairAddress),
  };

  return {
    pairBalance,
    pairAddress,
  };
};

const calculateAmount = async ({
  addressRouter,
  amount,
  factoryAddress,
  provider,
  tokenAddress,
  weth,
}: {
  provider: providers.Provider;
  weth: string;
  tokenAddress: string;
  addressRouter: string;
  amount: string | number;
  factoryAddress: string;
}) => {
  const routerContract = getRouterContract(addressRouter, provider);
  const factoryContract = getFactoryContract(factoryAddress, provider);
  const wethContract = getERC20Contract(weth, provider);
  const tokenAddressContract = getERC20Contract(tokenAddress, provider);
  const pairAddress = await factoryContract.getPair(weth, tokenAddress);
  const amountWETH9InWei = ethers.utils.parseEther(`${amount}`);
  const balanceOfWETH = await wethContract.balanceOf(pairAddress);
  const balanceOfToken = await tokenAddressContract.balanceOf(pairAddress);
  const tokenDecimals = await tokenAddressContract.decimals();
  const amountOut = await routerContract.getAmountOut(
    amountWETH9InWei,
    balanceOfWETH,
    balanceOfToken
  );

  const amountIn = await routerContract.getAmountIn(
    amountWETH9InWei,
    balanceOfToken,
    balanceOfWETH
  );

  const minOut = ethers.BigNumber.from(amountOut).sub(
    ethers.BigNumber.from(amountOut)
      .mul(parseFloat(`${0}`) * 100)
      .div(10000)
  );
  const maxIn = ethers.BigNumber.from(amountIn).add(
    ethers.BigNumber.from(amountIn)
      .mul(parseFloat(`${0}`) * 100)
      .div(10000)
  );

  return {
    minOut,
    maxIn,
    minOutDisplay: minOut.mul(
      ethers.BigNumber.from(10).pow(18 - tokenDecimals)
    ),
    maxInDisplay: maxIn.mul(ethers.BigNumber.from(10).pow(18 - tokenDecimals)),
  };
};

const startSendTx = async ({
  childWallet,
  WETH,
  addressRouter,
  factoryAddress,
  step,
  tokenAddress,
  wallet,
  gasPrice,
  gasLimit,
  onResult,
}: {
  childWallet: ethers.Wallet;
  wallet: ethers.Wallet;
  step: StepDetail;
  addressRouter: string;
  WETH: string;
  tokenAddress: string;
  factoryAddress: string;
  gasPrice: string;
  gasLimit: string;
  onResult?: (result: providers.TransactionResponse, step: StepDetail) => void;
}) => {
  const methodName = "swapExactETHForTokens";

  // const tokenContract = getERC20Contract(
  //   tokenAddress,
  //   childWallet.provider
  // ).connect(childWallet);

  // const { minOut, maxIn } = await calculateAmount({
  //   provider: childWallet.provider,
  //   weth: WETH,
  //   tokenAddress,
  //   addressRouter,
  //   amount: step.amount,
  //   factoryAddress,
  // });
  const routerContract = getRouterContract(
    addressRouter,
    childWallet.provider
  ).connect(childWallet);

  const args = [
    0,
    [WETH, tokenAddress],
    childWallet.address,
    Math.floor(Date.now() / 1000) + 60 * 10,
  ];

  let gasLimitValue = BigNumber.from(gasLimit);

  const gasPriceValue = ethers.utils.parseUnits(`${gasPrice}`, "gwei");

  const amountSend = ethers.utils
    .parseUnits(`${step.amount}`, "ether")
    .add(gasLimitValue.mul(gasPriceValue))
    .toString();

  const sendBNBTx = await wallet.sendTransaction({
    value: amountSend,
    to: childWallet.address,
    gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
    gasLimit: 21000,
  });
  const resSendBNBTx = await sendBNBTx.wait();
  if (resSendBNBTx.status !== 1) {
    throw new Error("Send BNB failed");
  }
  let currentChildBalance = await childWallet.getBalance();

  const payload = {
    gasPrice: gasPriceValue.toString(),
    value: currentChildBalance.sub(
      BigNumber.from(gasLimitValue).mul(gasPriceValue)
    ),
    gasLimit: gasLimitValue,
  };

  const result = await routerContract[methodName](...args, payload);
  onResult && onResult(result, step);
  await result.wait();
  console.log("[Transaction]", methodName, args, payload);
  currentChildBalance = await childWallet.getBalance();
  const sendBNBBackToWalletTx = await childWallet.sendTransaction({
    value: currentChildBalance.sub(BigNumber.from(21000).mul(gasPriceValue)),
    to: wallet.address,
    gasPrice: gasPriceValue,
    gasLimit: 21000,
    nonce: 1,
  });
  console.log("sendBNBBackToWalletTx", sendBNBBackToWalletTx);
  const resSendBNBBackToWalletTx = await sendBNBBackToWalletTx.wait();
  if (resSendBNBBackToWalletTx.status !== 1) {
    throw new Error("Send BNB back to wallet failed");
  }

  return result;
};

export {
  calculateAmount,
  getOfPairBalance,
  getProvider,
  getWallet,
  startSendTx,
};
