/**
 * Health Check Routes
 */

const express = require('express');
const router = express.Router();
const { datastore } = require('../datastore');

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  const uptime = process.uptime();
  
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'risk-management-system',
      version: '1.0.0',
      uptime: Math.floor(uptime),
      datastore: {
        investors: datastore.investors.length,
        profiles: datastore.riskProfiles.length,
        assessments: datastore.riskAssessments.length,
        scenarios: datastore.scenarios.length,
        riskFactors: datastore.riskFactors.length,
        benchmarks: datastore.benchmarks.length,
        scores: datastore.riskScores.length,
        recommendations: datastore.recommendations.length
      }
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

