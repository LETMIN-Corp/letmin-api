const router = require('express').Router();

const userRoutes = require('./userRoutes');

router.use('/user', userRoutes);

router.get('/', (req, res) => {
  res.send({
    message: 'Hello API!',
  });
});

module.exports = router;
