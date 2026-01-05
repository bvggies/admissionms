const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const { authenticate, authorize } = require('../middleware/auth');

// Admission statistics
router.get('/statistics', authenticate, authorize('officer', 'admin'), async (req, res) => {
  try {
    const stats = {};

    // Overall statistics
    const overallResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted,
        COUNT(CASE WHEN status = 'waitlisted' THEN 1 END) as waitlisted,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM applications
    `);
    stats.overall = overallResult.rows[0];

    // Statistics by programme
    const programmeResult = await pool.query(`
      SELECT 
        p.name as programme_name,
        p.code as programme_code,
        COUNT(a.id) as total_applications,
        COUNT(CASE WHEN a.status = 'admitted' THEN 1 END) as admitted,
        COUNT(CASE WHEN a.status = 'waitlisted' THEN 1 END) as waitlisted,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected,
        ROUND(COUNT(CASE WHEN a.status = 'admitted' THEN 1 END)::numeric / NULLIF(COUNT(a.id), 0) * 100, 2) as acceptance_rate
      FROM programmes p
      LEFT JOIN applications a ON p.id = a.programme_id
      GROUP BY p.id, p.name, p.code
      ORDER BY total_applications DESC
    `);
    stats.byProgramme = programmeResult.rows;

    // Statistics by campus
    const campusResult = await pool.query(`
      SELECT 
        campus,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted,
        COUNT(CASE WHEN status = 'waitlisted' THEN 1 END) as waitlisted,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM applications
      WHERE campus IS NOT NULL
      GROUP BY campus
      ORDER BY total DESC
    `);
    stats.byCampus = campusResult.rows;

    // Monthly trends
    const monthlyResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', submitted_at) as month,
        COUNT(*) as applications,
        COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted
      FROM applications
      WHERE submitted_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', submitted_at)
      ORDER BY month DESC
    `);
    stats.monthlyTrends = monthlyResult.rows;

    // Average AI scores
    const scoreResult = await pool.query(`
      SELECT 
        AVG(ai_score) as avg_score,
        MIN(ai_score) as min_score,
        MAX(ai_score) as max_score,
        COUNT(*) as evaluated_count
      FROM applications
      WHERE ai_score IS NOT NULL
    `);
    stats.aiScores = scoreResult.rows[0];

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    logger.error('Get statistics error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get statistics' });
  }
});

// Export applications (CSV format)
router.get('/export', authenticate, authorize('officer', 'admin'), async (req, res) => {
  try {
    const { status, programmeId } = req.query;

    let query = `
      SELECT 
        a.application_id,
        u.first_name || ' ' || u.last_name as applicant_name,
        u.email,
        p.name as programme_name,
        a.campus,
        a.status,
        a.ai_score,
        a.ai_recommendation,
        a.submitted_at,
        a.decision_date
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN programmes p ON a.programme_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (programmeId) {
      paramCount++;
      query += ` AND a.programme_id = $${paramCount}`;
      params.push(programmeId);
    }

    query += ' ORDER BY a.submitted_at DESC';

    const result = await pool.query(query, params);

    // Convert to CSV
    const headers = [
      'Application ID',
      'Applicant Name',
      'Email',
      'Programme',
      'Campus',
      'Status',
      'AI Score',
      'AI Recommendation',
      'Submitted At',
      'Decision Date'
    ];

    const csvRows = [
      headers.join(','),
      ...result.rows.map(row => [
        row.application_id,
        `"${row.applicant_name || ''}"`,
        row.email,
        `"${row.programme_name || ''}"`,
        row.campus || '',
        row.status,
        row.ai_score || '',
        row.ai_recommendation || '',
        row.submitted_at || '',
        row.decision_date || ''
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    res.send(csv);

    logger.audit('Applications exported', {
      userId: req.user.id,
      count: result.rows.length,
      filters: { status, programmeId }
    });
  } catch (error) {
    logger.error('Export applications error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to export applications' });
  }
});

module.exports = router;

