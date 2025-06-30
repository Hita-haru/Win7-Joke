const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electronAPI', {
    saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
    openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
    showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
    showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
    readDirectory: (path) => ipcRenderer.invoke('read-directory', path),
    listDrives: () => ipcRenderer.invoke('list-drives'),
    moveToTrash: (path) => ipcRenderer.invoke('move-to-trash', path),
    listTrash: () => ipcRenderer.invoke('list-trash'),
    emptyTrash: () => ipcRenderer.invoke('empty-trash'),
    restoreFromTrash: (path) => ipcRenderer.invoke('restore-from-trash', path),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    // Expose ipcRenderer directly for notepad.js to use
    ipcRenderer: ipcRenderer
  }
);
