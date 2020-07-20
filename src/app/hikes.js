'use strict';

const hikesDb = require('../db/hikes');

const ensureArray = (field) => {
  if (typeof field === 'string') {
    field = [field];
  }
  return field;
}

const { v4: uuidv4 } = require('uuid');
const { restore } = require('sinon');

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

const validateHike = (hike) => {
  const hikeFields = Object.keys(hike);
  const hasAllFields = hasRequiredFields(hikeFields);
  const hasOnlyExpectedFields = hasExpectedFields(hikeFields);
  return (hasAllFields && hasOnlyExpectedFields);
  // let { date, difficulty, distance, hiked, name, parks, regions, tags, trailheads } = hike;
  // check that it has corre
}

const hasRequiredFields = (hikeFields) => {
  const requiredFields = [ 'name', 'distance', 'difficulty' ];
  return requiredFields.every(fld => hikeFields.includes(fld));
}

const hasExpectedFields = (hikeFields) => {
  const expectedFields = [ 'name', 'distance', 'hiked', 'date', 'difficulty', 'regions', 'parks', 'trailheads', 'tags' ];
  // for every field in hikeFields, we should expect to see in expectedFields
  return hikeFields.every(fld => expectedFields.includes(fld)); // so we'll get a false if there is a hike that isn't in expectedFields
}
const createOneHike = (hike, res) => {
  let isValid = validateHike(hike);
  if (!isValid) {
    // return instead of throw to handle arrays with both incorrect and correct hikes
    return new Error(`'${hike.name}' creation failed`);
  }
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
      return hikeid;
    } else {
      // handle error
    }
  }).catch(err => res.send(err));
}

const createHike = async (req, res) => {
  let hikes = req.body;
  let hikeIds = [];
  let hikeErrs = [];

  if (Array.isArray(hikes)) {
    try {
      let hikesRes = hikes.map(async (hike) => await createOneHike(hike));
      let hikesAndErrs = await Promise.all(hikesRes);
      hikesAndErrs.forEach(hikeOrErr => {
        (hikeOrErr instanceof Error) ? hikeErrs.push(hikeOrErr.message) : hikeIds.push(hikeOrErr);
      });
    } catch(err) {
      // this is a db error
      console.log(err);
    } finally {
      if (hikeIds.length > 0) {
        res.status(201).json( { hikeIds, hikeErrs });
      } else {
        res.status(400).json({ hikeErrs });
      }
    }
  } else {
    try {
      const hikeIdOrErr = await createOneHike(hikes, res);
      if (hikeIdOrErr instanceof Error) {
        res.status(400).send(hikeIdOrErr.message);
      } else {
        res.status(201).json({ hikeIds: [hikeIdOrErr] });
      }
    } catch(err) {
      // todo: make this consistent
      res.status(400).send(err.message)
    }
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