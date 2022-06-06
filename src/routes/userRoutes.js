const router = require('express').Router();
const { ObjectId } = require('mongodb');
const db = require('../connection/db');
const UserContainer = require('../containers/user');

const JsonResult = require('../results/json');
const NotifyResult = require('../results/notify');
const AuthService = require('../services/auth');
const {
  authorize, decodeToken, revokeToken, generateToken,
} = require('../middleware/jwtAuth');

// // Get all Users
// router.get('/', (req, res) => {
//   db.collection('users').find({}).toArray((err, users) => {
//     if (err) {
//       return res.status(500).json({
//         message: err.message,
//       });
//     }
//     return res.send(users);
//   });
// });

// Register User
router.post('/register', async (req, res, next) => {
  try {
    const authService = new AuthService();
    await authService.register(req.body);
    res.json(new NotifyResult('Registered successfully'));
  } catch (err) {
    next(err);
  }
});

// Login User
router.post('/login', async (req, res, next) => {
  try {
    const authService = new AuthService();
    req.user = await authService.login(req.body);
    req.result = new NotifyResult('Login Successful!');
    next();
  } catch (err) {
    next(err);
  }
}, generateToken);

// Logout User
router.post('/logout', authorize, decodeToken, revokeToken, async (req, res, next) => {
  try {
    res.header('Authorization', null);
    res.send();
  } catch (err) {
    next(err);
  }
});

router.get('/refresh', authorize, decodeToken, revokeToken, async (req, res, next) => {
  try {
    const authService = new AuthService();
    req.user = await authService.findUserById(req.user.sub);
    next();
  } catch (err) {
    next(err);
  }
}, generateToken);

// // Get User by ID
// router.get('/:id', (req, res) => {
//   db.collection('users').findOne({
//     _id: new ObjectId(req.params.id),
//   }, (err, user) => {
//     if (err) {
//       return res.status(500).json({
//         message: err.message,
//       });
//     }
//     return res.send(user);
//   });
// });

// Get user
router.get('/user', authorize, async (req, res, next) => {
  try {
    const authService = new AuthService();
    const data = await authService.findUserById(req.user.sub);
    res.json(new JsonResult({ data }));
  } catch (err) {
    next(err);
  }
});

// Update User
router.put('/:id', (req, res) => {
  db.collection('users').updateOne({
    _id: new ObjectId(req.params.id),
  }, {
    $set: req.body,
  }, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
    return res.send(result);
  });
});

// Delete User
router.delete('/:id', (req, res) => {
  db.collection('users').deleteOne({
    _id: new ObjectId(req.params.id),
  }, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
    return res.send(result);
  });
});

module.exports = router;
