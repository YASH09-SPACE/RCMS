const transporter = require('../config/email');
const EmailLog = require('../models/EmailLog');

/**
 * Email templates for all RCMS notification events
 */
const templates = {
  // 1. Complaint registered - to Citizen
  complaintRegistered: (complaint) => ({
    subject: `Complaint Registered - ${complaint.complaintNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #1a73e8; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🛣️ RoadCare Management System</h2>
          <p style="margin: 5px 0 0;">Gujarat State</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #1a73e8;">✅ Complaint Registered Successfully</h3>
          <p>Thank you for reporting! Your complaint has been registered.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #555;">Complaint Number:</td><td style="padding: 8px;">${complaint.complaintNumber}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold; color: #555;">Issue:</td><td style="padding: 8px;">${complaint.title}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #555;">Location:</td><td style="padding: 8px;">${complaint.address}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold; color: #555;">Priority:</td><td style="padding: 8px;">${complaint.priority.toUpperCase()}</td></tr>
          </table>
          <p>We will update you on the progress. You can track your complaint status on the portal.</p>
          <a href="${process.env.FRONTEND_URL}/citizen/complaints/${complaint._id}" style="display: inline-block; background: #1a73e8; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px;">Track Complaint</a>
        </div>
      </div>
    `
  }),

  // 2. New complaint in ward - to Admin
  newComplaintForAdmin: (complaint, adminName) => ({
    subject: `New Complaint in Your Ward - ${complaint.complaintNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #e65100; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🛣️ RCMS - Admin Alert</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #e65100;">📋 New Complaint Requires Action</h3>
          <p>Dear ${adminName},</p>
          <p>A new complaint has been submitted in your ward:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Complaint:</td><td style="padding: 8px;">${complaint.complaintNumber}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Title:</td><td style="padding: 8px;">${complaint.title}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td style="padding: 8px;">${complaint.address}</td></tr>
          </table>
          <p>Please review and assign to a constructor.</p>
        </div>
      </div>
    `
  }),

  // 3. Task assigned - to Constructor
  taskAssigned: (complaint, constructorName) => ({
    subject: `New Task Assigned - ${complaint.complaintNumber} [${complaint.priority.toUpperCase()}]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #2e7d32; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🛣️ RCMS - New Task</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #2e7d32;">🔧 New Task Assigned to You</h3>
          <p>Dear ${constructorName},</p>
          <p>A new task has been assigned:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Task ID:</td><td style="padding: 8px;">${complaint.complaintNumber}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Issue:</td><td style="padding: 8px;">${complaint.title}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td style="padding: 8px;">${complaint.address}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Priority:</td><td style="padding: 8px; color: ${complaint.priority === 'high' ? 'red' : complaint.priority === 'medium' ? 'orange' : 'green'}; font-weight: bold;">${complaint.priority.toUpperCase()}</td></tr>
          </table>
          <p>Please login to accept and start work.</p>
        </div>
      </div>
    `
  }),

  // 4. Status update - to Citizen
  statusUpdate: (complaint, statusMessage) => ({
    subject: `Complaint Update - ${complaint.complaintNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #1a73e8; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🛣️ RCMS - Status Update</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #1a73e8;">📢 Complaint Status Updated</h3>
          <p>Your complaint <strong>${complaint.complaintNumber}</strong> has been updated:</p>
          <p style="font-size: 18px; color: #1a73e8; font-weight: bold;">${statusMessage}</p>
          <p>Complaint: ${complaint.title}</p>
          <a href="${process.env.FRONTEND_URL}/citizen/complaints/${complaint._id}" style="display: inline-block; background: #1a73e8; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Details</a>
        </div>
      </div>
    `
  }),

  // 5. Complaint closed - to Citizen (ask for feedback)
  complaintClosed: (complaint) => ({
    subject: `Complaint Closed - Please Rate Service - ${complaint.complaintNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #2e7d32; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🛣️ RCMS - Complaint Resolved</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #2e7d32;">✅ Your Complaint Has Been Resolved</h3>
          <p>Complaint <strong>${complaint.complaintNumber}</strong> has been closed.</p>
          <p>We hope the issue has been resolved to your satisfaction.</p>
          <a href="${process.env.FRONTEND_URL}/citizen/feedback/${complaint._id}" style="display: inline-block; background: #2e7d32; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Rate Service ⭐</a>
          <p style="margin-top: 15px; color: #666; font-size: 13px;">If the issue persists, you can reopen this complaint from the portal.</p>
        </div>
      </div>
    `
  }),

  // 6. SLA Warning - to Admin
  slaWarning: (complaint, adminName, timeRemaining) => ({
    subject: `⚠️ SLA Warning - ${complaint.complaintNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #ff9800; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⚠️ SLA Warning</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #ff9800;">SLA Approaching Breach!</h3>
          <p>Dear ${adminName},</p>
          <p>The following complaint is approaching SLA breach:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Complaint:</td><td style="padding: 8px;">${complaint.complaintNumber}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Due Date:</td><td style="padding: 8px;">${new Date(complaint.slaDueDate).toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Time Remaining:</td><td style="padding: 8px; color: red; font-weight: bold;">${timeRemaining}</td></tr>
          </table>
          <p><strong>Please take immediate action.</strong></p>
        </div>
      </div>
    `
  }),

  // 7. SLA Breached - to Super Admin  
  slaBreached: (complaint) => ({
    subject: `🔴 SLA BREACHED - ${complaint.complaintNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #d32f2f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🔴 SLA BREACHED</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #d32f2f;">Immediate Action Required!</h3>
          <p>Complaint <strong>${complaint.complaintNumber}</strong> has breached its SLA deadline.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Issue:</td><td style="padding: 8px;">${complaint.title}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Location:</td><td style="padding: 8px;">${complaint.address}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Status:</td><td style="padding: 8px;">${complaint.status}</td></tr>
            <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">SLA Due:</td><td style="padding: 8px; color: red;">${new Date(complaint.slaDueDate).toLocaleString()}</td></tr>
          </table>
          <p><strong>This complaint has been auto-escalated to you.</strong></p>
        </div>
      </div>
    `
  }),

  // 8. Complaint reopened - to Admin
  complaintReopened: (complaint, adminName, reason) => ({
    subject: `⚠️ Complaint Reopened - ${complaint.complaintNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #e65100; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⚠️ Complaint Reopened</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #e65100;">Citizen Has Reopened a Complaint</h3>
          <p>Dear ${adminName},</p>
          <p>Complaint <strong>${complaint.complaintNumber}</strong> has been reopened by the citizen.</p>
          <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
          <p>Please investigate and take action.</p>
        </div>
      </div>
    `
  }),

  // 9. OTP Verification - to Citizen
  otpVerification: (data) => ({
    subject: `Email Verification OTP - RCMS Gujarat`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: #1a73e8; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🛡️ RCMS Gujarat - Verification</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
          <h3 style="color: #333;">Identify Verification</h3>
          <p>Please use the following 6-digit code to complete your registration.</p>
          <div style="background: #f1f3f4; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1a73e8; border-radius: 8px; margin: 20px 0;">
            ${data.otp}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. Do not share this OTP with anyone.</p>
        </div>
      </div>
    `
  }),

  // 10. Custom Email (For other events)
  custom: (data) => ({
    subject: data.subject,
    html: data.html
  })
};

/**
 * Send email and log it to database
 */
const sendEmail = async (toEmail, templateName, data, userId = null, complaintId = null) => {
  try {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const { subject, html } = template(data);

    await transporter.sendMail({
      from: `"RCMS Gujarat" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html
    });

    // Log successful email
    if (userId) {
      await EmailLog.create({
        user: userId,
        complaint: complaintId,
        toEmail,
        subject,
        body: html,
        status: 'sent',
        sentAt: new Date()
      });
    }

    console.log(`📧 Email sent: ${templateName} → ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed: ${templateName} → ${toEmail}:`, error.message);

    // Log failed email
    if (userId) {
      await EmailLog.create({
        user: userId,
        complaint: complaintId,
        toEmail,
        subject: templateName,
        body: 'Failed to send',
        status: 'failed',
        errorMessage: error.message
      });
    }

    return false;
  }
};

module.exports = { sendEmail, templates };
