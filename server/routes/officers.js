const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const { authenticate, authorize } = require('../middleware/auth');

// Get dashboard stats
router.get('/dashboard', authenticate, authorize('officer', 'admin'), async (req, res) => {
  try {
    const stats = {};

    // Total applications
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM applications');
    stats.totalApplications = parseInt(totalResult.rows[0].count);

    // Applications by status
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM applications 
       GROUP BY status`
    );
    stats.byStatus = {};
    statusResult.rows.forEach(row => {
      stats.byStatus[row.status] = parseInt(row.count);
    });

    // Applications by programme
    const programmeResult = await pool.query(
      `SELECT p.name, COUNT(a.id) as count
       FROM programmes p
       LEFT JOIN applications a ON p.id = a.programme_id
       GROUP BY p.id, p.name
       ORDER BY count DESC`
    );
    stats.byProgramme = programmeResult.rows.map(row => ({
      name: row.name,
      count: parseInt(row.count)
    }));

    // Pending reviews
    const pendingResult = await pool.query(
      "SELECT COUNT(*) as count FROM applications WHERE status IN ('pending', 'under_review')"
    );
    stats.pendingReviews = parseInt(pendingResult.rows[0].count);

    // Recent applications
    const recentResult = await pool.query(
      `SELECT a.*, p.name as programme_name, u.first_name, u.last_name
       FROM applications a
       LEFT JOIN programmes p ON a.programme_id = p.id
       LEFT JOIN users u ON a.applicant_id = u.id
       ORDER BY a.submitted_at DESC
       LIMIT 10`
    );
    stats.recentApplications = recentResult.rows;

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Get dashboard error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
  }
});

module.exports = router;

