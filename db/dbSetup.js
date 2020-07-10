'use strict';

const knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'localhost',
    user : 'me',
    password : 'password',
    database : 'testhikes'
  }
});

module.exports = knex;
