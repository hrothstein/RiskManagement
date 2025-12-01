/**
 * Suitability Service
 * Checks portfolio suitability against investor risk profile
 */

const { getById, getWhere } = require('../datastore');

/**
 * Evaluate risk alignment
 */
function evaluateRiskAlignment(portfolioVolatility, maxVolatilityTolerance, maxDrawdown, maxDrawdownTolerance) {
  const volDiff = portfolioVolatility - maxVolatilityTolerance;
  const drawdownDiff = Math.abs(maxDrawdown) - maxDrawdownTolerance;
  
  let status, detail, score;
  
  if (volDiff <= 2 && drawdownDiff <= 5) {
    status = 'ALIGNED';
    detail = 'Portfolio volatility within acceptable range for risk profile';
    score = 85;
  } else if (volDiff <= 5 && drawdownDiff <= 10) {
    status = 'MINOR_DEVIATION';
    detail = 'Portfolio volatility slightly above target range';
    score = 70;
  } else {
    status = 'MISALIGNED';
    detail = 'Portfolio risk significantly exceeds investor tolerance';
    score = 45;
  }
  
  return { score, status, detail };
}

/**
 * Evaluate allocation alignment
 */
function evaluateAllocationAlignment(actual, recommended) {
  const equityDiff = Math.abs(actual.equities - recommended.equities);
  const fixedIncomeDiff = Math.abs(actual.fixedIncome - recommended.fixedIncome);
  
  let status, detail, score;
  
  if (equityDiff <= 5 && fixedIncomeDiff <= 5) {
    status = 'ALIGNED';
    detail = 'Asset allocation matches recommended profile';
    score = 90;
  } else if (equityDiff <= 15 && fixedIncomeDiff <= 15) {
    status = 'MINOR_DEVIATION';
    detail = `Equity allocation ${equityDiff}% ${actual.equities > recommended.equities ? 'above' : 'below'} recommended level`;
    score = 72;
  } else {
    status = 'SIGNIFICANT_DEVIATION';
    detail = 'Asset allocation significantly differs from recommended profile';
    score = 50;
  }
  
  return { score, status, detail, actual, recommended };
}

/**
 * Evaluate concentration compliance
 */
function evaluateConcentrationCompliance(topHoldingWeight, sectorConcentration, maxConcentrationLimit) {
  const topSector = Object.entries(sectorConcentration || {}).sort((a, b) => b[1] - a[1])[0];
  const topSectorWeight = topSector ? topSector[1] : 0;
  
  const singleBreach = topHoldingWeight > maxConcentrationLimit;
  const sectorBreach = topSectorWeight > (maxConcentrationLimit + 5); // Sector gets +5% buffer
  
  let status, detail, score;
  
  if (!singleBreach && !sectorBreach) {
    status = 'COMPLIANT';
    detail = 'Concentration levels within acceptable limits';
    score = 95;
  } else if (singleBreach && !sectorBreach) {
    status = 'MINOR_NON_COMPLIANT';
    detail = 'Single position limit breached';
    score = 60;
  } else {
    status = 'NON_COMPLIANT';
    detail = 'Multiple concentration limits breached';
    score = 45;
  }
  
  return { score, status, detail };
}

/**
 * Evaluate time horizon fit
 */
function evaluateTimeHorizonFit(investorHorizon, portfolioVolatility) {
  let status, detail, score;
  
  if (investorHorizon === 'LONG_TERM') {
    status = 'ALIGNED';
    detail = 'Portfolio composition appropriate for long-term horizon';
    score = 85;
  } else if (investorHorizon === 'MEDIUM_TERM') {
    if (portfolioVolatility > 20) {
      status = 'CAUTION';
      detail = 'High volatility may be challenging for medium-term horizon';
      score = 65;
    } else {
      status = 'ALIGNED';
      detail = 'Portfolio suitable for medium-term horizon';
      score = 80;
    }
  } else {
    // SHORT_TERM
    if (portfolioVolatility > 15) {
      status = 'MISALIGNED';
      detail = 'Portfolio too volatile for short-term investment horizon';
      score = 40;
    } else {
      status = 'ALIGNED';
      detail = 'Portfolio appropriate for short-term needs';
      score = 75;
    }
  }
  
  return { score, status, detail };
}

/**
 * Calculate overall suitability
 */
function calculateOverallSuitability(dimensions) {
  const avgScore = Object.values(dimensions).reduce((sum, d) => sum + d.score, 0) / Object.keys(dimensions).length;
  
  let rating, recommendation;
  
  if (avgScore >= 80) {
    rating = 'HIGHLY_SUITABLE';
    recommendation = 'Portfolio is well-aligned with investor risk profile and objectives';
  } else if (avgScore >= 70) {
    rating = 'SUITABLE';
    recommendation = 'Portfolio is generally suitable with minor areas for improvement';
  } else if (avgScore >= 60) {
    rating = 'SUITABLE_WITH_CAVEATS';
    recommendation = 'Portfolio is suitable but requires attention to specific risk areas';
  } else if (avgScore >= 50) {
    rating = 'REVIEW_REQUIRED';
    recommendation = 'Portfolio requires review and potential adjustments to align with risk profile';
  } else {
    rating = 'NOT_SUITABLE';
    recommendation = 'Portfolio is not suitable for investor risk profile - immediate action required';
  }
  
  return {
    overallRating: rating,
    overallScore: Math.round(avgScore),
    recommendation
  };
}

/**
 * Check portfolio suitability
 */
function checkSuitability(investorId, portfolioData) {
  // Get investor profile
  const profile = getWhere('riskProfiles', p => 
    p.investorId === investorId && p.isActive
  )[0];
  
  if (!profile) {
    throw new Error('No active risk profile found for investor');
  }
  
  const investor = getById('investors', 'investorId', investorId);
  if (!investor) {
    throw new Error('Investor not found');
  }
  
  // Evaluate dimensions
  const riskAlignment = evaluateRiskAlignment(
    portfolioData.portfolioVolatility,
    profile.maxVolatilityTolerance,
    portfolioData.maxDrawdown || -20,
    profile.maxDrawdownTolerance
  );
  
  const allocationAlignment = evaluateAllocationAlignment(
    portfolioData.assetAllocation,
    profile.recommendedAllocation
  );
  
  const concentrationCompliance = evaluateConcentrationCompliance(
    portfolioData.topHoldingWeight || 0,
    portfolioData.sectorConcentration || {},
    profile.maxConcentrationLimit
  );
  
  const timeHorizonFit = evaluateTimeHorizonFit(
    investor.investmentHorizon,
    portfolioData.portfolioVolatility
  );
  
  const dimensions = {
    riskAlignment,
    allocationAlignment,
    concentrationCompliance,
    timeHorizonFit
  };
  
  const overall = calculateOverallSuitability(dimensions);
  
  // Determine required actions
  const requiredActions = [];
  if (concentrationCompliance.score < 70) {
    requiredActions.push('Address concentration risk');
  }
  if (riskAlignment.score < 70) {
    requiredActions.push('Reduce portfolio volatility to match risk tolerance');
  }
  if (allocationAlignment.score < 70) {
    requiredActions.push('Rebalance to recommended asset allocation');
  }
  
  return {
    suitabilityAssessment: {
      ...overall,
      dimensions
    },
    riskProfile: {
      profileId: profile.profileId,
      riskCategory: profile.riskCategory,
      maxVolatilityTolerance: profile.maxVolatilityTolerance,
      maxDrawdownTolerance: profile.maxDrawdownTolerance
    },
    actionRequired: requiredActions.length > 0,
    requiredActions
  };
}

module.exports = {
  checkSuitability
};

