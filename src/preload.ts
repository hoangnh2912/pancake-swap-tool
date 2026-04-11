// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { app } from "electron";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("AppInfo", {
  name: app.getName(),
  version: app.getVersion(),
});

contextBridge.exposeInMainWorld("Shell", {
  openExternal: (url: string) =>
    ipcRenderer.send("open-link", url),
  setProcessBar: (value: number) =>
    ipcRenderer.send("set-progress-bar", value),
});
