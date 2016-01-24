/* eslint-env browser */

'use strict';

const electron = require('electron');

const BACKGROUND_COLOUR = 'rgba(255, 255, 255, 1)';

const canvas  = document.createElement('canvas');
const context = canvas.getContext('2d');

canvas.width  = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.95;

document.body.appendChild(canvas);

const drawText = function drawText(text, x, y, colour) {
  context.fillStyle = colour;
  context.font = 'normal 36px monospace';
  context.fillText(text, x, y);
};

const displayText = function displayText(text, x, y, alpha) {
  drawText(text, x, y, `rgba(0, 0, 0, ${alpha})`);
};

const clearText = function clearText(text, x, y) {
  drawText(text, x, y, BACKGROUND_COLOUR);
};

const fadeInText = function fadeInText(text, x, y) {
  let alpha = 0;

  const interval = setInterval(function fade() {
    clearText(text, x, y);
    displayText(text, x, y, alpha);

    alpha += 0.05;

    if (alpha > 1) {
      clearInterval(interval);
    }
  }, 50);
};

electron.ipcRenderer.on('clear', function clearWords() {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

electron.ipcRenderer.on('display-words', function displayWords(event, words) {
  fadeInText(words.join('\n'), 0, canvas.height / 2);
});
