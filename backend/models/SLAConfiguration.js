const mongoose = require('mongoose');

const slaConfigurationSchema = new mongoose.Schema({
  high: {
    type: Number,
    required: true,
    default: 24, // hours
    min: 1
  },
  medium: {
    type: Number,
    required: true,
    default: 72, // hours
    min: 1
  },
  low: {
    type: Number,
    required: true,
    default: 168, // hours (7 days)
    min: 1
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Validation: ensure high < medium < low
slaConfigurationSchema.pre('save', function(next) {
  if (this.high >= this.medium || this.medium >= this.low) {
    return next(new Error('SLA durations must follow: high < medium < low'));
  }
  next();
});

module.exports = mongoose.model('SLAConfiguration', slaConfigurationSchema);
