'use strict';

// todo: put routes in their own file??
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
const users = require('./src/app/users');
const hikes = require('./src/app/hikes');
const trailheads = require('./src/app/trailheads');
const lists = require('./src/app/lists');

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
  createOneHike,
  createHike
*/

// app.get('/', hikes.getHikes);
app.get('/api/hikes', hikes.getHikes);
app.get('/api/hikes/:hikeid', hikes.getHikeByHikeId);
app.post('/api/hikes', hikes.createHike);
app.put('/api/hikes/:hikeid', hikes.updateHike);
app.delete('/api/hikes/:hikeid', hikes.deleteHike);

// todo: add user stuff
// app.get('/user', users.getAllUsers); // this should have limited access - only admin/developer
// app.get('/user/:id', users.getUserById);
// app.put('/user/:id', users.updateUser);
// app.post('/user', users.createUser);
// app.delete('/user/:id', users.deleteUser);

// // todo: add routes for lists
// app.get('/user/:id/lists', lists.getListsByUser);
// app.post('/user/:id/lists', lists.createList);
// app.delete('/user/:id/list/:id', lists.deleteList); 

// todo: add routes for trailheads

const server = app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

module.exports = server;