const mongoose = require('mongoose');

const scoreHistoryEntrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  previousScore: { type: Number, required: true },
  newScore: { type: Number, required: true },
  change: { type: Number, required: true }, // positive or negative
  reason: { type: String, required: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null }
}, { _id: false });

const monthlySnapshotSchema = new mongoose.Schema({
  month: { type: String, required: true }, // YYYY-MM
  score: { type: Number, required: true },
  tasksCompleted: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 }
}, { _id: false });

const performanceScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'constructor'],
    required: true
  },

  // Core score
  currentScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  level: {
    type: String,
    enum: ['excellent', 'good', 'warning', 'critical', 'suspended'],
    default: 'excellent'
  },

  // Breakdown metrics
  totalTasksAssigned: { type: Number, default: 0 },
  tasksCompletedOnTime: { type: Number, default: 0 },
  tasksBreachedSla: { type: Number, default: 0 },
  averageFeedbackRating: { type: Number, default: 0 },
  totalFeedbacks: { type: Number, default: 0 },
  complaintsEscalated: { type: Number, default: 0 },    // Admin only
  complaintsReopened: { type: Number, default: 0 },       // Constructor only

  // Scoring history log (keep last 100 entries)
  scoreHistory: {
    type: [scoreHistoryEntrySchema],
    default: []
  },

  // Probation tracking for auto-suspension
  isProbation: { type: Boolean, default: false },
  probationStartedAt: { type: Date, default: null },
  lastWarningEmailSent: { type: Date, default: null },
  lastInterventionEmailSent: { type: Date, default: null },

  // Monthly snapshots for trend chart
  monthlySnapshots: {
    type: [monthlySnapshotSchema],
    default: []
  }
}, {
  timestamps: true
});

// Indexes for fast queries
performanceScoreSchema.index({ user: 1 });
performanceScoreSchema.index({ role: 1, currentScore: 1 });
performanceScoreSchema.index({ level: 1 });
performanceScoreSchema.index({ isProbation: 1 });

module.exports = mongoose.model('PerformanceScore', performanceScoreSchema);
