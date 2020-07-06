// knex and promise - i don't tink promise 
  exports.seed = (knex, Promise) => {
    return knex('lists').del() // delets all entries
      .then(() => {
        return knex('lists').insert({
          name: 'Favorites',
          listid: '1234bbbb',
          hikeids: ['123456', '654321'],
          userids: ['abc123', 'zyx246'],
          ownerid: 'zyx246'
        });
      }).then(() => {
        return knex('lists').insert({
          name: 'Favorites',
          listid: '4321cccc',
          hikeids: ['123456'],
          userids: ['mno222'],
          ownerid: 'mno222'
        });
      });
  }