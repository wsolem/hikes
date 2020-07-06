// knex and promise - i don't tink promise 
  exports.seed = (knex, Promise) => {
    return knex('trailheads').del() // delets all entries
      .then(() => {
        return knex('users').insert({
          name: 'Willow',
          email: 'me@me.com',
          userid: 'abc123',
          username: 'willow',
          lastname: 'Solem'  
        });
      }).then(() => {
        return knex('users').insert({
          name: 'Tima',
          email: 'tina@me.com',
          userid: 'zyx246',
          username: 'tinab',
          lastname: 'Belcher' 
        });
      }).then(() => {
        return knex('users').insert({
          name: 'Gene',
          email: 'gene@me.com',
          userid: 'mno222',
          username: 'gbelcher',
          lastname: 'Belcher' 
        });
      });
  }