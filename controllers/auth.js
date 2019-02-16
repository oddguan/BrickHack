const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodeMailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: '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',
    },
  }),
);

exports.getLogin = (req, res, next) => {
  let emailError = req.flash('emailError');
  let passwordError = req.flash('passwordError');
  if (!emailError.length > 0) {
    emailError = null;
  }
  if (!passwordError.length > 0) {
    passwordError = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    emailError,
    passwordError,
    emailValid: null,
    passwordValid: null,
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    emailValid: '',
    emailError: '',
    passwordValid: '',
    passwordError: '',
    confirmPasswordValid: '',
    confirmPasswordError: '',
  });
};

exports.getReset = (req, res, next) => {
  console.log('get reset');
  let emailError = req.flash('emailError');
  if (!emailError.length > 0) {
    emailError = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    emailError,
  });
};

exports.postLogin = (req, res, next) => {
  let emailValid;
  let passwordValid;
  let emailError;
  let passwordError;
  const { email, password } = req.body;
  const errors = validationResult(req).array();
  // console.log('postlogin errors: ', errors);
  if (errors.length !== 0) {
    errors.forEach((e) => {
      if (e.param === 'email') {
        emailError = e.msg;
        emailValid = 'is-invalid';
      }
      if (e.param === 'password') {
        passwordError = e.msg;
        passwordValid = 'is-invalid';
      }
    });
    console.log(emailError);
    console.log(emailValid);
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      emailValid,
      emailError,
      passwordValid,
      passwordError,
    });
  }
  User.findOne({ email })
    .then((userDoc) => {
      if (!userDoc) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          emailValid: 'is-invalid',
          emailError,
          passwordValid,
          passwordError,
        });
      }
      bcrypt
        .compare(password, userDoc.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = userDoc;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            }); // want to be sure the session is created before continue
          }
          // res.redirect('/login');
          res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            emailValid,
            emailError,
            passwordValid: 'is-invalid',
            passwordError: 'Input password is incorrect',
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.postSignup = (req, res, next) => {
  let emailValid;
  let passwordValid;
  let confirmPasswordValid;
  let emailError;
  let passwordError;
  let confirmPasswordError;
  const { name, email, password } = req.body;
  const errors = validationResult(req).array();
  if (errors.length !== 0) {
    errors.forEach((e) => {
      if (e.param === 'email') {
        emailError = e.msg;
        emailValid = 'is-invalid';
      }
      if (e.param === 'password') {
        passwordError = e.msg;
        passwordValid = 'is-invalid';
      }
      if (e.param === 'confirmPassword') {
        confirmPasswordError = e.msg;
        confirmPasswordValid = 'is-invalid';
      }
    });
    console.log(errors);
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      emailValid,
      emailError,
      passwordValid,
      passwordError,
      confirmPasswordValid,
      confirmPasswordError,
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name,
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      console.log(user);
      return user.save();
    })
    .then((result) => {
      res.redirect('/');
      return transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Signup Succeeded!',
        html: '<h1>You successfully signed up!</h1>',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.log('redirected to reset');
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('emailError', 'is-invalid');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: 'shop@node-complete.com',
          subject: 'Password Reset',
          html: `
            <p>You requested a password reset.</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password.</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  console.log('get new password');
  const { token } = req.params;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let passwordError = req.flash('passwordError');
      if (!passwordError.length > 0) {
        passwordError = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        passwordError,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const { userId, passwordToken } = req.body;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      console.log(err);
    });
};
