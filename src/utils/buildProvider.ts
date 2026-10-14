import { ethers } from 'ethers'

export function parseRpcList(raw: string): string[] {
    return raw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
}

export function buildProvider(rpcList: string[], chainId?: number): ethers.providers.BaseProvider {
    const urls = rpcList.filter((u) => u.trim())
    if (urls.length === 0) throw new Error('No RPC URL provided')
    // Truyền thẳng chainId khi biết trước — bỏ qua network auto-detect của ethers v5 (gọi
    // eth_chainId lặp lại, có thể bị treo retry nếu RPC trả lời không ổn định giữa các lần).
    const network = chainId ? { chainId, name: `chain-${chainId}` } : undefined
    if (urls.length === 1) return new ethers.providers.JsonRpcProvider(urls[0], network)
    return new ethers.providers.FallbackProvider(
        urls.map((url, i) => ({
            provider: new ethers.providers.JsonRpcProvider(url, network),
            priority: i + 1,
            stallTimeout: 2000,
            weight: 1,
        })),
        1
    )
}
