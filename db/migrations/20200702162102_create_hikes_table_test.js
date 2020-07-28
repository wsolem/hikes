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
