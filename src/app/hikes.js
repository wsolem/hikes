'use strict';

const hikesDb = require('../db/hikes');

const ensureArray = (field) => {
  if (typeof field === 'string') {
    field = [field];
  }
  return field;
}

const { v4: uuidv4 } = require('uuid');

const getHikes = (req, res) => {
  return hikesDb.allHikes()
  .then(hikes => {
    if(hikes) {
      res.status(200).json(hikes);
    } else {
      // update failed - throw error?
    }
  }).catch(err => {
    res.send(err); // need something better
  });
};

module.exports = {
  getHikes,

}