'use strict';

const environment = process.env.NODE_ENV || 'test';
const config = require('../knexfile.js')[environment];

module.exports = require('knex')(config);

// npx knex seed:make hikes_seed --env test
// npx knex seed:make users_seed --env test
// npx knex seed:make lists_seed --env test
// npx knex seed:make trailheads_seed --env test
