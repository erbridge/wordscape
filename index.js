/* eslint-env browser */

'use strict';

const electron = require('electron');


electron.ipcRenderer.on('clear', function clearWords() {
  document.body.innerHTML = '';
});

electron.ipcRenderer.on('display-words', function displayWords(event, words) {
  document.write(words.join('<br>'));
});
