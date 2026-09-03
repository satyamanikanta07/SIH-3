const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ner_logistics_secret_key_2024');
    let user = null;
    try {
      if (mongoose.connection.readyState === 1 && decoded.userId) {
        user = await User.findById(decoded.userId);
      }
    } catch (e) {}

    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    } else if (decoded.role) {
      req.user = {
        _id: decoded.userId || decoded.id || '650000000000000000000001',
        id: decoded.userId || decoded.id || '650000000000000000000001',
        name: decoded.name || 'User',
        email: decoded.email || '',
        role: decoded.role,
        isActive: true
      };
      req.userId = req.user._id;
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive user.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token, just sets req.user if present
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ner_logistics_secret_key_2024');
      req.user = await User.findById(decoded.userId);
      req.userId = decoded.userId;
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }
  next();
};

module.exports = { auth, authorize, optionalAuth };
