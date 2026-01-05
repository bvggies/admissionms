const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const { authenticate, authorize } = require('../middleware/auth');
const generateApplicationId = require('../utils/generateApplicationId');

// Submit application
router.post('/submit', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const { programmeId, campus, qualifications } = req.body;

    if (!programmeId || !campus || !qualifications || !Array.isArray(qualifications)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if applicant already has a pending or submitted application
    const existingApp = await pool.query(
      `SELECT id FROM applications WHERE applicant_id = $1 
       AND status IN ('pending', 'under_review', 'admitted', 'waitlisted')`,
      [req.user.id]
    );

    if (existingApp.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active application'
      });
    }

    // Generate application ID
    const applicationId = await generateApplicationId();

    // Create application
    const appResult = await pool.query(
      `INSERT INTO applications (application_id, applicant_id, programme_id, campus, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [applicationId, req.user.id, programmeId, campus]
    );

    const application = appResult.rows[0];

    // Insert academic qualifications
    for (const qual of qualifications) {
      await pool.query(
        `INSERT INTO academic_qualifications 
         (application_id, qualification_type, institution_name, year_completed, subjects, overall_grade, certificate_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          application.id,
          qual.qualificationType,
          qual.institutionName,
          qual.yearCompleted,
          JSON.stringify(qual.subjects || {}),
          qual.overallGrade,
          qual.certificateUrl || null
        ]
      );
    }

    logger.audit('Application submitted', {
      userId: req.user.id,
      applicationId: application.application_id,
      programmeId
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        applicationId: application.application_id,
        status: application.status,
        submittedAt: application.submitted_at
      }
    });
  } catch (error) {
    logger.error('Submit application error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

// Get applicant's application
router.get('/my-application', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.name as programme_name, p.code as programme_code
       FROM applications a
       LEFT JOIN programmes p ON a.programme_id = p.id
       WHERE a.applicant_id = $1
       ORDER BY a.submitted_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, application: null });
    }

    const application = result.rows[0];

    // Get qualifications
    const qualResult = await pool.query(
      'SELECT * FROM academic_qualifications WHERE application_id = $1',
      [application.id]
    );

    application.qualifications = qualResult.rows.map(q => ({
      ...q,
      subjects: typeof q.subjects === 'string' ? JSON.parse(q.subjects) : q.subjects
    }));

    res.json({
      success: true,
      application
    });
  } catch (error) {
    logger.error('Get application error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to get application' });
  }
});

// Get all applications (for officers/admins)
router.get('/', authenticate, authorize('officer', 'admin'), async (req, res) => {
  try {
    const { status, programmeId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
             p.name as programme_name, p.code as programme_code,
             u.first_name, u.last_name, u.email,
             app.date_of_birth, app.gender, app.nationality
      FROM applications a
      LEFT JOIN programmes p ON a.programme_id = p.id
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN applicants app ON a.applicant_id = app.id
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

    query += ` ORDER BY a.submitted_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM applications WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    if (programmeId) {
      countParamCount++;
      countQuery += ` AND programme_id = $${countParamCount}`;
      countParams.push(programmeId);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      applications: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    logger.error('Get applications error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get applications' });
  }
});

// Get single application details
router.get('/:id', authenticate, authorize('officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, 
              p.name as programme_name, p.code as programme_code,
              u.first_name, u.last_name, u.email, u.phone,
              app.*
       FROM applications a
       LEFT JOIN programmes p ON a.programme_id = p.id
       LEFT JOIN users u ON a.applicant_id = u.id
       LEFT JOIN applicants app ON a.applicant_id = app.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = result.rows[0];

    // Get qualifications
    const qualResult = await pool.query(
      'SELECT * FROM academic_qualifications WHERE application_id = $1',
      [id]
    );

    application.qualifications = qualResult.rows.map(q => ({
      ...q,
      subjects: typeof q.subjects === 'string' ? JSON.parse(q.subjects) : q.subjects
    }));

    // Get documents
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE applicant_id = $1',
      [application.applicant_id]
    );

    application.documents = docResult.rows;

    res.json({
      success: true,
      application
    });
  } catch (error) {
    logger.error('Get application details error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get application details' });
  }
});

// Update application status (for officers/admins)
router.put('/:id/status', authenticate, authorize('officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status required' });
    }

    const validStatuses = ['pending', 'under_review', 'admitted', 'waitlisted', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pool.query(
      `UPDATE applications SET
       status = $1,
       officer_decision = $1,
       officer_notes = $2,
       officer_id = $3,
       decision_date = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [status, notes || null, req.user.id, id]
    );

    logger.audit('Application status updated', {
      userId: req.user.id,
      applicationId: id,
      status,
      notes
    });

    res.json({ success: true, message: 'Application status updated successfully' });
  } catch (error) {
    logger.error('Update application status error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

module.exports = router;

