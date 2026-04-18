const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    unique: true,
    required: true
  },

  // Citizen who raised complaint
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },

  // Location
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District is required']
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: [true, 'Ward is required']
  },
  locality: {
    type: String,
    trim: true,
    maxlength: 200
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },

  // Complaint details
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplaintCategory',
    required: [true, 'Category is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  images: {
    type: [String], // Array of Cloudinary URLs
    default: []
  },

  // Assignment
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedConstructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'closed', 'reopened', 'escalated'],
    default: 'pending'
  },

  // Timeline
  submittedAt: {
    type: Date,
    default: Date.now
  },
  assignedAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },

  // SLA
  slaDueDate: {
    type: Date,
    default: null
  },
  isSlaBreached: {
    type: Boolean,
    default: false
  },

  // Escalation
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  escalationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for fast queries
complaintSchema.index({ status: 1 });
complaintSchema.index({ ward: 1 });
complaintSchema.index({ district: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ assignedAdmin: 1 });
complaintSchema.index({ assignedConstructor: 1 });
complaintSchema.index({ slaDueDate: 1, isSlaBreached: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
