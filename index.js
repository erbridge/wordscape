/* eslint-env browser */

'use strict';

const electron = require('electron');

if (!navigator.onLine) {
  alert(
    'You appear to be offline.\n\nThis app requires internet access to run.'
  );
}

electron.ipcRenderer.on('display-word', function displayWord(event, word) {
  document.write(word);
});
