const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
