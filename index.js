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

const fadeText = function fadeText(
  text, x, y, orientation, initialAlpha, step
) {
  const chars = text.split('');

  const alphas = [];

  for (let i = 0; i < chars.length; i++) {
    alphas.push(initialAlpha);
  }

  const interval = setInterval(function fade() {
    chars.forEach(function fadeChar(char, i) {
      let xOffset = 0;
      let yOffset = 0;

      if (orientation) {
        xOffset = 36 * i;
      } else {
        yOffset = 36 * i;
      }

      clearText(char, x + xOffset, y + yOffset);
      displayText(char, x + xOffset, y + yOffset, alphas[i]);

      alphas[i] += step;

      if (alphas[i] > 1 || alphas[i] < 0) {
        clearInterval(interval);
      }
    });
  }, 50);
};

const fadeInText = function fadeInText(text, x, y, orientation) {
  fadeText(text, x, y, orientation, 0, 0.05);
};

const fadeOutText = function fadeOutText(text, x, y, orientation) {
  fadeText(text, x, y, orientation, 1, -0.05);
};

electron.ipcRenderer.on('clear', function clearWords() {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

electron.ipcRenderer.on('display-words', function displayWords(event, words) {
  const orientations = [ Math.random() > 0.5 ? 0 : 1 ];

  for (let i = 1; i < words.length; i++) {
    orientations.push((orientations[i - 1] + 1) % 2);
  }

  let i = 0;
  let word;

  const interval = setInterval(function displayWord() {
    const x = 0;
    const y = canvas.height / 2;
    const orientation = orientations[i];

    const prevWord = word;

    if (prevWord) {
      fadeOutText(prevWord, x, y, orientations[i - 1]);
    }

    word = words[i];

    if (!word) {
      return clearInterval(interval);
    }

    fadeInText(word, x, y, orientation);

    i++;

  }, 2000);
});
