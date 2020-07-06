'use strict';

const getUserById = (req, res) => {
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

// todo: get user by fields - username? - should be a protected field
const getAllUsers = (req, res) => {

}

const createUser = (req, res) => {

}

const updateUser = (req, res) => {

}

const deleteUser = (req, res) => {

}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
}