/**
 * Scenario Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, update, remove, generateId } = require('../datastore');

/**
 * @openapi
 * /scenarios:
 *   get:
 *     summary: List all scenarios
 *     description: Returns all stress test scenarios (historical, hypothetical, and regulatory)
 *     tags: [Scenarios]
 *     responses:
 *       200:
 *         description: List of all scenarios
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
 *                     scenarios:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           scenarioId:
 *                             type: string
 *                             example: SCN-001
 *                           scenarioName:
 *                             type: string
 *                             example: 2008 Financial Crisis
 *                           scenarioDescription:
 *                             type: string
 *                           scenarioCategory:
 *                             type: string
 *                             enum: [HISTORICAL, HYPOTHETICAL, REGULATORY]
 *                           isActive:
 *                             type: boolean
 *                           shockParameters:
 *                             type: object
 *                             properties:
 *                               equityShock:
 *                                 type: number
 *                               bondShock:
 *                                 type: number
 *                               creditSpreadChange:
 *                                 type: number
 *                               volatilitySpike:
 *                                 type: number
 *                           sectorShocks:
 *                             type: object
 *                     count:
 *                       type: integer
 *                       example: 10
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 * @openapi
 * /scenarios/{scenarioId}:
 *   get:
 *     summary: Get scenario by ID
 *     description: Returns a single stress test scenario with all parameters
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: The scenario ID
 *         example: SCN-001
 *     responses:
 *       200:
 *         description: Scenario found
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
 *                     scenarioId:
 *                       type: string
 *                     scenarioName:
 *                       type: string
 *                     scenarioDescription:
 *                       type: string
 *                     scenarioCategory:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     shockParameters:
 *                       type: object
 *                     sectorShocks:
 *                       type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @openapi
 * /scenarios/category/{category}:
 *   get:
 *     summary: Get scenarios by category
 *     description: Returns all scenarios of a specific category
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [HISTORICAL, HYPOTHETICAL, REGULATORY]
 *         description: The scenario category
 *         example: HISTORICAL
 *     responses:
 *       200:
 *         description: Scenarios retrieved
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
 *                     scenarios:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 * @openapi
 * /scenarios:
 *   post:
 *     summary: Create custom scenario
 *     description: Creates a new stress test scenario
 *     tags: [Scenarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scenarioName
 *               - scenarioCategory
 *               - shockParameters
 *             properties:
 *               scenarioName:
 *                 type: string
 *                 example: Custom Recession Scenario
 *               scenarioDescription:
 *                 type: string
 *                 example: A custom stress scenario for testing
 *               scenarioCategory:
 *                 type: string
 *                 enum: [HISTORICAL, HYPOTHETICAL, REGULATORY]
 *                 example: HYPOTHETICAL
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               shockParameters:
 *                 type: object
 *                 properties:
 *                   equityShock:
 *                     type: number
 *                     example: -30
 *                   bondShock:
 *                     type: number
 *                     example: 5
 *                   creditSpreadChange:
 *                     type: number
 *                     example: 200
 *                   volatilitySpike:
 *                     type: number
 *                     example: 50
 *               sectorShocks:
 *                 type: object
 *                 example:
 *                   TECHNOLOGY: -35
 *                   FINANCIAL: -40
 *                   HEALTHCARE: -20
 *     responses:
 *       201:
 *         description: Scenario created successfully
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
 *                     scenarioId:
 *                       type: string
 *                     scenarioName:
 *                       type: string
 *                     scenarioCategory:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 * @openapi
 * /scenarios/{scenarioId}:
 *   put:
 *     summary: Update scenario
 *     description: Updates an existing stress test scenario
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: The scenario ID
 *         example: SCN-001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenarioName:
 *                 type: string
 *               scenarioDescription:
 *                 type: string
 *               scenarioCategory:
 *                 type: string
 *                 enum: [HISTORICAL, HYPOTHETICAL, REGULATORY]
 *               isActive:
 *                 type: boolean
 *               shockParameters:
 *                 type: object
 *               sectorShocks:
 *                 type: object
 *     responses:
 *       200:
 *         description: Scenario updated successfully
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
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @openapi
 * /scenarios/{scenarioId}:
 *   delete:
 *     summary: Delete scenario
 *     description: Deletes a stress test scenario
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: The scenario ID
 *         example: SCN-001
 *     responses:
 *       200:
 *         description: Scenario deleted successfully
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
 *                       example: Scenario deleted successfully
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
