const { v4: uuidv4 } = require('uuid');
const hikesDb = require('../db/hikes');

const expectedFields = ['name', 'distance', 'hiked', 'date', 'difficulty', 'regions', 'parks', 'trailheads', 'tags'];

// The following functions are helper functions
// I suppose I should add some tests for the helper functions
function ensureArray(fld) {
  let field = fld;
  if (typeof fld === 'string') {
    field = [fld];
  }
  return field;
}

function hasRequiredFields(hikeFields) {
  const requiredFields = ['name', 'distance', 'difficulty'];
  return requiredFields.every((fld) => hikeFields.includes(fld));
}

function hasExpectedFields(hikeFields) {
  // for every field in hikeFields, we should expect to see in expectedFields
  // so we'll get a false if there is a hike that isn't in expectedFields
  return hikeFields.every((fld) => expectedFields.includes(fld));
}

function validateHike(hike) {
  const hikeFields = Object.keys(hike);
  const hasAllFields = hasRequiredFields(hikeFields);
  const hasOnlyExpectedFields = hasExpectedFields(hikeFields);
  return (hasAllFields && hasOnlyExpectedFields);
  // check that it has corre
}
// There is a lot more this should do
// As in make sure that it isn't sneaky db requests, etc
// also gonna want to do a sanitize fields too
// but for now, gonna make it simple and just check type

function validateFields(hikeFields) {
  // hikeFields should be an object with key-value pairs of each
  // so I guess first we'll get an array of all the keys
  const hikeKeys = Object.keys(hikeFields);

  return hikeKeys.every((hikeKey) => {
    let correctFieldType;
    const hikeValue = hikeFields[hikeKey];
    let correctedHikeVal = hikeValue;

    if (['regions', 'parks', 'trailheads', 'tags'].includes(hikeKey)) {
      return Array.isArray(hikeValue) && hikeValue.every((fld) => typeof fld === 'string');
    }

    switch (hikeKey) {
      case 'difficulty':
        if (typeof hikeValue === 'string') {
          correctedHikeVal = Number.parseInt(hikeValue, 10);
        }
        correctFieldType = Number.isInteger(correctedHikeVal);
        break;
      case 'distance':
        correctFieldType = !(Number.isNaN(Number(hikeValue)));
        break;
      case 'name':
        correctFieldType = typeof hikeValue === 'string';
        break;
      case 'date':
        correctFieldType = hikeValue instanceof Date;
        break;
      case 'hiked':
        correctFieldType = typeof hikeValue === 'boolean';
        break;
      default:
        correctFieldType = false; // here we're into fields that should not exist
    }
    return correctFieldType;
  });
}

const getHikes = (req, res) => hikesDb.allHikes()
  .then((hikes) => {
    if (hikes) {
      res.status(200).json(hikes);
    } else {
      // so we're getting nothing back -> why?
    }
  }).catch((err) => res.send(err));

// to do: deal with errors
const getHikeByHikeId = (req, res) => {
  const { hikeid } = req.params;
  // todo: externalize error
  return hikesDb.selectHikeByHikeId(hikeid)
    .then((hikes) => {
      if (hikes) {
        if (hikes.length === 0) {
          // this hike does not exist
          res.status(404).json({
            error: 'This resource does not exist',
          });
        } else {
          res.status(200).json(hikes);
        }
      } else {
        // handle error
      }
    }).catch((err) => res.send(err));
};

const createOneHike = (hike, res) => {
  const isValid = validateHike(hike);
  if (!isValid) {
    // return instead of throw to handle arrays with both incorrect and correct hikes
    return new Error(`'${hike.name}' creation failed`);
  }

  const {
    date, difficulty, distance, hiked, name,
  } = hike;
  let {
    parks, regions, tags, trailheads,
  } = hike;
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
    hikeid,
  }).then((result) => (result ? hikeid : 0))
    .catch((err) => res.send(err));
};

const createHike = async (req, res) => {
  const hikes = req.body;
  const hikeIds = [];
  const hikeErrs = [];

  if (Array.isArray(hikes)) {
    try {
      const hikesRes = hikes.map((hike) => createOneHike(hike));
      const hikesAndErrs = await Promise.all(hikesRes);
      hikesAndErrs.map((hikeOrErr) => {
        const isError = hikeOrErr instanceof Error;
        return isError ? hikeErrs.push(hikeOrErr.message) : hikeIds.push(hikeOrErr);
      });
    } catch (err) {
      // this is a db error
      res.send(err);
    } finally {
      if (hikeIds.length > 0) {
        res.status(201).json({ hikeIds, hikeErrs });
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
    } catch (err) {
      // todo: make this consistent
      res.status(400).send(err.message);
    }
  }
};

const updateHike = (req, res) => {
  const { hikeid } = req.params;
  const updateFields = req.body;
  const hasInvalidFields = !validateFields(updateFields);

  if (hasInvalidFields) {
    return res.status(400).send('Invalid fields');
  }

  return hikesDb.updateHike(hikeid, updateFields, updateFields)
    .then((result) => {
      if (result) {
        if (result instanceof Error) {
          res.status(400).send(result.message);
        } else {
          res.status(201).json({ hikeId: hikeid });
        }
      } else {
        // handle error
      }
    }).catch((err) => res.send(err));
};

const deleteHike = (req, res) => {
  const { hikeid } = req.params;
  return hikesDb.deleteHikeByHikeId(hikeid)
    .then((result) => {
      if (result) {
        res.status(200).json([hikeid]);
      } else {
        // I think this is because if nothing is change, a 0 is returned
        // which is registering as false
        res.status(404).json([hikeid]);
      }
    }).catch((err) => res.send(err));
};

module.exports = {
  getHikes,
  getHikeByHikeId,
  createHike,
  updateHike,
  deleteHike,
};
