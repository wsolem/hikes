
exports.up = function(knex) {
  return knex.schema.hasColumn('hikes', 'description').then((exists) => {
    if (!exists) {
      return knex.schema.table('hikes', (table) => {
        table.string('description'); 
      });
    }
  })
};

exports.down = function(knex) {
  return knex.schema.table('hikes', (table) => {
    table.dropColumn('description');
  });
};
