/**
 * Risk Profile Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, update, generateId } = require('../datastore');

/**
 * GET /api/v1/profiles
 * List all risk profiles
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
 * GET /api/v1/profiles/:profileId
 * Get profile by ID
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
 * GET /api/v1/investors/:investorId/profiles
 * Get all profiles for investor
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
 * GET /api/v1/investors/:investorId/profiles/active
 * Get active profile for investor
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
 * POST /api/v1/profiles
 * Create profile (admin override)
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
 * PUT /api/v1/profiles/:profileId
 * Update profile
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

