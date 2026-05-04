const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
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
} = require('../controllers/superAdminController');

const {
  getPerformanceScores,
  getPerformanceDetail,
  getPerformanceAlerts,
  interveneUser,
  resetScore,
  adjustScore
} = require('../controllers/performanceController');

// All routes require authentication and Super Admin role
router.use(protect, authorize('super_admin'));

// SLA Configuration
router.get('/sla-config', getSLAConfig);
router.put('/sla-config', updateSLAConfig);

// Advanced Analytics
router.get('/analytics', getDistrictAnalytics);
router.get('/heatmap', getHeatmapData);
router.get('/sla-breaches', getSlaBreaches);

// Performance Matrix
router.get('/performance/alerts', getPerformanceAlerts);
router.get('/performance/:userId', getPerformanceDetail);
router.get('/performance', getPerformanceScores);
router.post('/performance/:userId/intervene', interveneUser);
router.post('/performance/:userId/reset', resetScore);
router.post('/performance/:userId/adjust', adjustScore);

// Complaint Oversight
router.get('/stats', getGlobalStats);
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/resolve', resolveEscalatedComplaint);

// User CRUD
router.get('/users', getUsersList);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/toggle-status', toggleStatus);

module.exports = router;
