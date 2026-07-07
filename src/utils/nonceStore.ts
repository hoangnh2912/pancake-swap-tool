import { Store } from '@tanstack/store'

// Global nonce counter per wallet address — shared across all tabs
export const nonceStore = new Store<Record<string, number>>({})

export function getNextNonce(walletAddress: string): number {
    const key = walletAddress.toLowerCase()
    const state = nonceStore.state
    const n = state[key] ?? 0
    nonceStore.setState((prev) => ({ ...prev, [key]: n + 1 }))
    return n
}

export function setBaseNonce(walletAddress: string, base: number): void {
    const key = walletAddress.toLowerCase()
    nonceStore.setState((prev) => {
        // Only set if not already initialized
        if (prev[key] !== undefined) return prev
        return { ...prev, [key]: base }
    })
}

export function resetNonce(walletAddress: string): void {
    const key = walletAddress.toLowerCase()
    nonceStore.setState((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
    })
}
