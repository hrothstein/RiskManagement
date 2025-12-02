/**
 * Health Check Routes
 */

const express = require('express');
const router = express.Router();
const { datastore } = require('../datastore');

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System health check
 *     description: Returns the health status of the Risk Management System including datastore statistics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     service:
 *                       type: string
 *                       example: risk-management-system
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     uptime:
 *                       type: integer
 *                       description: Server uptime in seconds
 *                       example: 3600
 *                     datastore:
 *                       type: object
 *                       properties:
 *                         investors:
 *                           type: integer
 *                           example: 50
 *                         profiles:
 *                           type: integer
 *                           example: 50
 *                         assessments:
 *                           type: integer
 *                           example: 50
 *                         scenarios:
 *                           type: integer
 *                           example: 10
 *                         riskFactors:
 *                           type: integer
 *                           example: 10
 *                         benchmarks:
 *                           type: integer
 *                           example: 5
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
