/* eslint-env browser */

'use strict';

const electron = require('electron');

const BACKGROUND_COLOUR = 'rgba(255, 255, 255, 1)';
const CHAR_WIDTH        = 36;

const canvas  = document.createElement('canvas');
const context = canvas.getContext('2d');

canvas.width  = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.95;

document.body.appendChild(canvas);

const drawText = function drawText(text, x, y, colour) {
  context.fillStyle    = colour;
  context.font         = `normal ${CHAR_WIDTH}px monospace`;
  context.textAlign    = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, x, y);
};

const displayText = function displayText(text, x, y, alpha) {
  drawText(text, x, y, `rgba(0, 0, 0, ${alpha})`);
};

const clearText = function clearText(text, x, y) {
  context.fillStyle = BACKGROUND_COLOUR;
  context.fillRect(
    x - CHAR_WIDTH / 2, y - CHAR_WIDTH / 2, CHAR_WIDTH, CHAR_WIDTH
  );
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
    if (alphas[0] > 1 || alphas[0] < 0) {
      clearInterval(interval);
    }

    chars.forEach(function fadeChar(char, i) {
      let xOffset = 0;
      let yOffset = 0;

      if (orientation) {
        xOffset = CHAR_WIDTH * i;
      } else {
        yOffset = CHAR_WIDTH * i;
      }

      if (char !== ' ') {
        clearText(char, x + xOffset, y + yOffset);
      }

      displayText(char, x + xOffset, y + yOffset, alphas[i]);

      alphas[i] += step;
    });
  }, 2000 * Math.abs(step));
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

  let x = canvas.width / 2 - words[0].split('').length * CHAR_WIDTH / 2;
  let y = canvas.height / 2;

  const interval = setInterval(function displayWord() {
    const prevOrientation = orientations[i - 1];
    const orientation     = orientations[i];

    let prevWord = words[i - 1];

    word = words[i];

    i++;

    if (!word) {
      if (!prevWord) {
        clearInterval(interval);

        electron.ipcRenderer.send('display-words-complete');

        return;
      }

      fadeOutText(prevWord, x, y, prevOrientation);

      return;
    }

    if (prevWord) {
      let firstMatchingIndexInPrevWord = -1;
      let firstMatchingIndexInWord = -1;

      // TODO: Get a random intersection, not the first one every time...
      word.split('').forEach(function findMatchingIndex(char, j) {
        if (firstMatchingIndexInPrevWord >= 0) {
          return;
        }

        firstMatchingIndexInPrevWord = prevWord.indexOf(char);

        if (firstMatchingIndexInPrevWord >= 0) {
          firstMatchingIndexInWord = j;
        }
      });

      prevWord = `${prevWord.substr(0, firstMatchingIndexInPrevWord)} ${prevWord.substr(firstMatchingIndexInPrevWord + 1)}`;
      word     = `${word.substr(0, firstMatchingIndexInWord)} ${word.substr(firstMatchingIndexInWord + 1)}`;

      fadeOutText(prevWord, x, y, prevOrientation);

      if (orientation) {
        x -= CHAR_WIDTH * firstMatchingIndexInWord;
        y += CHAR_WIDTH * firstMatchingIndexInPrevWord;
      } else {
        x += CHAR_WIDTH * firstMatchingIndexInPrevWord;
        y -= CHAR_WIDTH * firstMatchingIndexInWord;
      }
    }

    fadeInText(word, x, y, orientation);
  }, 2000);
});
