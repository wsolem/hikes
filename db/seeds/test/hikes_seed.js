  // knex and promise - i don't tink promise 
  exports.seed = (knex, Promise) => {
    return knex('hikes').del() // delets all entries
      .then(() => {
        return knex('hikes').insert({
          name: 'Sunrise Trek',
          distance: 13.2,
          hiked: false,
          difficulty: 4,
          hikeid: '123456',      
        });
      }).then(() => {
        return knex('hikes').insert({
          name: 'Backcountry',
          distance: 14,
          difficulty: 4,
          hikeid: '654321',
        });
      }).then(() => {
        return knex('hikes').insert({
          name: 'Pond Loop',
          distance: 2,
          difficulty: 1,
          hikeid: '246812',
        });
      });
  }
