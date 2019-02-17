const axios = require('axios');

const User = require('../models/user');
const Block = require('../models/block');
const Product = require('../models/product');

const GEOCODE_API_KEY = 'AIzaSyDcxpWg6vSSKguDxWsJ_GIVT7QuRPYwUdw';

exports.getProfile = (req, res, next) => {
  // console.log('get profile route');
  // console.log(req.user._id);
  User.findOne({ _id: req.user._id }).then((user) => {
    // console.log(user);
    // console.log(user.items.lend);
    Product.find({ userId: req.user._id }).then((lends) => {
      console.log(lends);
      res.render('profile', {
        path: '/profile',
        pageTitle: 'Profile',
        user,
        lends,
      });
    });
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
  function measure(lat1, lon1, lat2, lon2) {
    // generally used geo measurement function
    const R = 6378.137; // Radius of earth in KM
    const dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    const dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos((lat1 * Math.PI) / 180)
        * Math.cos((lat2 * Math.PI) / 180)
        * Math.sin(dLon / 2)
        * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000; // meters
  }
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
          Block.find().then((blockArray) => {
            let find = false;
            blockArray.forEach((b) => {
              const distance = measure(lat, lng, b.center.lat, b.center.lng);
              if (distance <= 1000) {
                find = true;
                let hasUser = false;
                b.users.forEach((u) => {
                  if (u._id.toString() === req.user._id.toString()) {
                    hasUser = true;
                  }
                });
                if (!hasUser) {
                  Block.findOne({ _id: req.user.blockId }).then((block) => {
                    block.users.filter(ou => ou._id.toString() !== req.user._id.toString());
                    block.save();
                  });
                  b.users.push(req.user);
                  // req.user.blockId = b._id;
                  // user.update({ blockId: b._id });
                  req.user.blockId = b._id;
                  // console.log(typeof req.user);
                  // console.log(b);
                }
                req.user.save();
                b.save();
              }
            });
            let b;
            if (!find) {
              Block.findOne({ _id: req.user.blockId }).then((block) => {
                // console.log('findOne not find');
                // console.log(block);
                // console.log(req.user._id.toString());
                // console.log(block.users[0]._id.toString());
                const newUser = block.users.filter(
                  ou => ou._id.toString() !== req.user._id.toString(),
                );
                block.users = newUser;
                block.save();
              });
              console.log('not find');
              b = new Block({
                name: null,
                center: {
                  lat: req.user.address.lat,
                  lng: req.user.address.lng,
                },
                radius: 1000,
                users: [req.user],
              });
              // b.users.push(req.user);
              req.user.blockId = b._id;
              // console.log('req.user.block:', req.user);
              req.user.save();
              b.save();
            }

            // console.log(b);
            // console.log(req.user);
          });
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

exports.getAddItem = (req, res, next) => {
  res.render('add-item', {
    path: '/add-item',
    pageTitle: 'Add Item',
  });
};

exports.postAddItem = (req, res, next) => {
  const { name, img } = req.body;
  console.log(req.user.items.lend);
  const newProduct = new Product({
    name,
    imageUrl: img,
    userId: req.user,
  });
  newProduct
    .save()
    .then(() => {
      req.user.items.lend.push(newProduct);
      return req.user
        .save()
        .then((result) => {
          // console.log(result);
          res.redirect('/add-item');
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProfile = (req, res, next) => {
  res.render('edit-profile', {
    path: '/edit-profile',
    pageTitle: 'Edit Profile',
  });
};
