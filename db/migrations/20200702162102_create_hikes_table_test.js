// hkes, user, lists, trailheads
exports.up = function(knex) {
  return knex.schema.createTable('hikes', function(table) {
    table.increments();
    table.string('name').notNullable().unique();
    table.specificType('distance', 'numeric(5,2)');
    table.boolean('hiked');
    table.date('date');
    table.integer('difficulty').notNullable();
    table.string('hikeid').notNullable();
    table.specificType('regions', 'text ARRAY');
    table.specificType('parks', 'text ARRAY');
    table.specificType('trailheads', 'text ARRAY');
    table.specificType('tags', 'text ARRAY');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('hikes');
};

/*
var environment = process.env.NODE_ENV || 'development';
var config = require('../knexfile.js')[environment];

module.exports = require('knex')(config);

exports.up = function(knex, Promise) {
  return knex.schema.createTable('shows', function(table){
    table.increments();
    table.string('name').notNullable().unique();
    table.string('channel').notNullable();
    table.string('genre').notNullable();
    table.integer('rating').notNullable();
    table.boolean('explicit').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('shows');
};
  t.specificType('stringarray', 'text ARRAY');

  id         | integer                |           | not null | nextval('hikes_id_seq'::regclass)
 name       | character varying(255) |           | not null | 
 distance   | numeric(5,2)           |           | not null | 
 hiked      | boolean                |           |          | 
 date       | date                   |           |          | 
 difficulty | integer                |           | not null | 
 hikeid     | character varying(255) |           |          | 
 regions    | text[]                 |           |          | 
 parks      | text[]                 |           |          | 
 trailheads | text[]                 |           |          | 
 tags       | text[]        
*/