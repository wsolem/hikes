// todo: add middleware to handle Users info access restrictions
const { v4: uuidv4 } = require('uuid');
const usersDb = require('../db/users');

function hasRequiredFields(user) {
  const requiredFields = ['username', 'lastname', 'firstname', 'email', 'usertype'];
  const userFields = Object.keys(user);
  return Array.isArray(userFields)
    && requiredFields.every((fld) => userFields.includes(fld) && user[fld] && user[fld].length > 0);
}

function hasOnlyExpectedFields(user) {
  const expectedFields = ['email', 'firstname', 'lastname', 'password', 'username', 'usertype'];
  const userFields = Object.keys(user);
  return Array.isArray(userFields) && userFields.every((fld) => expectedFields.includes(fld));
}

function hasExpectedValueTypes(user) {
  // all should be strings
  const userFields = Object.keys(user);
  const incorrectTypes = userFields.filter((fld) => typeof user[fld] !== 'string');
  return incorrectTypes.length === 0;
}

// function hasValidEmail(email) {
//   // todo: email validator
// }

// function sanitizeFields(user) {
//   // todo: field sanitizer
// }

function validateUser(user) {
  // validate email field
  return hasRequiredFields(user) && hasOnlyExpectedFields(user) && hasExpectedValueTypes(user);
}

const getUsers = (req, res) => usersDb.allUsers()
  .then((users) => {
    if (users) {
      res.status(200).json(users);
    } else {
      // so we're getting nothing back -> why?
    }
  }).catch((err) => res.send(err));

const getUserById = (req, res) => {
  const { userid } = req.params;
  usersDb.getUserById(userid)
    .then((user) => {
      if (user) {
        const isError = user instanceof Error;
        if (isError) {
          res.status(404).json(user.message);
        } else if (user.length === 0) {
          res.status(404).json({
            error: 'This resource does not exist',
          });
        } else {
          res.status(200).json(user);
        }
      } else {
        // error handling
      }
    }).catch((err) => res.send(err));
};

const createUser = (req, res) => {
  const user = req.body;
  const isValid = validateUser(user);
  if (!isValid) {
    res.status(400).send(`User ${user.username} not created`); // should i send info as to why?? I will have front end validation as well
  } else {
    // probably take OUT password field - that will be a separate log in thing
    const { email, firstname, lastname, password, username, usertype } = user;
    const userid = uuidv4();
    usersDb.createUser({
      email, firstname, lastname, password, userid, username, usertype,
    }).then((result) => {
      if (result) {
        if (result instanceof Error) {
          res.status(404).json(result.message);
        } else {
          res.status(201).json({ userid });
        }
      } else {
        res.status(404).json('create failed');
      }
    }).catch((err) => res.send(err));
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
