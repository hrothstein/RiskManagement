/**
 * Risk Assessment Routes
 */

const express = require('express');
const router = express.Router();
const { getAll, getById, getWhere, add, generateId } = require('../datastore');
const { scoreAssessment, generateProfile } = require('../services/scoringEngine');

/**
 * GET /api/v1/assessments
 * List all assessments
 */
router.get('/', (req, res) => {
  const assessments = getAll('riskAssessments');
  
  res.json({
    success: true,
    data: {
      assessments,
      count: assessments.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/assessments/:assessmentId
 * Get assessment by ID
 */
router.get('/:assessmentId', (req, res) => {
  const assessment = getById('riskAssessments', 'assessmentId', req.params.assessmentId);
  
  if (!assessment) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Assessment not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: assessment,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/investors/:investorId/assessments
 * Get assessments for investor
 */
router.get('/investor/:investorId/assessments', (req, res) => {
  const assessments = getWhere('riskAssessments', a => a.investorId === req.params.investorId);
  
  res.json({
    success: true,
    data: {
      assessments,
      count: assessments.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/v1/assessments
 * Create/submit new assessment
 */
router.post('/', (req, res) => {
  const { investorId, assessmentType, responses } = req.body;
  
  if (!investorId || !responses || !Array.isArray(responses)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'investorId and responses array are required'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Check investor exists
  const investor = getById('investors', 'investorId', investorId);
  if (!investor) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Investor not found'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Score the assessment
  const scored = scoreAssessment(responses);
  
  const now = new Date().toISOString();
  const assessment = {
    assessmentId: generateId('assessment'),
    investorId,
    assessmentDate: now,
    assessmentType: assessmentType || 'COMPREHENSIVE',
    status: 'COMPLETED',
    responses: scored.responses,
    rawScore: scored.rawScore,
    maxPossibleScore: scored.maxPossibleScore,
    percentileScore: scored.percentileScore,
    createdAt: now
  };
  
  add('riskAssessments', assessment);
  
  // Generate risk profile
  const profile = generateProfile(investor, assessment);
  add('riskProfiles', profile);
  
  // Deactivate old profiles
  const oldProfiles = getWhere('riskProfiles', p => 
    p.investorId === investorId && p.profileId !== profile.profileId
  );
  oldProfiles.forEach(oldProfile => {
    oldProfile.isActive = false;
    oldProfile.validTo = now;
  });
  
  res.status(201).json({
    success: true,
    data: {
      assessmentId: assessment.assessmentId,
      status: assessment.status,
      rawScore: assessment.rawScore,
      percentileScore: assessment.percentileScore,
      riskProfile: {
        profileId: profile.profileId,
        riskCategory: profile.riskCategory,
        compositeRiskScore: profile.compositeRiskScore
      }
    },
    timestamp: now
  });
});

module.exports = router;

