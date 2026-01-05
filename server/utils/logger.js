const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'admission-ms' },
  transports: [
    // Write all logs to combined.log
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    }),
    // Write errors to error.log
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    }),
    // Write info and above to info.log
    new DailyRotateFile({
      filename: path.join(logsDir, 'info-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
} else {
  // In production, also log to console but in JSON format
  logger.add(new winston.transports.Console({
    format: logFormat
  }));
}

// Helper methods for different log types
logger.audit = (action, details) => {
  logger.info('AUDIT', {
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

logger.security = (event, details) => {
  logger.warn('SECURITY', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;

