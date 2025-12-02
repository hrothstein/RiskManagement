/**
 * Risk Score Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, generateId } = require('../datastore');

/**
 * @openapi
 * /scores:
 *   get:
 *     summary: List all risk scores
 *     description: Returns all point-in-time risk score snapshots
 *     tags: [Scores]
 *     responses:
 *       200:
 *         description: List of all risk scores
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
 *                     scores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           scoreId:
 *                             type: string
 *                             example: SCR-001
 *                           investorId:
 *                             type: string
 *                           profileId:
 *                             type: string
 *                           scoreDate:
 *                             type: string
 *                             format: date-time
 *                           scoreType:
 *                             type: string
 *                             enum: [PORTFOLIO_RISK, CONCENTRATION, SUITABILITY]
 *                           portfolioMetrics:
 *                             type: object
 *                           concentrationMetrics:
 *                             type: object
 *                           profileAlignment:
 *                             type: object
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  const scores = getAll('riskScores');
  
  res.json({
    success: true,
    data: {
      scores,
      count: scores.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /scores/{scoreId}:
 *   get:
 *     summary: Get score by ID
 *     description: Returns a single risk score snapshot
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: scoreId
 *         required: true
 *         schema:
 *           type: string
 *         description: The score ID
 *         example: SCR-001
 *     responses:
 *       200:
 *         description: Score found
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
 *                     scoreId:
 *                       type: string
 *                     investorId:
 *                       type: string
 *                     profileId:
 *                       type: string
 *                     scoreDate:
 *                       type: string
 *                       format: date-time
 *                     scoreType:
 *                       type: string
 *                     portfolioMetrics:
 *                       type: object
 *                     concentrationMetrics:
 *                       type: object
 *                     profileAlignment:
 *                       type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Risk score not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:scoreId', (req, res) => {
  const score = getById('riskScores', 'scoreId', req.params.scoreId);
  
  if (!score) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Risk score not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: score,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /scores/investor/{investorId}/scores:
 *   get:
 *     summary: Get all scores for investor
 *     description: Returns all historical risk scores for a specific investor
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The investor ID
 *         example: INV-001
 *     responses:
 *       200:
 *         description: Scores retrieved
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
 *                     scores:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/investor/:investorId/scores', (req, res) => {
  const scores = getWhere('riskScores', s => s.investorId === req.params.investorId);
  
  res.json({
    success: true,
    data: {
      scores,
      count: scores.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /scores/investor/{investorId}/scores/latest:
 *   get:
 *     summary: Get latest score for investor
 *     description: Returns the most recent risk score for an investor
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The investor ID
 *         example: INV-001
 *     responses:
 *       200:
 *         description: Latest score found
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
 *                     scoreId:
 *                       type: string
 *                     investorId:
 *                       type: string
 *                     scoreDate:
 *                       type: string
 *                       format: date-time
 *                     portfolioMetrics:
 *                       type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: No risk scores found for investor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/investor/:investorId/scores/latest', (req, res) => {
  const scores = getWhere('riskScores', s => s.investorId === req.params.investorId);
  
  if (scores.length === 0) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'No risk scores found for investor'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Sort by date descending and get first
  const latest = scores.sort((a, b) => 
    new Date(b.scoreDate) - new Date(a.scoreDate)
  )[0];
  
  res.json({
    success: true,
    data: latest,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /scores:
 *   post:
 *     summary: Create risk score
 *     description: Creates a new risk score snapshot (typically from analysis results)
 *     tags: [Scores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investorId
 *               - scoreType
 *             properties:
 *               investorId:
 *                 type: string
 *                 example: INV-001
 *               profileId:
 *                 type: string
 *                 example: PRF-001
 *               scoreType:
 *                 type: string
 *                 enum: [PORTFOLIO_RISK, CONCENTRATION, SUITABILITY]
 *                 example: PORTFOLIO_RISK
 *               portfolioMetrics:
 *                 type: object
 *                 properties:
 *                   totalValue:
 *                     type: number
 *                   volatility:
 *                     type: number
 *                   beta:
 *                     type: number
 *                   sharpeRatio:
 *                     type: number
 *                   valueAtRisk95:
 *                     type: number
 *               concentrationMetrics:
 *                 type: object
 *               profileAlignment:
 *                 type: object
 *     responses:
 *       201:
 *         description: Score created successfully
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
 *                     scoreId:
 *                       type: string
 *                     scoreDate:
 *                       type: string
 *                       format: date-time
 *                     investorId:
 *                       type: string
 *                     scoreType:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/', (req, res) => {
  const now = new Date().toISOString();
  
  const score = {
    scoreId: generateId('score'),
    scoreDate: now,
    ...req.body,
    createdAt: now
  };
  
  add('riskScores', score);
  
  res.status(201).json({
    success: true,
    data: score,
    timestamp: now
  });
});

module.exports = router;
