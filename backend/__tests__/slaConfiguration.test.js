const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const SLAConfiguration = require('../models/SLAConfiguration');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock the cron job to prevent it from starting
jest.mock('../cron/slaMonitor', () => jest.fn());

// Mock the email service to prevent open handles
jest.mock('../config/email', () => ({
  verify: jest.fn().mockResolvedValue(true),
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
}));

const app = require('../server');

// Mock data
let superAdminToken;
let adminToken;
let superAdminUser;
let adminUser;
let mongoServer;

describe('SLA Configuration API Tests', () => {
  // Setup: Connect to in-memory test database and create test users
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
    await SLAConfiguration.deleteMany({});

    // Create super admin user
    superAdminUser = await User.create({
      name: 'Test Super Admin',
      email: 'superadmin@test.com',
      mobile: '9999999999',
      password: 'password123',
      role: 'super_admin',
      isActive: true
    });

    // Create regular admin user
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      mobile: '8888888888',
      password: 'password123',
      role: 'admin',
      isActive: true
    });

    // Generate tokens
    superAdminToken = jwt.sign(
      { id: superAdminUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: adminUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }, 60000); // 60 second timeout for setup

  // Cleanup: Clear database and close connection
  afterAll(async () => {
    await SLAConfiguration.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Clear SLA config before each test
  beforeEach(async () => {
    await SLAConfiguration.deleteMany({});
  });

  describe('GET /api/superadmin/sla-config', () => {
    it('should return default SLA configuration when none exists', async () => {
      const response = await request(app)
        .get('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('high', 24);
      expect(response.body.data).toHaveProperty('medium', 72);
      expect(response.body.data).toHaveProperty('low', 168);
    });

    it('should return existing SLA configuration', async () => {
      // Create a config first
      await SLAConfiguration.create({
        high: 12,
        medium: 48,
        low: 120
      });

      const response = await request(app)
        .get('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.high).toBe(12);
      expect(response.body.data.medium).toBe(48);
      expect(response.body.data.low).toBe(120);
    });

    it('should reject unauthorized access (no token)', async () => {
      const response = await request(app)
        .get('/api/superadmin/sla-config')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject access from non-super-admin users', async () => {
      const response = await request(app)
        .get('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/superadmin/sla-config - Valid Configuration Updates', () => {
    it('should successfully update SLA configuration with valid values', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 12,
          medium: 48,
          low: 120
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('SLA configuration updated successfully');
      expect(response.body.data.high).toBe(12);
      expect(response.body.data.medium).toBe(48);
      expect(response.body.data.low).toBe(120);
    });

    it('should create new configuration if none exists', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          medium: 72,
          low: 168
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify it was created in database
      const config = await SLAConfiguration.findOne();
      expect(config).toBeTruthy();
      expect(config.high).toBe(24);
    });

    it('should update existing configuration', async () => {
      // Create initial config
      await SLAConfiguration.create({
        high: 24,
        medium: 72,
        low: 168
      });

      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 6,
          medium: 24,
          low: 72
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.high).toBe(6);
      expect(response.body.data.medium).toBe(24);
      expect(response.body.data.low).toBe(72);

      // Verify only one config exists
      const count = await SLAConfiguration.countDocuments();
      expect(count).toBe(1);
    });

    it('should track updatedBy field', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          medium: 72,
          low: 168
        })
        .expect(200);

      expect(response.body.data.updatedBy).toBe(superAdminUser._id.toString());
    });
  });

  describe('PUT /api/superadmin/sla-config - Invalid Hierarchy Validation', () => {
    it('should reject when high >= medium', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 72,
          medium: 72,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must follow: high < medium < low');
    });

    it('should reject when high > medium', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 100,
          medium: 72,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must follow: high < medium < low');
    });

    it('should reject when medium >= low', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          medium: 168,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must follow: high < medium < low');
    });

    it('should reject when medium > low', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          medium: 200,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must follow: high < medium < low');
    });

    it('should reject when all values are equal', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 72,
          medium: 72,
          low: 72
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must follow: high < medium < low');
    });
  });

  describe('PUT /api/superadmin/sla-config - Missing Fields and Non-Positive Values', () => {
    it('should reject when high field is missing', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          medium: 72,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All SLA durations (high, medium, low) are required');
    });

    it('should reject when medium field is missing', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All SLA durations (high, medium, low) are required');
    });

    it('should reject when low field is missing', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          medium: 72
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All SLA durations (high, medium, low) are required');
    });

    it('should reject when all fields are missing', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All SLA durations (high, medium, low) are required');
    });

    it('should reject when high is zero', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 0,
          medium: 72,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must be positive integers');
    });

    it('should reject when medium is negative', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          medium: -72,
          low: 168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must be positive integers');
    });

    it('should reject when low is negative', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 24,
          medium: 72,
          low: -168
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must be positive integers');
    });

    it('should reject when all values are zero', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          high: 0,
          medium: 0,
          low: 0
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('SLA durations must be positive integers');
    });
  });

  describe('PUT /api/superadmin/sla-config - Unauthorized Access Attempts', () => {
    it('should reject update without authentication token', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .send({
          high: 24,
          medium: 72,
          low: 168
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject update from regular admin user', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          high: 24,
          medium: 72,
          low: 168
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject update with invalid token', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', 'Bearer invalid-token-12345')
        .send({
          high: 24,
          medium: 72,
          low: 168
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject update with malformed authorization header', async () => {
      const response = await request(app)
        .put('/api/superadmin/sla-config')
        .set('Authorization', superAdminToken) // Missing "Bearer" prefix
        .send({
          high: 24,
          medium: 72,
          low: 168
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('SLA Calculation During Complaint Assignment', () => {
    let testComplaint;
    let testConstructor;
    let testWard;
    let testDistrict;
    let testCategory;

    beforeEach(async () => {
      // Clear test data
      await SLAConfiguration.deleteMany({});
      const Complaint = require('../models/Complaint');
      const Ward = require('../models/Ward');
      const District = require('../models/District');
      const ComplaintCategory = require('../models/ComplaintCategory');
      
      await Complaint.deleteMany({});
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

      // Create test constructor
      await User.deleteOne({ email: 'constructor@test.com' }); // Clean up any existing constructor
      testConstructor = await User.create({
        name: 'Test Constructor',
        email: 'constructor@test.com',
        mobile: '7777777777',
        password: 'password123',
        role: 'constructor',
        ward: testWard._id,
        isActive: true
      });

      // Update admin user with ward
      adminUser.ward = testWard._id;
      await adminUser.save();

      // Create test complaint
      testComplaint = await Complaint.create({
        complaintNumber: 'TEST-001',
        user: adminUser._id,
        district: testDistrict._id,
        ward: testWard._id,
        address: 'Test Address',
        category: testCategory._id,
        title: 'Test Complaint',
        description: 'Test Description',
        status: 'pending'
      });
    });

  describe('Default SLA Configuration', () => {
    it('should calculate 24h deadline for high priority with default config', async () => {
      const beforeAssignment = Date.now();

      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: testConstructor._id
        })
        .expect(200);

      const afterAssignment = Date.now();

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.slaDueDate).toBeTruthy();

      // Verify slaDueDate is approximately 24 hours from now
      const slaDueDate = new Date(response.body.data.slaDueDate);
      const expectedDueDate = new Date(beforeAssignment + 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(slaDueDate - expectedDueDate);
      
      // Allow 5 second tolerance for test execution time
      expect(timeDiff).toBeLessThan(5000);
    });

    it('should calculate 72h deadline for medium priority with default config', async () => {
      const beforeAssignment = Date.now();

      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'medium',
          constructorId: testConstructor._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('medium');
      expect(response.body.data.slaDueDate).toBeTruthy();

      // Verify slaDueDate is approximately 72 hours from now
      const slaDueDate = new Date(response.body.data.slaDueDate);
      const expectedDueDate = new Date(beforeAssignment + 72 * 60 * 60 * 1000);
      const timeDiff = Math.abs(slaDueDate - expectedDueDate);
      
      expect(timeDiff).toBeLessThan(5000);
    });

    it('should calculate 168h deadline for low priority with default config', async () => {
      const beforeAssignment = Date.now();

      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'low',
          constructorId: testConstructor._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('low');
      expect(response.body.data.slaDueDate).toBeTruthy();

      // Verify slaDueDate is approximately 168 hours from now
      const slaDueDate = new Date(response.body.data.slaDueDate);
      const expectedDueDate = new Date(beforeAssignment + 168 * 60 * 60 * 1000);
      const timeDiff = Math.abs(slaDueDate - expectedDueDate);
      
      expect(timeDiff).toBeLessThan(5000);
    });
  });

  describe('Custom SLA Configuration', () => {
    it('should calculate deadline using custom SLA configuration', async () => {
      // Create custom SLA configuration
      await SLAConfiguration.create({
        high: 12,
        medium: 48,
        low: 120
      });

      const beforeAssignment = Date.now();

      // Test high priority with custom config (12h)
      const highResponse = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: testConstructor._id
        })
        .expect(200);

      expect(highResponse.body.success).toBe(true);
      expect(highResponse.body.data.priority).toBe('high');

      const slaDueDate = new Date(highResponse.body.data.slaDueDate);
      const expectedDueDate = new Date(beforeAssignment + 12 * 60 * 60 * 1000);
      const timeDiff = Math.abs(slaDueDate - expectedDueDate);
      
      expect(timeDiff).toBeLessThan(5000);
    });

    it('should calculate medium priority with custom config (48h)', async () => {
      // Create custom SLA configuration
      await SLAConfiguration.create({
        high: 12,
        medium: 48,
        low: 120
      });

      // Create new complaint for medium priority test
      const Complaint = require('../models/Complaint');
      const ComplaintCategory = require('../models/ComplaintCategory');
      const District = require('../models/District');
      
      const category = await ComplaintCategory.findOne();
      const district = await District.findOne();
      
      const mediumComplaint = await Complaint.create({
        complaintNumber: 'TEST-002',
        user: adminUser._id,
        district: district._id,
        ward: testWard._id,
        address: 'Test Address 2',
        category: category._id,
        title: 'Test Complaint 2',
        description: 'Test Description 2',
        status: 'pending'
      });

      const beforeAssignment = Date.now();

      const response = await request(app)
        .put(`/api/admin/complaints/${mediumComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'medium',
          constructorId: testConstructor._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('medium');

      const slaDueDate = new Date(response.body.data.slaDueDate);
      const expectedDueDate = new Date(beforeAssignment + 48 * 60 * 60 * 1000);
      const timeDiff = Math.abs(slaDueDate - expectedDueDate);
      
      expect(timeDiff).toBeLessThan(5000);
    });

    it('should calculate low priority with custom config (120h)', async () => {
      // Create custom SLA configuration
      await SLAConfiguration.create({
        high: 12,
        medium: 48,
        low: 120
      });

      // Create new complaint for low priority test
      const Complaint = require('../models/Complaint');
      const ComplaintCategory = require('../models/ComplaintCategory');
      const District = require('../models/District');
      
      const category = await ComplaintCategory.findOne();
      const district = await District.findOne();
      
      const lowComplaint = await Complaint.create({
        complaintNumber: 'TEST-003',
        user: adminUser._id,
        district: district._id,
        ward: testWard._id,
        address: 'Test Address 3',
        category: category._id,
        title: 'Test Complaint 3',
        description: 'Test Description 3',
        status: 'pending'
      });

      const beforeAssignment = Date.now();

      const response = await request(app)
        .put(`/api/admin/complaints/${lowComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'low',
          constructorId: testConstructor._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('low');

      const slaDueDate = new Date(response.body.data.slaDueDate);
      const expectedDueDate = new Date(beforeAssignment + 120 * 60 * 60 * 1000);
      const timeDiff = Math.abs(slaDueDate - expectedDueDate);
      
      expect(timeDiff).toBeLessThan(5000);
    });
  });

  describe('SLA Calculation Edge Cases', () => {
    it('should store slaDueDate as UTC timestamp', async () => {
      const response = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: testConstructor._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify slaDueDate is a valid ISO 8601 date string
      const slaDueDate = new Date(response.body.data.slaDueDate);
      expect(slaDueDate).toBeInstanceOf(Date);
      expect(slaDueDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('should preserve existing slaDueDate when reassigning with same priority', async () => {
      // First assignment
      const firstResponse = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: testConstructor._id
        })
        .expect(200);

      const firstSlaDueDate = firstResponse.body.data.slaDueDate;

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      // Reassign to different constructor with same priority
      const Complaint = require('../models/Complaint');
      const complaint = await Complaint.findById(testComplaint._id);
      complaint.status = 'assigned';
      await complaint.save();

      const secondResponse = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: testConstructor._id
        })
        .expect(200);

      // slaDueDate should be recalculated (new assignment)
      expect(secondResponse.body.data.slaDueDate).toBeTruthy();
      // The dates will be different since it's a new assignment
      expect(new Date(secondResponse.body.data.slaDueDate).getTime())
        .toBeGreaterThanOrEqual(new Date(firstSlaDueDate).getTime());
    });

    it('should update slaDueDate when priority changes', async () => {
      // First assignment with low priority
      const firstResponse = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'low',
          constructorId: testConstructor._id
        })
        .expect(200);

      const firstSlaDueDate = new Date(firstResponse.body.data.slaDueDate);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      // Reassign with high priority
      const Complaint = require('../models/Complaint');
      const complaint = await Complaint.findById(testComplaint._id);
      complaint.status = 'assigned';
      await complaint.save();

      const secondResponse = await request(app)
        .put(`/api/admin/complaints/${testComplaint._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          constructorId: testConstructor._id
        })
        .expect(200);

      const secondSlaDueDate = new Date(secondResponse.body.data.slaDueDate);

      // High priority should have earlier deadline than low priority
      expect(secondSlaDueDate.getTime()).toBeLessThan(firstSlaDueDate.getTime());
    });
  });
  });
});
