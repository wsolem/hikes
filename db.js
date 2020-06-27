'use strict';

// TODO: This should be broken into four separate files  - this, the parent file, and then files for updates to lists and to hikes

// all this should be externalized obvs
const knex = require('knex')({
  client: 'pg',
  // version: '7.2',
  connection: {
    host : 'localhost',
    user : 'me',
    password : 'password',
    database : 'hikes'
  }
});
// const Pool = require('pg').Pool;
// const pool = new Pool({
//   user: 'me',
//   host: 'localhost',
//   database: 'hikes',
//   password: 'password',
//   port: 5432,
// });

const { v4: uuidv4 } = require('uuid');


// start with CRUD
// dodo: get hikes by categeory - by region, by park, by hiked, by distance, by difficulty
// i'll just order after the fact
const getHikesByCategory = (req, res, category) => {

//   // knex('hikes').where('')

//   // ugh my brain aint working super goood
//   pool.query(`SELECT * FROM hikes WHERE ${category} = $1`, [categoryValue], (error, results) => {
//     if (error) {
//       throw error;
//     }
//     res.status(200).json(results.rows);
//   });
}
  /*
  name: string
  regions: string || string[] --> string[]
  distance: number
  hiked: boolean
  date: date
  difficulty: integer
  hikeid: null --> uuid
  parks: string || string[] --> string[]
  trailheads: string || string[] --> string[]
  tags: string || string[] --> string[]
  */
// maybe i do want to get everything?
const getHikes = (req, res) => {
  knex('hikes').select('name', 'distance', 'difficulty', 'hikeid').orderBy('name')
    .then(hikes => {
      if(hikes) {
        // update succeeded
        console.log(hikes)
        res.status(200).json(hikes);
      } else {
        // update failed - throw error?
      }
    }).catch(err => {
      res.send(err); // need something better
    })


  // pool.query('SELECT * FROM hikes ORDER BY id ASC', (error, results) => {
  //   if (error) {
  //     throw error;
  //   }
  //   res.status(200).json(results.rows);
  // });
}

const getHikeByHikeId = (req, res) => {
  const hikeid = parseInt(req.params.hikeid);

  knex('hikes').where('hikeid', hikeid).then(hikes => {
    if (hikes) {
      res.status(200).json(hikes);
    } else {
      // handle error
    }
  }).catch(err => res.send(err));
  // pool.query('SELECT * FROM hikes WHERE hikeid = $1', [hikeid], (error, results) => {
  //   if (error) {
  //     throw error;
  //   }
  //   res.status(200).json(results.rows);
  // });
}

const ensureArray = (field) => {
  if (typeof field === 'string') {
    field = [field];
  }
  return field;
}

const createHike = (req, res) => {
  // console.log(req.body);
  let { date, difficulty, distance, hiked, name, parks, regions, tags, trailheads } = req.body;
  const hikeid = uuidv4();
  regions = ensureArray(regions);
  parks = ensureArray(parks);
  trailheads = ensureArray(trailheads);
  tags = ensureArray(tags);
 // this absolutely heeds a handler - to fix the input types
  /*
  name: string
  regions: string || string[] --> string[]
  distance: number
  hiked: boolean
  date: date
  difficulty: integer
  hikeid: null --> uuid
  parks: string || string[] --> string[]
  trailheads: string || string[] --> string[]
  tags: string || string[] --> string[]
  */

  knex('hikes').insert({
    date,
    difficulty,
    distance,
    hiked,
    name,
    parks,
    regions,
    tags,
    trailheads,
    hikeid
  }).then(result => {
    if (result) {
      res.status(201).send(`Hike added with ID: ${results.hikeid}`);
    } else {
      // handle error
    }
  }).catch(err => res.send(err));
  // pool.query('INSERT INTO hikes (date, difficulty, distance, hiked, name, parks, regions, tags, trailheads, hikeid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [date, difficulty, distance, hiked, name, parks, regions, tags, trailheads, hikeid], (error, results) => {
  //   if (error) {
  //     throw error;
  //   }
  //   res.status(201).send(`Hike added with ID: ${results.hikeid}`); // um we are not actually getting that back in teh results object
  // });
}

