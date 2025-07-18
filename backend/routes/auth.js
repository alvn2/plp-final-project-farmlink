const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validateUserRegistration } = require('../middleware/validation');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async(req, res) => {
  try {
    const { name, email, password, farmLocation, phoneNumber } = req.body;
    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    // Create user
    const user = new User({ name, email, password, farmLocation, phoneNumber });
    await user.save();
    // Generate token
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          farmLocation: user.farmLocation,
          phoneNumber: user.phoneNumber
        },
        token
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors ? Object.values(error.errors).map(e => ({ message: e.message })) : [] });
    }
    res.status(500).json({ success: false, message: 'Server error', errors: [{ message: error.message }] });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async(req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Generate token
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          farmLocation: user.farmLocation,
          phoneNumber: user.phoneNumber
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Middleware to protect routes
const authMiddleware = require('../middleware/auth');
// Profile route
router.get('/profile', authMiddleware, async(req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          farmLocation: user.farmLocation,
          phoneNumber: user.phoneNumber
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async(req, res) => {
  try {
    const { name, farmLocation } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (farmLocation !== undefined) updateData.farmLocation = farmLocation.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile.',
      errors: [{ message: error.message }]
    });
  }
});

module.exports = router;
