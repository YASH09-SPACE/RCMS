const Complaint = require('../models/Complaint');

/**
 * Generate a unique complaint number in format: RCM-YYYY-XXXX
 * Auto-increments the sequence number
 */
const generateComplaintNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `RCM-${year}-`;

  // Find the latest complaint number for this year
  const lastComplaint = await Complaint.findOne({
    complaintNumber: { $regex: `^${prefix}` }
  })
    .sort({ complaintNumber: -1 })
    .select('complaintNumber');

  let nextSequence = 1;

  if (lastComplaint) {
    const lastSequence = parseInt(lastComplaint.complaintNumber.split('-')[2]);
    nextSequence = lastSequence + 1;
  }

  // Pad to 4 digits (supports up to 9999 per year)
  const sequenceStr = String(nextSequence).padStart(4, '0');

  return `${prefix}${sequenceStr}`;
};

module.exports = { generateComplaintNumber };
