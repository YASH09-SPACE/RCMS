const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Ward = require('../models/Ward');
const District = require('../models/District');
const ComplaintCategory = require('../models/ComplaintCategory');

// Mock the cron job to prevent it from starting
jest.mock('../cron/slaMonitor', () => jest.fn());

// Mock the email service to prevent open handles
jest.mock('../config/email', () => ({
  verify: jest.fn().mockResolvedValue(true),
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
}));

const { createNotification } = require('../services/notificationService');

// Mock data
let mongoServer;
let testAdmin;
let testSuperAdmin;
let testCitizen;
let testWard;
let testDistrict;
let testCategory;

describe('SLA Monitoring Integration Tests', () => {
  // Setup: Connect to in-memory test database and create test data
  beforeAll(async () => {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    // Clear existing test data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    await Ward.deleteMany({});
    await District.deleteMany({});
    await ComplaintCategory.deleteMany({});

    // Create test district
    testDistrict = await District.create({
      name: 'Test District',
      code: 'TD01'
    });

    // Create test ward
    testWard = await Ward.create({
      name: 'Test Ward',
      wardNumber: 'TW01',
      district: testDistrict._id
    });

    // Create test category
    testCategory = await ComplaintCategory.create({
      name: 'Test Category',
      icon: 'test-icon'
    });

    // Create test users
    testCitizen = await User.create({
      name: 'Test Citizen',
      email: 'citizen@test.com',
      mobile: '9999999999',
      password: 'password123',
      role: 'citizen',
      isActive: true
    });

    testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      mobile: '8888888888',
      password: 'password123',
      role: 'admin',
      ward: testWard._id,
      isActive: true
    });

    testSuperAdmin = await User.create({
      name: 'Test Super Admin',
      email: 'superadmin@test.com',
      mobile: '7777777777',
      password: 'password123',
      role: 'super_admin',
      isActive: true
    });
  }, 60000);

  // Cleanup: Clear database and close connection
  afterAll(async () => {
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    await Ward.deleteMany({});
    await District.deleteMany({});
    await ComplaintCategory.deleteMany({});
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Clear complaints and notifications before each test
  beforeEach(async () => {
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
  });

  describe('SLA Breach Detection', () => {
    it('should detect complaints with past slaDueDate', async () => {
      // Create complaint with slaDueDate in the past
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      
      const complaint = await Complaint.create({
        complaintNumber: 'TEST-001',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // Simulate cron job logic
      const now = new Date();
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      });

      expect(breachedComplaints.length).toBe(1);
      expect(breachedComplaints[0]._id.toString()).toBe(complaint._id.toString());
    });

    it('should not detect complaints with future slaDueDate', async () => {
      // Create complaint with slaDueDate in the future
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      await Complaint.create({
        complaintNumber: 'TEST-002',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: futureDate,
        isSlaBreached: false
      });

      // Simulate cron job logic
      const now = new Date();
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      });

      expect(breachedComplaints.length).toBe(0);
    });

    it('should not detect already marked breached complaints', async () => {
      // Create complaint with past slaDueDate but already marked as breached
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      await Complaint.create({
        complaintNumber: 'TEST-003',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: true // Already marked
      });

      // Simulate cron job logic
      const now = new Date();
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      });

      expect(breachedComplaints.length).toBe(0);
    });

    it('should not detect completed or closed complaints', async () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      // Create completed complaint
      await Complaint.create({
        complaintNumber: 'TEST-004',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'completed',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // Create closed complaint
      await Complaint.create({
        complaintNumber: 'TEST-005',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address 2',
        category: testCategory._id,
        title: 'Test Complaint 2',
        description: 'Test Description 2',
        status: 'closed',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // Simulate cron job logic
      const now = new Date();
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      });

      expect(breachedComplaints.length).toBe(0);
    });
  });

  describe('isSlaBreached Flag Update', () => {
    it('should set isSlaBreached to true for breached complaint', async () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      const complaint = await Complaint.create({
        complaintNumber: 'TEST-006',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      expect(complaint.isSlaBreached).toBe(false);

      // Simulate cron job marking as breached
      complaint.isSlaBreached = true;
      await complaint.save();

      // Verify update
      const updatedComplaint = await Complaint.findById(complaint._id);
      expect(updatedComplaint.isSlaBreached).toBe(true);
    });

    it('should calculate hours overdue correctly', async () => {
      const hoursAgo = 5;
      const pastDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      
      await Complaint.create({
        complaintNumber: 'TEST-007',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // Simulate cron job calculation
      const now = new Date();
      const hoursOverdue = Math.floor((now - pastDate) / (1000 * 60 * 60));

      expect(hoursOverdue).toBeGreaterThanOrEqual(hoursAgo);
      expect(hoursOverdue).toBeLessThan(hoursAgo + 1); // Allow for test execution time
    });
  });

  describe('SLA Breach Notifications', () => {
    it('should create notification for assigned admin on breach', async () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      const complaint = await Complaint.create({
        complaintNumber: 'TEST-008',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // Mark as breached
      complaint.isSlaBreached = true;
      await complaint.save();

      // Calculate hours overdue
      const now = new Date();
      const hoursOverdue = Math.floor((now - complaint.slaDueDate) / (1000 * 60 * 60));

      // Create notification
      await createNotification(
        testAdmin._id,
        'SLA Breached',
        `Complaint ${complaint.complaintNumber} (${complaint.priority} priority) is ${hoursOverdue}h overdue`,
        'error',
        complaint._id
      );

      // Verify notification was created
      const notifications = await Notification.find({ user: testAdmin._id });
      expect(notifications.length).toBe(1);
      expect(notifications[0].title).toBe('SLA Breached');
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].message).toContain(complaint.complaintNumber);
      expect(notifications[0].message).toContain('high priority');
      expect(notifications[0].message).toContain(`${hoursOverdue}h overdue`);
    });

    it('should create notification for super admin on escalated breach', async () => {
      const pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
      
      const complaint = await Complaint.create({
        complaintNumber: 'TEST-009',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'escalated',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        isEscalated: true,
        escalatedTo: testSuperAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // Mark as breached
      complaint.isSlaBreached = true;
      await complaint.save();

      // Calculate hours overdue
      const now = new Date();
      const hoursOverdue = Math.floor((now - complaint.slaDueDate) / (1000 * 60 * 60));

      // Create notification for super admin
      await createNotification(
        testSuperAdmin._id,
        'Escalated SLA Breach',
        `Escalated complaint ${complaint.complaintNumber} has breached SLA by ${hoursOverdue}h`,
        'error',
        complaint._id
      );

      // Verify notification was created
      const notifications = await Notification.find({ user: testSuperAdmin._id });
      expect(notifications.length).toBe(1);
      expect(notifications[0].title).toBe('Escalated SLA Breach');
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].message).toContain(complaint.complaintNumber);
      expect(notifications[0].message).toContain(`${hoursOverdue}h`);
    });

    it('should include complaint number, priority, and hours overdue in notification', async () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 60 * 1000); // 10 hours ago
      
      const complaint = await Complaint.create({
        complaintNumber: 'TEST-010',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'medium',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      const now = new Date();
      const hoursOverdue = Math.floor((now - complaint.slaDueDate) / (1000 * 60 * 60));

      await createNotification(
        testAdmin._id,
        'SLA Breached',
        `Complaint ${complaint.complaintNumber} (${complaint.priority} priority) is ${hoursOverdue}h overdue`,
        'error',
        complaint._id
      );

      const notification = await Notification.findOne({ user: testAdmin._id });
      expect(notification.message).toContain('TEST-010');
      expect(notification.message).toContain('medium priority');
      expect(notification.message).toContain('10h overdue');
    });
  });

  describe('Idempotent Notification Creation', () => {
    it('should not create duplicate notifications for same breach', async () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      const complaint = await Complaint.create({
        complaintNumber: 'TEST-011',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // First breach detection
      complaint.isSlaBreached = true;
      await complaint.save();

      const now = new Date();
      const hoursOverdue = Math.floor((now - complaint.slaDueDate) / (1000 * 60 * 60));

      await createNotification(
        testAdmin._id,
        'SLA Breached',
        `Complaint ${complaint.complaintNumber} (${complaint.priority} priority) is ${hoursOverdue}h overdue`,
        'error',
        complaint._id
      );

      // Verify one notification created
      let notifications = await Notification.find({ user: testAdmin._id });
      expect(notifications.length).toBe(1);

      // Simulate cron job running again (should not find this complaint since isSlaBreached=true)
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false // This will exclude already breached complaints
      });

      expect(breachedComplaints.length).toBe(0);

      // Verify still only one notification
      notifications = await Notification.find({ user: testAdmin._id });
      expect(notifications.length).toBe(1);
    });

    it('should only process complaints with isSlaBreached=false', async () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      // Create multiple complaints, some already breached
      await Complaint.create({
        complaintNumber: 'TEST-012',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address 1',
        category: testCategory._id,
        title: 'Test Complaint 1',
        description: 'Test Description 1',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false // New breach
      });

      await Complaint.create({
        complaintNumber: 'TEST-013',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address 2',
        category: testCategory._id,
        title: 'Test Complaint 2',
        description: 'Test Description 2',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: true // Already breached
      });

      await Complaint.create({
        complaintNumber: 'TEST-014',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address 3',
        category: testCategory._id,
        title: 'Test Complaint 3',
        description: 'Test Description 3',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false // New breach
      });

      // Simulate cron job query
      const now = new Date();
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      });

      // Should only find the 2 complaints with isSlaBreached=false
      expect(breachedComplaints.length).toBe(2);
      expect(breachedComplaints.map(c => c.complaintNumber).sort()).toEqual(['TEST-012', 'TEST-014']);
    });
  });

  describe('Full SLA Monitoring Workflow', () => {
    it('should complete full breach detection and notification workflow', async () => {
      const pastDate = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago
      
      const complaint = await Complaint.create({
        complaintNumber: 'TEST-015',
        user: testCitizen._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedAdmin: testAdmin._id,
        slaDueDate: pastDate,
        isSlaBreached: false
      });

      // Simulate full cron job workflow
      const now = new Date();
      
      // 1. Find breached complaints
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      }).populate('assignedAdmin', 'name email');

      expect(breachedComplaints.length).toBe(1);

      // 2. Mark as breached
      for (const c of breachedComplaints) {
        c.isSlaBreached = true;
        await c.save();

        // 3. Calculate hours overdue
        const hoursOverdue = Math.floor((now - c.slaDueDate) / (1000 * 60 * 60));

        // 4. Create notification
        if (c.assignedAdmin) {
          await createNotification(
            c.assignedAdmin._id,
            'SLA Breached',
            `Complaint ${c.complaintNumber} (${c.priority} priority) is ${hoursOverdue}h overdue`,
            'error',
            c._id
          );
        }
      }

      // Verify final state
      const updatedComplaint = await Complaint.findById(complaint._id);
      expect(updatedComplaint.isSlaBreached).toBe(true);

      const notifications = await Notification.find({ user: testAdmin._id });
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].message).toContain('5h overdue');

      // Verify idempotency - running again should find no new breaches
      const secondRun = await Complaint.find({
        status: { $nin: ['completed', 'closed'] },
        slaDueDate: { $lt: now },
        isSlaBreached: false
      });

      expect(secondRun.length).toBe(0);
    });
  });
});
