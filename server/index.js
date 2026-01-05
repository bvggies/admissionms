const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applicants', require('./routes/applicants'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/evaluation', require('./routes/evaluation'));
app.use('/api/officers', require('./routes/officers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admission Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

