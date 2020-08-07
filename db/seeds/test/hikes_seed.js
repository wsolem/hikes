exports.seed = (knex) => knex('hikes').del() // deletes all entries
  .then(() => knex('hikes')
    .insert({
      name: 'Sunrise Trek',
      distance: 13.2,
      hiked: false,
      difficulty: 4,
      hikeid: '123456',
    }))
  .then(() => knex('hikes')
    .insert({
      name: 'Backcountry',
      distance: 14,
      difficulty: 4,
      hikeid: '654321',
    }))
  .then(() => knex('hikes')
    .insert({
      name: 'Pond Loop',
      distance: 2,
      difficulty: 1,
      hikeid: '246812',
      description: 'Beautiful views, can see birds',
    }));
