const PANCAKE_ADDRESS = {
    BSC: {
        Mainnet: {
            Router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            WETH: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            Factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
            RPC: 'https://56.rpc.thirdweb.com/cce88ba586b9a9772e27e52376f7f39aa9fcaacc6097af98866edc47fab20cbfdc4a85d41ea11f49148cfc9fb25499d93248ef1080eec4978bc4b978b9d6770b',
            Explorer: 'https://bscscan.com',
            Name: 'BSC',
            Symbol: 'BNB',
        },
        Testnet: {
            Router: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
            WETH: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            Factory: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
            RPC: 'https://97.rpc.thirdweb.com/cce88ba586b9a9772e27e52376f7f39aa9fcaacc6097af98866edc47fab20cbfdc4a85d41ea11f49148cfc9fb25499d93248ef1080eec4978bc4b978b9d6770b',
            Token: '0x20Dab34A69eF4D6C387b2302E0e2163c17970B80',
            Explorer: 'https://testnet.bscscan.com',
            Name: 'BSC Testnet',
            Symbol: 'BNB',
        },
    },
}

const TOKEN_ADDRESS = [
    { label: 'USDT', value: '0x55d398326f99059ff775485246999027b3197955' },
    { label: 'USDC', value: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d' },
    { label: 'ETH', value: '0x2170ed0880ac9a755fd29b2688956bd959f933f8' },
    { label: 'WBNB', value: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
    { label: 'BTC', value: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c' },
]
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ENVIRONMENT_TYPE = {
    Mainnet: 'Mainnet',
    Testnet: 'Testnet',
}

const ENVIRONMENT: string = ENVIRONMENT_TYPE.Mainnet
const DEFAULT_PAGINATE_SIZE = 10
const electronAPI: {
    openExternal: (url: string) => void
    setProcessBar: (value: number) => void
    readSheet: (tokenAddress: string) => Promise<string[]>
    writeSheet: (tokenAddress: string, ...wallets: string[]) => Promise<void>
    checkSheet: (wallet: string, tokenAddress: string) => Promise<boolean>
    writeBalance: (wallet: string, token: string, balance: string) => Promise<void>
} = (window as any).electronAPI
export {
    PANCAKE_ADDRESS,
    ENVIRONMENT as ENVIROMENT,
    electronAPI,
    ZERO_ADDRESS,
    ENVIRONMENT_TYPE,
    DEFAULT_PAGINATE_SIZE,
    TOKEN_ADDRESS,
}
