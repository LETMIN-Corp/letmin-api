require('dotenv').config();
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const createError = require('http-errors');

//const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

const handleError = require('./middleware/handleError');

// Engine setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(cors({
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
}));

// Import database and initialize it
const db = require('./connection/db.js');

db.initialize(
  process.env.MONGO_URI,
  'users',
  { useNewUrlParser: true, useUnifiedTopology: true },
  process.env.DB_RECONNECT_DELAY,
);

// Import routes
const routes = require('./routes/routes.js');

app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(handleError);

app.listen(port, () => {
  console.log(`🌍 Server running at http://localhost:${port}/`)
});
