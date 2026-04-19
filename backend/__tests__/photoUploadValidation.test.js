const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

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
const Ward = require('../models/Ward');
const District = require('../models/District');
const ComplaintCategory = require('../models/ComplaintCategory');

// Test data
let constructorToken;
let constructorUser;
let testComplaint;
let testWard;
let testDistrict;
let testCategory;
let mongoServer;

describe('Photo Upload Validation Tests', () => {
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

    // Create constructor user
    constructorUser = await User.create({
      name: 'Test Constructor',
      email: 'constructor@test.com',
      mobile: '9999999999',
      password: 'password123',
      role: 'constructor',
      ward: testWard._id,
      isActive: true
    });

    // Create citizen user for complaint
    const citizenUser = await User.create({
      name: 'Test Citizen',
      email: 'citizen@test.com',
      mobile: '8888888888',
      password: 'password123',
      role: 'citizen',
      ward: testWard._id,
      isActive: true
    });

    // Create admin user for assignment
    const adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      mobile: '7777777777',
      password: 'password123',
      role: 'admin',
      ward: testWard._id,
      isActive: true
    });

    // Generate constructor token
    const jwt = require('jsonwebtoken');
    constructorToken = jwt.sign(
      { id: constructorUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test complaint assigned to constructor
    testComplaint = await Complaint.create({
      complaintNumber: 'TEST-PHOTO-001',
      user: citizenUser._id,
      district: testDistrict._id,
      ward: testWard._id,
      address: 'Test Address',
      category: testCategory._id,
      title: 'Test Complaint for Photo Upload',
      description: 'Test Description',
      status: 'assigned',
      priority: 'high',
      assignedConstructor: constructorUser._id,
      assignedAdmin: adminUser._id,
      assignedAt: new Date()
    });
  }, 60000); // 60 second timeout for setup

  // Cleanup: Clear database and close connection
  afterAll(async () => {
    await Complaint.deleteMany({});
    await User.deleteMany({});
    await Ward.deleteMany({});
    await District.deleteMany({});
    await ComplaintCategory.deleteMany({});
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Helper function to create a test image buffer
  const createTestImageBuffer = (filename = 'test.jpg') => {
    // Create a minimal valid JPEG buffer (1x1 pixel red JPEG)
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

  describe('Photo Upload Count Validation', () => {
    it('should succeed when uploading exactly 5 photos', async () => {
      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Work completed with 5 photos')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .attach('images', createTestImageBuffer('photo2.jpg'), 'photo2.jpg')
        .attach('images', createTestImageBuffer('photo3.jpg'), 'photo3.jpg')
        .attach('images', createTestImageBuffer('photo4.jpg'), 'photo4.jpg')
        .attach('images', createTestImageBuffer('photo5.jpg'), 'photo5.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed');
      expect(response.body.data.status).toBe('completed');
    });

    it('should fail when uploading 6 photos (exceeds maximum)', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Attempting to upload 6 photos')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .attach('images', createTestImageBuffer('photo2.jpg'), 'photo2.jpg')
        .attach('images', createTestImageBuffer('photo3.jpg'), 'photo3.jpg')
        .attach('images', createTestImageBuffer('photo4.jpg'), 'photo4.jpg')
        .attach('images', createTestImageBuffer('photo5.jpg'), 'photo5.jpg')
        .attach('images', createTestImageBuffer('photo6.jpg'), 'photo6.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Maximum 5 photos allowed for completion proof');
    });

    it('should fail when completing with 0 photos (minimum not met)', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Attempting to complete without photos')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('At least 1 photo required for completion proof');
    });

    it('should succeed when completing with 1 photo (minimum requirement)', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Work completed with 1 photo')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed');
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('Photo Upload Edge Cases', () => {
    it('should allow in_progress status update without photos', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        startedAt: null,
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'in_progress')
        .field('comments', 'Starting work')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should succeed with 2 photos (within valid range)', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Work completed with 2 photos')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .attach('images', createTestImageBuffer('photo2.jpg'), 'photo2.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should succeed with 3 photos (within valid range)', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Work completed with 3 photos')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .attach('images', createTestImageBuffer('photo2.jpg'), 'photo2.jpg')
        .attach('images', createTestImageBuffer('photo3.jpg'), 'photo3.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should succeed with 4 photos (within valid range)', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Work completed with 4 photos')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .attach('images', createTestImageBuffer('photo2.jpg'), 'photo2.jpg')
        .attach('images', createTestImageBuffer('photo3.jpg'), 'photo3.jpg')
        .attach('images', createTestImageBuffer('photo4.jpg'), 'photo4.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should fail with 7 photos (well over maximum)', async () => {
      // Reset complaint status for this test
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'completed')
        .field('comments', 'Attempting to upload 7 photos')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .attach('images', createTestImageBuffer('photo2.jpg'), 'photo2.jpg')
        .attach('images', createTestImageBuffer('photo3.jpg'), 'photo3.jpg')
        .attach('images', createTestImageBuffer('photo4.jpg'), 'photo4.jpg')
        .attach('images', createTestImageBuffer('photo5.jpg'), 'photo5.jpg')
        .attach('images', createTestImageBuffer('photo6.jpg'), 'photo6.jpg')
        .attach('images', createTestImageBuffer('photo7.jpg'), 'photo7.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Maximum 5 photos allowed for completion proof');
    });
  });

  describe('Authorization and Error Handling', () => {
    it('should reject photo upload from unauthorized constructor', async () => {
      // Create another constructor
      const otherConstructor = await User.create({
        name: 'Other Constructor',
        email: 'other@test.com',
        mobile: '6666666666',
        password: 'password123',
        role: 'constructor',
        ward: testWard._id,
        isActive: true
      });

      const jwt = require('jsonwebtoken');
      const otherToken = jwt.sign(
        { id: otherConstructor._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Reset complaint status
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${otherToken}`)
        .field('status', 'completed')
        .field('comments', 'Unauthorized attempt')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to update this task');

      // Cleanup
      await User.findByIdAndDelete(otherConstructor._id);
    });

    it('should reject photo upload without authentication', async () => {
      // Reset complaint status
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .field('status', 'completed')
        .field('comments', 'No auth token')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid status with photos', async () => {
      // Reset complaint status
      await Complaint.findByIdAndUpdate(testComplaint._id, { 
        status: 'assigned',
        completedAt: null
      });

      const response = await request(app)
        .put(`/api/constructor/tasks/${testComplaint._id}/status`)
        .set('Authorization', `Bearer ${constructorToken}`)
        .field('status', 'invalid_status')
        .field('comments', 'Invalid status')
        .attach('images', createTestImageBuffer('photo1.jpg'), 'photo1.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status update');
    });
  });
});
