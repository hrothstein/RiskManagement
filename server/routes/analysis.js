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
 * POST /api/v1/analysis/portfolio-risk
 * Calculate portfolio risk metrics
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
 * POST /api/v1/analysis/concentration
 * Analyze concentration risk
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
 * POST /api/v1/analysis/suitability
 * Check portfolio suitability vs profile
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
 * POST /api/v1/analysis/stress-test
 * Run stress test scenario
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
 * POST /api/v1/analysis/comprehensive
 * Full risk analysis (all metrics)
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

