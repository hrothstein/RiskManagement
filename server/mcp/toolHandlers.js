/**
 * MCP Tool Handlers
 * Implementation of all MCP tools using existing services
 */

const { getAll, getById, getWhere } = require('../datastore');
const { calculatePortfolioRisk } = require('../services/riskEngine');
const { analyzeConcentration } = require('../services/concentrationService');
const { runStressTest } = require('../services/stressTestService');
const { checkSuitability } = require('../services/suitabilityService');

/**
 * Get investor by ID (supports both INV-XXX and CUST-XXX formats)
 */
function findInvestor(investorId) {
  // Try direct investor ID lookup
  let investor = getById('investors', 'investorId', investorId);
  
  // Try customer ID lookup
  if (!investor) {
    investor = getWhere('investors', i => i.customerId === investorId)[0];
  }
  
  return investor;
}

/**
 * Tool: get_investor_profile
 * Gets complete investor profile with risk tolerance and allocations
 */
async function getInvestorProfile(args) {
  const { investorId } = args;
  
  const investor = findInvestor(investorId);
  if (!investor) {
    return {
      error: true,
      code: -32000,
      message: `Investor not found: ${investorId}`
    };
  }
  
  // Get active risk profile
  const profile = getWhere('riskProfiles', p => 
    p.investorId === investor.investorId && p.isActive
  )[0];
  
  // Get latest assessment
  const assessments = getWhere('riskAssessments', a => 
    a.investorId === investor.investorId
  ).sort((a, b) => new Date(b.assessmentDate) - new Date(a.assessmentDate));
  
  const latestAssessment = assessments[0];
  
  return {
    investor: {
      investorId: investor.investorId,
      customerId: investor.customerId,
      firstName: investor.firstName,
      lastName: investor.lastName,
      email: investor.email,
      age: investor.age,
      investmentExperience: investor.investmentExperience,
      investmentHorizon: investor.investmentHorizon,
      annualIncome: investor.annualIncome,
      netWorth: investor.netWorth
    },
    riskProfile: profile ? {
      profileId: profile.profileId,
      riskCategory: profile.riskCategory,
      riskCategoryCode: profile.riskCategoryCode,
      compositeRiskScore: profile.compositeRiskScore,
      riskToleranceScore: profile.riskToleranceScore,
      riskCapacityScore: profile.riskCapacityScore,
      recommendedAllocation: profile.recommendedAllocation,
      maxDrawdownTolerance: profile.maxDrawdownTolerance,
      maxVolatilityTolerance: profile.maxVolatilityTolerance,
      maxConcentrationLimit: profile.maxConcentrationLimit,
      validFrom: profile.validFrom
    } : null,
    lastAssessment: latestAssessment ? {
      assessmentId: latestAssessment.assessmentId,
      assessmentDate: latestAssessment.assessmentDate,
      percentileScore: latestAssessment.percentileScore
    } : null
  };
}

/**
 * Tool: analyze_portfolio_risk
 * Performs comprehensive portfolio risk analysis
 */
async function analyzePortfolioRisk(args) {
  const { investorId, holdings, totalValue } = args;
  
  const investor = findInvestor(investorId);
  if (!investor) {
    return {
      error: true,
      code: -32000,
      message: `Investor not found: ${investorId}`
    };
  }
  
  // Get investor's risk profile for comparison
  const profile = getWhere('riskProfiles', p => 
    p.investorId === investor.investorId && p.isActive
  )[0];
  
  // Calculate portfolio risk metrics
  const portfolioData = { totalValue, holdings };
  const portfolioMetrics = calculatePortfolioRisk(portfolioData);
  
  // Analyze concentration
  const concentrationAnalysis = analyzeConcentration(investor.investorId, holdings);
  
  // Check suitability against profile
  let suitability = null;
  if (profile) {
    const suitabilityInput = {
      totalValue,
      portfolioVolatility: portfolioMetrics.portfolioVolatility,
      portfolioBeta: portfolioMetrics.portfolioBeta,
      maxDrawdown: portfolioMetrics.maxDrawdown,
      assetAllocation: calculateAssetAllocation(holdings),
      topHoldingWeight: concentrationAnalysis.concentrationAnalysis.singlePosition.topHoldingWeight,
      sectorConcentration: concentrationAnalysis.concentrationAnalysis.sectorConcentration.sectorBreakdown
    };
    
    try {
      const suitabilityResult = checkSuitability(investor.investorId, suitabilityInput);
      suitability = {
        isAligned: suitabilityResult.suitabilityAssessment.overallScore >= 70,
        alignmentScore: suitabilityResult.suitabilityAssessment.overallScore,
        rating: suitabilityResult.suitabilityAssessment.overallRating,
        actionRequired: suitabilityResult.actionRequired
      };
    } catch (e) {
      // Suitability check is optional
    }
  }
  
  return {
    investorId: investor.investorId,
    analysisDate: new Date().toISOString(),
    portfolioMetrics: {
      totalValue: portfolioMetrics.totalValue,
      volatility: portfolioMetrics.portfolioVolatility,
      beta: portfolioMetrics.portfolioBeta,
      sharpeRatio: portfolioMetrics.sharpeRatio,
      sortinoRatio: portfolioMetrics.sortinoRatio,
      maxDrawdown: portfolioMetrics.maxDrawdown,
      valueAtRisk95: portfolioMetrics.valueAtRisk.var95_dollar,
      valueAtRisk99: portfolioMetrics.valueAtRisk.var99_dollar
    },
    concentrationAnalysis: {
      topHoldingWeight: concentrationAnalysis.concentrationAnalysis.singlePosition.topHoldingWeight,
      topHolding: concentrationAnalysis.concentrationAnalysis.singlePosition.topHolding,
      sectorConcentration: concentrationAnalysis.concentrationAnalysis.sectorConcentration.sectorBreakdown,
      concentrationRisk: concentrationAnalysis.concentrationAnalysis.overallConcentrationRisk,
      alerts: concentrationAnalysis.alerts
    },
    suitability,
    riskProfile: profile ? {
      riskCategory: profile.riskCategory,
      maxVolatilityTolerance: profile.maxVolatilityTolerance,
      maxDrawdownTolerance: profile.maxDrawdownTolerance
    } : null
  };
}

