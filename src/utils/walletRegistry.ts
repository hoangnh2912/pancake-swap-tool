import { Store } from '@tanstack/store'

// Tracks which tab is currently running automation with which main (deploy) wallet.
// Used to block starting automation in 2+ tabs with the same main wallet —
// concurrent tx from the same wallet across tabs causes nonce collisions.
export const runningWalletsStore = new Store<Record<string, string>>({}) // tabId -> mainWalletAddress (lowercased)

export function registerRunningWallet(tabId: string, address: string): void {
    runningWalletsStore.setState((prev) => ({ ...prev, [tabId]: address.toLowerCase() }))
}

export function unregisterRunningWallet(tabId: string): void {
    runningWalletsStore.setState((prev) => {
        const copy = { ...prev }
        delete copy[tabId]
        return copy
    })
}

// Returns the conflicting tabId if another tab is already running with this wallet, else null
export function findWalletConflict(tabId: string, address: string): string | null {
    const addr = address.toLowerCase()
    const state = runningWalletsStore.state
    for (const [otherTabId, otherAddr] of Object.entries(state)) {
        if (otherTabId !== tabId && otherAddr === addr) return otherTabId
    }
    return null
}
