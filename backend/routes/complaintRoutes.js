const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateGujaratLocation } = require('../middleware/gujaratLocationCheck');
const upload = require('../middleware/uploadMiddleware');

const {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  getMyComplaints,
  submitFeedback,
  reopenComplaint
} = require('../controllers/complaintController');

const { getComments, addComment } = require('../controllers/commentController');

// Public routes
router.get('/', getAllComplaints);
router.get('/categories', async (req, res) => {
  const ComplaintCategory = require('../models/ComplaintCategory');
  const cats = await ComplaintCategory.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: cats });
});
router.get('/mine', protect, getMyComplaints); // must be before /:id
router.get('/:id', getComplaintById);
router.get('/:id/comments', getComments);

// Auth-required routes
router.post('/', protect, authorize('citizen'), upload.array('images', 5), validateGujaratLocation, createComplaint);
router.post('/:id/comments', protect, addComment);
router.post('/:id/feedback', protect, authorize('citizen'), submitFeedback);
router.put('/:id/reopen', protect, authorize('citizen'), reopenComplaint);

module.exports = router;
