import { useEffect, useRef, useState } from 'react'
import { electronAPI } from '../utils/constants'

const useMemoryInfo = () => {
    const [memoryInfo, setMemoryInfo] = useState<Electron.ProcessMemoryInfo>()

    const fetchMemoryInfo = async () => {
        const info = await electronAPI.getMemoryInfo()
        setMemoryInfo(info)
    }

    const refInterval = useRef<NodeJS.Timeout>()

    const startFetching = () => {
        refInterval.current = setInterval(fetchMemoryInfo, 3000)
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
    }, [])

    return memoryInfo
}

export default useMemoryInfo
