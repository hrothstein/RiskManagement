/**
 * Risk Assessment Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, generateId } = require('../datastore');
const { scoreAssessment, generateProfile } = require('../services/scoringEngine');

/**
 * @openapi
 * /assessments:
 *   get:
 *     summary: List all assessments
 *     description: Returns all risk assessments across all investors
 *     tags: [Assessments]
 *     responses:
 *       200:
 *         description: List of all assessments
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
 *                     assessments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           assessmentId:
 *                             type: string
 *                             example: ASM-001
 *                           investorId:
 *                             type: string
 *                             example: INV-001
 *                           assessmentDate:
 *                             type: string
 *                             format: date-time
 *                           assessmentType:
 *                             type: string
 *                             enum: [COMPREHENSIVE, QUICK, ANNUAL_REVIEW]
 *                           status:
 *                             type: string
 *                             enum: [PENDING, IN_PROGRESS, COMPLETED]
 *                           rawScore:
 *                             type: integer
 *                           percentileScore:
 *                             type: number
 *                     count:
 *                       type: integer
 *                       example: 50
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  const assessments = getAll('riskAssessments');
  
  res.json({
    success: true,
    data: {
      assessments,
      count: assessments.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /assessments/{assessmentId}:
 *   get:
 *     summary: Get assessment by ID
 *     description: Returns a single assessment with all question responses
 *     tags: [Assessments]
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID
 *         example: ASM-001
 *     responses:
 *       200:
 *         description: Assessment found
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
 *                     assessmentId:
 *                       type: string
 *                     investorId:
 *                       type: string
 *                     assessmentDate:
 *                       type: string
 *                       format: date-time
 *                     assessmentType:
 *                       type: string
 *                     status:
 *                       type: string
 *                     responses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           questionId:
 *                             type: string
 *                           questionCategory:
 *                             type: string
 *                           questionText:
 *                             type: string
 *                           selectedOption:
 *                             type: string
 *                           optionText:
 *                             type: string
 *                           score:
 *                             type: integer
 *                     rawScore:
 *                       type: integer
 *                     maxPossibleScore:
 *                       type: integer
 *                     percentileScore:
 *                       type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:assessmentId', (req, res) => {
  const assessment = getById('riskAssessments', 'assessmentId', req.params.assessmentId);
  
  if (!assessment) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Assessment not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: assessment,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /assessments/investor/{investorId}/assessments:
 *   get:
 *     summary: Get assessments for investor
 *     description: Returns all assessments for a specific investor
 *     tags: [Assessments]
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
 *         description: Assessments retrieved
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
 *                     assessments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/investor/:investorId/assessments', (req, res) => {
  const assessments = getWhere('riskAssessments', a => a.investorId === req.params.investorId);
  
  res.json({
    success: true,
    data: {
      assessments,
      count: assessments.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /assessments:
 *   post:
 *     summary: Submit new assessment
 *     description: Creates and scores a new risk assessment, automatically generating a risk profile
 *     tags: [Assessments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investorId
 *               - responses
 *             properties:
 *               investorId:
 *                 type: string
 *                 description: The investor ID
 *                 example: INV-001
 *               assessmentType:
 *                 type: string
 *                 enum: [COMPREHENSIVE, QUICK, ANNUAL_REVIEW]
 *                 default: COMPREHENSIVE
 *               responses:
 *                 type: array
 *                 description: Array of question responses
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - selectedOption
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       example: Q1
 *                     selectedOption:
 *                       type: string
 *                       example: C
 *           example:
 *             investorId: INV-001
 *             assessmentType: COMPREHENSIVE
 *             responses:
 *               - questionId: Q1
 *                 selectedOption: C
 *               - questionId: Q2
 *                 selectedOption: D
 *               - questionId: Q3
 *                 selectedOption: B
 *     responses:
 *       201:
 *         description: Assessment created and scored successfully
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
 *                     assessmentId:
 *                       type: string
 *                       example: ASM-051
 *                     status:
 *                       type: string
 *                       example: COMPLETED
 *                     rawScore:
 *                       type: integer
 *                       example: 68
 *                     percentileScore:
 *                       type: number
 *                       example: 68
 *                     riskProfile:
 *                       type: object
 *                       properties:
 *                         profileId:
 *                           type: string
 *                           example: PRF-051
 *                         riskCategory:
 *                           type: string
 *                           example: MODERATELY_AGGRESSIVE
 *                         compositeRiskScore:
 *                           type: number
 *                           example: 65
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Investor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', (req, res) => {
  const { investorId, assessmentType, responses } = req.body;
  
  if (!investorId || !responses || !Array.isArray(responses)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'investorId and responses array are required'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Check investor exists
  const investor = getById('investors', 'investorId', investorId);
  if (!investor) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Investor not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Score the assessment
  const scored = scoreAssessment(responses);
  
  const now = new Date().toISOString();
  const assessment = {
    assessmentId: generateId('assessment'),
    investorId,
    assessmentDate: now,
    assessmentType: assessmentType || 'COMPREHENSIVE',
    status: 'COMPLETED',
    responses: scored.responses,
    rawScore: scored.rawScore,
    maxPossibleScore: scored.maxPossibleScore,
    percentileScore: scored.percentileScore,
    createdAt: now
  };
  
  add('riskAssessments', assessment);
  
  // Generate risk profile
  const profile = generateProfile(investor, assessment);
  add('riskProfiles', profile);
  
  // Deactivate old profiles
  const oldProfiles = getWhere('riskProfiles', p => 
    p.investorId === investorId && p.profileId !== profile.profileId
  );
  oldProfiles.forEach(oldProfile => {
    oldProfile.isActive = false;
    oldProfile.validTo = now;
  });
  
  res.status(201).json({
    success: true,
    data: {
      assessmentId: assessment.assessmentId,
      status: assessment.status,
      rawScore: assessment.rawScore,
      percentileScore: assessment.percentileScore,
      riskProfile: {
        profileId: profile.profileId,
        riskCategory: profile.riskCategory,
        compositeRiskScore: profile.compositeRiskScore
      }
    },
    timestamp: now
  });
});

module.exports = router;
