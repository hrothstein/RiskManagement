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
 * @openapi
 * /questionnaire:
 *   get:
 *     summary: Get risk assessment questionnaire
 *     description: Returns the complete 15-question risk assessment questionnaire with scoring guide
 *     tags: [Reference Data]
 *     responses:
 *       200:
 *         description: Questionnaire retrieved successfully
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
 *                     questionnaireType:
 *                       type: string
 *                       example: COMPREHENSIVE
 *                     totalQuestions:
 *                       type: integer
 *                       example: 15
 *                     estimatedTime:
 *                       type: string
 *                       example: 5-10 minutes
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["RISK_TOLERANCE", "TIME_HORIZON", "FINANCIAL_SITUATION", "INVESTMENT_KNOWLEDGE"]
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           questionId:
 *                             type: string
 *                           questionNumber:
 *                             type: integer
 *                           category:
 *                             type: string
 *                           questionText:
 *                             type: string
 *                           options:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 optionId:
 *                                   type: string
 *                                 text:
 *                                   type: string
 *                                 score:
 *                                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 * @openapi
 * /questionnaire/{type}:
 *   get:
 *     summary: Get questionnaire by type
 *     description: Returns questionnaire for specified type (currently only COMPREHENSIVE is available)
 *     tags: [Reference Data]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [COMPREHENSIVE]
 *         description: Type of questionnaire
 *     responses:
 *       200:
 *         description: Questionnaire retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Questionnaire type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @openapi
 * /risk-factors:
 *   get:
 *     summary: Get all risk factors
 *     description: Returns all risk factor definitions with weights and current levels
 *     tags: [Reference Data]
 *     responses:
 *       200:
 *         description: Risk factors retrieved successfully
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
 *                     factors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           factorId:
 *                             type: string
 *                             example: FAC-001
 *                           factorName:
 *                             type: string
 *                             example: Market Risk
 *                           factorCode:
 *                             type: string
 *                             example: MARKET
 *                           factorCategory:
 *                             type: string
 *                             enum: [SYSTEMATIC, UNSYSTEMATIC]
 *                             example: SYSTEMATIC
 *                           description:
 *                             type: string
 *                           defaultWeight:
 *                             type: number
 *                             example: 0.35
 *                           benchmarkIndex:
 *                             type: string
 *                             example: SPY
 *                           currentLevel:
 *                             type: number
 *                             example: 0.65
 *                           historicalAverage:
 *                             type: number
 *                             example: 0.50
 *                           isActive:
 *                             type: boolean
 *                     count:
 *                       type: integer
 *                       example: 10
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 * @openapi
 * /benchmarks:
 *   get:
 *     summary: Get all benchmarks
 *     description: Returns all market benchmarks for performance comparison
 *     tags: [Reference Data]
 *     responses:
 *       200:
 *         description: Benchmarks retrieved successfully
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
 *                     benchmarks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           benchmarkId:
 *                             type: string
 *                             example: BM-001
 *                           benchmarkName:
 *                             type: string
 *                             example: S&P 500 Total Return
 *                           benchmarkSymbol:
 *                             type: string
 *                             example: SPY
 *                           benchmarkType:
 *                             type: string
 *                             enum: [EQUITY, FIXED_INCOME, BALANCED, COMMODITY]
 *                             example: EQUITY
 *                           annualizedReturn:
 *                             type: number
 *                             example: 10.5
 *                           annualizedVolatility:
 *                             type: number
 *                             example: 15.2
 *                           sharpeRatio:
 *                             type: number
 *                             example: 0.69
 *                           maxDrawdown:
 *                             type: number
 *                             example: -33.8
 *                           isDefault:
 *                             type: boolean
 *                           isActive:
 *                             type: boolean
 *                     count:
 *                       type: integer
 *                       example: 5
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 * @openapi
 * /risk-categories:
 *   get:
 *     summary: Get risk category definitions
 *     description: Returns all five risk categories with typical allocations and volatility ranges
 *     tags: [Reference Data]
 *     responses:
 *       200:
 *         description: Risk categories retrieved successfully
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: integer
 *                             example: 3
 *                           name:
 *                             type: string
 *                             enum: [CONSERVATIVE, MODERATELY_CONSERVATIVE, MODERATE, MODERATELY_AGGRESSIVE, AGGRESSIVE]
 *                             example: MODERATE
 *                           description:
 *                             type: string
 *                             example: Balanced approach between growth and stability
 *                           scoreRange:
 *                             type: object
 *                             properties:
 *                               min:
 *                                 type: integer
 *                               max:
 *                                 type: integer
 *                           typicalAllocation:
 *                             type: object
 *                             properties:
 *                               equities:
 *                                 type: integer
 *                               fixedIncome:
 *                                 type: integer
 *                               alternatives:
 *                                 type: integer
 *                               cash:
 *                                 type: integer
 *                           typicalVolatility:
 *                             type: object
 *                             properties:
 *                               min:
 *                                 type: integer
 *                               max:
 *                                 type: integer
 *                           maxDrawdownTolerance:
 *                             type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
