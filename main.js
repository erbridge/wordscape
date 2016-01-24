'use strict';

const electron = require('electron');

const loop = require('./loop');

let mainWindow;

const createWindow = function createWindow() {
  mainWindow = new electron.BrowserWindow({
    title:      'WordScape',
    fullscreen: true,
    frame:      false,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });

  electron.ipcMain.on('display-words-complete', function restartLoop() {
    loop.start(mainWindow);
  });

  mainWindow.webContents.on('dom-ready', function startLoop() {
    loop.start(mainWindow, [ 'WordScape' ]);
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
