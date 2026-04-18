const mongoose = require('mongoose');

const constructorAssignmentSchema = new mongoose.Schema({
  constructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    default: null,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

constructorAssignmentSchema.index({ constructor: 1, ward: 1 });

module.exports = mongoose.model('ConstructorAssignment', constructorAssignmentSchema);
