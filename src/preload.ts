// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url: string) => ipcRenderer.send('open-link', url),
    onMessage: (callback: (message: string) => void) => ipcRenderer.on('message', (event, message) => callback(message)),
    readSheet: (tokenAddress: string, contractAddress: string) => ipcRenderer.invoke('sheets:read', tokenAddress, contractAddress),
    checkSheet: (wallet: string, contractAddress: string, tokenAddress: string) =>
        ipcRenderer.invoke('sheets:check', wallet, contractAddress, tokenAddress),
    writeSheet: (tokenAddress: string, contractAddress: string, ...wallets: string[]) =>
        ipcRenderer.invoke('sheets:write', tokenAddress, contractAddress, ...wallets),
    writeSheetBalance: (wallet: string, token: string, balance: string) =>
        ipcRenderer.invoke('sheets:writeBalance', wallet, token, balance),
    getMemoryInfo: () => ipcRenderer.invoke('get-memory-info'),
    saveFile: (tokenAddress: string, contractAddress: string) => ipcRenderer.invoke('sheets:save', tokenAddress, contractAddress),
    readFile: () => ipcRenderer.invoke('sheets:import'),
    countSheet: (tokenAddress: string, contractAddress: string) => ipcRenderer.invoke('sheets:count', tokenAddress, contractAddress),
    deleteAll: (tokenAddress: string, contractAddress: string) => ipcRenderer.invoke('sheets:deleteAll', tokenAddress, contractAddress),
    deleteAirdrop: (tokenAddress: string, contractAddress: string) => ipcRenderer.invoke('sheets:deleteAirdrop', tokenAddress, contractAddress),
})

// Buffer, TypedArray, or DataView
