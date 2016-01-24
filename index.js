/* eslint-env browser */

'use strict';

const electron = require('electron');

if (!navigator.onLine) {
  alert(
    'You appear to be offline.\n\nThis app requires internet access to run.'
  );
}

electron.ipcRenderer.on('clear', function clearWords() {
  document.body.innerHTML = '';
});

electron.ipcRenderer.on('display-words', function displayWords(event, words) {
  document.write(words.join('<br>'));
});
