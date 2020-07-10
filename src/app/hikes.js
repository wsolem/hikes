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

// to do: deal with errors
const getHikeByHikeId = (req, res) => {
  const hikeid = req.params.hikeid;
 
  // todo: externalize error
  return hikesDb.selectHikeByHikeId(hikeid)
    .then(hikes => {
      if (hikes) {
        if (hikes.length === 0) {
          // this hike does not exist
          res.status(404).json({
            error: 'This resource does not exist'
          });
        } else {
          res.status(200).json(hikes);
        }
      } else {
        // handle error
      }
  }).catch(err => res.send(err));
}

const createOneHike = (hike, res) => {
  let { date, difficulty, distance, hiked, name, parks, regions, tags, trailheads } = hike;
  const hikeid = uuidv4();
  regions = ensureArray(regions);
  parks = ensureArray(parks);
  trailheads = ensureArray(trailheads);
  tags = ensureArray(tags);

  return hikesDb.saveHike({
    date,
    difficulty,
    distance,
    hiked,
    name,
    parks,
    regions,
    tags,
    trailheads,
    hikeid
  }).then(result => {
    if (result) {
      res.status(201).json({ hikeid });
    } else {
      // handle error
    }
  }).catch(err => res.send(err));
}

const createHike = (req, res) => {
  let hikes = req.body;
  if (Array.isArray(hikes)) {
    let hike;
    for (let i = 0; i < hikes.length; i++) {
      console.log(hike)
      hike = hikes[i];
      creatOneHike(hike, res);
    }
  } else {
    createOneHike(hikes, res);
  }
}

const updateHike = (req, res) => {
  // get a list of all the fields to update
  const { hikeid } = req.body;
  const updateFields = Object.assign({}, req.body);
  delete updateFields.hikeid;

  return hikesDb.updateHike(hikeid, updateFields)
    .then(result => {
      if (result) {
        res.status(201).send(`Hike updated with ID: ${hikeid}`);
      } else {
        // handle error
      }
    }).catch(err => res.send(err));
}

const deleteHike = (req, res) => {
  const { hikeid } = req.body;
  return hikesDb.deleteHikeByHikeId(hikeid)
    .then(result => {
      if(result) {
        res.status(201).send(`Hike updated with ID: ${hikeid}`);
      } else {
        // handle error
      }
    }).catch(err => res.send(err));
}

module.exports = {
  getHikes,
  getHikeByHikeId,
  createHike,
  updateHike,
  deleteHike
}