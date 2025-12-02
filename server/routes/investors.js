/**
 * Investor Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, update, remove, generateId } = require('../datastore');

/**
 * @openapi
 * /investors:
 *   get:
 *     summary: List all investors
 *     description: Returns all 50 investors with their demographic and financial information
 *     tags: [Investors]
 *     responses:
 *       200:
 *         description: List of all investors
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
 *                     investors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Investor'
 *                     count:
 *                       type: integer
 *                       example: 50
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  const investors = getAll('investors');
  
  res.json({
    success: true,
    data: {
      investors,
      count: investors.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /investors/{investorId}:
 *   get:
 *     summary: Get investor by ID
 *     description: Returns a single investor by their investor ID
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The investor ID (e.g., INV-001)
 *         example: INV-001
 *     responses:
 *       200:
 *         description: Investor found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Investor'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Investor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:investorId', (req, res) => {
  const investor = getById('investors', 'investorId', req.params.investorId);
  
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
  
  res.json({
    success: true,
    data: investor,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /investors/{investorId}/profile:
 *   get:
 *     summary: Get investor with active risk profile
 *     description: Returns investor details along with their current active risk profile
 *     tags: [Investors]
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
 *         description: Investor with profile found
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
 *                     investor:
 *                       $ref: '#/components/schemas/Investor'
 *                     riskProfile:
 *                       type: object
 *                       properties:
 *                         profileId:
 *                           type: string
 *                           example: PRF-001
 *                         riskCategory:
 *                           type: string
 *                           example: MODERATE
 *                         compositeRiskScore:
 *                           type: number
 *                           example: 65
 *                         recommendedAllocation:
 *                           type: object
 *                           properties:
 *                             equities:
 *                               type: integer
 *                             fixedIncome:
 *                               type: integer
 *                             alternatives:
 *                               type: integer
 *                             cash:
 *                               type: integer
 *                         maxDrawdownTolerance:
 *                           type: number
 *                           example: 25
 *                         maxVolatilityTolerance:
 *                           type: number
 *                           example: 18
 *                         lastAssessmentDate:
 *                           type: string
 *                           format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Investor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:investorId/profile', (req, res) => {
  const investor = getById('investors', 'investorId', req.params.investorId);
  
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
  
  const profile = getWhere('riskProfiles', p => 
    p.investorId === req.params.investorId && p.isActive
  )[0];
  
  const response = {
    investor,
    riskProfile: profile ? {
      profileId: profile.profileId,
      riskCategory: profile.riskCategory,
      compositeRiskScore: profile.compositeRiskScore,
      recommendedAllocation: profile.recommendedAllocation,
      maxDrawdownTolerance: profile.maxDrawdownTolerance,
      maxVolatilityTolerance: profile.maxVolatilityTolerance,
      lastAssessmentDate: profile.profileDate
    } : null
  };
  
  res.json({
    success: true,
    data: response,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /investors/customer/{customerId}:
 *   get:
 *     summary: Get investor by customer ID
 *     description: Returns investor by their external customer ID reference (from banking core system)
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID from banking core system
 *         example: CUST-001
 *     responses:
 *       200:
 *         description: Investor found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Investor'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Investor not found for customer ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/customer/:customerId', (req, res) => {
  const investor = getWhere('investors', i => i.customerId === req.params.customerId)[0];
  
  if (!investor) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Investor not found for customer ID'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: investor,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /investors:
 *   post:
 *     summary: Create new investor
 *     description: Creates a new investor record
 *     tags: [Investors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: CUST-051
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@email.com
 *               phone:
 *                 type: string
 *                 example: 555-0151
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1985-06-15
 *               employmentStatus:
 *                 type: string
 *                 enum: [EMPLOYED, SELF_EMPLOYED, RETIRED, UNEMPLOYED]
 *               annualIncome:
 *                 type: number
 *                 example: 120000
 *               netWorth:
 *                 type: number
 *                 example: 500000
 *               liquidNetWorth:
 *                 type: number
 *                 example: 250000
 *               investmentExperience:
 *                 type: string
 *                 enum: [NOVICE, INTERMEDIATE, EXPERIENCED, EXPERT]
 *               investmentHorizon:
 *                 type: string
 *                 enum: [SHORT_TERM, MEDIUM_TERM, LONG_TERM]
 *     responses:
 *       201:
 *         description: Investor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Investor'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/', (req, res) => {
  const now = new Date().toISOString();
  
  const investor = {
    investorId: generateId('investor'),
    ...req.body,
    createdAt: now,
    updatedAt: now
  };
  
  add('investors', investor);
  
  res.status(201).json({
    success: true,
    data: investor,
    timestamp: now
  });
});

/**
 * @openapi
 * /investors/{investorId}:
 *   put:
 *     summary: Update investor
 *     description: Updates an existing investor's information
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The investor ID
 *         example: INV-001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               employmentStatus:
 *                 type: string
 *                 enum: [EMPLOYED, SELF_EMPLOYED, RETIRED, UNEMPLOYED]
 *               annualIncome:
 *                 type: number
 *               netWorth:
 *                 type: number
 *               liquidNetWorth:
 *                 type: number
 *               investmentExperience:
 *                 type: string
 *                 enum: [NOVICE, INTERMEDIATE, EXPERIENCED, EXPERT]
 *               investmentHorizon:
 *                 type: string
 *                 enum: [SHORT_TERM, MEDIUM_TERM, LONG_TERM]
 *     responses:
 *       200:
 *         description: Investor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Investor'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Investor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:investorId', (req, res) => {
  const updated = update('investors', 'investorId', req.params.investorId, req.body);
  
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Investor not found'
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

/**
 * @openapi
 * /investors/{investorId}:
 *   delete:
 *     summary: Delete investor
 *     description: Deletes an investor record
 *     tags: [Investors]
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
 *         description: Investor deleted successfully
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
 *                     message:
 *                       type: string
 *                       example: Investor deleted successfully
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Investor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:investorId', (req, res) => {
  const deleted = remove('investors', 'investorId', req.params.investorId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Investor not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: { message: 'Investor deleted successfully' },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
