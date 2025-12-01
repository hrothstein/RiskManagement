/**
 * Investor Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, update, remove, generateId } = require('../datastore');

/**
 * GET /api/v1/investors
 * List all investors
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
 * GET /api/v1/investors/:investorId
 * Get investor by ID
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
 * GET /api/v1/investors/:investorId/profile
 * Get investor with active risk profile
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
 * GET /api/v1/investors/customer/:customerId
 * Get investor by customer ID
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
 * POST /api/v1/investors
 * Create new investor
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
 * PUT /api/v1/investors/:investorId
 * Update investor
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
 * DELETE /api/v1/investors/:investorId
 * Delete investor
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

