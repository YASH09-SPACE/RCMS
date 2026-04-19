const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

commentSchema.index({ complaint: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
