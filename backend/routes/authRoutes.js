const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  getMe,
  registerValidation,
  loginValidation,
  forgotPassword,
  resetPassword,
  sendOTP
} = require('../controllers/authController');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendOTP);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
