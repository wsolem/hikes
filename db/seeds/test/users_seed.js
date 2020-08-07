exports.seed = (knex) => knex('users').del() // delets all entries
  .then(() => knex('users')
    .insert({
      firstname: 'Willow',
      email: 'me@me.com',
      userid: 'abc123',
      username: 'willow',
      lastname: 'Solem',
      usertype: 'developer',
    }))
  .then(() => knex('users')
    .insert({
      firstname: 'Tina',
      email: 'tina@me.com',
      userid: 'zyx246',
      username: 'tinab',
      lastname: 'Belcher',
      usertype: 'paid',
    }))
  .then(() => knex('users')
    .insert({
      firstname: 'Gene',
      email: 'gene@me.com',
      userid: 'mno222',
      username: 'gbelcher',
      lastname: 'Belcher',
      usertype: 'free',
    }));