/**
 * Tool: run_stress_test
 * Runs stress test scenarios against a portfolio
 */
async function runStressTestTool(args) {
  const { investorId, scenarioId, holdings, totalValue } = args;
  
  const investor = findInvestor(investorId);
  if (!investor) {
    return {
      error: true,
      code: -32000,
      message: `Investor not found: ${investorId}`
    };
  }
  
  const scenario = getById('scenarios', 'scenarioId', scenarioId);
  if (!scenario) {
    return {
      error: true,
      code: -32001,
      message: `Scenario not found: ${scenarioId}. Use list_scenarios to see available scenarios.`
    };
  }
  
  try {
    const result = runStressTest(investor.investorId, scenarioId, { totalValue, holdings });
    
    return {
      scenario: {
        scenarioId: scenario.scenarioId,
        name: scenario.scenarioName,
        type: scenario.scenarioCategory,
        description: scenario.scenarioDescription
      },
      impact: {
        currentValue: result.scenarioResults.portfolioImpact.currentValue,
        stressedValue: result.scenarioResults.portfolioImpact.stressedValue,
        dollarLoss: result.scenarioResults.portfolioImpact.dollarLoss,
        percentageLoss: result.scenarioResults.portfolioImpact.percentageLoss,
        recoveryTime: result.scenarioResults.portfolioImpact.recoveryTime
      },
      worstHit: result.scenarioResults.worstHit,
      bestProtected: result.scenarioResults.bestProtected,
      exceedsRiskTolerance: result.riskProfileComparison ? 
        result.riskProfileComparison.exceedsToleranceBy > 0 : null,
      toleranceExceededBy: result.riskProfileComparison?.exceedsToleranceBy || 0,
      warning: result.riskProfileComparison?.warning || null
    };
  } catch (error) {
    return {
      error: true,
      code: -32003,
      message: `Stress test failed: ${error.message}`
    };
  }
}

/**
 * Tool: get_recommendations
 * Gets personalized investment recommendations
 */
async function getRecommendations(args) {
  const { investorId, includeRebalancing = true, includeDiversification = true } = args;
  
  const investor = findInvestor(investorId);
  if (!investor) {
    return {
      error: true,
      code: -32000,
      message: `Investor not found: ${investorId}`
    };
  }
  
  // Get existing recommendations for this investor
  const existingRecs = getWhere('recommendations', r => 
    r.investorId === investor.investorId && r.status === 'ACTIVE'
  ).sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
  
  if (existingRecs.length > 0) {
    const rec = existingRecs[0];
    let filteredRecs = rec.recommendations;
    
    if (!includeRebalancing) {
      filteredRecs = filteredRecs.filter(r => r.category !== 'REBALANCING');
    }
    if (!includeDiversification) {
      filteredRecs = filteredRecs.filter(r => r.category !== 'DIVERSIFICATION');
    }
    
    return {
      investorId: investor.investorId,
      investorName: `${investor.firstName} ${investor.lastName}`,
      generatedDate: rec.generatedDate,
      overallAssessment: rec.overallAssessment,
      recommendations: filteredRecs,
      nextReviewDate: rec.nextReviewDate
    };
  }
  
  // No recommendations exist - provide generic advice based on profile
  const profile = getWhere('riskProfiles', p => 
    p.investorId === investor.investorId && p.isActive
  )[0];
  
  return {
    investorId: investor.investorId,
    investorName: `${investor.firstName} ${investor.lastName}`,
    generatedDate: new Date().toISOString(),
    overallAssessment: {
      suitabilityScore: 80,
      suitabilityRating: 'SUITABLE',
      summary: profile ? 
        `Based on ${investor.firstName}'s ${profile.riskCategory.toLowerCase()} risk profile, the recommended allocation is ${profile.recommendedAllocation.equities}% equities, ${profile.recommendedAllocation.fixedIncome}% fixed income.` :
        'Complete a risk assessment to receive personalized recommendations.'
    },
    recommendations: [],
    message: 'Run analyze_portfolio_risk with current holdings to generate specific recommendations.'
  };
}

