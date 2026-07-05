import { ethers } from 'ethers'

export function parseRpcList(raw: string): string[] {
    return raw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
}

export function buildProvider(rpcList: string[]): ethers.providers.BaseProvider {
    const urls = rpcList.filter((u) => u.trim())
    if (urls.length === 0) throw new Error('No RPC URL provided')
    if (urls.length === 1) return new ethers.providers.JsonRpcProvider(urls[0])
    return new ethers.providers.FallbackProvider(
        urls.map((url, i) => ({
            provider: new ethers.providers.JsonRpcProvider(url),
            priority: i + 1,
            stallTimeout: 2000,
            weight: 1,
        })),
        1
    )
}
