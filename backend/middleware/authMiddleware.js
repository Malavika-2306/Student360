const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: Validates Bearer JWT in request header and attaches authenticated user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'student360_fallback_secret_key_2026'
    );

    // Fetch user without password field
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.'
    });
  }
};

/**
 * Restrict routes by user role (e.g., 'admin', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

/**
 * Ensures student can only access or modify their own student record ID
 */
const restrictStudentToSelf = (paramName = 'id') => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    const targetStudentId = req.params[paramName];
    if (
      !req.user.studentId ||
      req.user.studentId.toString() !== targetStudentId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You may only view or interact with your own student profile and records.'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  restrictStudentToSelf
};
