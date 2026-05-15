import { contextBridge, ipcRenderer } from 'electron'

declare const APP_VERSION: string

contextBridge.exposeInMainWorld('electron', {
    appVersion: APP_VERSION,
    compileContract: (sourceCode: string, solcVersion: string) =>
        ipcRenderer.invoke('compile-contract', sourceCode, solcVersion),
    loadConfig: () =>
        ipcRenderer.invoke('load-config'),
    saveConfig: (data: Record<string, string>) =>
        ipcRenderer.invoke('save-config', data),
    getSolcVersions: () =>
        ipcRenderer.invoke('get-solc-versions'),
})
