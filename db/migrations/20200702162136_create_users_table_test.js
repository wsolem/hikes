exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.string('email');
    table.string('userid').notNullable().unique();
    table.string('username').notNullable().unique();
    table.string('lastname');
    table.string('password');/// do i want this?

  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
