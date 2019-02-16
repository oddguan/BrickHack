const User = require('../models/user');

exports.getProfile = (req, res, next) => {
    User.find({userId: req.user._id})
    .then((user) => {
        console.log(user);
    })
    .catch((err) => {
        console.log(err);
    })
}