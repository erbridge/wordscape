'use strict';

const fs = require('fs');
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

  return Promise.resolve(list);
};

module.exports = {
  start(window) {
    window.webContents.send('clear');

    getRandomCharacter()
      .then(createWordList)
      .then(function displayFirstWord(list) {
        window.webContents.send('display-word', list[0]);

        return Promise.resolve();
      })
      .catch(function onRejected(err) {
        console.error(err);
      });
  },
};
