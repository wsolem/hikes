exports.seed = (knex) => knex('trailheads').del() // delets all entries
  .then(() => knex('trailheads')
    .insert({
      name: 'Sunrise',
      trailheadid: 'b1b2b3',
      maplink: 'https://www.fakehikelink.com/sunrise',
    }))
  .then(() => knex('trailheads')
    .insert({
      name: 'Backcountry Trailhead',
      trailheadid: 'c2c4c6',
      maplink: 'https://www.fakehikelink.com/backcountry',
    }))
  .then(() => knex('trailheads')
    .insert({
      name: 'Pretty Pond',
      trailheadid: 'd9d8d7d6',
      maplink: 'https://www.fakehikelink.com/prettypond',
    }));
