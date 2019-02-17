const Block = require('../models/block');
const User = require('../models/user');
const Product = require('../models/product');

exports.getProduct = async (req, res, next) => {
  console.log('get product');
  const lendingItems = [];
  const result = [];
  Block.findById(req.user.blockId)
    .populate('users.userId')
    .exec((err, block) => {
      console.log(block);
    });
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
