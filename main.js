'use strict';

const electron = require('electron');

let mainWindow;

const createWindow = function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width:  1024,
    height: 768,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });
};

electron.app.on('ready', createWindow);

electron.app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

electron.app.on('activate', function onActivate() {
  if (!mainWindow) {
    createWindow();
  }
});
