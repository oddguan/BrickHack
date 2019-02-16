const express = require('express');

const isAuth = require('../middleware/is-auth');
const profileController = require('../controllers/profile');

router = express.Router();

router.get('/profile', isAuth, profileController.getProfile);

module.exports = router;
