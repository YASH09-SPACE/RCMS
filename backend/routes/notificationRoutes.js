const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

router.use(protect);

router.route('/')
  .get(getNotifications);

router.put('/read-all', markAllAsRead);
router.put('/read/:id', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
