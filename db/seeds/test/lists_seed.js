exports.seed = (knex) => knex('lists').del() // delets all entries
  .then(() => knex('lists')
    .insert({
      name: 'Favorites',
      listid: '1234bbbb',
      hikeids: ['123456', '654321'],
      userids: ['abc123', 'zyx246'],
      ownerid: 'zyx246',
    }))
  .then(() => knex('lists')
    .insert({
      name: 'Favorites',
      listid: '4321cccc',
      hikeids: ['123456'],
      userids: ['mno222'],
      ownerid: 'mno222',
    }));
