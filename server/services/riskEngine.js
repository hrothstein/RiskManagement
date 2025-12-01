/**
 * Risk Engine
 * Portfolio risk metric calculations
 */

/**
 * Calculate portfolio volatility (simplified weighted average)
 */
function calculatePortfolioVolatility(holdings) {
  if (!holdings || holdings.length === 0) return 0;
  
  const weightedVol = holdings.reduce((sum, holding) => {
    const weight = holding.weight / 100;
    const vol = holding.annualizedVolatility || getDefaultVolatility(holding.sector, holding.securityType);
    return sum + (weight * vol);
  }, 0);
  
  return Number(weightedVol.toFixed(2));
}

/**
 * Calculate portfolio beta (weighted average)
 */
function calculatePortfolioBeta(holdings) {
  if (!holdings || holdings.length === 0) return 1.0;
  
  const weightedBeta = holdings.reduce((sum, holding) => {
    const weight = holding.weight / 100;
    const beta = holding.beta || getDefaultBeta(holding.sector, holding.securityType);
    return sum + (weight * beta);
  }, 0);
  
  return Number(weightedBeta.toFixed(2));
}

/**
 * Calculate Sharpe Ratio
 */
function calculateSharpeRatio(portfolioReturn, portfolioVolatility, riskFreeRate = 3.5) {
  if (portfolioVolatility === 0) return 0;
  return Number(((portfolioReturn - riskFreeRate) / portfolioVolatility).toFixed(2));
}

/**
 * Calculate Sortino Ratio (simplified using 60% of volatility as downside)
 */
function calculateSortinoRatio(portfolioReturn, portfolioVolatility, riskFreeRate = 3.5) {
  if (portfolioVolatility === 0) return 0;
  const downsideDeviation = portfolioVolatility * 0.6; // Simplified
  return Number(((portfolioReturn - riskFreeRate) / downsideDeviation).toFixed(2));
}

/**
 * Calculate Treynor Ratio
 */
function calculateTreynorRatio(portfolioReturn, portfolioBeta, riskFreeRate = 3.5) {
  if (portfolioBeta === 0) return 0;
  return Number(((portfolioReturn - riskFreeRate) / portfolioBeta).toFixed(2));
}

/**
 * Calculate Value at Risk (VaR) - Parametric method
 */
function calculateVaR(totalValue, portfolioVolatility) {
  // Assuming monthly VaR and normal distribution
  const monthlyVol = portfolioVolatility / Math.sqrt(12);
  
  // 95% VaR (1.645 standard deviations)
  const var95Percent = -1.645 * monthlyVol;
  const var95Dollar = totalValue * (var95Percent / 100);
  
  // 99% VaR (2.326 standard deviations)
  const var99Percent = -2.326 * monthlyVol;
  const var99Dollar = totalValue * (var99Percent / 100);
  
  return {
    var95_percent: Number(var95Percent.toFixed(2)),
    var95_dollar: Number(var95Dollar.toFixed(2)),
    var99_percent: Number(var99Percent.toFixed(2)),
    var99_dollar: Number(var99Dollar.toFixed(2)),
    timeHorizon: '1_MONTH'
  };
}

/**
 * Calculate Expected Shortfall (CVaR)
 */
function calculateExpectedShortfall(totalValue, portfolioVolatility) {
  const monthlyVol = portfolioVolatility / Math.sqrt(12);
  
  // ES95 = -2.063 * sigma (for normal distribution)
  const es95Percent = -2.063 * monthlyVol;
  const es95Dollar = totalValue * (es95Percent / 100);
  
  // ES99 = -2.665 * sigma
  const es99Percent = -2.665 * monthlyVol;
  const es99Dollar = totalValue * (es99Percent / 100);
  
  return {
    es95_dollar: Number(es95Dollar.toFixed(2)),
    es99_dollar: Number(es99Dollar.toFixed(2))
  };
}

/**
 * Calculate max drawdown (estimated based on volatility and beta)
 */
function calculateMaxDrawdown(portfolioBeta, portfolioVolatility) {
  // Simplified: higher beta and volatility = larger drawdowns
  const baseDrawdown = -15;
  const betaAdjustment = (portfolioBeta - 1) * 8;
  const volAdjustment = (portfolioVolatility - 15) * 0.5;
  
  return Number((baseDrawdown + betaAdjustment + volAdjustment).toFixed(2));
}

/**
 * Calculate tracking error (simplified)
 */
function calculateTrackingError(portfolioBeta, portfolioVolatility) {
  // Distance from market (beta=1) adjusted by volatility
  const deviation = Math.abs(portfolioBeta - 1) * 2;
  const volComponent = portfolioVolatility * 0.15;
  return Number((deviation + volComponent).toFixed(2));
}

/**
 * Calculate R-squared (correlation to benchmark)
 */
