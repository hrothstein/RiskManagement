/**
 * Recommendation Service
 * Generates investment recommendations based on analysis
 */

const { generateId, add } = require('../datastore');

/**
 * Generate recommendations from comprehensive analysis
 */
function generateRecommendations(investorId, profileId, analysisData) {
  const recommendations = [];
  const { concentrationAnalysis, suitabilityAssessment, portfolioRisk } = analysisData;
  
  // Check concentration issues
  if (concentrationAnalysis && concentrationAnalysis.concentrationAnalysis) {
    const conc = concentrationAnalysis.concentrationAnalysis;
    
    // Single position concentration
    if (conc.singlePosition && conc.singlePosition.status === 'BREACHED') {
      recommendations.push({
        recommendationId: generateId('recommendation') + '-A',
        category: 'REBALANCING',
        priority: conc.singlePosition.breach > 10 ? 'HIGH' : 'MEDIUM',
        title: `Reduce ${conc.singlePosition.topHolding} Concentration`,
        description: `Consider reducing ${conc.singlePosition.topHolding} position from ${conc.singlePosition.topHoldingWeight}% to recommended ${conc.singlePosition.limit}% maximum`,
        currentValue: conc.singlePosition.topHoldingWeight,
        targetValue: conc.singlePosition.limit,
        expectedImpact: {
          volatilityReduction: Number((conc.singlePosition.breach * 0.15).toFixed(2)),
          concentrationImprovement: 'HIGH'
        }
      });
    }
    
    // Sector concentration
    if (conc.sectorConcentration && conc.sectorConcentration.status === 'BREACHED') {
      recommendations.push({
        recommendationId: generateId('recommendation') + '-B',
        category: 'DIVERSIFICATION',
        priority: conc.sectorConcentration.breach > 15 ? 'HIGH' : 'MEDIUM',
        title: `Reduce ${conc.sectorConcentration.topSector} Sector Exposure`,
        description: `Consider reducing ${conc.sectorConcentration.topSector} sector exposure from ${conc.sectorConcentration.topSectorWeight}% to recommended ${conc.sectorConcentration.limit}% maximum`,
        currentValue: conc.sectorConcentration.topSectorWeight,
        targetValue: conc.sectorConcentration.limit,
        expectedImpact: {
          correlationReduction: 0.15,
          diversificationBenefit: 'HIGH'
        }
      });
    }
  }
  
  // Check allocation misalignment
  if (suitabilityAssessment && suitabilityAssessment.suitabilityAssessment) {
    const suit = suitabilityAssessment.suitabilityAssessment;
    
    if (suit.dimensions && suit.dimensions.allocationAlignment) {
      const alloc = suit.dimensions.allocationAlignment;
      if (alloc.score < 80) {
        const equityDiff = alloc.actual.equities - alloc.recommended.equities;
        if (Math.abs(equityDiff) > 10) {
          recommendations.push({
            recommendationId: generateId('recommendation') + '-C',
            category: 'REBALANCING',
            priority: 'MEDIUM',
            title: equityDiff > 0 ? 'Reduce Equity Exposure' : 'Increase Equity Exposure',
            description: `Current equity allocation (${alloc.actual.equities}%) is ${Math.abs(equityDiff)}% ${equityDiff > 0 ? 'above' : 'below'} recommended level (${alloc.recommended.equities}%)`,
            currentValue: alloc.actual.equities,
            targetValue: alloc.recommended.equities,
            expectedImpact: {
              riskAlignmentImprovement: 'MODERATE',
              profileAlignment: 'IMPROVED'
            }
          });
        }
      }
    }
  }
  
  // Check risk levels
  if (portfolioRisk && portfolioRisk.portfolioVolatility > 20) {
    recommendations.push({
      recommendationId: generateId('recommendation') + '-D',
      category: 'RISK_REDUCTION',
      priority: 'MEDIUM',
      title: 'Consider Adding Defensive Positions',
      description: 'Portfolio volatility is elevated. Adding defensive sectors or bonds could improve risk-adjusted returns',
      currentValue: portfolioRisk.portfolioVolatility,
      targetValue: 18,
      expectedImpact: {
        volatilityReduction: Number((portfolioRisk.portfolioVolatility - 18).toFixed(2)),
        sharpeRatioImprovement: 0.15
      }
    });
  }
  
  // Add income recommendation if appropriate
  if (suitabilityAssessment && recommendations.length < 3) {
    recommendations.push({
      recommendationId: generateId('recommendation') + '-E',
      category: 'INCOME',
      priority: 'LOW',
      title: 'Consider Dividend-Paying Securities',
      description: 'Dividend stocks may provide stability and income while maintaining growth potential',
      currentValue: 8.0,
      targetValue: 15.0,
      expectedImpact: {
        incomeIncrease: 1.2,
        volatilityReduction: 0.8
      }
    });
  }
  
  // Calculate overall assessment
  const suitabilityScore = suitabilityAssessment?.suitabilityAssessment?.overallScore || 75;
  const suitabilityRating = suitabilityAssessment?.suitabilityAssessment?.overallRating || 'SUITABLE';
  
  let summary;
  if (recommendations.length === 0) {
    summary = 'Portfolio is well-aligned with risk profile. Continue monitoring and maintain current allocation.';
  } else if (recommendations.length <= 2) {
    summary = 'Portfolio is generally aligned with risk profile but shows opportunities for optimization.';
  } else {
    summary = 'Portfolio requires attention to improve alignment with risk profile and reduce concentration risk.';
  }
  
  // Create recommendation record
  const now = new Date().toISOString();
  const recommendationRecord = {
    recommendationId: generateId('recommendation'),
    investorId,
    profileId,
    scoreId: null,
    generatedDate: now,
    status: 'ACTIVE',
    overallAssessment: {
      suitabilityScore,
      suitabilityRating,
      summary
    },
    recommendations,
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
    createdAt: now
  };
  
  // Store recommendation
  add('recommendations', recommendationRecord);
  
  return recommendationRecord;
}

module.exports = {
  generateRecommendations
};

