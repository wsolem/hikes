'use strict';

const knex = require('../../knex');
// const knex = require('./dbSetup');
    // todo: this is just the get from database and return;
    // the err should be caught and handled with an error handler - but in service layer
    // and anyting with req/res shoud be jhandled in service layer
    // and this function should be called by service layer
    // and this is true of all g-d functions in hikes, lists, trailheads, and users

  // maybe i do want to get everything?
  const allHikes = () => {
    return knex('hikes').select('name', 'distance', 'difficulty', 'hikeid').orderBy('name')
    // .then((hikes) => {
    //   if (hikes) {
    //     console.log(hikes)
    //     return hikes;
    //   } else {
    //     return [];
    //   }
    // });
  }
  
  const selectHikeByHikeId = (hikeid) => {
    return knex('hikes')
      .select('name', 'distance', 'hiked', 'date', 'difficulty', 'hikeid', 'regions', 'parks', 'trailheads', 'tags')
      .where('hikeid', hikeid);
  }
  
  // todo: take out the ensureArray functino - that shoudl be handled externally
  const saveHike = (hike) => {  
    return knex('hikes').insert(hike);
  }
  
  const updateHike = (hikeid, updatefields) => {
    return knex('hikes')
      .where('hikeid', hikeid)
      .update(updatefields)
      .catch((err) => {
        return new Error('failed to update');
      });
  }
  
  const deleteHikeByHikeId = (hikeid) => {
    return knex('hikes')
      .where('hikeid', hikeid)
      .del().catch((err) => {
        return new Error('failed to delete');
      });
  }

  // create object to be returned and pass in knex
  module.exports = {
    allHikes,
    selectHikeByHikeId,
    saveHike,
    updateHike,
    deleteHikeByHikeId,
  }
