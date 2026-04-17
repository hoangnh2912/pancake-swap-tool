import { contextBridge } from 'electron'

declare const APP_VERSION: string

contextBridge.exposeInMainWorld('electron', {
    appVersion: APP_VERSION,
})
