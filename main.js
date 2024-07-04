const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('get-files', (event, folderPath) => {
  console.log('Received get-files event with path:', folderPath);
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      event.reply('get-files-response', { success: false, message: err.message });
    } else {
      console.log('Files found:', files);
      const filePaths = files.map(file => path.join(folderPath, file)); // Monta os caminhos dos arquivos
      event.reply('get-files-response', { success: true, files: filePaths }); // Envia os caminhos dos arquivos
    }
  });
});

ipcMain.on('open-file', (event, filePath) => {
  console.log('Opening file:', filePath);
  shell.openPath(filePath); // Abrir o arquivo no sistema operacional
  event.reply('open-file-response', { success: true });
});
