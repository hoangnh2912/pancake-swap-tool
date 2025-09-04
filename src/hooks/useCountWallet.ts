import { useEffect, useRef, useState } from 'react'
import { electronAPI } from '../utils/constants'

const useCountWallet = (
    tokenAddress: string,
    contractAddress: string
) => {
    const [walletCount, setWalletCount] = useState<number>(0)
    const [airdropCount, setAirdropCount] = useState<number>(0)

    const fetchWalletCount = async () => {
        if (!contractAddress) return
        const count = await electronAPI.countSheet(tokenAddress, contractAddress)
        setWalletCount(count.countAll)
        setAirdropCount(count.countAirdrop)
    }

    const refInterval = useRef<NodeJS.Timeout>()

    const startFetching = () => {
        refInterval.current = setInterval(fetchWalletCount, 3000)
    }

    const stopFetching = () => {
        if (refInterval.current) {
            clearInterval(refInterval.current)
        }
    }
    useEffect(() => {
        startFetching()
        return () => {
            stopFetching()
        }
    }, [tokenAddress, contractAddress])

    return {
        walletCount,
        airdropCount,
        refetch: fetchWalletCount
    }
}

export default useCountWallet
