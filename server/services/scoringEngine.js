/**
 * Scoring Engine
 * Assessment scoring and profile generation
 */

const fs = require('fs');
const path = require('path');
const { generateId } = require('../datastore');

// Load questionnaire for scoring reference
const questionnaire = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/questionnaire.json'), 'utf8')
);

/**
 * Score a risk assessment
 */
function scoreAssessment(responses) {
  const scoredResponses = responses.map(response => {
    const question = questionnaire.questions.find(q => q.questionId === response.questionId);
    if (!question) {
      throw new Error(`Invalid question ID: ${response.questionId}`);
    }
    
    const option = question.options.find(opt => opt.optionId === response.selectedOption);
    if (!option) {
      throw new Error(`Invalid option for question ${response.questionId}`);
    }
    
    return {
      questionId: response.questionId,
      questionCategory: question.category,
      questionText: question.questionText,
      selectedOption: response.selectedOption,
      optionText: option.text,
      score: option.score
    };
  });
  
  const rawScore = scoredResponses.reduce((sum, r) => sum + r.score, 0);
  const maxPossibleScore = questionnaire.maxScore;
  const percentileScore = Math.round((rawScore / maxPossibleScore) * 100);
  
  return {
    responses: scoredResponses,
    rawScore,
    maxPossibleScore,
    percentileScore
  };
}

/**
 * Calculate risk category from score
 */
function calculateRiskCategory(score) {
  if (score <= 30) return { name: 'CONSERVATIVE', code: 1 };
  if (score <= 45) return { name: 'MODERATELY_CONSERVATIVE', code: 2 };
  if (score <= 55) return { name: 'MODERATE', code: 3 };
  if (score <= 65) return { name: 'MODERATELY_AGGRESSIVE', code: 4 };
  return { name: 'AGGRESSIVE', code: 5 };
}

/**
 * Get recommended allocation based on risk category
 */
function getRecommendedAllocation(categoryCode) {
  const allocations = {
    1: { equities: 20, fixedIncome: 60, alternatives: 5, cash: 15 },
    2: { equities: 40, fixedIncome: 45, alternatives: 5, cash: 10 },
    3: { equities: 60, fixedIncome: 30, alternatives: 5, cash: 5 },
    4: { equities: 75, fixedIncome: 15, alternatives: 7, cash: 3 },
    5: { equities: 90, fixedIncome: 5, alternatives: 3, cash: 2 }
  };
  return allocations[categoryCode];
}

/**
 * Get risk limits based on risk category
 */
function getRiskLimits(categoryCode) {
  const limits = {
    1: { maxDrawdownTolerance: 10, maxVolatilityTolerance: 8, maxConcentrationLimit: 15 },
    2: { maxDrawdownTolerance: 15, maxVolatilityTolerance: 12, maxConcentrationLimit: 20 },
    3: { maxDrawdownTolerance: 25, maxVolatilityTolerance: 18, maxConcentrationLimit: 25 },
    4: { maxDrawdownTolerance: 35, maxVolatilityTolerance: 22, maxConcentrationLimit: 30 },
    5: { maxDrawdownTolerance: 50, maxVolatilityTolerance: 30, maxConcentrationLimit: 35 }
  };
  return limits[categoryCode];
}

/**
 * Generate risk profile from assessment
 */
function generateProfile(investor, assessment) {
  const now = new Date().toISOString();
  
  const riskCategory = calculateRiskCategory(assessment.rawScore);
  const compositeRiskScore = assessment.percentileScore;
  const riskToleranceScore = Math.round(compositeRiskScore + (Math.random() * 10 - 5));
  const riskCapacityScore = Math.min(100, Math.round(
    (investor.liquidNetWorth / 1000000) * 40 + 
    (investor.annualIncome / 300000) * 30 + 30
  ));
  const riskRequiredScore = Math.round(60 + (Math.random() * 20 - 10));
  
  const profile = {
    profileId: generateId('profile'),
    investorId: investor.investorId,
    assessmentId: assessment.assessmentId,
    profileDate: now,
    isActive: true,
    
    riskToleranceScore: Math.max(0, Math.min(100, riskToleranceScore)),
    riskCapacityScore: Math.max(0, Math.min(100, riskCapacityScore)),
    riskRequiredScore: Math.max(0, Math.min(100, riskRequiredScore)),
    compositeRiskScore,
    
    riskCategory: riskCategory.name,
    riskCategoryCode: riskCategory.code,
    
    lossAversionScore: Math.round(100 - compositeRiskScore),
    volatilityToleranceScore: Math.round(compositeRiskScore - 5 + Math.random() * 10),
    timeHorizonScore: investor.investmentHorizon === 'LONG_TERM' ? 75 : 
                     investor.investmentHorizon === 'MEDIUM_TERM' ? 50 : 25,
    
    recommendedAllocation: getRecommendedAllocation(riskCategory.code),
    
    ...getRiskLimits(riskCategory.code),
    
    validFrom: now,
    validTo: null,
    createdAt: now,
    updatedAt: now
  };
  
  return profile;
}

module.exports = {
  scoreAssessment,
  calculateRiskCategory,
  getRecommendedAllocation,
  getRiskLimits,
  generateProfile
};

