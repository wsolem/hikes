const knex = require('../../knex');

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
  .select('email', 'firstname', 'lastname', 'userid', 'username', 'usertype')
  .catch((err) => new Error(err.message));

// // todo: get user by fields - username? - should be a protected field
// const getUserByFields = (req, res) => {

// };

// todo: allUsers should definitely be protected
const allUsers = () => knex('users').select('username', 'firstname', 'lastname', 'userid').orderBy('username');

const createUser = (user) => knex('users').insert(user).catch((err) => new Error(err.constraint));

const updateUser = (userid, updateFields) => knex('users')
  .where('userid', userid)
  .update(updateFields)
  .catch((err) => new Error(err.message)); // todo: better error handling i think

const deleteUser = (userid) => knex('users')
  .where('userid', userid)
  .del()
  .catch((err) => new Error(err.message));

module.exports = {
  allUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
};
