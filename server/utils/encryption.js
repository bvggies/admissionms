const crypto = require('crypto');
const logger = require('./logger');

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Encrypt sensitive data
const encrypt = (text) => {
  if (!text) return null;
  
  try {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Encryption error', { error: error.message });
    return null;
  }
};

// Decrypt sensitive data
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  try {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error', { error: error.message });
    return null;
  }
};

module.exports = { encrypt, decrypt };

