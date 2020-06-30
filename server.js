'use strict';

// todo: put routes in their own file??
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
// const db = require('./db/db'); 
const usersDb = require('./db/users');
const hikesDb = require('./db/hikes');
const trailheadsDb = require('./db/trailheads');
const listsDb = require('./db/lists');

const cors = require('cors');
const whitelist = ['http://localhost:8080']
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== 1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
  
}
app.use(cors(corsOptions));

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

/*
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
*/

app.get('/', hikesDb.getHikes);
app.get('/hikes', hikesDb.getHikes);
app.get('/hikes/:id', hikesDb.getHikeByHikeId);
app.post('/hikes', hikesDb.createHike);
app.put('/hikes/:id', hikesDb.updateHike);
app.delete('/hikes/:id', hikesDb.deleteHikeByHikeId);

// todo: add user stuff
app.get('/user', usersDb.getAllUsers); // this should have limited access - only admin/developer
app.get('/user/:id', usersDb.getUserById);
app.put('/user/:id', usersDb.updateUser);
app.post('/user', usersDb.createUser);
app.delete('/user/:id', usersDb.deleteUser);

// todo: add routes for lists
app.get('/user/:id/lists', listsDb.getListsByUser);
app.post('/user/:id/lists', listsDb.createList);
app.delete('/user/:id/list/:id', listsDb.deleteList); 

// todo: add routes for trailheads

app.listen(port, () => {
  console.log(`App running on port ${port}. GO ME!!`);
});


