/**
 * Risk Management System - Main Server
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const { seedData } = require('./seed');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files (Web UI)
app.use(express.static(path.join(__dirname, '../public')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customSiteTitle: 'Risk Management System API',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico'
}));

// Seed data on startup
seedData();

// Import routes
const healthRoute = require('./routes/health');
const referenceRoute = require('./routes/reference');
const investorsRoute = require('./routes/investors');
const assessmentsRoute = require('./routes/assessments');
const profilesRoute = require('./routes/profiles');
const scoresRoute = require('./routes/scores');
const scenariosRoute = require('./routes/scenarios');
const recommendationsRoute = require('./routes/recommendations');
const analysisRoute = require('./routes/analysis');

// Mount routes
app.use('/api/v1/health', healthRoute);
app.use('/api/v1', referenceRoute);
app.use('/api/v1/investors', investorsRoute);
app.use('/api/v1/assessments', assessmentsRoute);
app.use('/api/v1/profiles', profilesRoute);
app.use('/api/v1/scores', scoresRoute);
app.use('/api/v1/scenarios', scenariosRoute);
app.use('/api/v1/recommendations', recommendationsRoute);
app.use('/api/v1/analysis', analysisRoute);

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Risk Management System API',
    version: '1.0.0',
    documentation: '/api-docs',
    webUI: '/',
    health: '/api/v1/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An internal error occurred'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Risk Management System started successfully!`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Web UI: ${BASE_URL}/`);
  console.log(`📚 API Docs: ${BASE_URL}/api-docs`);
  console.log(`🔌 API Base: ${BASE_URL}/api/v1`);
  console.log(`💚 Health: ${BASE_URL}/api/v1/health\n`);
});

module.exports = app;

