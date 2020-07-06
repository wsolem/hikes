exports.up = function(knex) {
  return knex.schema.createTable('lists', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.string('listid').notNullable().unique();
    table.specificType('hikeids', 'text ARRAY');
    table.specificType('userids', 'text ARRAY');
    table.string('ownerid').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('lists');
};
