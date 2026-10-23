import { contextBridge, ipcRenderer } from 'electron'

declare const APP_VERSION: string

contextBridge.exposeInMainWorld('electron', {
    appVersion: APP_VERSION,
    compileContract: (sourceCode: string, solcVersion: string) =>
        ipcRenderer.invoke('compile-contract', sourceCode, solcVersion),
    loadConfig: (tabId?: string) => ipcRenderer.invoke('load-config', tabId),
    saveConfig: (data: Record<string, string>, tabId?: string) => ipcRenderer.invoke('save-config', data, tabId),
    getSolcVersions: () => ipcRenderer.invoke('get-solc-versions'),
    projectInfo: () => ipcRenderer.invoke('project-info'),
    projectTakePending: () => ipcRenderer.invoke('project-take-pending'),
    projectPickOpen: () => ipcRenderer.invoke('project-pick-open'),
    projectOpen: (filePath: string, password: string) => ipcRenderer.invoke('project-open', filePath, password),
    projectSave: () => ipcRenderer.invoke('project-save'),
    projectSaveAs: (password: string) => ipcRenderer.invoke('project-save-as', password),
    projectSetTabs: (tabs: unknown) => ipcRenderer.invoke('project-set-tabs', tabs),
    updateState: () => ipcRenderer.invoke('update-state'),
    checkForUpdates: () => ipcRenderer.invoke('update-check'),
    onUpdateStatus: (cb: (state: { status: string; message?: string }) => void) => {
        const h = (_e: unknown, state: { status: string; message?: string }) => cb(state)
        ipcRenderer.on('update-status', h)
        return () => ipcRenderer.removeListener('update-status', h)
    },
    onProjectSaveError: (cb: (msg: string) => void) => {
        const h = (_e: unknown, msg: string) => cb(msg)
        ipcRenderer.on('project-save-error', h)
        return () => ipcRenderer.removeListener('project-save-error', h)
    },
    onProjectMenu: (cb: (action: string) => void) => {
        const h = (_e: unknown, action: string) => cb(action)
        ipcRenderer.on('project-menu', h)
        return () => ipcRenderer.removeListener('project-menu', h)
    },
    onProjectOpenRequest: (cb: (filePath: string) => void) => {
        const h = (_e: unknown, filePath: string) => cb(filePath)
        ipcRenderer.on('project-open-request', h)
        return () => ipcRenderer.removeListener('project-open-request', h)
    },
})
