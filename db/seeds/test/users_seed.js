// knex and promise - i don't tink promise 
  exports.seed = (knex, Promise) => {
    return knex('users').del() // delets all entries
      .then(() => {
        return knex('users').insert({
          firstname: 'Willow',
          email: 'me@me.com',
          userid: 'abc123',
          username: 'willow',
          lastname: 'Solem',
          usertype: 'developer'
        });
      }).then(() => {
        return knex('users').insert({
          firstname: 'Tina',
          email: 'tina@me.com',
          userid: 'zyx246',
          username: 'tinab',
          lastname: 'Belcher',
          usertype: 'paid'
        });
      }).then(() => {
        return knex('users').insert({
          firstname: 'Gene',
          email: 'gene@me.com',
          userid: 'mno222',
          username: 'gbelcher',
          lastname: 'Belcher',
          usertype: 'free'
        });
      });
  }