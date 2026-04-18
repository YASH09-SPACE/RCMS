const Notification = require('../models/Notification');

/**
 * Create an in-app notification for a user
 */
const createNotification = async (userId, title, message, type = 'info', complaintId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      complaint: complaintId,
      type,
      title,
      message
    });

    console.log(`🔔 Notification created: ${title} → User ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Notification creation failed:', error.message);
    return null;
  }
};

/**
 * Create notifications for multiple users at once
 */
const createBulkNotifications = async (userIds, title, message, type = 'info', complaintId = null) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      complaint: complaintId,
      type,
      title,
      message
    }));

    await Notification.insertMany(notifications);
    console.log(`🔔 Bulk notifications created: ${title} → ${userIds.length} users`);
    return true;
  } catch (error) {
    console.error('❌ Bulk notification creation failed:', error.message);
    return false;
  }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

module.exports = { createNotification, createBulkNotifications, getUnreadCount };
