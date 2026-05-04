const Complaint = require('../models/Complaint');
const ComplaintStatusHistory = require('../models/ComplaintStatusHistory');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get dashboard stats for a constructor
 * @route   GET /api/constructor/stats
 * @access  Private (Constructor)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const constructorId = req.user._id;

    const stats = await Complaint.aggregate([
      { $match: { assignedConstructor: constructorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsMap = { total: 0, assigned: 0, in_progress: 0, completed: 0, closed: 0 };
    stats.forEach(s => {
      statsMap[s._id] = s.count;
      statsMap.total += s.count;
    });

    res.json({ success: true, stats: statsMap });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get paginated tasks assigned to constructor
 * @route   GET /api/constructor/tasks
 * @access  Private (Constructor)
 */
const getMyTasks = async (req, res, next) => {
  try {
    const constructorId = req.user._id;
    const { status, priority, page = 1, limit = 10 } = req.query;

    const query = { assignedConstructor: constructorId };
    
    // Default to active tasks if no status provided
    if (status && status !== 'active') {
      query.status = status;
    } else if (status === 'active' || !status) {
      query.status = { $in: ['assigned', 'in_progress'] };
    }
    
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Complaint.find(query)
        .populate('category', 'name icon')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Complaint.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update task status (Start work or Mark Completed)
 * @route   PUT /api/constructor/tasks/:id/status
 * @access  Private (Constructor)
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, comments } = req.body; // status should be 'in_progress' or 'completed'
    const constructorId = req.user._id;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Task not found' });

    if (complaint.assignedConstructor?.toString() !== constructorId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    if (!['in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    // NEW: Validate photo count BEFORE processing uploads
    if (req.files && req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 photos allowed for completion proof'
      });
    }

    // Process image uploads if marking as completed
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Handle Cloudinary OR local storage fallback
        if (file.path && file.path.startsWith('http')) {
          uploadedImages.push(file.path);
        } else {
          uploadedImages.push(`/uploads/${file.filename}`);
        }
      });
    }

    // NEW: Enforce minimum 1 photo for completion
    if (status === 'completed' && uploadedImages.length === 0 && !req.body.bypassProof) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least 1 photo required for completion proof' 
      });
    }

    complaint.status = status;
    if (status === 'in_progress') complaint.startedAt = new Date();
    if (status === 'completed') complaint.completedAt = new Date();
    
    await complaint.save();

    // Add to history
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      status: status,
      updatedBy: req.user._id,
      comments: comments || (status === 'in_progress' ? 'Constructor started the work.' : 'Work completed by constructor, awaiting admin verification.'),
      images: uploadedImages
    });

    // Enhanced notifications (Requirements 5.1-5.6, 9.3)
    if (status === 'in_progress') {
      // Notify citizen (Requirement 5.1, 5.2)
      try {
        await createNotification(
          complaint.user, 
          'Work Started', 
          `A constructor has begun working on Complaint ${complaint.complaintNumber}.`, 
          'info', 
          complaint._id
        );
      } catch (notifError) {
        console.error(`❌ Failed to create citizen notification for complaint ${complaint.complaintNumber}:`, notifError.message);
        // Continue - notification failure should not block status update
      }
      
      // Notify admin (Requirement 5.3, 5.4)
      try {
        await createNotification(
          complaint.assignedAdmin,
          'Work In Progress',
          `Constructor has started work on Complaint ${complaint.complaintNumber}.`,
          'info',
          complaint._id
        );
      } catch (notifError) {
        console.error(`❌ Failed to create admin notification for complaint ${complaint.complaintNumber}:`, notifError.message);
        // Continue - notification failure should not block status update
      }
    } else if (status === 'completed') {
      // Notify admin (Requirement 5.5)
      try {
        await createNotification(
          complaint.assignedAdmin, 
          'Task Completed', 
          `Constructor has marked Complaint ${complaint.complaintNumber} as completed. Pending your approval.`, 
          'success', 
          complaint._id
        );
      } catch (notifError) {
        console.error(`❌ Failed to create admin notification for complaint ${complaint.complaintNumber}:`, notifError.message);
        // Continue - notification failure should not block status update
      }
      
      // Notify citizen (Requirement 5.6)
      try {
        await createNotification(
          complaint.user, 
          'Work Completed', 
          `The issue for Complaint ${complaint.complaintNumber} has been fixed! Your ward admin will verify it shortly.`, 
          'success', 
          complaint._id
        );
      } catch (notifError) {
        console.error(`❌ Failed to create citizen notification for complaint ${complaint.complaintNumber}:`, notifError.message);
        // Continue - notification failure should not block status update
      }
    }

    console.log(`✅ Task ${complaint.complaintNumber} status updated to ${status} by ${req.user.name}`);

    res.json({ success: true, message: `Task marked as ${status.replace('_', ' ')}`, data: complaint });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get local ward heatmap points for Constructor
 * @route   GET /api/constructor/heatmap
 * @access  Private (Constructor)
 */
const getConstructorHeatmap = async (req, res, next) => {
  try {
    // Constructor probably operates within their district or ward, let's limit to their assigned district
    const complaints = await Complaint.find({ district: req.user.district })
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
  getMyTasks,
  updateTaskStatus,
  getConstructorHeatmap
};