function calculateRSquared(portfolioBeta, portfolioVolatility) {
  // Simplified: closer to market beta = higher R²
  const betaDeviation = Math.abs(portfolioBeta - 1);
  const baseR2 = 0.95;
  const adjustment = betaDeviation * 0.15;
  return Number(Math.max(0.5, Math.min(0.99, baseR2 - adjustment)).toFixed(2));
}

/**
 * Calculate risk decomposition
 */
function calculateRiskDecomposition(holdings, portfolioBeta) {
  // Systematic risk (market risk)
  const systematicRisk = Math.min(95, portfolioBeta * 60);
  const unsystematicRisk = 100 - systematicRisk;
  
  // Top risk contributors by weight * volatility
  const contributors = holdings.map(h => ({
    symbol: h.symbol,
    riskContribution: Number((h.weight * (h.annualizedVolatility || 20) / 100).toFixed(2))
  })).sort((a, b) => b.riskContribution - a.riskContribution).slice(0, 3);
  
  return {
    systematicRisk: Number(systematicRisk.toFixed(2)),
    unsystematicRisk: Number(unsystematicRisk.toFixed(2)),
    topRiskContributors: contributors
  };
}

/**
 * Get default volatility based on security characteristics
 */
function getDefaultVolatility(sector, securityType) {
  const volatilities = {
    'TECHNOLOGY': 28,
    'FINANCIAL': 22,
    'HEALTHCARE': 18,
    'CONSUMER_DISCRETIONARY': 20,
    'CONSUMER_STAPLES': 14,
    'UTILITIES': 12,
    'ENERGY': 26,
    'REAL_ESTATE': 20,
    'INDUSTRIALS': 19,
    'MATERIALS': 21,
    'TELECOMMUNICATIONS': 18
  };
  
  if (securityType === 'BOND') return 6;
  if (securityType === 'ETF') return 15;
  
  return volatilities[sector] || 20;
}

/**
 * Get default beta based on security characteristics
 */
function getDefaultBeta(sector, securityType) {
  const betas = {
    'TECHNOLOGY': 1.25,
    'FINANCIAL': 1.15,
    'HEALTHCARE': 0.85,
    'CONSUMER_DISCRETIONARY': 1.05,
    'CONSUMER_STAPLES': 0.70,
    'UTILITIES': 0.60,
    'ENERGY': 1.10,
    'REAL_ESTATE': 0.95,
    'INDUSTRIALS': 1.08,
    'MATERIALS': 1.12,
    'TELECOMMUNICATIONS': 0.80
  };
  
  if (securityType === 'BOND') return 0.10;
  if (securityType === 'ETF') return 1.00;
  
  return betas[sector] || 1.00;
}

/**
 * Calculate full portfolio risk metrics
 */
function calculatePortfolioRisk(portfolioData, benchmarkSymbol = 'SPY') {
  const { totalValue, holdings } = portfolioData;
  
  // Assume portfolio return based on beta and market return
  const portfolioBeta = calculatePortfolioBeta(holdings);
  const marketReturn = 10.5; // S&P 500 historical
  const portfolioReturn = 3.5 + (portfolioBeta * (marketReturn - 3.5)); // CAPM
  
  const portfolioVolatility = calculatePortfolioVolatility(holdings);
  const sharpeRatio = calculateSharpeRatio(portfolioReturn, portfolioVolatility);
  const sortinoRatio = calculateSortinoRatio(portfolioReturn, portfolioVolatility);
  const treynorRatio = calculateTreynorRatio(portfolioReturn, portfolioBeta);
  const maxDrawdown = calculateMaxDrawdown(portfolioBeta, portfolioVolatility);
  const var95 = calculateVaR(totalValue, portfolioVolatility);
  const expectedShortfall = calculateExpectedShortfall(totalValue, portfolioVolatility);
  const trackingError = calculateTrackingError(portfolioBeta, portfolioVolatility);
  const rSquared = calculateRSquared(portfolioBeta, portfolioVolatility);
  const riskDecomposition = calculateRiskDecomposition(holdings, portfolioBeta);
  
  // Information Ratio (simplified)
  const alpha = portfolioReturn - marketReturn;
  const informationRatio = trackingError > 0 ? Number((alpha / trackingError).toFixed(2)) : 0;
  
  return {
    totalValue,
    portfolioVolatility,
    portfolioBeta,
    sharpeRatio,
    sortinoRatio,
    treynorRatio,
    informationRatio,
    maxDrawdown,
    valueAtRisk: var95,
    expectedShortfall,
    trackingError,
    rSquared,
    riskDecomposition,
    benchmark: {
      symbol: benchmarkSymbol,
      benchmarkReturn: marketReturn,
      portfolioReturn: Number(portfolioReturn.toFixed(2)),
      alpha: Number(alpha.toFixed(2)),
      benchmarkVolatility: 15.2
    }
  };
}

module.exports = {
  calculatePortfolioRisk,
  calculatePortfolioVolatility,
  calculatePortfolioBeta,
  calculateSharpeRatio,
  calculateVaR,
  calculateMaxDrawdown
};

