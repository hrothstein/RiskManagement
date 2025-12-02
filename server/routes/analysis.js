/**
 * Analysis Routes
 * Core risk analysis endpoints
 */

const express = require('express');
const router = express.Router();
const { getById, getWhere } = require('../datastore');
const { calculatePortfolioRisk } = require('../services/riskEngine');
const { analyzeConcentration } = require('../services/concentrationService');
const { checkSuitability } = require('../services/suitabilityService');
const { runStressTest, runMultipleStressTests } = require('../services/stressTestService');
const { generateRecommendations } = require('../services/recommendationService');

/**
 * @openapi
 * /analysis/portfolio-risk:
 *   post:
 *     summary: Calculate portfolio risk metrics
 *     description: Analyzes portfolio and calculates comprehensive risk metrics including VaR, Sharpe ratio, beta, and more
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioRiskRequest'
 *           example:
 *             investorId: INV-001
 *             portfolioData:
 *               totalValue: 485000
 *               holdings:
 *                 - symbol: AAPL
 *                   securityType: STOCK
 *                   sector: TECHNOLOGY
 *                   marketValue: 35700
 *                   weight: 7.36
 *                   beta: 1.25
 *                 - symbol: MSFT
 *                   securityType: STOCK
 *                   sector: TECHNOLOGY
 *                   marketValue: 63000
 *                   weight: 13.0
 *                   beta: 1.15
 *               cashPosition: 15000
 *             benchmarkSymbol: SPY
 *     responses:
 *       200:
 *         description: Portfolio risk analysis complete
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
 *                     investorId:
 *                       type: string
 *                     analysisDate:
 *                       type: string
 *                       format: date-time
 *                     portfolioMetrics:
 *                       type: object
 *                       properties:
 *                         totalValue:
 *                           type: number
 *                           example: 485000
 *                         portfolioVolatility:
 *                           type: number
 *                           description: Annual standard deviation %
 *                           example: 14.5
 *                         portfolioBeta:
 *                           type: number
 *                           example: 1.12
 *                         sharpeRatio:
 *                           type: number
 *                           example: 1.25
 *                         sortinoRatio:
 *                           type: number
 *                           example: 1.45
 *                         treynorRatio:
 *                           type: number
 *                           example: 0.08
 *                         informationRatio:
 *                           type: number
 *                           example: 0.42
 *                         maxDrawdown:
 *                           type: number
 *                           example: -18.5
 *                         valueAtRisk:
 *                           type: object
 *                           properties:
 *                             var95_percent:
 *                               type: number
 *                             var95_dollar:
 *                               type: number
 *                             var99_percent:
 *                               type: number
 *                             var99_dollar:
 *                               type: number
 *                         trackingError:
 *                           type: number
 *                           example: 3.2
 *                         rSquared:
 *                           type: number
 *                           example: 0.89
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input - portfolioData with holdings is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/portfolio-risk', (req, res) => {
  try {
    const { investorId, portfolioData, benchmarkSymbol, analysisDate } = req.body;
    
    if (!portfolioData || !portfolioData.holdings) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'portfolioData with holdings is required'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculate portfolio metrics
    const portfolioMetrics = calculatePortfolioRisk(portfolioData, benchmarkSymbol);
    
    res.json({
      success: true,
      data: {
        investorId,
        analysisDate: analysisDate || new Date().toISOString(),
        portfolioMetrics
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @openapi
 * /analysis/concentration:
 *   post:
 *     summary: Analyze concentration risk
 *     description: Analyzes portfolio concentration including single position, sector, and top-5 holdings risk
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - holdings
 *             properties:
 *               investorId:
 *                 type: string
 *                 example: INV-001
 *               holdings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     symbol:
 *                       type: string
 *                     sector:
 *                       type: string
 *                     weight:
 *                       type: number
 *                 example:
 *                   - symbol: AAPL
 *                     sector: TECHNOLOGY
 *                     weight: 22.5
 *                   - symbol: MSFT
 *                     sector: TECHNOLOGY
 *                     weight: 18.2
 *               thresholds:
 *                 type: object
 *                 properties:
 *                   singlePositionLimit:
 *                     type: number
 *                     default: 10
 *                   sectorLimit:
 *                     type: number
 *                     default: 25
 *                   top5Limit:
 *                     type: number
 *                     default: 50
 *     responses:
 *       200:
 *         description: Concentration analysis complete
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
 *                     concentrationAnalysis:
 *                       type: object
 *                       properties:
 *                         singlePosition:
 *                           type: object
 *                           properties:
 *                             topHolding:
 *                               type: string
 *                             topHoldingWeight:
 *                               type: number
 *                             limit:
 *                               type: number
 *                             status:
 *                               type: string
 *                               enum: [OK, BREACHED]
 *                             breach:
 *                               type: number
 *                         sectorConcentration:
 *                           type: object
 *                           properties:
 *                             topSector:
 *                               type: string
 *                             topSectorWeight:
 *                               type: number
 *                             status:
 *                               type: string
 *                             sectorBreakdown:
 *                               type: object
 *                         top5Concentration:
 *                           type: object
 *                         herfindahlIndex:
 *                           type: number
 *                           description: Concentration measure 0-1
 *                         effectivePositions:
 *                           type: number
 *                         overallConcentrationRisk:
 *                           type: string
 *                           enum: [LOW, MODERATE, ELEVATED, HIGH]
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           alertType:
 *                             type: string
 *                           severity:
 *                             type: string
 *                           message:
 *                             type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Holdings array is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/concentration', (req, res) => {
  try {
    const { investorId, holdings, thresholds } = req.body;
    
    if (!holdings || !Array.isArray(holdings)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'holdings array is required'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    const analysis = analyzeConcentration(investorId, holdings, thresholds);
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @openapi
 * /analysis/suitability:
 *   post:
 *     summary: Check portfolio suitability vs profile
 *     description: Compares portfolio characteristics against investor's risk profile to assess suitability
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investorId
 *               - portfolioData
 *             properties:
 *               investorId:
 *                 type: string
 *                 example: INV-001
 *               portfolioData:
 *                 type: object
 *                 properties:
 *                   totalValue:
 *                     type: number
 *                   portfolioVolatility:
 *                     type: number
 *                   portfolioBeta:
 *                     type: number
 *                   maxDrawdown:
 *                     type: number
 *                   assetAllocation:
 *                     type: object
 *                     properties:
 *                       equities:
 *                         type: number
 *                       fixedIncome:
 *                         type: number
 *                       alternatives:
 *                         type: number
 *                       cash:
 *                         type: number
 *                   topHoldingWeight:
 *                     type: number
 *                   sectorConcentration:
 *                     type: object
 *     responses:
 *       200:
 *         description: Suitability assessment complete
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
 *                     suitabilityAssessment:
 *                       type: object
 *                       properties:
 *                         overallRating:
 *                           type: string
 *                           enum: [HIGHLY_SUITABLE, SUITABLE, SUITABLE_WITH_CAVEATS, REVIEW_REQUIRED, NOT_SUITABLE]
 *                         overallScore:
 *                           type: number
 *                         recommendation:
 *                           type: string
 *                         dimensions:
 *                           type: object
 *                           properties:
 *                             riskAlignment:
 *                               type: object
 *                             allocationAlignment:
 *                               type: object
 *                             concentrationCompliance:
 *                               type: object
 *                             timeHorizonFit:
 *                               type: object
 *                     riskProfile:
 *                       type: object
 *                       properties:
 *                         profileId:
 *                           type: string
 *                         riskCategory:
 *                           type: string
 *                         maxVolatilityTolerance:
 *                           type: number
 *                         maxDrawdownTolerance:
 *                           type: number
 *                     actionRequired:
 *                       type: boolean
 *                     requiredActions:
 *                       type: array
 *                       items:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: investorId and portfolioData are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/suitability', (req, res) => {
  try {
    const { investorId, portfolioData } = req.body;
    
    if (!investorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'investorId is required'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    if (!portfolioData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'portfolioData is required'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    const analysis = checkSuitability(investorId, portfolioData);
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @openapi
 * /analysis/stress-test:
 *   post:
 *     summary: Run stress test scenario
 *     description: Applies stress test scenario(s) to a portfolio and calculates potential impact
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investorId
 *               - portfolioData
 *             properties:
 *               investorId:
 *                 type: string
 *                 example: INV-001
 *               scenarioId:
 *                 type: string
 *                 description: Single scenario ID
 *                 example: SCN-001
 *               scenarioIds:
 *                 type: array
 *                 description: Multiple scenario IDs (alternative to scenarioId)
 *                 items:
 *                   type: string
 *                 example: ["SCN-001", "SCN-002", "SCN-005"]
 *               portfolioData:
 *                 type: object
 *                 required:
 *                   - totalValue
 *                   - holdings
 *                 properties:
 *                   totalValue:
 *                     type: number
 *                   holdings:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         symbol:
 *                           type: string
 *                         sector:
 *                           type: string
 *                         marketValue:
 *                           type: number
 *                         weight:
 *                           type: number
 *     responses:
 *       200:
 *         description: Stress test complete
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
 *                     scenarioResults:
 *                       type: object
 *                       properties:
 *                         scenarioId:
 *                           type: string
 *                         scenarioName:
 *                           type: string
 *                         portfolioImpact:
 *                           type: object
 *                           properties:
 *                             currentValue:
 *                               type: number
 *                             stressedValue:
 *                               type: number
 *                             dollarLoss:
 *                               type: number
 *                             percentageLoss:
 *                               type: number
 *                             recoveryTime:
 *                               type: string
 *                         holdingImpacts:
 *                           type: array
 *                           items:
 *                             type: object
 *                         worstHit:
 *                           type: array
 *                         bestProtected:
 *                           type: array
 *                     riskProfileComparison:
 *                       type: object
 *                       properties:
 *                         maxDrawdownTolerance:
 *                           type: number
 *                         scenarioDrawdown:
 *                           type: number
 *                         exceedsToleranceBy:
 *                           type: number
 *                         warning:
 *                           type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/stress-test', (req, res) => {
  try {
    const { investorId, scenarioId, scenarioIds, portfolioData } = req.body;
    
    if (!investorId || !portfolioData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'investorId and portfolioData are required'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    let results;
    if (scenarioIds && Array.isArray(scenarioIds)) {
      // Run multiple scenarios
      const testResults = runMultipleStressTests(investorId, scenarioIds, portfolioData);
      results = { scenarios: testResults };
    } else if (scenarioId) {
      // Run single scenario
      results = runStressTest(investorId, scenarioId, portfolioData);
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'scenarioId or scenarioIds is required'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @openapi
 * /analysis/comprehensive:
 *   post:
 *     summary: Full risk analysis (all metrics)
 *     description: Performs comprehensive risk analysis including portfolio risk, concentration, suitability, optional stress tests, and generates recommendations
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investorId
 *               - portfolioData
 *             properties:
 *               investorId:
 *                 type: string
 *                 example: INV-001
 *               portfolioData:
 *                 type: object
 *                 required:
 *                   - totalValue
 *                   - holdings
 *                 properties:
 *                   totalValue:
 *                     type: number
 *                   holdings:
 *                     type: array
 *                     items:
 *                       type: object
 *                   cashPosition:
 *                     type: number
 *                   assetAllocation:
 *                     type: object
 *               includeStressTests:
 *                 type: boolean
 *                 default: false
 *               scenarioIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["SCN-001", "SCN-002", "SCN-005"]
 *               benchmarkSymbol:
 *                 type: string
 *                 default: SPY
 *     responses:
 *       200:
 *         description: Comprehensive analysis complete
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
 *                     investorId:
 *                       type: string
 *                     analysisTimestamp:
 *                       type: string
 *                       format: date-time
 *                     portfolioRisk:
 *                       type: object
 *                       description: Full portfolio risk metrics
 *                     concentrationAnalysis:
 *                       type: object
 *                       description: Full concentration analysis
 *                     suitabilityAssessment:
 *                       type: object
 *                       description: Full suitability assessment
 *                     stressTestResults:
 *                       type: array
 *                       description: Array of stress test results (if requested)
 *                       nullable: true
 *                     recommendations:
 *                       type: object
 *                       description: Generated recommendations
 *                     executiveSummary:
 *                       type: object
 *                       properties:
 *                         overallRiskLevel:
 *                           type: string
 *                           enum: [LOW, MODERATE, MODERATE_HIGH, HIGH]
 *                         keyFindings:
 *                           type: array
 *                           items:
 *                             type: string
 *                         priorityActions:
 *                           type: array
 *                           items:
 *                             type: string
 *                         nextReviewDate:
 *                           type: string
 *                           format: date
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: investorId and portfolioData are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Investor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/comprehensive', (req, res) => {
  try {
    const { 
      investorId, 
      portfolioData, 
      includeStressTests, 
      scenarioIds,
      benchmarkSymbol 
    } = req.body;
    
    if (!investorId || !portfolioData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'investorId and portfolioData are required'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    const now = new Date().toISOString();
    
    // Get investor
    const investor = getById('investors', 'investorId', investorId);
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Investor not found'
        },
        timestamp: now
      });
    }
    
    // Get active profile
    const profile = getWhere('riskProfiles', p => 
      p.investorId === investorId && p.isActive
    )[0];
    
    // 1. Portfolio Risk Analysis
    const portfolioRisk = calculatePortfolioRisk(portfolioData, benchmarkSymbol);
    
    // 2. Concentration Analysis
    const concentrationAnalysis = analyzeConcentration(
      investorId, 
      portfolioData.holdings, 
      profile ? {
        singlePositionLimit: profile.maxConcentrationLimit - 5,
        sectorLimit: profile.maxConcentrationLimit,
        top5Limit: 50
      } : {}
    );
    
    // 3. Suitability Assessment
    let suitabilityAssessment = null;
    if (profile) {
      suitabilityAssessment = checkSuitability(investorId, {
        ...portfolioData,
        portfolioVolatility: portfolioRisk.portfolioVolatility,
        maxDrawdown: portfolioRisk.maxDrawdown,
        topHoldingWeight: concentrationAnalysis.concentrationAnalysis.singlePosition.topHoldingWeight,
        sectorConcentration: concentrationAnalysis.concentrationAnalysis.sectorConcentration.sectorBreakdown
      });
    }
    
    // 4. Stress Test Results (optional)
    let stressTestResults = null;
    if (includeStressTests && scenarioIds && scenarioIds.length > 0) {
      stressTestResults = runMultipleStressTests(investorId, scenarioIds, portfolioData);
    }
    
    // 5. Generate Recommendations
    const recommendations = generateRecommendations(investorId, profile?.profileId, {
      portfolioRisk,
      concentrationAnalysis,
      suitabilityAssessment
    });
    
    // 6. Generate Executive Summary
    const keyFindings = [];
    
    // Volatility finding
    if (profile) {
      if (portfolioRisk.portfolioVolatility <= profile.maxVolatilityTolerance) {
        keyFindings.push(`Portfolio volatility (${portfolioRisk.portfolioVolatility}%) is within acceptable range`);
      } else {
        keyFindings.push(`Portfolio volatility (${portfolioRisk.portfolioVolatility}%) exceeds target (${profile.maxVolatilityTolerance}%)`);
      }
    }
    
    // Concentration findings
    if (concentrationAnalysis.concentrationAnalysis.overallConcentrationRisk === 'HIGH' || 
        concentrationAnalysis.concentrationAnalysis.overallConcentrationRisk === 'ELEVATED') {
      const sectorInfo = concentrationAnalysis.concentrationAnalysis.sectorConcentration;
      keyFindings.push(`Significant concentration risk in ${sectorInfo.topSector} sector (${sectorInfo.topSectorWeight}%)`);
      
      const singleInfo = concentrationAnalysis.concentrationAnalysis.singlePosition;
      if (singleInfo.status === 'BREACHED') {
        keyFindings.push(`Single position limit breached for ${singleInfo.topHolding} (${singleInfo.topHoldingWeight}%)`);
      }
    }
    
    // Stress test finding
    if (stressTestResults && stressTestResults.length > 0) {
      const worstScenario = stressTestResults.sort((a, b) => 
        a.scenarioResults.portfolioImpact.percentageLoss - b.scenarioResults.portfolioImpact.percentageLoss
      )[0];
      
      keyFindings.push(`Worst stress scenario (${worstScenario.scenarioResults.scenarioName}) shows potential ${Math.abs(worstScenario.scenarioResults.portfolioImpact.percentageLoss).toFixed(1)}% loss`);
    }
    
    // Priority actions
    const priorityActions = recommendations.recommendations
      .filter(r => r.priority === 'HIGH' || r.priority === 'MEDIUM')
      .slice(0, 3)
      .map(r => r.title);
    
    // Overall risk level
    let overallRiskLevel = 'MODERATE';
    if (profile) {
      if (portfolioRisk.portfolioVolatility > profile.maxVolatilityTolerance + 5) {
        overallRiskLevel = 'HIGH';
      } else if (portfolioRisk.portfolioVolatility > profile.maxVolatilityTolerance) {
        overallRiskLevel = 'MODERATE_HIGH';
      } else if (portfolioRisk.portfolioVolatility < profile.maxVolatilityTolerance - 5) {
        overallRiskLevel = 'LOW';
      }
    }
    
    const executiveSummary = {
      overallRiskLevel,
      keyFindings,
      priorityActions,
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    res.json({
      success: true,
      data: {
        investorId,
        analysisTimestamp: now,
        portfolioRisk,
        concentrationAnalysis,
        suitabilityAssessment,
        stressTestResults,
        recommendations,
        executiveSummary
      },
      timestamp: now
    });
  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
