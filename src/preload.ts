import { contextBridge, ipcRenderer } from 'electron'

declare const APP_VERSION: string

contextBridge.exposeInMainWorld('electron', {
    appVersion: APP_VERSION,
    compileContract: (sourceCode: string, solcVersion: string) =>
        ipcRenderer.invoke('compile-contract', sourceCode, solcVersion),
    loadConfig: (tabId?: string) => ipcRenderer.invoke('load-config', tabId),
    saveConfig: (data: Record<string, string>, tabId?: string) => ipcRenderer.invoke('save-config', data, tabId),
    getSolcVersions: () => ipcRenderer.invoke('get-solc-versions'),
})
