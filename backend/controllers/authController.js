const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { securityLogger } = require('../middleware/logger');

// Register new user
const register = catchAsync(async(req, res, next) => {
  const { email, password, name, farmLocation, phoneNumber } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const user = new User({
    email,
    password,
    name,
    farmLocation,
    phoneNumber
  });

  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  // Log successful registration
  securityLogger.logSuccessfulLogin(
    user._id,
    user.email,
    req.ip || req.connection.remoteAddress,
    req.get('User-Agent')
  );

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
});

// Login user
const login = catchAsync(async(req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findByEmail(email).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Log failed login attempt
    securityLogger.logFailedLogin(
      email,
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent')
    );

    return next(new AppError('Invalid email or password', 401));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated. Please contact support.', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  // Log successful login
  securityLogger.logSuccessfulLogin(
    user._id,
    user.email,
    req.ip || req.connection.remoteAddress,
    req.get('User-Agent')
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        farmLocation: user.farmLocation,
        phoneNumber: user.phoneNumber,
        lastLogin: user.lastLogin
      },
      token
    }
  });
});

// Get user profile
const getProfile = catchAsync(async(req, res, _next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        farmLocation: user.farmLocation,
        phoneNumber: user.phoneNumber,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

// Update user profile
const updateProfile = catchAsync(async(req, res, next) => {
  const { name, farmLocation, phoneNumber } = req.body;
  const userId = req.user._id;

  // Update user profile (exclude email and password)
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      name,
      farmLocation,
      phoneNumber
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        farmLocation: updatedUser.farmLocation,
        phoneNumber: updatedUser.phoneNumber,
        lastLogin: updatedUser.lastLogin,
        updatedAt: updatedUser.updatedAt
      }
    }
  });
});

// Change password
const changePassword = catchAsync(async(req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Deactivate account
const deactivateAccount = catchAsync(async(req, res, next) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount
};
