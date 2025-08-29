import { ethers, type providers } from 'ethers'
import { ERC20_ABI, FACTORY_PANCAKE_V2_ABI, ROUTER_PANCAKE_V2_ABI } from './utils/abi'

const instance = {
    provider: {} as {
        [key: string]: providers.JsonRpcProvider
    },
    wallet: {} as {
        [key: string]: ethers.Wallet
    },
    routerContract: {} as {
        [key: string]: ethers.Contract
    },
    factoryContract: {} as {
        [key: string]: ethers.Contract
    },
    wethContract: {} as {
        [key: string]: ethers.Contract
    },
    tokenContract: {} as {
        [key: string]: ethers.Contract
    },
    tokenSymbol: {} as {
        [key: string]: string
    },
}

const getProvider = (rpc: string) => {
    if (!instance.provider[rpc]) {
        instance.provider[rpc] = new ethers.providers.JsonRpcProvider(rpc)
    }
    return instance.provider[rpc]
}

const getWallet = (provider: providers.JsonRpcProvider, privateKey: string) => {
    if (!instance.wallet[privateKey]) {
        instance.wallet[privateKey] = new ethers.Wallet(privateKey, provider)
    }
    return instance.wallet[privateKey]
}

const getRouterContract = (address: string, provider: providers.Provider) => {
    if (!instance.routerContract[address]) {
        instance.routerContract[address] = new ethers.Contract(
            address,
            ROUTER_PANCAKE_V2_ABI,
            provider
        )
    }
    return instance.routerContract[address]
}

const getERC20Contract = (address: string, provider: providers.Provider) => {
    if (!instance.tokenContract[address]) {
        instance.tokenContract[address] = new ethers.Contract(address, ERC20_ABI, provider)
    }
    return instance.tokenContract[address]
}

const getFactoryContract = (address: string, provider: providers.Provider) => {
    if (!instance.factoryContract[address]) {
        instance.factoryContract[address] = new ethers.Contract(
            address,
            FACTORY_PANCAKE_V2_ABI,
            provider
        )
    }
    return instance.factoryContract[address]
}

const getTokenSymbol = async (tokenAddressContract: ethers.Contract) => {
    if (!instance.tokenSymbol[tokenAddressContract.address]) {
        instance.tokenSymbol[tokenAddressContract.address] = await tokenAddressContract.symbol()
    }
    return instance.tokenSymbol[tokenAddressContract.address]
}

const getOfPairBalance = async (
    provider: providers.Provider,
    weth: string,
    tokenAddress: string,
    factoryAddress: string,
    symbol: string
) => {
    const factoryContract = getFactoryContract(factoryAddress, provider)
    const wethContract = getERC20Contract(weth, provider)
    const tokenAddressContract = getERC20Contract(tokenAddress, provider)
    const pairAddress = await factoryContract.getPair(weth, tokenAddress)

    const pairBalance = {
        [symbol]: ethers.BigNumber.from(await wethContract.balanceOf(pairAddress)),
        [await getTokenSymbol(tokenAddressContract)]: ethers.BigNumber.from(
            await tokenAddressContract.balanceOf(pairAddress)
        ).mul(ethers.BigNumber.from(10).pow(18 - (await tokenAddressContract.decimals()))),
        Native: await provider.getBalance(pairAddress),
    }

    return {
        pairBalance,
        pairAddress,
    }
}

export { getOfPairBalance, getProvider, getWallet }
