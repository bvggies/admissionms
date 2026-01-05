const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const { authenticate, authorize } = require('../middleware/auth');

// Programmes management
router.get('/programmes', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM programmes ORDER BY name'
    );

    res.json({
      success: true,
      programmes: result.rows
    });
  } catch (error) {
    logger.error('Get programmes error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get programmes' });
  }
});

router.post('/programmes', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { code, name, campus, durationYears, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Code and name required' });
    }

    const result = await pool.query(
      `INSERT INTO programmes (code, name, campus, duration_years, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [code, name, campus, durationYears, description]
    );

    logger.audit('Programme created', {
      userId: req.user.id,
      programmeId: result.rows[0].id,
      code
    });

    res.status(201).json({
      success: true,
      message: 'Programme created successfully',
      programme: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Programme code already exists' });
    }
    logger.error('Create programme error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create programme' });
  }
});

router.put('/programmes/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, campus, durationYears, description, isActive } = req.body;

    const result = await pool.query(
      `UPDATE programmes SET
       name = COALESCE($1, name),
       campus = COALESCE($2, campus),
       duration_years = COALESCE($3, duration_years),
       description = COALESCE($4, description),
       is_active = COALESCE($5, is_active),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, campus, durationYears, description, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Programme not found' });
    }

    logger.audit('Programme updated', { userId: req.user.id, programmeId: id });

    res.json({
      success: true,
      message: 'Programme updated successfully',
      programme: result.rows[0]
    });
  } catch (error) {
    logger.error('Update programme error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update programme' });
  }
});

// Admission requirements management
router.get('/programmes/:id/requirements', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM admission_requirements WHERE programme_id = $1 ORDER BY subject',
      [id]
    );

    res.json({
      success: true,
      requirements: result.rows
    });
  } catch (error) {
    logger.error('Get requirements error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get requirements' });
  }
});

router.post('/programmes/:id/requirements', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, minimumGrade, isRequired } = req.body;

    if (!subject || !minimumGrade) {
      return res.status(400).json({ success: false, message: 'Subject and minimum grade required' });
    }

    const result = await pool.query(
      `INSERT INTO admission_requirements (programme_id, subject, minimum_grade, is_required)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, subject, minimumGrade, isRequired !== false]
    );

    logger.audit('Admission requirement created', {
      userId: req.user.id,
      programmeId: id,
      subject
    });

    res.status(201).json({
      success: true,
      message: 'Requirement added successfully',
      requirement: result.rows[0]
    });
  } catch (error) {
    logger.error('Create requirement error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to add requirement' });
  }
});

// User management
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      role ? 'SELECT COUNT(*) as total FROM users WHERE role = $1' : 'SELECT COUNT(*) as total FROM users',
      role ? [role] : []
    );

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
});

router.put('/users/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isActive, id]
    );

    logger.audit('User status updated', {
      userId: req.user.id,
      targetUserId: id,
      isActive
    });

    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    logger.error('Update user status error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

// System logs
router.get('/logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sl.*, u.email, u.first_name, u.last_name
      FROM system_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (action) {
      paramCount++;
      query += ` AND sl.action = $${paramCount}`;
      params.push(action);
    }

    if (userId) {
      paramCount++;
      query += ` AND sl.user_id = $${paramCount}`;
      params.push(userId);
    }

    query += ` ORDER BY sl.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM system_logs',
      []
    );

    res.json({
      success: true,
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    logger.error('Get logs error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get logs' });
  }
});

module.exports = router;

