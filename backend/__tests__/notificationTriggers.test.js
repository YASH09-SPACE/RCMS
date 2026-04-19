const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// Mock the cron job to prevent it from starting
jest.mock('../cron/slaMonitor', () => jest.fn());

// Mock the email service to prevent open handles
jest.mock('../config/email', () => ({
  verify: jest.fn().mockResolvedValue(true),
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
}));

// Mock Cloudinary to use local storage in tests
jest.mock('../config/cloudinary', () => {
  throw new Error('Cloudinary not configured for tests');
});

const app = require('../server');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Ward = require('../models/Ward');
const District = require('../models/District');
const ComplaintCategory = require('../models/ComplaintCategory');

// Test data
let citizenToken, adminToken, constructorToken, superAdminToken;
let citizenUser, adminUser, constructorUser, superAdminUser;
let testWard, testDistrict, testCategory;
let mongoServer;

describe('Notification Triggers Integration Tests', () => {
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
      icon: 'test-icon',
      slaHours: 24
    });

    // Create test users
    citizenUser = await User.create({
      name: 'Test Citizen',
      email: 'citizen@test.com',
      mobile: '9999999999',
      password: 'password123',
      role: 'citizen',
      ward: testWard._id,
      isActive: true
    });

    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      mobile: '8888888888',
      password: 'password123',
      role: 'admin',
      ward: testWard._id,
      isActive: true
    });

    constructorUser = await User.create({
      name: 'Test Constructor',
      email: 'constructor@test.com',
      mobile: '7777777777',
      password: 'password123',
      role: 'constructor',
      ward: testWard._id,
      isActive: true
    });

    superAdminUser = await User.create({
      name: 'Test Super Admin',
      email: 'superadmin@test.com',
      mobile: '6666666666',
      password: 'password123',
      role: 'super_admin',
      isActive: true
    });

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    citizenToken = jwt.sign({ id: citizenUser._id }, jwtSecret, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: adminUser._id }, jwtSecret, { expiresIn: '1h' });
    constructorToken = jwt.sign({ id: constructorUser._id }, jwtSecret, { expiresIn: '1h' });
    superAdminToken = jwt.sign({ id: superAdminUser._id }, jwtSecret, { expiresIn: '1h' });
  }, 60000);

  // Cleanup: Clear database and close connection
  afterAll(async () => {
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    await User.deleteMany({});
    await Ward.deleteMany({});
    await District.deleteMany({});
    await ComplaintCategory.deleteMany({});
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Clear notifications before each test
  beforeEach(async () => {
    await Notification.deleteMany({});
  });

  describe('Notification on Complaint Creation (Requirement 9.1)', () => {
    it('should create notification when citizen creates complaint', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('district', testDistrict._id.toString())
        .field('ward', testWard._id.toString())
        .field('category', testCategory._id.toString())
        .field('title', 'Test Complaint')
        .field('description', 'Test Description')
        .field('address', 'Test Address')
        .expect(201);

      expect(response.body.success).toBe(true);
      const complaintNumber = response.body.data.complaintNumber;

      // Check notification was created
      const notification = await Notification.findOne({
        user: citizenUser._id,
        complaint: response.body.data._id
      });

      expect(notification).toBeTruthy();
      expect(notification.title).toBe('Complaint Registered');
      expect(notification.message).toContain(complaintNumber);
      expect(notification.type).toBe('info');
    });

    it('should continue complaint creation even if notification fails', async () => {
      // Mock notification service to fail
      const notificationService = require('../services/notificationService');
      const originalCreate = notificationService.createNotification;
      notificationService.createNotification = jest.fn().mockRejectedValue(new Error('Notification service down'));

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('district', testDistrict._id.toString())
        .field('ward', testWard._id.toString())
        .field('category', testCategory._id.toString())
        .field('title', 'Test Complaint 2')
        .field('description', 'Test Description 2')
        .field('address', 'Test Address 2')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaintNumber).toBeTruthy();

      // Restore original function
      notificationService.createNotification = originalCreate;
    });
  });

  describe('Notification on Assignment (Requirement 9.2)', () => {
    let testComplaint;

    beforeEach(async () => {
      await Complaint.deleteMany({});
      testComplaint = await Complaint.create({
        complaintNumber: 'TEST-ASSIGN-001',
        user: citizenUser._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint for Assignment',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium'
      });
    });

    it('should create notification for constructor when complaint assigned', async () => {
      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: constructorUser._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check notification was created for constructor
      const notification = await Notification.findOne({
        user: constructorUser._id,
        complaint: testComplaint._id
      });

      expect(notification).toBeTruthy();
      expect(notification.title).toBe('New Task Assigned');
      expect(notification.message).toContain(testComplaint.complaintNumber);
      expect(notification.message).toContain('high priority');
      expect(notification.type).toBe('info');
    });

    it('should continue assignment even if notification fails', async () => {
      // Mock notification service to fail
      const notificationService = require('../services/notificationService');
      const originalCreate = notificationService.createNotification;
      notificationService.createNotification = jest.fn().mockRejectedValue(new Error('Notification service down'));

      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: constructorUser._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('assigned');

      // Restore original function
      notificationService.createNotification = originalCreate;
    });
  });

  describe('Notification on Status Change (Requirements 5.1-5.6, 9.3)', () => {
    let testComplaint;

    beforeEach(async () => {
      await Complaint.deleteMany({});
      testComplaint = await Complaint.create({
        complaintNumber: 'TEST-STATUS-001',
        user: citizenUser._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint for Status Change',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedConstructor: constructorUser._id,
        assignedAdmin: adminUser._id,
        assignedAt: new Date()
      });
    });

    // Helper function to create a test image buffer
    const createTestImageBuffer = () => {
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
        0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
        0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
        0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
        0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
        0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,
        0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14,
        0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
        0x00, 0x00, 0x3F, 0x00, 0x37, 0xFF, 0xD9
      ]);
      return jpegBuffer;
    };

    it('should create notifications when constructor starts work (in_progress)', async () => {
      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'in_progress')
        .field('comments', 'Starting work now')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check notification for citizen
      const citizenNotification = await Notification.findOne({
        user: citizenUser._id,
        complaint: testComplaint._id,
        title: 'Work Started'
      });

      expect(citizenNotification).toBeTruthy();
      expect(citizenNotification.message).toContain(testComplaint.complaintNumber);
      expect(citizenNotification.type).toBe('info');

      // Check notification for admin
      const adminNotification = await Notification.findOne({
        user: adminUser._id,
        complaint: testComplaint._id,
        title: 'Work In Progress'
      });

      expect(adminNotification).toBeTruthy();
      expect(adminNotification.message).toContain(testComplaint.complaintNumber);
      expect(adminNotification.type).toBe('info');
    });

    it('should create notifications when constructor completes work', async () => {
      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Work completed')
        .attach('images', createTestImageBuffer(), 'photo1.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check notification for admin
      const adminNotification = await Notification.findOne({
        user: adminUser._id,
        complaint: testComplaint._id,
        title: 'Task Completed'
      });

      expect(adminNotification).toBeTruthy();
      expect(adminNotification.message).toContain(testComplaint.complaintNumber);
      expect(adminNotification.type).toBe('success');

      // Check notification for citizen
      const citizenNotification = await Notification.findOne({
        user: citizenUser._id,
        complaint: testComplaint._id,
        title: 'Work Completed'
      });

      expect(citizenNotification).toBeTruthy();
      expect(citizenNotification.message).toContain(testComplaint.complaintNumber);
      expect(citizenNotification.type).toBe('success');
    });

    it('should continue status update even if notification fails', async () => {
      // Mock notification service to fail
      const notificationService = require('../services/notificationService');
      const originalCreate = notificationService.createNotification;
      notificationService.createNotification = jest.fn().mockRejectedValue(new Error('Notification service down'));

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'in_progress')
        .field('comments', 'Starting work')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');

      // Restore original function
      notificationService.createNotification = originalCreate;
    });
  });

  describe('Notification on Admin Approval (Requirement 9.5)', () => {
    let testComplaint;

    beforeEach(async () => {
      await Complaint.deleteMany({});
      testComplaint = await Complaint.create({
        complaintNumber: 'TEST-APPROVE-001',
        user: citizenUser._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint for Approval',
        description: 'Test Description',
        status: 'completed',
        priority: 'high',
        assignedConstructor: constructorUser._id,
        assignedAdmin: adminUser._id,
        assignedAt: new Date(),
        completedAt: new Date()
      });
    });

    it('should create notification when admin approves completion', async () => {
      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ comments: 'Work looks good' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check notification for citizen
      const notification = await Notification.findOne({
        user: citizenUser._id,
        complaint: testComplaint._id,
        title: 'Issue Resolved'
      });

      expect(notification).toBeTruthy();
      expect(notification.message).toContain(testComplaint.complaintNumber);
      expect(notification.type).toBe('success');
    });

    it('should continue approval even if notification fails', async () => {
      // Mock notification service to fail
      const notificationService = require('../services/notificationService');
      const originalCreate = notificationService.createNotification;
      notificationService.createNotification = jest.fn().mockRejectedValue(new Error('Notification service down'));

      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ comments: 'Work looks good' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('closed');

      // Restore original function
      notificationService.createNotification = originalCreate;
    });
  });

  describe('Notification on Escalation (Requirement 9.6)', () => {
    let testComplaint;

    beforeEach(async () => {
      await Complaint.deleteMany({});
      testComplaint = await Complaint.create({
        complaintNumber: 'TEST-ESCALATE-001',
        user: citizenUser._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint for Escalation',
        description: 'Test Description',
        status: 'assigned',
        priority: 'high',
        assignedConstructor: constructorUser._id,
        assignedAdmin: adminUser._id,
        assignedAt: new Date()
      });
    });

    it('should create notification for super admin when complaint escalated', async () => {
      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/escalate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Constructor not responding' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check notification for super admin
      const notification = await Notification.findOne({
        user: superAdminUser._id,
        complaint: testComplaint._id,
        title: 'Complaint Escalated'
      });

      expect(notification).toBeTruthy();
      expect(notification.message).toContain(testComplaint.complaintNumber);
      expect(notification.type).toBe('warning');
    });

    it('should continue escalation even if notification fails', async () => {
      // Mock notification service to fail
      const notificationService = require('../services/notificationService');
      const originalCreate = notificationService.createNotification;
      notificationService.createNotification = jest.fn().mockRejectedValue(new Error('Notification service down'));

      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/escalate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Constructor not responding' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('escalated');

      // Restore original function
      notificationService.createNotification = originalCreate;
    });
  });

  describe('Notification on Complaint Reopen (Requirement 9.7)', () => {
    let testComplaint;

    beforeEach(async () => {
      await Complaint.deleteMany({});
      testComplaint = await Complaint.create({
        complaintNumber: 'TEST-REOPEN-001',
        user: citizenUser._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint for Reopen',
        description: 'Test Description',
        status: 'closed',
        priority: 'high',
        assignedConstructor: constructorUser._id,
        assignedAdmin: adminUser._id,
        assignedAt: new Date(),
        completedAt: new Date(),
        closedAt: new Date()
      });
    });

    it('should create notification for admin when citizen reopens complaint', async () => {
      const response = await request(app)
        .put(`/api/complaints/${testComplaint._id}/reopen`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ reason: 'Issue not fully resolved' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check notification for admin
      const notification = await Notification.findOne({
        user: adminUser._id,
        complaint: testComplaint._id,
        title: 'Complaint Reopened'
      });

      expect(notification).toBeTruthy();
      expect(notification.message).toContain(testComplaint.complaintNumber);
      expect(notification.type).toBe('warning');
    });

    it('should continue reopen even if notification fails', async () => {
      // Mock notification service to fail
      const notificationService = require('../services/notificationService');
      const originalCreate = notificationService.createNotification;
      notificationService.createNotification = jest.fn().mockRejectedValue(new Error('Notification service down'));

      const response = await request(app)
        .put(`/api/complaints/${testComplaint._id}/reopen`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ reason: 'Issue not fully resolved' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('reopened');

      // Restore original function
      notificationService.createNotification = originalCreate;
    });
  });
});
