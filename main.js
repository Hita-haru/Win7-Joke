const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Disable Node.js integration in renderer process
      contextIsolation: true, // Enable context isolation for security
      webviewTag: true // Enable webview tag
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('show-save-dialog', async (event) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return canceled ? null : filePath;
  });

  ipcMain.handle('show-open-dialog', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle('save-file', async (event, filePath, content) => {
    try {
      fs.writeFileSync(filePath, content);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('open-file', async (event, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      return { success: true, files: files.map(file => ({
        name: file.name,
        isDirectory: file.isDirectory()
      })) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('list-drives', async (event) => {
    const drives = [];
    // For Windows, check drive letters A-Z
    for (let i = 65; i <= 90; i++) { // ASCII A to Z
      const driveLetter = String.fromCharCode(i);
      const drivePath = `${driveLetter}:\\`;
      try {
        fs.accessSync(drivePath); // Check if drive exists and is accessible
        drives.push(drivePath);
      } catch (e) {
        // Drive does not exist or is not accessible
      }
    }
    return { success: true, drives };
  });

  ipcMain.handle('move-to-trash', async (event, filePath) => {
    try {
      await shell.trashItem(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('list-trash', async () => {
    try {
      // Electron's shell.trashItem doesn't provide a direct way to list trash contents.
      // This would require platform-specific implementations or external libraries.
      // For now, we'll return an empty array or a placeholder.
      return { success: true, items: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('empty-trash', async () => {
    try {
      await shell.emptyTrash();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('restore-from-trash', async (event, filePath) => {
    try {
      // Electron's shell.trashItem doesn't provide a direct way to restore from trash.
      // This would require platform-specific implementations or external libraries.
      return { success: false, error: 'Restore from trash not supported yet.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('quit-app', async () => {
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});