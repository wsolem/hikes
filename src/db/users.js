'use strict';

const knex = require("../../knex");

// All user stuff should be protected on some level

/*
So far these are just some ideas
User types:
Admin
Developer
Paid User
Free User

*/

const getUserById = (userId) => knex('users')
  .where('userid', userId)
  .select('email', 'firstname', 'lastname',  'userid', 'username', 'usertype')
  .catch((err) => new Error(err.message));

// todo: get user by fields - username? - should be a protected field
const getUserByFields = (req, res) => {

};

// todo: allUsers should definitely be protected
const allUsers = () => knex('users').select('username', 'firstname', 'lastname', 'userid').orderBy('username');

const createUser = () => {

}

const updateUser = (req, res) => {

}

const deleteUser = (req, res) => {

}

module.exports = {
  allUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
}