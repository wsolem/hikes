// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'me',
      password : 'password',
      database : 'hikes'
    }
    // todo: add migrations and seeds
  },

  test: {
    client: 'pg',
    connection: 'postgres://localhost/testhikes', // fix this
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/test'
    }
  },
  // all of this is bull crap
  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
