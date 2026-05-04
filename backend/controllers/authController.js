const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendEmail } = require('../services/emailService');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @desc    Register a new citizen
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, mobile, password, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required for registration' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Mobile number already registered'
      });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Create citizen user
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: 'citizen'
    });

    // Delete OTP record after successful registration
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (all roles)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'You are suspended. Please contact the main administrator at superadmin@rcms.com to reactivate your account.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          district: user.district,
          ward: user.ward,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('district', 'name code')
      .populate('ward', 'wardNumber wardName');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, mobile, pincode, address } = req.body;

    // Optional: check if mobile is taken by another user
    if (mobile) {
      const existingUser = await User.findOne({ mobile, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Mobile number already registered to another user' });
      }
    }

    const oldUser = await User.findById(req.user.id);
    if (!oldUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const changes = [];
    const checkChange = (fieldLabel, oldVal, newVal) => {
      if (newVal !== undefined && newVal !== '' && String(oldVal || '') !== String(newVal || '')) {
        changes.push({ field: fieldLabel, old: oldVal || '', new: newVal || '' });
      }
    };
    
    checkChange('Name', oldUser.name, name);
    checkChange('Mobile', oldUser.mobile, mobile);
    checkChange('Pincode', oldUser.pincode, pincode);
    checkChange('Address', oldUser.address, address);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, mobile, pincode, address },
      { new: true, runValidators: true }
    ).populate('district', 'name code').populate('ward', 'wardNumber wardName');

    if (changes.length > 0 && updatedUser.email) {
      sendEmail(updatedUser.email, 'profileUpdated', { userName: updatedUser.name, changes }).catch(err => console.error('Email error:', err));
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password directly
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save(); // This triggers the pre('save') hook in User model to hash the password

    if (user.email) {
      sendEmail(user.email, 'passwordChanged', { userName: user.name }).catch(err => console.error('Email error:', err));
    }

    res.json({
      success: true,
      message: 'Password successfully updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password (Send OTP)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'You are suspended. For reopen connect to main administrator: ybvyas786@gmail.com' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Import here to avoid circular dep if any
    const { sendEmail } = require('../services/emailService');

    const message = `
      <h2>RCMS Password Reset</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>It expires in 10 minutes.</p>
    `;

    try {
      await sendEmail(user.email, 'custom', { subject: 'Password Reset OTP', html: message });
      res.json({ success: true, message: 'OTP sent to email. Please check your inbox.' });
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      console.log('OTP output to console (Email service fallback):', otp);
      // In development, if email fails just print and succeed
      res.json({ success: true, message: 'Email service failed, but for dev purposes OTP is in server console: ' + otp });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password via OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password successfully reset. You can now login.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send OTP to email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (TTL index handles expiration)
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send Email
    const emailSent = await sendEmail(email, 'otpVerification', { otp });

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Mobile must be 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  sendOTP,
  registerValidation,
  loginValidation
};
