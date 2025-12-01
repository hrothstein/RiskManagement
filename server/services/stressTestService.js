/**
 * Stress Test Service
 * Applies stress scenarios to portfolios
 */

const { getById } = require('../datastore');

/**
 * Apply stress scenario to a holding
 */
function applyStressToHolding(holding, scenario) {
  const sector = holding.sector || 'OTHER';
  const sectorShock = scenario.sectorShocks[sector] || scenario.shockParameters.equityShock;
  
  let shockPercent;
  if (holding.securityType === 'BOND') {
    shockPercent = scenario.shockParameters.bondShock;
  } else {
    shockPercent = sectorShock;
  }
  
  const stressedValue = holding.marketValue * (1 + shockPercent / 100);
  const loss = stressedValue - holding.marketValue;
  const lossPercent = shockPercent;
  
  return {
    symbol: holding.symbol,
    sector,
    currentValue: holding.marketValue,
    stressedValue: Number(stressedValue.toFixed(2)),
    loss: Number(loss.toFixed(2)),
    lossPercent: Number(lossPercent.toFixed(2)),
    sectorShock: sector
  };
}

/**
 * Run stress test on portfolio
 */
function runStressTest(investorId, scenarioId, portfolioData) {
  // Get scenario
  const scenario = getById('scenarios', 'scenarioId', scenarioId);
  if (!scenario) {
    throw new Error('Scenario not found');
  }
  
  const { totalValue, holdings } = portfolioData;
  
  // Apply stress to each holding
  const holdingImpacts = holdings.map(holding => 
    applyStressToHolding(holding, scenario)
  );
  
  // Calculate total stressed value
  const stressedValue = holdingImpacts.reduce((sum, h) => sum + h.stressedValue, 0);
  const dollarLoss = stressedValue - totalValue;
  const percentageLoss = ((dollarLoss / totalValue) * 100);
  
  // Find worst hit and best protected
  const sorted = [...holdingImpacts].sort((a, b) => a.lossPercent - b.lossPercent);
  const worstHit = sorted.slice(0, 3).map(h => ({
    symbol: h.symbol,
    lossPercent: h.lossPercent
  }));
  
  const bestProtected = sorted.slice(-2).map(h => ({
    symbol: h.symbol,
    lossPercent: h.lossPercent
  }));
  
  // Estimate recovery time based on loss severity
  let recoveryTime;
  if (percentageLoss > -20) {
    recoveryTime = '6-12 months (estimated)';
  } else if (percentageLoss > -30) {
    recoveryTime = '12-24 months (estimated)';
  } else if (percentageLoss > -40) {
    recoveryTime = '24-36 months (estimated)';
  } else {
    recoveryTime = '36+ months (estimated)';
  }
  
  // Get investor profile for comparison
  const { getWhere } = require('../datastore');
  const profile = getWhere('riskProfiles', p => 
    p.investorId === investorId && p.isActive
  )[0];
  
  let riskProfileComparison = null;
  if (profile) {
    const exceedsTolerance = Math.abs(percentageLoss) > profile.maxDrawdownTolerance;
    riskProfileComparison = {
      maxDrawdownTolerance: profile.maxDrawdownTolerance,
      scenarioDrawdown: Number(Math.abs(percentageLoss).toFixed(2)),
      exceedsToleranceBy: exceedsTolerance ? 
        Number((Math.abs(percentageLoss) - profile.maxDrawdownTolerance).toFixed(2)) : 0,
      warning: exceedsTolerance ? 
        "Scenario loss exceeds investor's stated maximum drawdown tolerance" : null
    };
  }
  
  return {
    scenarioResults: {
      scenarioId: scenario.scenarioId,
      scenarioName: scenario.scenarioName,
      portfolioImpact: {
        currentValue: totalValue,
        stressedValue: Number(stressedValue.toFixed(2)),
        dollarLoss: Number(dollarLoss.toFixed(2)),
        percentageLoss: Number(percentageLoss.toFixed(2)),
        recoveryTime
      },
      holdingImpacts,
      worstHit,
      bestProtected
    },
    riskProfileComparison
  };
}

/**
 * Run multiple stress tests
 */
function runMultipleStressTests(investorId, scenarioIds, portfolioData) {
  return scenarioIds.map(scenarioId => 
    runStressTest(investorId, scenarioId, portfolioData)
  );
}

module.exports = {
  runStressTest,
  runMultipleStressTests
};

