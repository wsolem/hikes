  // knex and promise - i don't tink promise 
  exports.seed = (knex, Promise) => {
    return knex('trailheads').del() // delets all entries
      .then(() => {
        return knex('trailheads').insert({
          name: 'Sunrise',
          trailheadid: 'b1b2b3',
          maplink: 'https://www.fakehikelink.com/sunrise'      
        });
      }).then(() => {
        return knex('trailheads').insert({
          name: 'Backcountry Trailhead',
          trailheadid: 'c2c4c6',
          maplink: 'https://www.fakehikelink.com/backcountry'    
        });
      }).then(() => {
        return knex('trailheads').insert({
          name: 'Pretty Pond',
          trailheadid: 'd9d8d7d6',
          maplink: 'https://www.fakehikelink.com/prettypond'    
        });
      });
  }