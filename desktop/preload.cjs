const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('palettePilotDesktop', {
  savePalette: (name, text) => ipcRenderer.invoke('palette:save', name, text),
});
