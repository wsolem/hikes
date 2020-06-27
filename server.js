'use strict';

// todo: put routes in their own file??
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
const db = require('./db');
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

app.get('/', db.getHikes);
app.get('/hikes', db.getHikes);
app.get('/hikes/:id', db.getHikeByHikeId);
app.post('/hikes', db.createHike);
app.put('/hikes/:id', db.updateHike);
app.delete('/hikes/:id', db.deleteHikeByHikeId);
// todo: add user stuff
app.get('/user', db.getUser); // this should actually be a login thing i think
app.get('/user/:id', db.getUserById);
app.put('/user/:id', db.updateUser);
app.post('/user', db.createUser);
app.delete('/user/:id', db.deleteUser);

// todo: add routes for lists
app.get('/user/:id/lists', db.getListsByUser);
app.post('/user/:id/lists', db.createList);
app.delete('/user/:id/list/:id', db.deleteList); 

app.listen(port, () => {
  console.log(`App running on port ${port}. GO ME!!`);
});


