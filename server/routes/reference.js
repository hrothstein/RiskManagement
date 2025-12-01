/**
 * Reference Data Routes
 * Questionnaire, Risk Categories, Risk Factors, Benchmarks
 */

const express = require('express');
const router = express.Router();
const { getAll } = require('../datastore');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/v1/questionnaire
 * Get risk assessment questionnaire
 */
router.get('/questionnaire', (req, res) => {
  const questionnaire = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/questionnaire.json'), 'utf8')
  );
  
  res.json({
    success: true,
    data: questionnaire,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/questionnaire/:type
 * Get questionnaire by type
 */
router.get('/questionnaire/:type', (req, res) => {
  const questionnaire = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/questionnaire.json'), 'utf8')
  );
  
  // For now, only COMPREHENSIVE type exists
  if (req.params.type.toUpperCase() !== 'COMPREHENSIVE') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Questionnaire type not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: questionnaire,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/risk-factors
 * Get all risk factors
 */
router.get('/risk-factors', (req, res) => {
  const factors = getAll('riskFactors');
  
  res.json({
    success: true,
    data: {
      factors,
      count: factors.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/benchmarks
 * Get all benchmarks
 */
router.get('/benchmarks', (req, res) => {
  const benchmarks = getAll('benchmarks');
  
  res.json({
    success: true,
    data: {
      benchmarks,
      count: benchmarks.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/risk-categories
 * Get risk category definitions
 */
router.get('/risk-categories', (req, res) => {
  const categories = [
    {
      code: 1,
      name: 'CONSERVATIVE',
      description: 'Prioritizes capital preservation with minimal risk tolerance',
      scoreRange: { min: 0, max: 30 },
      typicalAllocation: {
        equities: 20,
        fixedIncome: 60,
        alternatives: 5,
        cash: 15
      },
      typicalVolatility: { min: 4, max: 8 },
      maxDrawdownTolerance: 10
    },
    {
      code: 2,
      name: 'MODERATELY_CONSERVATIVE',
      description: 'Seeks stability with modest growth potential',
      scoreRange: { min: 31, max: 45 },
      typicalAllocation: {
        equities: 40,
        fixedIncome: 45,
        alternatives: 5,
        cash: 10
      },
      typicalVolatility: { min: 6, max: 12 },
      maxDrawdownTolerance: 15
    },
    {
      code: 3,
      name: 'MODERATE',
      description: 'Balanced approach between growth and stability',
      scoreRange: { min: 46, max: 55 },
      typicalAllocation: {
        equities: 60,
        fixedIncome: 30,
        alternatives: 5,
        cash: 5
      },
      typicalVolatility: { min: 10, max: 18 },
      maxDrawdownTolerance: 25
    },
    {
      code: 4,
      name: 'MODERATELY_AGGRESSIVE',
      description: 'Growth-oriented with higher risk tolerance',
      scoreRange: { min: 56, max: 65 },
      typicalAllocation: {
        equities: 75,
        fixedIncome: 15,
        alternatives: 7,
        cash: 3
      },
      typicalVolatility: { min: 14, max: 22 },
      maxDrawdownTolerance: 35
    },
    {
      code: 5,
      name: 'AGGRESSIVE',
      description: 'Maximum growth with high volatility tolerance',
      scoreRange: { min: 66, max: 100 },
      typicalAllocation: {
        equities: 90,
        fixedIncome: 5,
        alternatives: 3,
        cash: 2
      },
      typicalVolatility: { min: 18, max: 30 },
      maxDrawdownTolerance: 50
    }
  ];
  
  res.json({
    success: true,
    data: { categories },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

