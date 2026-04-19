const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { createNotification } = require('../services/notificationService');

// This job runs every 15 minutes to check SLA breaches
const startSlaMonitor = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏳ Running SLA Monitor cron job...');
    
    try {
      const now = new Date();
      
      // Find complaints that have breached SLA but not yet marked
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      })
      .populate('assignedAdmin', 'name email')
      .populate('escalatedTo', 'name email')
      .populate('user', 'name');

      if (breachedComplaints.length > 0) {
        console.log(`⚠️ Found ${breachedComplaints.length} new SLA breaches.`);

        for (const complaint of breachedComplaints) {
          // Mark as breached
          complaint.isSlaBreached = true;
          await complaint.save();
          
          // Calculate hours overdue
          const hoursOverdue = Math.floor((now - complaint.slaDueDate) / (1000 * 60 * 60));
          
          // Notify assigned admin
          if (complaint.assignedAdmin) {
            try {
              await createNotification(
                complaint.assignedAdmin._id,
                'SLA Breached',
                `Complaint ${complaint.complaintNumber} (${complaint.priority} priority) is ${hoursOverdue}h overdue`,
                'error',
                complaint._id
              );
              console.log(`🚨 SLA breach notification sent to admin for ${complaint.complaintNumber}`);
            } catch (error) {
              console.error(`❌ Failed to notify admin for ${complaint.complaintNumber}:`, error.message);
            }
          }
          
          // If escalated, notify super admin
          if (complaint.isEscalated && complaint.escalatedTo) {
            try {
              await createNotification(
                complaint.escalatedTo,
                'Escalated SLA Breach',
                `Escalated complaint ${complaint.complaintNumber} has breached SLA by ${hoursOverdue}h`,
                'error',
                complaint._id
              );
              console.log(`🚨 SLA breach notification sent to super admin for ${complaint.complaintNumber}`);
            } catch (error) {
              console.error(`❌ Failed to notify super admin for ${complaint.complaintNumber}:`, error.message);
            }
          }
        }
      } else {
        console.log('✅ No new SLA breaches detected.');
      }
    } catch (error) {
      console.error('❌ Error running SLA Monitor:', error);
    }
  });
  
  console.log('⏰ SLA Monitor initialized (runs every 15 minutes)');
};

module.exports = startSlaMonitor;
