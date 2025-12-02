/**
 * Risk Profile Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, update, generateId } = require('../datastore');

/**
 * @openapi
 * /profiles:
 *   get:
 *     summary: List all risk profiles
 *     description: Returns all risk profiles across all investors
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: List of all risk profiles
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
 *                     profiles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RiskProfile'
 *                     count:
 *                       type: integer
 *                       example: 50
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  const profiles = getAll('riskProfiles');
  
  res.json({
    success: true,
    data: {
      profiles,
      count: profiles.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /profiles/{profileId}:
 *   get:
 *     summary: Get profile by ID
 *     description: Returns a single risk profile by its ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The profile ID
 *         example: PRF-001
 *     responses:
 *       200:
 *         description: Profile found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RiskProfile'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Risk profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:profileId', (req, res) => {
  const profile = getById('riskProfiles', 'profileId', req.params.profileId);
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Risk profile not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: profile,
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /profiles/investor/{investorId}/profiles:
 *   get:
 *     summary: Get all profiles for investor
 *     description: Returns all risk profiles (active and historical) for a specific investor
 *     tags: [Profiles]
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
 *         description: Profiles retrieved
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
 *                     profiles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RiskProfile'
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/investor/:investorId/profiles', (req, res) => {
  const profiles = getWhere('riskProfiles', p => p.investorId === req.params.investorId);
  
  res.json({
    success: true,
    data: {
      profiles,
      count: profiles.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /profiles/investor/{investorId}/profiles/active:
 *   get:
 *     summary: Get active profile for investor
 *     description: Returns the current active risk profile for an investor with risk limits
 *     tags: [Profiles]
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
 *         description: Active profile found
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
 *                     profileId:
 *                       type: string
 *                       example: PRF-001
 *                     investorId:
 *                       type: string
 *                       example: INV-001
 *                     riskCategory:
 *                       type: string
 *                       example: MODERATE
 *                     riskCategoryCode:
 *                       type: integer
 *                       example: 3
 *                     compositeRiskScore:
 *                       type: number
 *                       example: 65
 *                     riskToleranceScore:
 *                       type: number
 *                       example: 65
 *                     riskCapacityScore:
 *                       type: number
 *                       example: 72
 *                     recommendedAllocation:
 *                       type: object
 *                       properties:
 *                         equities:
 *                           type: integer
 *                         fixedIncome:
 *                           type: integer
 *                         alternatives:
 *                           type: integer
 *                         cash:
 *                           type: integer
 *                     riskLimits:
 *                       type: object
 *                       properties:
 *                         maxDrawdownTolerance:
 *                           type: number
 *                           example: 25
 *                         maxVolatilityTolerance:
 *                           type: number
 *                           example: 18
 *                         maxConcentrationLimit:
 *                           type: number
 *                           example: 25
 *                     validFrom:
 *                       type: string
 *                       format: date-time
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: No active risk profile found for investor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/investor/:investorId/profiles/active', (req, res) => {
  const profile = getWhere('riskProfiles', p => 
    p.investorId === req.params.investorId && p.isActive
  )[0];
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'No active risk profile found for investor'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: {
      profileId: profile.profileId,
      investorId: profile.investorId,
      riskCategory: profile.riskCategory,
      riskCategoryCode: profile.riskCategoryCode,
      compositeRiskScore: profile.compositeRiskScore,
      riskToleranceScore: profile.riskToleranceScore,
      riskCapacityScore: profile.riskCapacityScore,
      recommendedAllocation: profile.recommendedAllocation,
      riskLimits: {
        maxDrawdownTolerance: profile.maxDrawdownTolerance,
        maxVolatilityTolerance: profile.maxVolatilityTolerance,
        maxConcentrationLimit: profile.maxConcentrationLimit
      },
      validFrom: profile.validFrom,
      isActive: profile.isActive
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /profiles:
 *   post:
 *     summary: Create profile (admin override)
 *     description: Manually creates a risk profile without going through assessment
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investorId
 *               - riskCategory
 *             properties:
 *               investorId:
 *                 type: string
 *                 example: INV-001
 *               riskCategory:
 *                 type: string
 *                 enum: [CONSERVATIVE, MODERATELY_CONSERVATIVE, MODERATE, MODERATELY_AGGRESSIVE, AGGRESSIVE]
 *               compositeRiskScore:
 *                 type: number
 *               recommendedAllocation:
 *                 type: object
 *               maxDrawdownTolerance:
 *                 type: number
 *               maxVolatilityTolerance:
 *                 type: number
 *               maxConcentrationLimit:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RiskProfile'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/', (req, res) => {
  const now = new Date().toISOString();
  
  const profile = {
    profileId: generateId('profile'),
    ...req.body,
    createdAt: now,
    updatedAt: now
  };
  
  add('riskProfiles', profile);
  
  res.status(201).json({
    success: true,
    data: profile,
    timestamp: now
  });
});

/**
 * @openapi
 * /profiles/{profileId}:
 *   put:
 *     summary: Update profile
 *     description: Updates an existing risk profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The profile ID
 *         example: PRF-001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               riskCategory:
 *                 type: string
 *                 enum: [CONSERVATIVE, MODERATELY_CONSERVATIVE, MODERATE, MODERATELY_AGGRESSIVE, AGGRESSIVE]
 *               compositeRiskScore:
 *                 type: number
 *               recommendedAllocation:
 *                 type: object
 *               maxDrawdownTolerance:
 *                 type: number
 *               maxVolatilityTolerance:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RiskProfile'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Risk profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:profileId', (req, res) => {
  const updated = update('riskProfiles', 'profileId', req.params.profileId, req.body);
  
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Risk profile not found'
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
