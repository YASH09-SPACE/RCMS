const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ComplaintStatusHistory = require('../models/ComplaintStatusHistory');
const SLAConfiguration = require('../models/SLAConfiguration');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const { addPoints, updateMetric, POINTS } = require('../services/performanceService');

/**
 * @desc    Get dashboard stats for admin's assigned ward
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const wardId = req.user.ward;

    // Get aggregated stats
    const stats = await Complaint.aggregate([
      { $match: { ward: wardId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsMap = { total: 0, pending: 0, assigned: 0, in_progress: 0, completed: 0, closed: 0, reopened: 0, escalated: 0 };
    stats.forEach(s => {
      statsMap[s._id] = s.count;
      statsMap.total += s.count;
    });

    // Check for SLA alerts (pending/assigned > 48 hours for example, or simply those with sla_due_date near)
    const now = new Date();
    const nearSlaThreshold = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Due within 24h

    const slaAlerts = await Complaint.countDocuments({
      ward: wardId,
      status: { $in: ['pending', 'assigned', 'in_progress', 'reopened'] },
      slaDueDate: { $lt: nearSlaThreshold }
    });

    res.json({
      success: true,
      stats: statsMap,
      slaAlerts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all complaints for admin's ward
 * @route   GET /api/admin/complaints
 * @access  Private (Admin)
 */
