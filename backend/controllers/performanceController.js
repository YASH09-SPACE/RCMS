const PerformanceScore = require('../models/PerformanceScore');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const { addPoints, getOrCreateScore } = require('../services/performanceService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get all performance scores with filters
 * @route   GET /api/superadmin/performance
 * @access  Private (Super Admin)
 */
const getPerformanceScores = async (req, res, next) => {
  try {
    const { role, level, sort = 'score_asc', page = 1, limit = 50 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (level) query.level = level;

    let sortOption = {};
    switch (sort) {
      case 'score_asc': sortOption = { currentScore: 1 }; break;
      case 'score_desc': sortOption = { currentScore: -1 }; break;
      case 'name': sortOption = { 'user.name': 1 }; break;
      default: sortOption = { currentScore: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const scores = await PerformanceScore.find(query)
      .populate({
        path: 'user',
        select: 'name email role district ward isActive',
        populate: [
          { path: 'district', select: 'name' },
          { path: 'ward', select: 'wardName' }
        ]
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await PerformanceScore.countDocuments(query);

    // Calculate summary stats
    const allScores = await PerformanceScore.find();
    const summary = {
      totalTracked: allScores.length,
      averageScore: allScores.length > 0
        ? Math.round(allScores.reduce((s, p) => s + p.currentScore, 0) / allScores.length)
        : 0,
      excellent: allScores.filter(s => s.level === 'excellent').length,
      good: allScores.filter(s => s.level === 'good').length,
      warning: allScores.filter(s => s.level === 'warning').length,
      critical: allScores.filter(s => s.level === 'critical').length,
      suspended: allScores.filter(s => s.level === 'suspended').length,
      onProbation: allScores.filter(s => s.isProbation).length
    };

    res.json({
      success: true,
      data: scores,
      summary,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get detailed performance for a single user
 * @route   GET /api/superadmin/performance/:userId
 * @access  Private (Super Admin)
 */
const getPerformanceDetail = async (req, res, next) => {
  try {
    const score = await PerformanceScore.findOne({ user: req.params.userId })
      .populate({
        path: 'user',
        select: 'name email role district ward isActive mobile',
        populate: [
          { path: 'district', select: 'name' },
          { path: 'ward', select: 'wardName' }
        ]
      })
      .lean();

    if (!score) {
      return res.status(404).json({ success: false, message: 'Performance record not found' });
    }

    // Get recent complaints for this user
    const recentComplaints = await Complaint.find({
      $or: [
        { assignedAdmin: req.params.userId },
        { assignedConstructor: req.params.userId }
      ]
    })
      .select('complaintNumber title status isSlaBreached priority completedAt closedAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get feedback stats if constructor
    let feedbackBreakdown = null;
    if (score.role === 'constructor') {
      const complaints = await Complaint.find({ assignedConstructor: req.params.userId }).select('_id');
      const complaintIds = complaints.map(c => c._id);
      const feedbacks = await Feedback.find({ complaint: { $in: complaintIds } }).lean();

      feedbackBreakdown = {
        total: feedbacks.length,
        fiveStars: feedbacks.filter(f => f.rating === 5).length,
        fourStars: feedbacks.filter(f => f.rating === 4).length,
        threeStars: feedbacks.filter(f => f.rating === 3).length,
        twoStars: feedbacks.filter(f => f.rating === 2).length,
        oneStar: feedbacks.filter(f => f.rating === 1).length
      };
    }

    res.json({
      success: true,
      data: {
        ...score,
        recentComplaints,
        feedbackBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get users that need Super Admin intervention
 * @route   GET /api/superadmin/performance/alerts
 * @access  Private (Super Admin)
 */
const getPerformanceAlerts = async (req, res, next) => {
  try {
    const alerts = await PerformanceScore.find({
      $or: [
        { level: 'critical' },
        { level: 'suspended' },
        { isProbation: true }
      ]
    })
      .populate({
        path: 'user',
        select: 'name email role district ward isActive',
        populate: [
          { path: 'district', select: 'name' },
          { path: 'ward', select: 'wardName' }
        ]
      })
      .sort({ currentScore: 1 })
      .lean();

    // Calculate probation remaining time
    const now = new Date();
    const enrichedAlerts = alerts.map(a => {
      let probationHoursRemaining = null;
      if (a.isProbation && a.probationStartedAt) {
        const elapsed = (now - new Date(a.probationStartedAt)) / (1000 * 60 * 60);
        probationHoursRemaining = Math.max(0, 48 - elapsed);
      }
      return { ...a, probationHoursRemaining };
    });

    res.json({
      success: true,
      count: enrichedAlerts.length,
      data: enrichedAlerts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Super Admin intervenes on a user (acknowledge + optional action)
 * @route   POST /api/superadmin/performance/:userId/intervene
 * @access  Private (Super Admin)
 */
const interveneUser = async (req, res, next) => {
  try {
    const { action, message } = req.body; // action: 'warn', 'extend_probation', 'suspend'

    const score = await PerformanceScore.findOne({ user: req.params.userId });
    if (!score) return res.status(404).json({ success: false, message: 'Performance record not found' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    switch (action) {
      case 'warn':
        await createNotification(
          user._id,
          '⚠️ Performance Warning from Super Admin',
          message || 'Your performance needs improvement. Please take immediate corrective action.',
          'warning'
        );
        break;

      case 'extend_probation':
        score.probationStartedAt = new Date(); // Reset the 48h timer
        await score.save();
        await createNotification(
          user._id,
          '⏳ Probation Extended',
          message || 'Your probation period has been extended by 48 hours. Please improve your performance.',
          'warning'
        );
        break;

      case 'suspend':
        user.isActive = false;
        await user.save();
        score.level = 'suspended';
        score.isProbation = false;
        await score.save();
        await createNotification(
          user._id,
          '⛔ Account Suspended',
          message || 'Your account has been suspended by the Super Admin due to poor performance.',
          'error'
        );
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action. Use: warn, extend_probation, or suspend' });
    }

    // Log the intervention in score history
    score.scoreHistory.push({
      date: new Date(),
      previousScore: score.currentScore,
      newScore: score.currentScore,
      change: 0,
      reason: `Super Admin intervention: ${action} — ${message || 'No additional message'}`
    });
    await score.save();

    res.json({ success: true, message: `Intervention '${action}' applied to ${user.name}` });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reset a user's performance score to 100
 * @route   POST /api/superadmin/performance/:userId/reset
 * @access  Private (Super Admin)
 */
const resetScore = async (req, res, next) => {
  try {
    const score = await PerformanceScore.findOne({ user: req.params.userId });
    if (!score) return res.status(404).json({ success: false, message: 'Performance record not found' });

    const user = await User.findById(req.params.userId);

    const previousScore = score.currentScore;
    score.currentScore = 100;
    score.level = 'excellent';
    score.isProbation = false;
    score.probationStartedAt = null;

    // Preserve history but log the reset
    score.scoreHistory.push({
      date: new Date(),
      previousScore,
      newScore: 100,
      change: 100 - previousScore,
      reason: `Score reset to 100 by Super Admin (${req.body.reason || 'No reason provided'})`
    });

    await score.save();

    // Re-activate user if suspended
    if (user && !user.isActive) {
      user.isActive = true;
      await user.save();
    }

    await createNotification(
      req.params.userId,
      '🔄 Performance Score Reset',
      'Your performance score has been reset to 100 by the Super Admin. Keep up the good work!',
      'success'
    );

    res.json({ success: true, message: `Score reset to 100 for ${user?.name || req.params.userId}` });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Manually adjust a user's score
 * @route   POST /api/superadmin/performance/:userId/adjust
 * @access  Private (Super Admin)
 */
const adjustScore = async (req, res, next) => {
  try {
    const { points, reason } = req.body;

    if (points === undefined || !reason) {
      return res.status(400).json({ success: false, message: 'Points and reason are required' });
    }

    const result = await addPoints(req.params.userId, parseInt(points), `Manual adjustment: ${reason}`);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Failed to adjust score' });
    }

    res.json({
      success: true,
      message: `Score adjusted by ${points >= 0 ? '+' : ''}${points}`,
      data: { currentScore: result.currentScore, level: result.level }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPerformanceScores,
  getPerformanceDetail,
  getPerformanceAlerts,
  interveneUser,
  resetScore,
  adjustScore
};
