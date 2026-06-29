const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for now to allow anonymous testing
  },
  message: {
    type: String,
    required: true
  },
  reply: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chat', chatSchema);
