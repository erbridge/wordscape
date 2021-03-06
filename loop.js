'use strict';

const fs   = require('fs');
const path = require('path');

const _ = require('lodash');

const CORPORA_DATA_PATH = path.join(
  __dirname, 'node_modules', 'corpora', 'data'
);

const getRandomCharacter = function getRandomCharacter() {
  return new Promise(function promiseToGetCharacterSet(resolve, reject) {
    fs.readFile(
      path.join(CORPORA_DATA_PATH, 'archetypes', 'character.json'),
      function parseJson(err, data) {
        if (err) {
          return reject(err);
        }

        const parsedData = JSON.parse(data);

        resolve(parsedData.characters);
      }
    );
  })
    .then(function getCharacter(characters) {
      return Promise.resolve(_.sample(characters));
    });
};

const createWordList = function createWordList(character) {
  const list = [];

  if (character.qualities.length) {
    list.push(_.sample(character.qualities));
  }

  const synonyms = [ character.name ].concat(character.synonyms);

  list.push(_.sample(synonyms));

  const isValid = _.every(list, function sharesLetters(word, i) {
    const nextWord = list[i + 1];

    if (!nextWord) {
      return true;
    }

    return _.intersection(word.split(''), nextWord.split('')).length;
  });

  if (!isValid) {
    return createWordList(character);
  }

  return Promise.resolve(list);
};

module.exports = {
  start(window, initialWords) {
    window.webContents.send('clear');

    if (initialWords && initialWords.length) {
      window.webContents.send('display-words', initialWords);
    } else {
      getRandomCharacter()
        .then(createWordList)
        .then(function displayWords(words) {
          window.webContents.send('display-words', words);

          return Promise.resolve();
        })
        .catch(function onRejected(err) {
          console.error(err);
        });
    }
  },
};
