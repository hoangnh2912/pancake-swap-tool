import { BigNumber, ethers, type providers } from "ethers";
import type { StepDetail } from "./redux/model";
import {
	ERC20_ABI,
	FACTORY_PANCAKE_V2_ABI,
	ROUTER_PANCAKE_V2_ABI,
} from "./utils/abi";

const instance = {
	provider: {} as {
		[key: string]: providers.JsonRpcProvider;
	},
	wallet: {} as {
		[key: string]: ethers.Wallet;
	},
	routerContract: {} as {
		[key: string]: ethers.Contract;
	},
	factoryContract: {} as {
		[key: string]: ethers.Contract;
	},
	wethContract: {} as {
		[key: string]: ethers.Contract;
	},
	tokenContract: {} as {
		[key: string]: ethers.Contract;
	},
	tokenSymbol: {} as {
		[key: string]: string;
	},
};

const getProvider = (rpc: string) => {
	if (!instance.provider[rpc]) {
		instance.provider[rpc] = new ethers.providers.JsonRpcProvider(rpc);
	}
	return instance.provider[rpc];
};

const getWallet = (provider: providers.JsonRpcProvider, privateKey: string) => {
	if (!instance.wallet[privateKey]) {
		instance.wallet[privateKey] = new ethers.Wallet(privateKey, provider);
	}
	return instance.wallet[privateKey];
};

const getRouterContract = (address: string, provider: providers.Provider) => {
	if (!instance.routerContract[address]) {
		instance.routerContract[address] = new ethers.Contract(
			address,
			ROUTER_PANCAKE_V2_ABI,
			provider,
		);
	}
	return instance.routerContract[address];
};

const getERC20Contract = (address: string, provider: providers.Provider) => {
	if (!instance.tokenContract[address]) {
		instance.tokenContract[address] = new ethers.Contract(
			address,
			ERC20_ABI,
			provider,
		);
	}
	return instance.tokenContract[address];
};

const getFactoryContract = (address: string, provider: providers.Provider) => {
	if (!instance.factoryContract[address]) {
		instance.factoryContract[address] = new ethers.Contract(
			address,
			FACTORY_PANCAKE_V2_ABI,
			provider,
		);
	}
	return instance.factoryContract[address];
};

const getTokenSymbol = async (tokenAddressContract: ethers.Contract) => {
	if (!instance.tokenSymbol[tokenAddressContract.address]) {
		instance.tokenSymbol[tokenAddressContract.address] =
			await tokenAddressContract.symbol();
	}
	return instance.tokenSymbol[tokenAddressContract.address];
};

const getOfPairBalance = async (
	provider: providers.Provider,
	weth: string,
	tokenAddress: string,
	factoryAddress: string,
	symbol: string,
) => {
	const factoryContract = getFactoryContract(factoryAddress, provider);
	const wethContract = getERC20Contract(weth, provider);
	const tokenAddressContract = getERC20Contract(tokenAddress, provider);
	const pairAddress = await factoryContract.getPair(weth, tokenAddress);

	const pairBalance = {
		[symbol]: ethers.BigNumber.from(await wethContract.balanceOf(pairAddress)),
		[await getTokenSymbol(tokenAddressContract)]: ethers.BigNumber.from(
			await tokenAddressContract.balanceOf(pairAddress),
		).mul(
			ethers.BigNumber.from(10).pow(
				18 - (await tokenAddressContract.decimals()),
			),
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
	slippage,
	tokenAddress,
	weth,
}: {
	provider: providers.Provider;
	weth: string;
	tokenAddress: string;
	addressRouter: string;
	amount: string | number;
	slippage: string | number;
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
		balanceOfToken,
	);

	const amountIn = await routerContract.getAmountIn(
		amountWETH9InWei,
		balanceOfToken,
		balanceOfWETH,
	);

	const minOut = ethers.BigNumber.from(amountOut).sub(
		ethers.BigNumber.from(amountOut)
			.mul(Number.parseFloat(`${slippage}`) * 100)
			.div(10000),
	);
	const maxIn = ethers.BigNumber.from(amountIn).add(
		ethers.BigNumber.from(amountIn)
			.mul(Number.parseFloat(`${slippage}`) * 100)
			.div(10000),
	);

	return {
		minOut,
		maxIn,
		minOutDisplay: minOut.mul(
			ethers.BigNumber.from(10).pow(18 - tokenDecimals),
		),
		maxInDisplay: maxIn.mul(ethers.BigNumber.from(10).pow(18 - tokenDecimals)),
	};
};

const startSendTx = async ({
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
	const routerContract = getRouterContract(
		addressRouter,
		wallet.provider,
	).connect(wallet);
	const methodName =
		step.method === "buy"
			? "swapExactTokensForTokens"
			: "swapTokensForExactETH";

	const { minOut, maxIn } = await calculateAmount({
		provider: wallet.provider,
		weth: WETH,
		tokenAddress,
		addressRouter,
		amount: step.amount,
		slippage: step.slippage,
		factoryAddress,
	});

	const args =
		step.method === "buy"
			? [
					ethers.utils.parseUnits(`${step.amount}`, "ether").toString(),
					minOut,
					[WETH, tokenAddress],
					wallet.address,
					Math.floor(Date.now() / 1000) + 60 * 10,
				]
			: [
					ethers.utils.parseUnits(`${step.amount}`, "ether").toString(),
					maxIn,
					[tokenAddress, WETH],
					wallet.address,
					Math.floor(Date.now() / 1000) + 60 * 10,
				];

	const tokenContract = getERC20Contract(tokenAddress, wallet.provider).connect(
		wallet,
	);

	const allowance = await tokenContract.allowance(
		wallet.address,
		addressRouter,
	);
	if (
		BigNumber.from(allowance).lt(
			BigNumber.from(
				ethers.utils.parseUnits(`${step.amount}`, "ether").toString(),
			),
		)
	) {
		console.log(
			"Approve on sell",
			wallet.address,
			ethers.utils.formatEther(allowance),
		);
		const approve = await tokenContract.approve(
			addressRouter,
			ethers.constants.MaxUint256.toString(),
		);
		await approve.wait();
	}

	let gasLimitValue = "";
	if (gasLimit) {
		gasLimitValue = gasLimit;
	} else {
		gasLimitValue = (
			await routerContract.estimateGas[methodName](...args)
		).toString();
	}

	const payload = {
		gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei").toString(),
		value: "0",
		gasLimit: gasLimitValue,
	};

	console.log("[Transaction]", methodName, args, payload);
	const result = await routerContract[methodName](...args, payload);
	onResult?.(result, step);
	return result;
};

export {
	calculateAmount,
	getOfPairBalance,
	getProvider,
	getWallet,
	startSendTx,
};
