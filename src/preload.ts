// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url: string) => ipcRenderer.send('open-link', url),
    setProcessBar: (value: number) => ipcRenderer.send('set-progress-bar', value),
    readSheet: (tokenAddress: string) => ipcRenderer.invoke('sheets:read', tokenAddress),
    checkSheet: (wallet: string, tokenAddress: string) =>
        ipcRenderer.invoke('sheets:check', wallet, tokenAddress),
    writeSheet: (tokenAddress: string, ...wallets: string[]) =>
        ipcRenderer.invoke('sheets:write', tokenAddress, ...wallets),
    writeSheetBalance: (fileName: string, wallet: string, token: string, balance: string) =>
        ipcRenderer.invoke('sheets:writeBalance', fileName, wallet, token, balance),
    getMemoryInfo: () => ipcRenderer.invoke('get-memory-info'),
    saveFile: (tokenAddress: string) => ipcRenderer.invoke('sheets:save', tokenAddress),
})

// Buffer, TypedArray, or DataView