/**
 * Tool: list_scenarios
 * Lists available stress test scenarios
 */
async function listScenarios(args) {
  const { category } = args;
  
  let scenarios = getAll('scenarios');
  
  if (category) {
    scenarios = scenarios.filter(s => s.scenarioCategory === category);
  }
  
  return {
    count: scenarios.length,
    scenarios: scenarios.map(s => ({
      scenarioId: s.scenarioId,
      name: s.scenarioName,
      category: s.scenarioCategory,
      description: s.scenarioDescription,
      equityShock: s.shockParameters.equityShock,
      bondShock: s.shockParameters.bondShock,
      sectorShocks: s.sectorShocks
    }))
  };
}

/**
 * Tool: search_investors
 * Searches for investors by various criteria
 */
async function searchInvestors(args) {
  const { query, riskCategory, limit = 10 } = args;
  
  let investors = getAll('investors');
  
  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    investors = investors.filter(i => 
      i.firstName.toLowerCase().includes(q) ||
      i.lastName.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.investorId.toLowerCase().includes(q) ||
      i.customerId.toLowerCase().includes(q)
    );
  }
  
  // Filter by risk category
  if (riskCategory) {
    const profiles = getWhere('riskProfiles', p => 
      p.riskCategory === riskCategory && p.isActive
    );
    const investorIds = new Set(profiles.map(p => p.investorId));
    investors = investors.filter(i => investorIds.has(i.investorId));
  }
  
  // Limit results
  investors = investors.slice(0, limit);
  
  // Get profiles for enrichment
  const results = investors.map(i => {
    const profile = getWhere('riskProfiles', p => 
      p.investorId === i.investorId && p.isActive
    )[0];
    
    return {
      investorId: i.investorId,
      customerId: i.customerId,
      name: `${i.firstName} ${i.lastName}`,
      email: i.email,
      riskCategory: profile?.riskCategory || 'NOT_ASSESSED',
      compositeRiskScore: profile?.compositeRiskScore || null,
      investmentHorizon: i.investmentHorizon
    };
  });
  
  return {
    count: results.length,
    totalAvailable: getAll('investors').length,
    investors: results
  };
}

/**
 * Helper: Calculate asset allocation from holdings
 */
function calculateAssetAllocation(holdings) {
  const allocation = {
    equities: 0,
    fixedIncome: 0,
    alternatives: 0,
    cash: 0
  };
  
  holdings.forEach(h => {
    const sector = h.sector || 'OTHER';
    if (sector === 'FIXED_INCOME' || h.securityType === 'BOND') {
      allocation.fixedIncome += h.weight;
    } else if (sector === 'CASH' || h.securityType === 'CASH') {
      allocation.cash += h.weight;
    } else if (sector === 'ALTERNATIVES') {
      allocation.alternatives += h.weight;
    } else {
      allocation.equities += h.weight;
    }
  });
  
  return {
    equities: Math.round(allocation.equities),
    fixedIncome: Math.round(allocation.fixedIncome),
    alternatives: Math.round(allocation.alternatives),
    cash: Math.round(allocation.cash)
  };
}

/**
 * Route tool calls to appropriate handlers
 */
async function handleToolCall(toolName, args) {
  const handlers = {
    'get_investor_profile': getInvestorProfile,
    'analyze_portfolio_risk': analyzePortfolioRisk,
    'run_stress_test': runStressTestTool,
    'get_recommendations': getRecommendations,
    'list_scenarios': listScenarios,
    'search_investors': searchInvestors
  };
  
  const handler = handlers[toolName];
  if (!handler) {
    return {
      error: true,
      code: -32601,
      message: `Unknown tool: ${toolName}`
    };
  }
  
  return handler(args);
}

module.exports = {
  handleToolCall,
  getInvestorProfile,
  analyzePortfolioRisk,
  runStressTestTool,
  getRecommendations,
  listScenarios,
  searchInvestors
};

