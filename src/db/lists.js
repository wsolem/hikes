'use strict';
/*
To do: CRUD for lists
//users stuff
// need login
// need profile page
// need to be logged in to create a list
/// for now we can have a dummy user - default for logging in
*/


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

const removeHikeFromList = (req, res) => {
  //
}

const addHikeToList = (req, res) => {

}

module.exports = {
  getListsByUser,
  createList,
  deleteList,
  removeHikeFromList,
  addHikeToList,
}