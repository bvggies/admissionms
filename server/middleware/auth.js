const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Verify user still exists and is active
    const userResult = await pool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      logger.security('Invalid token - user not found or inactive', { userId: decoded.userId });
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    logger.security('Authentication failed', { error: error.message });
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.security('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };

