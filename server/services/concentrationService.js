/**
 * Concentration Service
 * Analyzes portfolio concentration risk
 */

/**
 * Calculate Herfindahl Index
 */
function calculateHerfindahlIndex(holdings) {
  return holdings.reduce((sum, h) => {
    const weight = h.weight / 100;
    return sum + (weight * weight);
  }, 0);
}

/**
 * Calculate effective number of positions
 */
function calculateEffectivePositions(herfindahlIndex) {
  return herfindahlIndex > 0 ? 1 / herfindahlIndex : 0;
}

/**
 * Analyze single position concentration
 */
function analyzeSinglePosition(holdings, limit = 10) {
  const sorted = [...holdings].sort((a, b) => b.weight - a.weight);
  const topHolding = sorted[0];
  
  const breach = topHolding.weight - limit;
  const status = breach > 0 ? 'BREACHED' : 'COMPLIANT';
  
  return {
    topHolding: topHolding.symbol,
    topHoldingWeight: Number(topHolding.weight.toFixed(2)),
    limit,
    status,
    breach: breach > 0 ? Number(breach.toFixed(2)) : 0
  };
}

/**
 * Analyze sector concentration
 */
function analyzeSectorConcentration(holdings, limit = 25) {
  const sectorTotals = {};
  
  holdings.forEach(h => {
    const sector = h.sector || 'OTHER';
    sectorTotals[sector] = (sectorTotals[sector] || 0) + h.weight;
  });
  
  const sectors = Object.entries(sectorTotals).map(([sector, weight]) => ({
    sector,
    weight: Number(weight.toFixed(2))
  })).sort((a, b) => b.weight - a.weight);
  
  const topSector = sectors[0];
  const breach = topSector.weight - limit;
  const status = breach > 0 ? 'BREACHED' : 'COMPLIANT';
  
  const sectorBreakdown = {};
  sectors.forEach(s => {
    sectorBreakdown[s.sector] = s.weight;
  });
  
  return {
    topSector: topSector.sector,
    topSectorWeight: topSector.weight,
    limit,
    status,
    breach: breach > 0 ? Number(breach.toFixed(2)) : 0,
    sectorBreakdown
  };
}

/**
 * Analyze top 5 concentration
 */
function analyzeTop5Concentration(holdings, limit = 50) {
  const sorted = [...holdings].sort((a, b) => b.weight - a.weight);
  const top5Weight = sorted.slice(0, 5).reduce((sum, h) => sum + h.weight, 0);
  
  const breach = top5Weight - limit;
  const status = breach > 0 ? 'BREACHED' : 'COMPLIANT';
  
  return {
    top5Weight: Number(top5Weight.toFixed(2)),
    limit,
    status,
    breach: breach > 0 ? Number(breach.toFixed(2)) : 0
  };
}

/**
 * Determine overall concentration risk level
 */
function determineConcentrationRisk(singleStatus, sectorStatus, top5Status, herfindahlIndex) {
  const breachCount = [singleStatus, sectorStatus, top5Status].filter(s => s === 'BREACHED').length;
  
  if (breachCount >= 2 || herfindahlIndex > 0.15) return 'HIGH';
  if (breachCount === 1 || herfindahlIndex > 0.10) return 'ELEVATED';
  if (herfindahlIndex > 0.05) return 'MODERATE';
  return 'LOW';
}

/**
 * Generate concentration alerts
 */
function generateConcentrationAlerts(singlePosition, sectorConcentration, top5Concentration) {
  const alerts = [];
  
  if (singlePosition.status === 'BREACHED') {
    alerts.push({
      alertType: 'SINGLE_POSITION',
      severity: singlePosition.breach > 10 ? 'HIGH' : 'MEDIUM',
      symbol: singlePosition.topHolding,
      message: `${singlePosition.topHolding} position (${singlePosition.topHoldingWeight}%) exceeds ${singlePosition.limit}% single position limit`
    });
  }
  
  if (sectorConcentration.status === 'BREACHED') {
    alerts.push({
      alertType: 'SECTOR',
      severity: sectorConcentration.breach > 15 ? 'HIGH' : 'MEDIUM',
      sector: sectorConcentration.topSector,
      message: `${sectorConcentration.topSector} sector (${sectorConcentration.topSectorWeight}%) exceeds ${sectorConcentration.limit}% sector limit`
    });
  }
  
  if (top5Concentration.status === 'BREACHED') {
    alerts.push({
      alertType: 'TOP5_HOLDINGS',
      severity: top5Concentration.breach > 20 ? 'HIGH' : 'MEDIUM',
      message: `Top 5 holdings (${top5Concentration.top5Weight}%) exceed ${top5Concentration.limit}% concentration limit`
    });
  }
  
  return alerts;
}

/**
 * Analyze concentration risk
 */
function analyzeConcentration(investorId, holdings, thresholds = {}) {
  const {
    singlePositionLimit = 10,
    sectorLimit = 25,
    top5Limit = 50
  } = thresholds;
  
  const singlePosition = analyzeSinglePosition(holdings, singlePositionLimit);
  const sectorConcentration = analyzeSectorConcentration(holdings, sectorLimit);
  const top5Concentration = analyzeTop5Concentration(holdings, top5Limit);
  
  const herfindahlIndex = calculateHerfindahlIndex(holdings);
  const effectivePositions = calculateEffectivePositions(herfindahlIndex);
  
  const overallConcentrationRisk = determineConcentrationRisk(
    singlePosition.status,
    sectorConcentration.status,
    top5Concentration.status,
    herfindahlIndex
  );
  
  const alerts = generateConcentrationAlerts(singlePosition, sectorConcentration, top5Concentration);
  
  return {
    concentrationAnalysis: {
      singlePosition,
      sectorConcentration,
      top5Concentration,
      herfindahlIndex: Number(herfindahlIndex.toFixed(3)),
      effectivePositions: Number(effectivePositions.toFixed(1)),
      overallConcentrationRisk
    },
    alerts
  };
}

module.exports = {
  analyzeConcentration,
  calculateHerfindahlIndex
};

