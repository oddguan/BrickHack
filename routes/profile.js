const express = require('express');

const isAuth = require('../middleware/is-auth');
const profileController = require('../controllers/profile');

const router = express.Router();

router.get('/profile', isAuth, profileController.getProfile);

router.get('/update-profile', profileController.getUpdateProfile);

router.post('/update-profile', profileController.postUpdateProfile);

router.get('/add-item', profileController.getAddItem);

router.post('/add-item', profileController.postAddItem);

module.exports = router;
