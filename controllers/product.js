const async = require('async');

const Block = require('../models/block');
const User = require('../models/user');
const Product = require('../models/product');

exports.getProduct = async (req, res, next) => {
  console.log('get product');
  let result = [];
  Block.findById(req.user.blockId)
    .populate({
      path: 'users',
      populate: {
        path: 'items.lend',
        model: 'Product',
      },
      model: 'User',
    })
    .exec((err, block) => {
      console.log(block);
      async.forEachOf(block.users, (value, key, callback) => {
        const newConcat = value._doc.items.lend;
        // console.log(value._doc);
        for (item of newConcat) {
          item.coords = { lat: value._doc.address.lat, lng: value._doc.address.lng };
        }
        result = result.concat(newConcat);
      });
      // console.log(block.center);
      // console.log(result);
      res.render('items', {
        path: '/items',
        pageTitle: 'Items',
        lendingItems: result,
        center: block.center,
      });
    });
};

exports.getIndex = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.redirect('/login');
  } else {
    res.redirect('/items');
  }
};
