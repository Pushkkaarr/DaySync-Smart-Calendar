const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Add any API methods here if needed
    // example: sendMessage: (message) => ipcRenderer.send('message', message)
});