const getWardComplaints = async (req, res, next) => {
  try {
    const wardId = req.user.ward;
    const { status, priority, page = 1, limit = 10 } = req.query;

    const query = { ward: wardId };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('category', 'name icon')
        .populate('user', 'name mobile')
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

/**
 * @desc    Get available constructors in admin's ward/district
 * @route   GET /api/admin/constructors
 * @access  Private (Admin)
 */
const getConstructors = async (req, res, next) => {
  try {
    const constructors = await User.find({
      role: 'constructor',
      ward: req.user.ward, // Only constructors in the same ward/taluka
      isActive: true
    }).select('name email mobile ward');

    // Attach active task count
    const constructorStats = await Promise.all(constructors.map(async (c) => {
      const activeTasks = await Complaint.countDocuments({
        assignedConstructor: c._id,
        status: { $in: ['assigned', 'in_progress'] }
      });
      return { ...c.toObject(), activeTasks };
    }));

    res.json({
      success: true,
      data: constructorStats
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Assign priority and constructor to a complaint
 * @route   PUT /api/admin/complaints/:id/assign
 * @access  Private (Admin)
 */
const assignComplaint = async (req, res, next) => {
  try {
    const { priority, constructorId } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    
    if (complaint.ward.toString() !== req.user.ward.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this ward' });
    }

    // Verify constructor
    const constructor = await User.findOne({ _id: constructorId, role: 'constructor' });
    if (!constructor) return res.status(400).json({ success: false, message: 'Invalid constructor' });

    // NEW: Calculate SLA due date based on priority
    const slaConfig = await SLAConfiguration.findOne();
    const slaDurationHours = slaConfig ? slaConfig[priority] : (priority === 'high' ? 24 : priority === 'medium' ? 72 : 168);
    const slaDueDate = new Date(Date.now() + slaDurationHours * 60 * 60 * 1000);

    complaint.priority = priority;
    complaint.assignedConstructor = constructorId;
    complaint.assignedAdmin = req.user._id; // Track which admin assigned
    complaint.status = 'assigned';
    complaint.assignedAt = new Date();
    complaint.slaDueDate = slaDueDate; // NEW
    await complaint.save();

    // Log history
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      status: 'assigned',
      updatedBy: req.user._id,
      comments: `Assigned to ${constructor.name} with ${priority} priority. SLA due: ${slaDueDate.toLocaleString('en-IN')}`
    });

    // Notify Constructor (Requirement 9.2)
    try {
      await createNotification(
        constructorId,
        'New Task Assigned',
        `You have been assigned to Complaint ${complaint.complaintNumber} with ${priority} priority`,
        'info',
        complaint._id
      );
    } catch (notifError) {
      console.error(`❌ Failed to create notification for constructor ${constructorId}, complaint ${complaint.complaintNumber}:`, notifError.message);
      // Continue - notification failure should not block assignment
    }

    // Try sending email (if configured)
    try { sendEmail(constructor.email, 'taskAssigned', { ...complaint.toObject(), address: complaint.address || 'Location provided via map' }, req.user._id, complaint._id); } catch (e) {}

    res.json({ success: true, message: 'Complaint assigned successfully', data: complaint });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve constructor's completed work
 * @route   PUT /api/admin/complaints/:id/approve
 * @access  Private (Admin)
 */
const approveCompletion = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedConstructor', 'name email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (complaint.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only approve complaints that are marked completed by constructor' });
    }

    complaint.status = 'closed';
    complaint.closedAt = new Date();
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      status: 'closed',
      updatedBy: req.user._id,
      comments: req.body.comments || 'Work approved and issue closed by Admin.'
    });

    // Notify Citizen (in-app)
    try {
      await createNotification(
        complaint.user._id || complaint.user,
        'Issue Resolved',
        `Your complaint ${complaint.complaintNumber} has been resolved and closed. Please provide your feedback!`,
        'success',
        complaint._id
      );
    } catch (notifError) {
      console.error(`❌ Failed to create notification for user, complaint ${complaint.complaintNumber}:`, notifError.message);
    }

    // Email Citizen - complaintClosed template
    try {
      if (complaint.user?.email) {
        sendEmail(
          complaint.user.email,
          'complaintClosed',
          { ...complaint.toObject(), complaintNumber: complaint.complaintNumber },
          complaint.user._id || complaint.user,
          complaint._id
        );
      }
    } catch (emailError) {
      console.error(`❌ Failed to send closed email to citizen for complaint ${complaint.complaintNumber}:`, emailError.message);
    }

    // Notify Constructor (in-app)
    try {
      if (complaint.assignedConstructor) {
        await createNotification(
          complaint.assignedConstructor._id || complaint.assignedConstructor,
          'Task Verified & Closed',
          `Your work on Complaint ${complaint.complaintNumber} has been verified and approved by the Admin. Great job!`,
          'success',
          complaint._id
        );
      }
    } catch (notifError) {
      console.error(`❌ Failed to create notification for constructor, complaint ${complaint.complaintNumber}:`, notifError.message);
    }

    // Email Constructor - taskClosedForConstructor template
    try {
      if (complaint.assignedConstructor?.email) {
        sendEmail(
          complaint.assignedConstructor.email,
          'taskClosedForConstructor',
          { ...complaint.toObject(), complaintNumber: complaint.complaintNumber, constructorName: complaint.assignedConstructor.name },
          complaint.assignedConstructor._id || complaint.assignedConstructor,
          complaint._id
        );
      }
    } catch (emailError) {
      console.error(`❌ Failed to send closed email to constructor for complaint ${complaint.complaintNumber}:`, emailError.message);
    }

    // Performance: Award points for successful completion
    try {
      // Award admin for successful closure
      if (complaint.assignedAdmin || req.user._id) {
        const adminId = complaint.assignedAdmin?._id || complaint.assignedAdmin || req.user._id;
        await addPoints(adminId, POINTS.TASK_COMPLETED_ON_TIME, `Complaint ${complaint.complaintNumber} approved and closed`, complaint._id);
        await updateMetric(adminId, 'tasksCompletedOnTime');
      }
      // Award constructor for completed task
      if (complaint.assignedConstructor) {
        const constructorId = complaint.assignedConstructor._id || complaint.assignedConstructor;
        await addPoints(constructorId, POINTS.TASK_COMPLETED_ON_TIME, `Task ${complaint.complaintNumber} completed and verified`, complaint._id);
        await updateMetric(constructorId, 'tasksCompletedOnTime');
      }
    } catch (perfError) {
      console.error(`❌ Failed to update performance scores for complaint ${complaint.complaintNumber}:`, perfError.message);
    }

    res.json({ success: true, message: 'Complaint approved and closed', data: complaint });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Escalate complaint to Super Admin
 * @route   PUT /api/admin/complaints/:id/escalate
 * @access  Private (Admin)
 */
const escalateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'escalated';
    complaint.isEscalated = true;
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      status: 'escalated',
      updatedBy: req.user._id,
      comments: req.body.reason || 'Escalated to higher authority for review.'
    });

    // Notify Super Admin (Requirement 9.6)
    try {
      const superAdmin = await User.findOne({ role: 'super_admin' });
      if (superAdmin) {
        await createNotification(
          superAdmin._id,
          'Complaint Escalated',
          `Complaint ${complaint.complaintNumber} has been escalated by Admin for review`,
          'warning',
          complaint._id
        );
      }
    } catch (notifError) {
      console.error(`❌ Failed to create escalation notification for complaint ${complaint.complaintNumber}:`, notifError.message);
      // Continue - notification failure should not block escalation
    }

    // Performance: Deduct points from admin for escalation
    try {
      await addPoints(req.user._id, POINTS.COMPLAINT_ESCALATED, `Complaint ${complaint.complaintNumber} escalated to Super Admin`, complaint._id);
      await updateMetric(req.user._id, 'complaintsEscalated');
    } catch (perfError) {
      console.error(`❌ Failed to update admin performance for escalation ${complaint.complaintNumber}:`, perfError.message);
    }

    res.json({ success: true, message: 'Complaint escalated successfully', data: complaint });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get local ward heatmap points for Admin
 * @route   GET /api/admin/heatmap
 * @access  Private (Admin)
 */
const getAdminHeatmap = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ ward: req.user.ward })
      .select('title latitude longitude priority status')
      .lean();

    const validPoints = complaints.filter(c => c.latitude && c.longitude);
    res.json({ success: true, data: validPoints, count: validPoints.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getWardComplaints,
  getConstructors,
  assignComplaint,
  approveCompletion,
  escalateComplaint,
  getAdminHeatmap
};
