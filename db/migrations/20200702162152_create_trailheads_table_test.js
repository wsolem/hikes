exports.up = function(knex) {
  return knex.schema.createTable('trailheads', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.string('trailheadid').notNullable();
    table.string('maplink');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('trailheads');
};
