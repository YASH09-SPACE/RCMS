const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ComplaintStatusHistory = require('../models/ComplaintStatusHistory');
const SLAConfiguration = require('../models/SLAConfiguration');
const { createNotification } = require('../services/notificationService');
const mongoose = require('mongoose');

// ----- COMPLAINT OVERSIGHT -----

const getGlobalStats = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsMap = { total: 0, pending: 0, assigned: 0, in_progress: 0, completed: 0, closed: 0, reopened: 0, escalated: 0 };
    stats.forEach(s => {
      statsMap[s._id] = s.count;
      statsMap.total += s.count;
    });

    const escalatedAlerts = await Complaint.countDocuments({ status: 'escalated' });

    res.json({
      success: true,
      stats: statsMap,
      alerts: { escalated: escalatedAlerts }
    });
  } catch (err) {
    next(err);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const { status, priority, districtId, wardId, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // We would need to join with Ward to filter by District, but our Complaint schema only stores `ward` currently.
    // If district filtering is needed, we usually find all wards in that district first.
    if (wardId) {
      query.ward = wardId;
    } else if (districtId) {
      const { default: Ward } = require('../models/Ward');
      const wardsInDistrict = await Ward.find({ district: districtId }).select('_id');
      query.ward = { $in: wardsInDistrict.map(w => w._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('category', 'name')
        .populate({ path: 'ward', populate: { path: 'district', select: 'name' } })
        .populate('user', 'name')
        .populate('assignedConstructor', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Complaint.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: complaints
    });
  } catch (err) {
    next(err);
  }
};

const resolveEscalatedComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (complaint.status !== 'escalated') {
      return res.status(400).json({ success: false, message: 'Only escalated complaints can be force-resolved by Super Admin.' });
    }

    complaint.status = 'closed';
    complaint.closedAt = new Date();
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      status: 'closed',
      updatedBy: req.user._id,
      comments: req.body.comments || 'Resolved and closed by State Super Admin.'
    });

    await createNotification(
      complaint.user,
      'Issue Resolved by State Exec',
      `Your escalated complaint ${complaint.complaintNumber} has been reviewed and closed by the Super Admin.`,
      'success',
      complaint._id
    );

    res.json({ success: true, message: 'Complaint resolved', data: complaint });
  } catch (err) {
    next(err);
  }
};

// ----- USER CRUD (Hierarchy oversight) -----

const getUsersList = async (req, res, next) => {
  try {
    const { role, wardId, districtId, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (wardId) query.ward = wardId;
    if (districtId && !wardId) query.district = districtId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .populate('district', 'name')
      .populate('ward', 'wardName')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role, district, ward } = req.body;
    
    // Admins and Constructors MUST have a district and ward
    if (['admin', 'constructor'].includes(role) && (!district || !ward)) {
      return res.status(400).json({ success: false, message: 'District and Ward are required for Admins and Constructors' });
    }

    const exists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (exists) return res.status(400).json({ success: false, message: 'User with email or mobile already exists' });

    const newUser = await User.create({
      name, email, mobile, password, role, district, ward
    });

    // Remove password from response
    newUser.password = undefined;

    res.status(201).json({ success: true, data: newUser, message: 'User created successfully' });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updates = req.body;
    if (updates.password) {
      user.password = updates.password; // The pre-save hook handles hashing
    }
    
    if (updates.name) user.name = updates.name;
    if (updates.mobile) user.mobile = updates.mobile;
    if (updates.email) user.email = updates.email;
    if (updates.role) user.role = updates.role;
    if (updates.district) user.district = updates.district;
    if (updates.ward) user.ward = updates.ward;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;

    await user.save();
    user.password = undefined;

    res.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend super admin' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'suspended'} successfully` });
  } catch (err) {
    next(err);
  }
};

// ----- ANALYTICS & ADVANCED OVERSIGHT -----

const getDistrictAnalytics = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: '$district',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $in: ['$status', ['completed', 'closed']] }, 1, 0] } },
          breached: { $sum: { $cond: ['$isSlaBreached', 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'districts',
          localField: '_id',
          foreignField: '_id',
          as: 'districtInfo'
        }
      },
      {
        $unwind: '$districtInfo'
      },
      {
        $project: {
          _id: 1,
          name: '$districtInfo.name',
          total: 1,
          resolved: 1,
          breached: 1,
          resolutionRate: {
            $cond: [ { $eq: ['$total', 0] }, 0, { $multiply: [ { $divide: ['$resolved', '$total'] }, 100 ] } ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getHeatmapData = async (req, res, next) => {
  try {
    // For heatmap, we usually return lat/long coordinates of active/all complaints to plot
    const complaints = await Complaint.find({ status: { $nin: ['closed'] } })
      .select('latitude longitude priority status')
      .lean();

    // Filter out entries without proper coordinates
    const validPoints = complaints.filter(c => c.latitude && c.longitude);
    
    res.json({ success: true, data: validPoints, count: validPoints.length });
  } catch(err) {
    next(err);
  }
};

const getSlaBreaches = async (req, res, next) => {
  try {
    const breaches = await Complaint.find({ isSlaBreached: true, status: { $nin: ['closed', 'completed'] } })
      .populate('district', 'name')
      .populate('assignedAdmin', 'name')
      .sort({ slaDueDate: 1 })
      .lean();

    res.json({ success: true, count: breaches.length, data: breaches });
  } catch(err) {
    next(err);
  }
};

// ----- SLA CONFIGURATION -----

/**
 * @desc    Get current SLA configuration
 * @route   GET /api/superadmin/sla-config
 * @access  Private (Super Admin)
 */
const getSLAConfig = async (req, res, next) => {
  try {
    // Get the singleton config document (or create default if doesn't exist)
    let config = await SLAConfiguration.findOne();
    
    if (!config) {
      config = await SLAConfiguration.create({
        high: 24,
        medium: 72,
        low: 168
      });
    }
    
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update SLA configuration
 * @route   PUT /api/superadmin/sla-config
 * @access  Private (Super Admin)
 */
const updateSLAConfig = async (req, res, next) => {
  try {
    const { high, medium, low } = req.body;
    
    // Validate input exists (check for undefined/null, but allow 0 to pass for better error message)
    if (high === undefined || high === null || medium === undefined || medium === null || low === undefined || low === null) {
      return res.status(400).json({
        success: false,
        message: 'All SLA durations (high, medium, low) are required'
      });
    }
    
    // Validate positive integers
    if (high <= 0 || medium <= 0 || low <= 0) {
      return res.status(400).json({
        success: false,
        message: 'SLA durations must be positive integers'
      });
    }
    
    // Validate hierarchy
    if (high >= medium || medium >= low) {
      return res.status(400).json({
        success: false,
        message: 'SLA durations must follow: high < medium < low'
      });
    }
    
    // Update or create config
    let config = await SLAConfiguration.findOne();
    
    if (!config) {
      config = new SLAConfiguration({ high, medium, low, updatedBy: req.user._id });
    } else {
      config.high = high;
      config.medium = medium;
      config.low = low;
      config.updatedBy = req.user._id;
    }
    
    await config.save();
    
    console.log(`✅ SLA Config updated by ${req.user.name}: high=${high}h, medium=${medium}h, low=${low}h`);
    
    res.json({
      success: true,
      message: 'SLA configuration updated successfully',
      data: config
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGlobalStats,
  getAllComplaints,
  resolveEscalatedComplaint,
  getUsersList,
  createUser,
  updateUser,
  toggleStatus,
  getDistrictAnalytics,
  getHeatmapData,
  getSlaBreaches,
  getSLAConfig,
  updateSLAConfig
};
