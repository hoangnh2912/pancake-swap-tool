// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) =>
    ipcRenderer.send("open-link", url),
  setProcessBar: (value: number) =>
    ipcRenderer.send("set-progress-bar", value),
  saveFile: (data: string) => ipcRenderer.send("save-file", data),
});
