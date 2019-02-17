const async = require('async');

const Block = require('../models/block');
const User = require('../models/user');
const Product = require('../models/product');

exports.getProduct = async (req, res, next) => {
  console.log('get product');
  const result = [];
  // const lendingItems = [];
  // Block.findById(req.user.blockId).then((block) => {
  //   console.log(block);
  //   block.users.forEach((u) => {
  //     u.items.lend.forEach((i) => {
  //       lendingItems.push(i);
  //     });
  //   });
  // });
  // console.log(lendingItems);
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
      // console.log(block);
      // console.log(block.users[0]);
      block.users.forEach((u) => {
        console.log(u);
        async.forEachOf(u, (value, key, callback) => {
          result.push(u);
        });
        // result = result.concat(u.items.lend);
      });
    });
  console.log(result);
  // console.log(block.users[0].items);
  // Promise.all(block.users.map(u => lendingItems.concat(u.items.items.lend))).then((b) => {
  //   console.log(b);
  // });
  // });
  //   .then((b) => {
  //     console.log('block', b);
  //     block = b;
  //     return b;
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // const { users } = block;
  // console.log('second then');

  // Promise.all(
  //   users.map(u => User.findById(u).then((item) => {
  //     // console.log('item: ', item);
  //     console.log('debug---------------------------------');
  //     lendingItems.push(item);
  //     console.log(item.items.lend);
  //     lendingItems = lendingItems.concat(item.items.lend);
  //     // console.log(lendingItems);
  //   })),
  // )
  //   .then(() => {
  //     lendingItems.shift();
  //     // console.log(lendingItems);
  //     console.log('final:', lendingItems);
  //     return lendingItems;
  //   })
  //   .then((li) => {
  //     res.render('items', {
  //       path: '/items',
  //       pageTitle: 'Items',
  //       lendingItems: li,
  //     });
  //   });
  // lendingItems.forEach((i) => {
  //   Product.findById(i).then((product) => {
  //     result.append(product);
  //   });
  // });
};
