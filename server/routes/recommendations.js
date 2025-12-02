/**
 * Recommendation Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, update } = require('../datastore');

/**
 * @openapi
 * /recommendations:
 *   get:
 *     summary: List all recommendations
 *     description: Returns all investment recommendations across all investors
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: List of all recommendations
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           recommendationId:
 *                             type: string
 *                             example: REC-001
 *                           investorId:
 *                             type: string
 *                           profileId:
 *                             type: string
 *                           generatedDate:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             enum: [ACTIVE, ACKNOWLEDGED, IMPLEMENTED, DISMISSED]
 *                           overallAssessment:
 *                             type: object
 *                           recommendations:
 *                             type: array
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  const recommendations = getAll('recommendations');
  
  res.json({
    success: true,
    data: {
      recommendations,
      count: recommendations.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /recommendations/{recommendationId}:
 *   get:
 *     summary: Get recommendation by ID
 *     description: Returns a single recommendation with all details
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: recommendationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The recommendation ID
 *         example: REC-001
 *     responses:
 *       200:
 *         description: Recommendation found
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
 *                     recommendationId:
 *                       type: string
 *                     investorId:
 *                       type: string
 *                     profileId:
 *                       type: string
 *                     generatedDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                     overallAssessment:
 *                       type: object
 *                       properties:
 *                         suitabilityScore:
 *                           type: number
 *                         suitabilityRating:
 *                           type: string
 *                           enum: [HIGHLY_SUITABLE, SUITABLE, SUITABLE_WITH_CAVEATS, REVIEW_REQUIRED, NOT_SUITABLE]
 *                         summary:
 *                           type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           recommendationId:
 *                             type: string
 *                           category:
 *                             type: string
 *                             enum: [REBALANCING, DIVERSIFICATION, RISK_REDUCTION, INCOME]
 *                           priority:
 *                             type: string
 *                             enum: [HIGH, MEDIUM, LOW]
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           currentValue:
 *                             type: number
 *                           targetValue:
 *                             type: number
 *                     nextReviewDate:
 *                       type: string
 *                       format: date
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Recommendation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:recommendationId', (req, res) => {
  const recommendation = getById('recommendations', 'recommendationId', req.params.recommendationId);
  
  if (!recommendation) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Recommendation not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: recommendation,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /recommendations/investor/{investorId}/recommendations:
 *   get:
 *     summary: Get recommendations for investor
 *     description: Returns all recommendations for a specific investor
 *     tags: [Recommendations]
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
 *         description: Recommendations retrieved
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/investor/:investorId/recommendations', (req, res) => {
  const recommendations = getWhere('recommendations', r => r.investorId === req.params.investorId);
  
  res.json({
    success: true,
    data: {
      recommendations,
      count: recommendations.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /recommendations/investor/{investorId}/recommendations/active:
 *   get:
 *     summary: Get active recommendations for investor
 *     description: Returns only active (non-dismissed, non-implemented) recommendations for an investor
 *     tags: [Recommendations]
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
 *         description: Active recommendations retrieved
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/investor/:investorId/recommendations/active', (req, res) => {
  const recommendations = getWhere('recommendations', r => 
    r.investorId === req.params.investorId && r.status === 'ACTIVE'
  );
  
  res.json({
    success: true,
    data: {
      recommendations,
      count: recommendations.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /recommendations/{recommendationId}/status:
 *   put:
 *     summary: Update recommendation status
 *     description: Updates the status of a recommendation (acknowledge, implement, dismiss)
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: recommendationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The recommendation ID
 *         example: REC-001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ACKNOWLEDGED, IMPLEMENTED, DISMISSED]
 *                 example: ACKNOWLEDGED
 *               notes:
 *                 type: string
 *                 example: Client acknowledged during quarterly review
 *           example:
 *             status: ACKNOWLEDGED
 *             notes: Client acknowledged during quarterly review
 *     responses:
 *       200:
 *         description: Status updated successfully
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
 *                     recommendationId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     notes:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Status is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recommendation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:recommendationId/status', (req, res) => {
  const { status, notes } = req.body;
  
  if (!status) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Status is required'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  const updates = { status };
  if (notes) {
    updates.notes = notes;
  }
  
  const updated = update('recommendations', 'recommendationId', req.params.recommendationId, updates);
  
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Recommendation not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: updated,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
