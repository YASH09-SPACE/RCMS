const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  getDashboardStats,
  getMyTasks,
  updateTaskStatus,
  getConstructorHeatmap
} = require('../controllers/constructorController');

// All routes require authentication and Constructor role
router.use(protect, authorize('constructor'));

// Dashboard & Lists
router.get('/stats', getDashboardStats);
router.get('/tasks', getMyTasks);
router.get('/heatmap', getConstructorHeatmap);
router.put('/tasks/:id/status', upload.array('images', 10), updateTaskStatus); // Allow up to 10 for multer, validation happens in controller

module.exports = router;
