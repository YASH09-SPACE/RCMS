const mongoose = require('mongoose');

const complaintCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: 100
  },
  icon: {
    type: String,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    default: ''
  },
  defaultPriority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  slaHours: {
    type: Number,
    default: 72
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ComplaintCategory', complaintCategorySchema);
