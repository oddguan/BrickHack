const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('This is not a valid email address.')
      .custom((value, { req }) => User.findOne({ email: value }).then((userDoc) => {
        console.log(userDoc);
        if (!userDoc) {
          return Promise.reject(new Error('Account does not exist!'));
        }
      })),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.',
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin,
);

router.post('/logout', authController.postLogout);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('This is not a valid email address.')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address is forbidden.');
        // }
        // return true;
        console.log('');
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(new Error('Email exists already, please pick a different one.'));
          }
        });
      }),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.',
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body('confirmPassword', '').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    }),
  ],
  authController.postSignup,
);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
