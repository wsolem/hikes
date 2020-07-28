const knex = require('../../knex');

const allHikes = () => knex('hikes').select('name', 'distance', 'difficulty', 'hikeid').orderBy('name');

const selectHikeByHikeId = (hikeid) => knex('hikes')
  .select('name', 'distance', 'hiked', 'date', 'description', 'difficulty', 'hikeid', 'regions', 'parks', 'trailheads', 'tags')
  .where('hikeid', hikeid)
  .catch(() => new Error('failed to fetch'));

// todo: take out the ensureArray functino - that shoudl be handled externally
const saveHike = (hike) => knex('hikes').insert(hike).catch((err) => new Error(err.constraint));

const updateHike = (hikeid, updatefields) => knex('hikes')
  .where('hikeid', hikeid)
  .update(updatefields)
  .catch(() => new Error('failed to update')); // todo: handle actual error

const deleteHikeByHikeId = (hikeid) => knex('hikes')
  .where('hikeid', hikeid)
  .del()
  .catch(() => new Error('failed to delete')); // todo: handle actual error

// create object to be returned and pass in knex
module.exports = {
  allHikes,
  selectHikeByHikeId,
  saveHike,
  updateHike,
  deleteHikeByHikeId,
};
