const PerformanceScore = require('../models/PerformanceScore');
const User = require('../models/User');
const { sendEmail } = require('./emailService');
const { createNotification } = require('./notificationService');

// Score thresholds
const LEVELS = {
  EXCELLENT: { min: 80, max: 100, name: 'excellent' },
  GOOD:      { min: 60, max: 79,  name: 'good' },
  WARNING:   { min: 40, max: 59,  name: 'warning' },
  CRITICAL:  { min: 20, max: 39,  name: 'critical' },
  SUSPENDED: { min: 0,  max: 19,  name: 'suspended' }
};

// Point values for events
const POINTS = {
  TASK_COMPLETED_ON_TIME:  +5,
  FEEDBACK_GOOD:           +3,   // 4-5 stars
  FEEDBACK_NEUTRAL:         0,   // 3 stars
  FEEDBACK_BAD:            -8,   // 1-2 stars
  SLA_BREACHED:           -10,
  COMPLAINT_REOPENED:      -5,
  COMPLAINT_ESCALATED:     -7
};

/**
 * Get or create a performance score record for a user
 */
const getOrCreateScore = async (userId, role) => {
  let score = await PerformanceScore.findOne({ user: userId });
  if (!score) {
    score = await PerformanceScore.create({
      user: userId,
      role: role,
      currentScore: 100,
      level: 'excellent'
    });
    console.log(`📊 Performance score initialized for user ${userId} (${role})`);
  }
  return score;
};

/**
 * Evaluate the level based on a numeric score
 */
const evaluateLevel = (score) => {
  if (score >= LEVELS.EXCELLENT.min) return LEVELS.EXCELLENT.name;
  if (score >= LEVELS.GOOD.min) return LEVELS.GOOD.name;
  if (score >= LEVELS.WARNING.min) return LEVELS.WARNING.name;
  if (score >= LEVELS.CRITICAL.min) return LEVELS.CRITICAL.name;
  return LEVELS.SUSPENDED.name;
};

/**
 * Add or deduct points from a user's performance score.
 * Triggers alerts if level changes.
 */
const addPoints = async (userId, points, reason, complaintId = null) => {
  try {
    const user = await User.findById(userId);
    if (!user || !['admin', 'constructor'].includes(user.role)) return null;

    const score = await getOrCreateScore(userId, user.role);
    const previousScore = score.currentScore;
    const previousLevel = score.level;

    // Clamp score between 0 and 100
    score.currentScore = Math.max(0, Math.min(100, score.currentScore + points));
    score.level = evaluateLevel(score.currentScore);

    // Add to history (keep last 100 entries)
    score.scoreHistory.push({
      date: new Date(),
      previousScore,
      newScore: score.currentScore,
      change: points,
      reason,
      complaint: complaintId
    });
    if (score.scoreHistory.length > 100) {
      score.scoreHistory = score.scoreHistory.slice(-100);
    }

    await score.save();

    console.log(`📊 Performance: ${user.name} (${user.role}) ${points >= 0 ? '+' : ''}${points} → ${score.currentScore} [${score.level}] | ${reason}`);

    // Check if level changed and trigger alerts
    if (previousLevel !== score.level) {
      await handleLevelChange(user, score, previousLevel);
    }

    return score;
  } catch (error) {
    console.error(`❌ Performance scoring error for user ${userId}:`, error.message);
    return null;
  }
};

/**
 * Handle level transitions — send emails and notifications
 */
const handleLevelChange = async (user, score, previousLevel) => {
  try {
    const now = new Date();

    // WARNING level — send warning email (max once per 24h)
    if (score.level === 'warning') {
      const lastWarning = score.lastWarningEmailSent;
      const cooldown = lastWarning ? (now - lastWarning) / (1000 * 60 * 60) : 999;

      if (cooldown >= 24) {
        await sendEmail(user.email, 'performanceWarning', {
          userName: user.name,
          role: user.role,
          currentScore: score.currentScore,
          level: 'Warning',
          reason: 'Your performance score has dropped to the warning zone.'
        }, user._id);

        score.lastWarningEmailSent = now;
        await score.save();
        console.log(`⚠️ Performance warning email sent to ${user.name}`);
      }
    }

    // CRITICAL level — start probation + notify Super Admin
    if (score.level === 'critical') {
      if (!score.isProbation) {
        score.isProbation = true;
        score.probationStartedAt = now;
        await score.save();
      }

      const lastIntervention = score.lastInterventionEmailSent;
      const cooldown = lastIntervention ? (now - lastIntervention) / (1000 * 60 * 60) : 999;

      if (cooldown >= 24) {
        // Email the user
        await sendEmail(user.email, 'performanceCritical', {
          userName: user.name,
          role: user.role,
          currentScore: score.currentScore,
          level: 'Critical',
          reason: 'Your performance is critically low. You have 48 hours to improve or your account will be suspended.',
          probationDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000).toLocaleString('en-IN')
        }, user._id);

        // Notify Super Admin
        const superAdmin = await User.findOne({ role: 'super_admin' });
        if (superAdmin) {
          await sendEmail(superAdmin.email, 'performanceCritical', {
            userName: user.name,
            role: user.role,
            currentScore: score.currentScore,
            level: 'Critical — Intervention Required',
            reason: `${user.name} (${user.role}) in ${user.ward ? 'Ward' : 'District'} has a critically low performance score. Intervention needed within 48 hours before auto-suspension.`,
            probationDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000).toLocaleString('en-IN')
          }, superAdmin._id);

          await createNotification(
            superAdmin._id,
            '🚨 Staff Performance Critical',
            `${user.name} (${user.role}) score is ${score.currentScore}/100 — needs immediate intervention.`,
            'error'
          );
        }

        score.lastInterventionEmailSent = now;
        await score.save();
        console.log(`🚨 Performance critical alerts sent for ${user.name}`);
      }
    }

    // If user improved back above critical, remove probation
    if (previousLevel === 'critical' && score.currentScore >= LEVELS.CRITICAL.min + 20) {
      score.isProbation = false;
      score.probationStartedAt = null;
      await score.save();
      console.log(`✅ ${user.name} improved and is no longer on probation`);
    }
  } catch (error) {
    console.error(`❌ Error handling performance level change for ${user.name}:`, error.message);
  }
};