// todo: instead of name and email, update only one field and it is flexible, 
// and should be a loop where every possible option gets updated
const updateHike = (req, res) => {
  // const hikeid = parseInt(req.params.hikeid); // preferable to use hikeID
  
  // get a list of all the fields to update
  const { date, difficulty, distance, hiked, hikeid, name, parks, regions, tags, trailheads } = req.body;
  
  // get the hike 
  let existingHike = getHikeByHikeId(hikeid);

  // update the hike fields
  // so do i overwrite regardless or just update the fields that are different?
  // can use is distinct from
  
  // this can include appending or changing 

  // const { name, email } = req.body;

  // pool.query(
  //   'UPDATE hikes SET name = $1, email = $2 WHERE id = $3',
  //   [name, email, id],
  //   (error, results) => {
  //     if (error) {
  //       throw error;
  //     }
  //     res.status(200).send(`Hike modified with ID: ${id}`);
  //   }
  // );
}

const deleteHikeByHikeId = (req, res) => {
  const id = parseInt(req.params.hikeid)
  // this should use hike id, not id
  // pool.query('DELETE FROM hikes WHERE hikeid = $1', [hikeid], (error, results) => {
  //   if (error) {
  //     throw error;
  //   }
  //   res.status(200).send(`Hike deleted with Hike ID: ${hikeid}`);
  // });
}
/*
To do: CRUD for lists
//users stuff
// need login
// need profile page
// need to be logged in to create a list
/// for now we can have a dummy user - default for logging in
*/

const getUser = (req, res) => {
  // use something on page for this??? 
  // or is this a login thing?
  // for now, this will be a dummy call - it doesn't matter what exactly is sent, we are returning a dummy user
  // also, we will defintitely need to obscure username and password
  const { username, password } = req.body; // i mean, sorta
  knex('users').where('username', username).select('username', 'name', 'lastname', 'userid', 'email').then(result => {
    if (results) {
      res.status(200).json(results);
    } else {
      // handle error
    }
  }).catch(err => res.send(err));
  // pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
  //   if (error) {
  //     throw error;
  //   }
  //   res.status(200).json(results.rows);
  // });
}

const getUserById = (req, res) => {
  // this will be used 
}
const createUser = (req, res) => {

}

const updateUser = (req, res) => {

}

const deleteUser = (req, res) => {

}

const createList = (req, res) => {
  // what are the requirements for a list ? So it needs 
  const { name, region, parks, distance, link, hiked, date, difficulty } = req.body;
  const hikeId = uuidv4();
 // this absolutely heeds a handler - to fill in any empty fields 
  // pool.query('INSERT INTO hikes (name, region, parks, distance, link, hiked, date, difficulty, hikeID) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [name, region, parks, distance, link, hiked, date, difficulty, hikeId], (error, results) => {
  //   if (error) {
  //     throw error;
  //   }
  //   res.status(201).send(`Hike added with ID: ${results.insertId}`); // um we are not actually getting that back in teh results object
  // });
}

const getListsByUser = (req, res) => {
  // get all lists associated with user

}

const deleteList = (req, res) => {
  // this may become a permissions error since I think we will have lists that are shared - so it can have two owners
  // for now it is ok i think... will likely have to update the database 
}

const deleteHikeFromList = (req, res) => {
  //
}

const addHikeToList = (req, res) => {

}

module.exports = {
  getHikes,
  getHikeByHikeId,
  createHike,
  updateHike,
  deleteHikeByHikeId,
  getUser,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  getListsByUser,
  createList,
  deleteList,
  deleteHikeFromList,
  addHikeToList
}