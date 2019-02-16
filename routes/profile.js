const express = require('express');

const isAuth = require('../middleware/is-auth');
const profileController = require('../controllers/profile');

const router = express.Router();

router.get('/profile', isAuth, profileController.getProfile);

router.get('/update-profile', profileController.getUpdateProfile);

router.post('/update-profile', profileController.postUpdateProfile);

module.exports = router;
