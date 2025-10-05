// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url: string) => ipcRenderer.send('open-link', url),
    onMessage: (callback: (message: string) => void) => ipcRenderer.on('message', (event, message) => callback(message)),
})

// Buffer, TypedArray, or DataView
