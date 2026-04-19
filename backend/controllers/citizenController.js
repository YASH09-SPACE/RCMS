const Complaint = require('../models/Complaint');

/**
 * @desc    Get dashboard stats for a citizen
 * @route   GET /api/citizen/dashboard
 * @access  Private (Citizen)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const dashboard = {
      total: 0,
      active: 0,
      completed: 0,
      closed: 0,
    };

    stats.forEach(s => {
      dashboard.total += s.count;
      if (['completed', 'closed'].includes(s._id)) {
        if (s._id === 'completed') dashboard.completed += s.count;
        if (s._id === 'closed') dashboard.closed += s.count;
      } else {
        dashboard.active += s.count;
      }
    });

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
