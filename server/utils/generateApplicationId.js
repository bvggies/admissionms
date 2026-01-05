const pool = require('../config/database');
const logger = require('../utils/logger');

const generateApplicationId = async () => {
  const year = new Date().getFullYear();
  const prefix = 'PUC';
  
  try {
    // Get the count of applications for this year
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM applications 
       WHERE application_id LIKE $1`,
      [`${prefix}${year}%`]
    );
    
    const count = parseInt(result.rows[0].count) + 1;
    const sequence = count.toString().padStart(5, '0');
    
    const applicationId = `${prefix}${year}${sequence}`;
    
    logger.info('Generated application ID', { applicationId });
    return applicationId;
  } catch (error) {
    logger.error('Error generating application ID', { error: error.message });
    // Fallback to timestamp-based ID
    const timestamp = Date.now().toString().slice(-8);
    return `${prefix}${year}${timestamp}`;
  }
};

module.exports = generateApplicationId;

