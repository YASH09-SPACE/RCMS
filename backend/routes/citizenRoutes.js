const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getDashboardStats
} = require('../controllers/citizenController');

router.use(protect, authorize('citizen'));

router.get('/dashboard', getDashboardStats);

module.exports = router;
