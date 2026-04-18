const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District is required']
  },
  wardNumber: {
    type: String,
    required: [true, 'Ward number is required'],
    trim: true,
    maxlength: 10
  },
  wardName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  areaNames: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure unique ward per district
wardSchema.index({ district: 1, wardNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ward', wardSchema);
