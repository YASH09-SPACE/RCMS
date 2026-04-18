const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    default: ''
  },
  isSatisfied: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// One feedback per complaint
feedbackSchema.index({ complaint: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
