const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async(req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token is required' });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix


    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');


    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired.'
      });
    } else {

      return res.status(500).json({
        error: 'Server error during authentication.'
      });
    }
  }
};

module.exports = auth;
