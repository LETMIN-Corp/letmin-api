require('dotenv').config();
const logger = require('../utils/logger');
const NotifyResult = require('../results/notify');

// eslint-disable-next-line no-unused-vars
const handleError = (err, req, res, next) => {
  res.status(err.status || 500);

  const instance = process.env.ENV || 'development';

  if (err instanceof Error) {
    if (instance === 'development') {
      logger.error(err.stack);
    }

    res.json(new NotifyResult(err.message));
  } else {
    res.json(new NotifyResult('Unknown Error'));
  }
};

module.exports = handleError;
