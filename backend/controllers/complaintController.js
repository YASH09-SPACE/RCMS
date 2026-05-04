const Complaint = require('../models/Complaint');
const ComplaintCategory = require('../models/ComplaintCategory');
const ComplaintStatusHistory = require('../models/ComplaintStatusHistory');
const Feedback = require('../models/Feedback');
const { generateComplaintNumber } = require('../utils/complaintNumberGenerator');
const { sendEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get all public complaints (guest + citizen)
 * @route   GET /api/complaints
 * @access  Public
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      district,
      category,
      status,
      priority,
      search,
      sort = 'newest'
    } = req.query;

    const query = {};

    if (district) query.district = district;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { complaintNumber: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'priority') sortOption = { priority: -1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('district', 'name code')
        .populate('ward', 'wardNumber wardName')
        .populate('category', 'name icon')
        .populate('user', 'name')
        .sort(sortOption)
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
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single complaint by ID (public)
 * @route   GET /api/complaints/:id
 * @access  Public
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('district', 'name code')
      .populate('ward', 'wardNumber wardName')
      .populate('category', 'name icon slaHours')
      .populate('user', 'name profileImage')
      .populate('assignedConstructor', 'name')
      .lean();

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Get status history
    const statusHistory = await ComplaintStatusHistory.find({ complaint: req.params.id })
      .populate('updatedBy', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    // Get feedback if exists
    const feedback = await Feedback.findOne({ complaint: req.params.id }).lean();

    res.json({
      success: true,
      data: { ...complaint, statusHistory, feedback }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new complaint (citizen only)
 * @route   POST /api/complaints
 * @access  Private (citizen)
 */
const createComplaint = async (req, res, next) => {
  try {
    const { district, ward, locality, address, latitude, longitude, category, title, description } = req.body;

    // Get category for SLA
    const cat = await ComplaintCategory.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const complaintNumber = await generateComplaintNumber();

    // Calculate SLA due date
    const slaDueDate = new Date();
    slaDueDate.setHours(slaDueDate.getHours() + cat.slaHours);

    // Get image URLs from multer
    const images = req.files ? req.files.map(f => {
      // Cloudinary returns f.path as a full URL; local storage returns a filesystem path
      if (f.path && f.path.startsWith('http')) return f.path;
      // Convert local path to relative URL
      return `/uploads/${f.filename}`;
    }) : [];

    const complaint = await Complaint.create({
      complaintNumber,
      user: req.user._id,
      district,
      ward,
      locality,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      category,
      title,
      description,
      images,
      priority: cat.defaultPriority,
      slaDueDate,
      submittedAt: new Date()
    });

    // Create initial status history
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      status: 'pending',
      updatedBy: req.user._id,
      comments: 'Complaint submitted'
    });

    // Create notification for citizen (Requirement 9.1)
    try {
      await createNotification(
        req.user._id,
        'Complaint Registered',
        `Your complaint ${complaintNumber} has been registered successfully.`,
        'info',
        complaint._id
      );
    } catch (notifError) {
      console.error(`❌ Failed to create notification for complaint ${complaintNumber}:`, notifError.message);
      // Continue - notification failure should not block complaint creation
    }

    // Notify Ward Admin about new complaint
    try {
      const User = require('../models/User');
      const wardAdmin = await User.findOne({ role: 'admin', ward: complaint.ward, isActive: true });
      if (wardAdmin) {
        await createNotification(
          wardAdmin._id,
          'New Complaint Submitted',
          `A new complaint (${complaintNumber}) has been submitted in your ward. Category: ${cat.name}. Please review and assign.`,
          'info',
          complaint._id
        );
        console.log(`✅ Ward admin ${wardAdmin.name} notified for new complaint ${complaintNumber}`);
      } else {
        console.warn(`⚠️ No active ward admin found for ward ${complaint.ward} to notify about complaint ${complaintNumber}`);
      }
    } catch (notifError) {
      console.error(`❌ Failed to notify ward admin for complaint ${complaintNumber}:`, notifError.message);
      // Continue - notification failure should not block complaint creation
    }

    // Send email
    const populated = await Complaint.findById(complaint._id)
      .populate('district', 'name')
      .populate('category', 'name');

    sendEmail(req.user.email, 'complaintRegistered', {
      ...populated.toObject(),
      complaintNumber
    }, req.user._id, complaint._id);

    res.status(201).json({
      success: true,
      message: `Complaint ${complaintNumber} registered successfully`,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my complaints (citizen)
 * @route   GET /api/complaints/mine
 * @access  Private (citizen)
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('district', 'name')
        .populate('ward', 'wardName')
        .populate('category', 'name icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Complaint.countDocuments(query)
    ]);

    // Get stats
    const stats = await Complaint.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsMap = { total: 0, pending: 0, assigned: 0, in_progress: 0, completed: 0, closed: 0, reopened: 0, escalated: 0 };
    stats.forEach(s => { statsMap[s._id] = s.count; statsMap.total += s.count; });

    res.json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      stats: statsMap,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit feedback for a complaint
 * @route   POST /api/complaints/:id/feedback
 * @access  Private (citizen, own complaint only)
 */
const submitFeedback = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only provide feedback for your own complaints' });
    }
    if (!['completed', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Feedback can only be given after completion' });
    }

    const existing = await Feedback.findOne({ complaint: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted' });
    }

    const { rating, comments } = req.body;
    const feedback = await Feedback.create({
      complaint: req.params.id,
      user: req.user._id,
      rating,
      comments,
      isSatisfied: rating >= 3
    });

    res.status(201).json({ success: true, message: 'Feedback submitted', data: feedback });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reopen complaint
 * @route   PUT /api/complaints/:id/reopen
 * @access  Private (citizen, own complaint only)
 */
const reopenComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only reopen your own complaints' });
    }
    if (!['completed', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Only completed/closed complaints can be reopened' });
    }

    complaint.status = 'reopened';
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      status: 'reopened',
      updatedBy: req.user._id,
      comments: req.body.reason || 'Citizen reopened the complaint'
    });

    // Notify assigned admin (Requirement 9.7)
    if (complaint.assignedAdmin) {
      try {
        await createNotification(
          complaint.assignedAdmin,
          'Complaint Reopened',
          `Complaint ${complaint.complaintNumber} has been reopened by the citizen`,
          'warning',
          complaint._id
        );
      } catch (notifError) {
        console.error(`❌ Failed to create notification for complaint ${complaint.complaintNumber}:`, notifError.message);
        // Continue - notification failure should not block reopen operation
      }
    }

    res.json({ success: true, message: 'Complaint reopened', data: complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  getMyComplaints,
  submitFeedback,
  reopenComplaint
};
