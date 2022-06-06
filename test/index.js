require('dotenv').config();
require('datejs');

require('./auth.test');

const db = require('../src/connection/db');

before((done) => {
    db.initialize(
        process.env.MONGO_URI,
        'userstest',
        { useNewUrlParser: true, useUnifiedTopology: true },
        process.env.DB_RECONNECT_DELAY,
      )
    .then(() => {
      done();
    });
});

after((done) => {
  db.dropDatabase().then(() => {
    db.close(true);
    done();
  });
});