/**
 * Update metric counters on the performance record
 */
const updateMetric = async (userId, metricName, increment = 1) => {
  try {
    await PerformanceScore.findOneAndUpdate(
      { user: userId },
      { $inc: { [metricName]: increment } }
    );
  } catch (error) {
    console.error(`❌ Metric update error (${metricName}) for user ${userId}:`, error.message);
  }
};

/**
 * Update average feedback rating for a constructor
 */
const updateFeedbackAverage = async (userId, newRating) => {
  try {
    const score = await PerformanceScore.findOne({ user: userId });
    if (!score) return;

    const totalFeedbacks = score.totalFeedbacks + 1;
    const newAverage = ((score.averageFeedbackRating * score.totalFeedbacks) + newRating) / totalFeedbacks;

    score.totalFeedbacks = totalFeedbacks;
    score.averageFeedbackRating = Math.round(newAverage * 100) / 100;
    await score.save();
  } catch (error) {
    console.error(`❌ Feedback average update error for user ${userId}:`, error.message);
  }
};

/**
 * Generate monthly snapshots for all tracked users (called by cron on 1st of month)
 */
const generateMonthlySnapshots = async () => {
  try {
    const Complaint = require('../models/Complaint');
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const allScores = await PerformanceScore.find();

    for (const score of allScores) {
      // Count tasks completed this month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const tasksCompletedThisMonth = await Complaint.countDocuments({
        assignedConstructor: score.user,
        status: { $in: ['completed', 'closed'] },
        completedAt: { $gte: startOfMonth }
      });

      // Check if snapshot for this month already exists
      const existing = score.monthlySnapshots.find(s => s.month === month);
      if (!existing) {
        score.monthlySnapshots.push({
          month,
          score: score.currentScore,
          tasksCompleted: tasksCompletedThisMonth,
          avgRating: score.averageFeedbackRating
        });

        // Keep only last 12 months
        if (score.monthlySnapshots.length > 12) {
          score.monthlySnapshots = score.monthlySnapshots.slice(-12);
        }

        await score.save();
      }
    }

    console.log(`📊 Monthly performance snapshots generated for ${allScores.length} users`);
  } catch (error) {
    console.error('❌ Monthly snapshot generation error:', error.message);
  }
};

/**
 * Check probation users and auto-suspend if 48h have passed (called by cron)
 */
const checkProbationAndSuspend = async () => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago

    const probationUsers = await PerformanceScore.find({
      isProbation: true,
      probationStartedAt: { $lt: cutoff },
      currentScore: { $lt: 20 }
    }).populate('user', 'name email role');

    for (const perf of probationUsers) {
      if (!perf.user || !perf.user.isActive !== false) {
        const user = await User.findById(perf.user._id || perf.user);
        if (!user || !user.isActive) continue;

        // Auto-suspend the user
        user.isActive = false;
        await user.save();

        // Update performance record
        perf.level = 'suspended';
        perf.isProbation = false;
        await perf.save();

        // Email the suspended user
        await sendEmail(user.email, 'performanceSuspended', {
          userName: user.name,
          role: user.role,
          currentScore: perf.currentScore,
          reason: 'Your performance score remained critically low after the 48-hour probation period. Your account has been automatically suspended. Please contact the Super Admin for reinstatement.'
        }, user._id);

        // Email + Notify Super Admin
        const superAdmin = await User.findOne({ role: 'super_admin' });
        if (superAdmin) {
          await sendEmail(superAdmin.email, 'performanceSuspended', {
            userName: user.name,
            role: user.role,
            currentScore: perf.currentScore,
            reason: `${user.name} (${user.role}) has been auto-suspended due to persistently low performance score (${perf.currentScore}/100) after 48-hour probation.`
          }, superAdmin._id);

          await createNotification(
            superAdmin._id,
            '⛔ Staff Auto-Suspended',
            `${user.name} (${user.role}) suspended — score ${perf.currentScore}/100 after 48h probation.`,
            'error'
          );
        }

        console.log(`⛔ Auto-suspended ${user.name} (${user.role}) — score: ${perf.currentScore}`);
      }
    }

    if (probationUsers.length === 0) {
      console.log('✅ No probation suspensions needed.');
    }
  } catch (error) {
    console.error('❌ Probation check error:', error.message);
  }
};

module.exports = {
  POINTS,
  LEVELS,
  getOrCreateScore,
  evaluateLevel,
  addPoints,
  updateMetric,
  updateFeedbackAverage,
  generateMonthlySnapshots,
  checkProbationAndSuspend
};
