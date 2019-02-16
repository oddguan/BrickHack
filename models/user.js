const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  items: {
    borrow: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    lend: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
  },
  homecoords: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
});

module.exports = mongoose.model('User', userSchema);
