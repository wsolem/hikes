const { table } = require("../../knex");

exports.up = function(knex) {
  return knex.schema.hasColumn('users', 'usertype').then((exists) => {
    if (!exists) {
      return knex.schema.table('users', (table) => {
        table.string('usertype'); 
      });
    }
  }).then(() => {
    return knex.schema.hasColumn('users', 'name').then((exists) => {
      if (exists) {
        return knex.schema.table('users', (table) => {
          table.renameColumn('name', 'firstname');
        });
      }
    });
  });
};

exports.down = function(knex) {
  // do i even want to do this???
  return knex.schema.table('users', (table) => {
    table.renameColumn('firstname', 'name');
    table.dropColumn('usertype');
  });
};
