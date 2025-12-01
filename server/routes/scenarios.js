/**
 * Scenario Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, update, remove, generateId } = require('../datastore');

/**
 * GET /api/v1/scenarios
 * List all scenarios
 */
router.get('/', (req, res) => {
  const scenarios = getAll('scenarios');
  
  res.json({
    success: true,
    data: {
      scenarios,
      count: scenarios.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/scenarios/:scenarioId
 * Get scenario by ID
 */
router.get('/:scenarioId', (req, res) => {
  const scenario = getById('scenarios', 'scenarioId', req.params.scenarioId);
  
  if (!scenario) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Scenario not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: scenario,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/scenarios/category/:category
 * Get scenarios by category
 */
router.get('/category/:category', (req, res) => {
  const category = req.params.category.toUpperCase();
  const scenarios = getWhere('scenarios', s => s.scenarioCategory === category);
  
  res.json({
    success: true,
    data: {
      scenarios,
      count: scenarios.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/v1/scenarios
 * Create custom scenario
 */
router.post('/', (req, res) => {
  const now = new Date().toISOString();
  
  const scenario = {
    scenarioId: generateId('scenario'),
    ...req.body,
    createdAt: now
  };
  
  add('scenarios', scenario);
  
  res.status(201).json({
    success: true,
    data: scenario,
    timestamp: now
  });
});

/**
 * PUT /api/v1/scenarios/:scenarioId
 * Update scenario
 */
router.put('/:scenarioId', (req, res) => {
  const updated = update('scenarios', 'scenarioId', req.params.scenarioId, req.body);
  
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Scenario not found'
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
 * DELETE /api/v1/scenarios/:scenarioId
 * Delete scenario
 */
router.delete('/:scenarioId', (req, res) => {
  const deleted = remove('scenarios', 'scenarioId', req.params.scenarioId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Scenario not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: { message: 'Scenario deleted successfully' },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

