const mongoose = require('mongoose');

const { Schema } = mongoose;

const blockSchema = new Schema({
  name: {
    type: String,
  },
  center: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  radius: {
    type: Number,
    required: true,
  },
  users: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
});

module.exports = mongoose.model('Block', blockSchema);
