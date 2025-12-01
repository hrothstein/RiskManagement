/**
 * Recommendation Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, update } = require('../datastore');

/**
 * GET /api/v1/recommendations
 * List all recommendations
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
 * GET /api/v1/recommendations/:recommendationId
 * Get recommendation by ID
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
 * GET /api/v1/investors/:investorId/recommendations
 * Get recommendations for investor
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
 * GET /api/v1/investors/:investorId/recommendations/active
 * Get active recommendations for investor
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
 * PUT /api/v1/recommendations/:recommendationId/status
 * Update recommendation status
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

