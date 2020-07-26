# Hikes
This is a fairly simple Node.js backend/middleware for a hikes app
At some point I intend to give it a better name
There is a React front end that goes with it --- todo: add link to front-end app

# What is this thing made from?
Node.js - most of the code. 
Express - makes it pretty great to run locally
Mocha + Chai for testing - tbh, what I used in my last job
Postgres - local database

# What do I need to do before running this the first time?
Right now I think you just need to ensure you have postgres (psql) and create a database entitled `testhikes`.
Run `npm run setup:db` before running any tests.
This will create the tables and seed them for the tests that are going to run