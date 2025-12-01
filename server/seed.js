/**
 * Seed Data Loader
 * Loads initial data into the in-memory datastore
 */

const fs = require('fs');
const path = require('path');
const { add, datastore, generateId } = require('./datastore');

/**
 * Load JSON data from file
 */
function loadJSON(filename) {
  const filepath = path.join(__dirname, 'data', filename);
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
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
 * Generate realistic questionnaire responses based on investor characteristics
 */
function generateResponses(investor, questionnaire) {
  const experienceScores = {
    'NOVICE': [1, 2],
    'INTERMEDIATE': [2, 3],
    'EXPERIENCED': [3, 4],
    'EXPERT': [4, 5]
  };
  
  const horizonScores = {
    'SHORT_TERM': [1, 2],
    'MEDIUM_TERM': [3, 4],
    'LONG_TERM': [4, 5]
  };

  const baseScores = experienceScores[investor.investmentExperience] || [3, 3];
  const horizonRange = horizonScores[investor.investmentHorizon] || [3, 4];
  
  const responses = questionnaire.questions.map((question, index) => {
    let selectedScore;
    
    if (question.category === 'TIME_HORIZON') {
      selectedScore = horizonRange[Math.floor(Math.random() * horizonRange.length)];
    } else if (question.category === 'INVESTMENT_KNOWLEDGE') {
      selectedScore = baseScores[Math.floor(Math.random() * baseScores.length)];
    } else {
      // For risk tolerance and financial situation, use base score with some variation
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      selectedScore = Math.max(1, Math.min(5, baseScores[0] + variation));
    }

    const selectedOption = question.options.find(opt => opt.score === selectedScore);
    
    return {
      questionId: question.questionId,
      questionCategory: question.category,
      questionText: question.questionText,
      selectedOption: selectedOption.optionId,
      optionText: selectedOption.text,
      score: selectedOption.score
    };
  });

  return responses;
}

/**
 * Seed all data
 */
function seedData() {
  console.log('🌱 Starting data seeding...');

  // Load reference data
  console.log('  Loading reference data...');
  const questionnaire = loadJSON('questionnaire.json');
  const scenariosData = loadJSON('scenarios.json');
  const riskFactorsData = loadJSON('riskFactors.json');
  const benchmarksData = loadJSON('benchmarks.json');
  const customersData = loadJSON('customers.json');

  // Seed scenarios
  scenariosData.forEach(scenario => {
    add('scenarios', scenario);
  });
  console.log(`  ✓ Loaded ${scenariosData.length} scenarios`);

  // Seed risk factors
  riskFactorsData.forEach(factor => {
    add('riskFactors', factor);
  });
  console.log(`  ✓ Loaded ${riskFactorsData.length} risk factors`);

  // Seed benchmarks
  benchmarksData.forEach(benchmark => {
    add('benchmarks', benchmark);
  });
  console.log(`  ✓ Loaded ${benchmarksData.length} benchmarks`);

  // Seed investors
  const now = new Date().toISOString();
  customersData.forEach(customer => {
    const investor = {
      ...customer,
      createdAt: now,
      updatedAt: now
    };
    add('investors', investor);
  });
  console.log(`  ✓ Loaded ${customersData.length} investors`);

  // Generate assessments and profiles for each investor
  console.log('  Generating assessments and profiles...');
  customersData.forEach((investor, index) => {
    const assessmentDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Within last 90 days
    
    // Generate assessment responses
    const responses = generateResponses(investor, questionnaire);
    const rawScore = responses.reduce((sum, r) => sum + r.score, 0);
    const percentileScore = Math.round((rawScore / questionnaire.maxScore) * 100);

    // Create assessment
    const assessment = {
      assessmentId: generateId('assessment'),
      investorId: investor.investorId,
      assessmentDate: assessmentDate.toISOString(),
      assessmentType: 'COMPREHENSIVE',
      status: 'COMPLETED',
      responses,
      rawScore,
      maxPossibleScore: questionnaire.maxScore,
      percentileScore,
      createdAt: assessmentDate.toISOString()
    };
    add('riskAssessments', assessment);

    // Calculate risk scores
    const riskCategory = calculateRiskCategory(rawScore);
    const compositeRiskScore = percentileScore;
    const riskToleranceScore = Math.round(percentileScore + (Math.random() * 10 - 5));
    const riskCapacityScore = Math.min(100, Math.round(
      (investor.liquidNetWorth / 1000000) * 40 + 
      (investor.annualIncome / 300000) * 30 + 30
    ));
    const riskRequiredScore = Math.round(60 + (Math.random() * 20 - 10));

    // Create risk profile
    const profile = {
      profileId: generateId('profile'),
      investorId: investor.investorId,
      assessmentId: assessment.assessmentId,
      profileDate: assessmentDate.toISOString(),
      isActive: true,
      
      riskToleranceScore: Math.max(0, Math.min(100, riskToleranceScore)),
      riskCapacityScore: Math.max(0, Math.min(100, riskCapacityScore)),
      riskRequiredScore: Math.max(0, Math.min(100, riskRequiredScore)),
      compositeRiskScore,
      
      riskCategory: riskCategory.name,
      riskCategoryCode: riskCategory.code,
      
      lossAversionScore: Math.round(100 - percentileScore),
      volatilityToleranceScore: Math.round(percentileScore - 5 + Math.random() * 10),
      timeHorizonScore: investor.investmentHorizon === 'LONG_TERM' ? 75 : 
                       investor.investmentHorizon === 'MEDIUM_TERM' ? 50 : 25,
      
      recommendedAllocation: getRecommendedAllocation(riskCategory.code),
      
      ...getRiskLimits(riskCategory.code),
      
      validFrom: assessmentDate.toISOString(),
      validTo: null,
      createdAt: assessmentDate.toISOString(),
      updatedAt: assessmentDate.toISOString()
    };
    add('riskProfiles', profile);
  });

  console.log(`  ✓ Generated ${datastore.riskAssessments.length} assessments`);
  console.log(`  ✓ Generated ${datastore.riskProfiles.length} risk profiles`);

  console.log('✅ Data seeding completed!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Investors: ${datastore.investors.length}`);
  console.log(`   - Risk Profiles: ${datastore.riskProfiles.length}`);
  console.log(`   - Risk Assessments: ${datastore.riskAssessments.length}`);
  console.log(`   - Scenarios: ${datastore.scenarios.length}`);
  console.log(`   - Risk Factors: ${datastore.riskFactors.length}`);
  console.log(`   - Benchmarks: ${datastore.benchmarks.length}`);
}

module.exports = { seedData };

