const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const logger = require('../utils/logger');
const { authenticate, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

// Get applicant profile
router.get('/profile', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.email, u.first_name, u.last_name, u.phone
       FROM applicants a
       JOIN users u ON a.id = u.id
       WHERE a.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Get documents
    const documentsResult = await pool.query(
      'SELECT * FROM documents WHERE applicant_id = $1 ORDER BY uploaded_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      profile: result.rows[0],
      documents: documentsResult.rows
    });
  } catch (error) {
    logger.error('Get profile error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
});

// Update applicant profile
router.put('/profile', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const {
      dateOfBirth,
      gender,
      nationality,
      address,
      city,
      region,
      postalCode,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    await pool.query(
      `UPDATE applicants SET
       date_of_birth = COALESCE($1, date_of_birth),
       gender = COALESCE($2, gender),
       nationality = COALESCE($3, nationality),
       address = COALESCE($4, address),
       city = COALESCE($5, city),
       region = COALESCE($6, region),
       postal_code = COALESCE($7, postal_code),
       emergency_contact_name = COALESCE($8, emergency_contact_name),
       emergency_contact_phone = COALESCE($9, emergency_contact_phone),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $10`,
      [
        dateOfBirth,
        gender,
        nationality,
        address,
        city,
        region,
        postalCode,
        emergencyContactName,
        emergencyContactPhone,
        req.user.id
      ]
    );

    // Update user info if provided
    const { firstName, lastName, phone } = req.body;
    if (firstName || lastName || phone) {
      await pool.query(
        `UPDATE users SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [firstName, lastName, phone, req.user.id]
      );
    }

    logger.audit('Profile updated', { userId: req.user.id });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Update profile error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Upload passport photo
router.post('/upload-photo', authenticate, authorize('applicant'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    await pool.query(
      'UPDATE applicants SET passport_photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [fileUrl, req.user.id]
    );

    logger.audit('Passport photo uploaded', { userId: req.user.id, fileUrl });

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      fileUrl
    });
  } catch (error) {
    logger.error('Upload photo error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

// Upload document
router.post('/upload-document', authenticate, authorize('applicant'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({ success: false, message: 'Document type required' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    await pool.query(
      `INSERT INTO documents (applicant_id, document_type, file_name, file_url, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.id,
        documentType,
        req.file.originalname,
        fileUrl,
        req.file.size,
        req.file.mimetype
      ]
    );

    logger.audit('Document uploaded', {
      userId: req.user.id,
      documentType,
      fileUrl
    });

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      fileUrl
    });
  } catch (error) {
    logger.error('Upload document error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
});

// Get documents
router.get('/documents', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE applicant_id = $1 ORDER BY uploaded_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      documents: result.rows
    });
  } catch (error) {
    logger.error('Get documents error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to get documents' });
  }
});

// Delete document
router.delete('/documents/:id', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify document belongs to user
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND applicant_id = $2',
      [id, req.user.id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', docResult.rows[0].file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    logger.audit('Document deleted', { userId: req.user.id, documentId: id });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Delete document error', { error: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
});

module.exports = router;

