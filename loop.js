'use strict';

module.exports = {
  start(window) {
    window.webContents.send('display-word', 'test');
  },
};
