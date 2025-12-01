/**
 * Risk Score Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, generateId } = require('../datastore');

/**
 * GET /api/v1/scores
 * List all risk scores
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
 * GET /api/v1/scores/:scoreId
 * Get score by ID
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
 * GET /api/v1/investors/:investorId/scores
 * Get all scores for investor
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
 * GET /api/v1/investors/:investorId/scores/latest
 * Get latest score for investor
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
 * POST /api/v1/scores
 * Create risk score (from analysis)
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

