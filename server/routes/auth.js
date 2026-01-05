const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'applicant' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name`,
      [email, passwordHash, role, firstName, lastName, phone]
    );

    const user = userResult.rows[0];

    // If applicant, create applicant record
    if (role === 'applicant') {
      await pool.query(
        'INSERT INTO applicants (id) VALUES ($1)',
        [user.id]
      );
    }

    logger.audit('User registered', { userId: user.id, email, role });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user
    const userResult = await pool.query(
      'SELECT id, email, password_hash, role, first_name, last_name, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      logger.security('Login attempt with invalid email', { email });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      logger.security('Login attempt with inactive account', { email, userId: user.id });
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      logger.security('Login attempt with invalid password', { email, userId: user.id });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    logger.audit('User logged in', { userId: user.id, email, role: user.role });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, is_active, email_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResult.rows[0];

    // If applicant, get additional info
    if (user.role === 'applicant') {
      const applicantResult = await pool.query(
        'SELECT * FROM applicants WHERE id = $1',
        [user.id]
      );
      user.applicantInfo = applicantResult.rows[0] || null;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        applicantInfo: user.applicantInfo
      }
    });
  } catch (error) {
    logger.error('Get user error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get user info' });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ success: true, message: 'If email exists, reset link sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: userResult.rows[0].id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '1h' }
    );

    // Save reset token
    await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL '1 hour'
       WHERE id = $2`,
      [resetToken, userResult.rows[0].id]
    );

    logger.audit('Password reset requested', { userId: userResult.rows[0].id, email });

    // TODO: Send email with reset link
    res.json({ success: true, message: 'If email exists, reset link sent', resetToken });
  } catch (error) {
    logger.error('Password reset request error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Check if token is valid in database
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND reset_token = $2 
       AND reset_token_expiry > NOW()`,
      [decoded.userId, token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = $2`,
      [passwordHash, decoded.userId]
    );

    logger.audit('Password reset completed', { userId: decoded.userId });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    logger.error('Password reset error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

module.exports = router;

