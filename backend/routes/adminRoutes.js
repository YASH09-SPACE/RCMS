const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getDashboardStats,
  getWardComplaints,
  getConstructors,
  assignComplaint,
  approveCompletion,
  escalateComplaint,
  getAdminHeatmap
} = require('../controllers/adminController');

// All routes require authentication and Admin role
router.use(protect, authorize('admin', 'super_admin')); // Super admin can technically use these too

// Dashboard & Lists
router.get('/stats', getDashboardStats);
router.get('/complaints', getWardComplaints);
router.get('/constructors', getConstructors);
router.get('/heatmap', getAdminHeatmap);

// Actions on specific complaints
router.put('/complaints/:id/assign', assignComplaint);
router.put('/complaints/:id/approve', approveCompletion);
router.put('/complaints/:id/escalate', escalateComplaint);

module.exports = router;
