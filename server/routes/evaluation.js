const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const { authenticate, authorize } = require('../middleware/auth');

// AI-based evaluation logic
const evaluateApplication = async (applicationId) => {
  try {
    // Get application with qualifications
    const appResult = await pool.query(
      `SELECT a.*, p.name as programme_name
       FROM applications a
       LEFT JOIN programmes p ON a.programme_id = p.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (appResult.rows.length === 0) {
      throw new Error('Application not found');
    }

    const application = appResult.rows[0];

    // Get qualifications
    const qualResult = await pool.query(
      'SELECT * FROM academic_qualifications WHERE application_id = $1',
      [applicationId]
    );

    // Get admission requirements for the programme
    const reqResult = await pool.query(
      'SELECT * FROM admission_requirements WHERE programme_id = $1',
      [application.programme_id]
    );

    const requirements = reqResult.rows;

    // Grade mapping (WAEC grades)
    const gradePoints = {
      'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
      'D7': 7, 'E8': 8, 'F9': 9,
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6
    };

    let totalScore = 0;
    let maxScore = 0;
    let explanation = [];
    let recommendation = 'reject';
    let meetsRequirements = true;

    // Evaluate each qualification
    for (const qual of qualResult.rows) {
      const subjects = typeof qual.subjects === 'string' 
        ? JSON.parse(qual.subjects) 
        : qual.subjects || {};

      // Check required subjects
      for (const req of requirements) {
        const subjectGrade = subjects[req.subject] || qual.overall_grade;
        const gradePoint = gradePoints[subjectGrade?.toUpperCase()] || 10;
        const requiredPoint = gradePoints[req.minimum_grade.toUpperCase()] || 10;

        maxScore += 10;
        
        if (gradePoint <= requiredPoint) {
          totalScore += (10 - gradePoint + 1);
          explanation.push(`✓ ${req.subject}: ${subjectGrade} (meets requirement: ${req.minimum_grade})`);
        } else {
          totalScore += Math.max(0, 10 - gradePoint);
          explanation.push(`✗ ${req.subject}: ${subjectGrade} (below requirement: ${req.minimum_grade})`);
          if (req.is_required) {
            meetsRequirements = false;
          }
        }
      }

      // Overall grade evaluation
      const overallPoint = gradePoints[qual.overall_grade?.toUpperCase()] || 10;
      if (overallPoint <= 6) {
        totalScore += 20;
        explanation.push(`✓ Overall grade: ${qual.overall_grade} (good)`);
      } else if (overallPoint <= 8) {
        totalScore += 10;
        explanation.push(`○ Overall grade: ${qual.overall_grade} (average)`);
      } else {
        explanation.push(`✗ Overall grade: ${qual.overall_grade} (poor)`);
      }
      maxScore += 20;
    }

    // Calculate percentage score
    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Determine recommendation
    if (meetsRequirements && percentageScore >= 70) {
      recommendation = 'admit';
    } else if (meetsRequirements && percentageScore >= 50) {
      recommendation = 'waitlist';
    } else {
      recommendation = 'reject';
    }

    const explanationText = explanation.join('\n') + 
      `\n\nOverall Score: ${percentageScore.toFixed(2)}%` +
      `\nMeets Requirements: ${meetsRequirements ? 'Yes' : 'No'}` +
      `\nRecommendation: ${recommendation.toUpperCase()}`;

    return {
      score: parseFloat(percentageScore.toFixed(2)),
      recommendation,
      explanation: explanationText,
      meetsRequirements
    };
  } catch (error) {
    logger.error('Evaluation error', { error: error.message, applicationId });
    throw error;
  }
};

// Evaluate application
router.post('/:id/evaluate', authenticate, authorize('officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await evaluateApplication(id);

    // Update application with AI evaluation
    await pool.query(
      `UPDATE applications SET
       ai_score = $1,
       ai_recommendation = $2,
       ai_explanation = $3,
       status = CASE 
         WHEN $2 = 'admit' THEN 'under_review'
         WHEN $2 = 'waitlist' THEN 'waitlisted'
         ELSE 'under_review'
       END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [evaluation.score, evaluation.recommendation, evaluation.explanation, id]
    );

    logger.audit('Application evaluated', {
      userId: req.user.id,
      applicationId: id,
      score: evaluation.score,
      recommendation: evaluation.recommendation
    });

    res.json({
      success: true,
      message: 'Application evaluated successfully',
      evaluation
    });
  } catch (error) {
    logger.error('Evaluate application error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to evaluate application' });
  }
});

// Auto-evaluate all pending applications (batch)
router.post('/batch-evaluate', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id FROM applications WHERE status = 'pending' AND ai_score IS NULL"
    );

    const evaluations = [];
    for (const app of result.rows) {
      try {
        const evaluation = await evaluateApplication(app.id);
        
        await pool.query(
          `UPDATE applications SET
           ai_score = $1,
           ai_recommendation = $2,
           ai_explanation = $3,
           status = CASE 
             WHEN $2 = 'admit' THEN 'under_review'
             WHEN $2 = 'waitlist' THEN 'waitlisted'
             ELSE 'under_review'
           END,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [evaluation.score, evaluation.recommendation, evaluation.explanation, app.id]
        );

        evaluations.push({ applicationId: app.id, ...evaluation });
      } catch (error) {
        logger.error('Batch evaluation error for application', {
          applicationId: app.id,
          error: error.message
        });
      }
    }

    logger.audit('Batch evaluation completed', {
      userId: req.user.id,
      count: evaluations.length
    });

    res.json({
      success: true,
      message: `Evaluated ${evaluations.length} applications`,
      evaluations
    });
  } catch (error) {
    logger.error('Batch evaluate error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to batch evaluate' });
  }
});

module.exports = router;

