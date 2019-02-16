const axios = require('axios');

const User = require('../models/user');

const GEOCODE_API_KEY = 'AIzaSyDcxpWg6vSSKguDxWsJ_GIVT7QuRPYwUdw';

exports.getProfile = (req, res, next) => {
  console.log('get profile route');
  console.log(req.user._id);
  User.find({ _id: req.user._id })
    .then((user) => {
      console.log(user);
      res.render('profile', {
        path: '/profile',
        pageTitle: 'Profile',
        user: user[0],
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getUpdateProfile = (req, res, next) => {
  console.log('get update Profile');
  User.find({ _id: req.user._id })
    .then((user) => {
      console.log(user);
      res.render('update-profile', {
        path: '/update-profile',
        pageTitle: 'Update Profile',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postUpdateProfile = (req, res, next) => {
  console.log('post update profile');
  User.find({ _id: req.user._id })
    .then((user) => {
      console.log(user);
      const {
        street1, street2, city, state, zip,
      } = req.body;
      let addr = `${street1}+${street2}+${city}+${state}+${zip}`;
      addr = addr.split(' ').join('+');
      // console.log(typeof addr);
      axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${addr}&key=${GEOCODE_API_KEY}`,
          {
            paramsSerializer(params) {
              return params;
            },
          },
        )
        .then((result) => {
          const { geometry } = result.data.results[0];
          // console.log(geometry);
          const { lat, lng } = geometry.location;
          const newAddress = {
            street1,
            street2,
            city,
            state,
            zip,
            lat,
            lng,
          };
          user[0].address = newAddress;

          return user[0]
            .save()
            .then((r) => {
              console.log(r);
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
