// Risk Analyzer Page JavaScript

let holdingCounter = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await loadInvestors();
    addHolding(); // Start with one holding
});

async function loadInvestors() {
    try {
        const response = await apiCall('/investors');
        const investors = response.data.investors;
        
        const select = document.getElementById('investorSelect');
        select.innerHTML = '<option value="">-- None / Custom Portfolio --</option>' +
            investors.map(inv => 
                `<option value="${inv.investorId}">${inv.firstName} ${inv.lastName} (${inv.investorId})</option>`
            ).join('');
    } catch (error) {
        console.error('Failed to load investors:', error);
    }
}

function addHolding() {
    holdingCounter++;
    const container = document.getElementById('holdingsContainer');
    
    const holdingDiv = document.createElement('div');
    holdingDiv.className = 'holding-row';
    holdingDiv.id = `holding-${holdingCounter}`;
    holdingDiv.innerHTML = `
        <input type="text" placeholder="Symbol (e.g., AAPL)" required>
        <input type="text" placeholder="Sector">
        <input type="number" placeholder="Market Value" required>
        <input type="number" step="0.01" placeholder="Beta">
        <button type="button" class="remove-btn" onclick="removeHolding(${holdingCounter})">×</button>
    `;
    
    container.appendChild(holdingDiv);
}

function removeHolding(id) {
    const element = document.getElementById(`holding-${id}`);
    if (element) {
        element.remove();
    }
}

function loadSamplePortfolio() {
    document.getElementById('totalValue').value = 500000;
    
    // Clear existing holdings
    document.getElementById('holdingsContainer').innerHTML = '';
    holdingCounter = 0;
    
    // Add sample holdings
    const sampleHoldings = [
        { symbol: 'AAPL', sector: 'TECHNOLOGY', value: 112500, beta: 1.25 },
        { symbol: 'MSFT', sector: 'TECHNOLOGY', value: 87500, beta: 1.15 },
        { symbol: 'JNJ', sector: 'HEALTHCARE', value: 50000, beta: 0.85 },
        { symbol: 'BND', sector: 'FIXED_INCOME', value: 100000, beta: 0.10 },
        { symbol: 'PG', sector: 'CONSUMER_STAPLES', value: 40000, beta: 0.65 },
        { symbol: 'XOM', sector: 'ENERGY', value: 35000, beta: 1.10 }
    ];
    
    sampleHoldings.forEach(h => {
        holdingCounter++;
        const container = document.getElementById('holdingsContainer');
        const holdingDiv = document.createElement('div');
        holdingDiv.className = 'holding-row';
        holdingDiv.id = `holding-${holdingCounter}`;
        holdingDiv.innerHTML = `
            <input type="text" placeholder="Symbol" value="${h.symbol}" required>
            <input type="text" placeholder="Sector" value="${h.sector}">
            <input type="number" placeholder="Market Value" value="${h.value}" required>
            <input type="number" step="0.01" placeholder="Beta" value="${h.beta}">
            <button type="button" class="remove-btn" onclick="removeHolding(${holdingCounter})">×</button>
        `;
        container.appendChild(holdingDiv);
    });
}

async function analyzePortfolio() {
    const resultsContainer = document.getElementById('resultsContainer');
    showLoading(resultsContainer);
    
    try {
        // Gather form data
        const investorId = document.getElementById('investorSelect').value || null;
        const totalValue = parseFloat(document.getElementById('totalValue').value);
        const includeStressTests = document.getElementById('includeStressTests').checked;
        
        // Gather holdings
        const holdingRows = document.querySelectorAll('.holding-row');
        const holdings = [];
        
        holdingRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const symbol = inputs[0].value.trim();
            const sector = inputs[1].value.trim() || 'OTHER';
            const marketValue = parseFloat(inputs[2].value);
            const beta = parseFloat(inputs[3].value) || 1.0;
            
            if (symbol && marketValue) {
                holdings.push({
                    symbol,
                    securityType: sector.includes('BOND') || sector.includes('FIXED') ? 'BOND' : 'STOCK',
                    sector,
                    marketValue,
                    weight: (marketValue / totalValue) * 100,
                    beta,
                    annualizedVolatility: beta * 18 // Simplified estimation
                });
            }
        });
        
        if (holdings.length === 0) {
            showError(resultsContainer, 'Please add at least one holding');
            return;
        }
        
        // Calculate asset allocation
        const equities = holdings
            .filter(h => h.securityType === 'STOCK')
            .reduce((sum, h) => sum + h.weight, 0);
        const fixedIncome = holdings
            .filter(h => h.securityType === 'BOND')
            .reduce((sum, h) => sum + h.weight, 0);
        
        // Prepare request
        const request = {
            investorId,
            portfolioData: {
                totalValue,
                holdings,
                assetAllocation: {
                    equities: Math.round(equities),
                    fixedIncome: Math.round(fixedIncome),
                    alternatives: 0,
                    cash: Math.round(100 - equities - fixedIncome)
                }
            },
            includeStressTests,
            scenarioIds: includeStressTests ? ['SCN-001', 'SCN-002', 'SCN-003'] : [],
            benchmarkSymbol: 'SPY'
        };
        
        // Call comprehensive analysis API
        const response = await apiCall('/analysis/comprehensive', {
            method: 'POST',
            body: JSON.stringify(request)
        });
        
        displayResults(response.data);
        
    } catch (error) {
        showError(resultsContainer, `Analysis failed: ${error.message}`);
    }
}

function displayResults(data) {
    const container = document.getElementById('resultsContainer');
    
    const { executiveSummary, portfolioRisk, concentrationAnalysis, suitabilityAssessment, stressTestResults, recommendations } = data;
    
    let html = `
        <div class="results-section">
            <h4>📊 Executive Summary</h4>
            <div class="alert ${executiveSummary.overallRiskLevel === 'HIGH' ? 'alert-danger' : 'alert-warning'}">
                <strong>Overall Risk Level:</strong> ${executiveSummary.overallRiskLevel}
            </div>
            <ul>
                ${executiveSummary.keyFindings.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
        
        <div class="results-section">
            <h4>📈 Portfolio Risk Metrics</h4>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-label">Volatility</div>
                    <div class="metric-value">${formatPercent(portfolioRisk.portfolioMetrics.portfolioVolatility)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Beta</div>
                    <div class="metric-value">${portfolioRisk.portfolioMetrics.portfolioBeta.toFixed(2)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Sharpe Ratio</div>
                    <div class="metric-value">${portfolioRisk.portfolioMetrics.sharpeRatio.toFixed(2)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Max Drawdown</div>
                    <div class="metric-value">${formatPercent(portfolioRisk.portfolioMetrics.maxDrawdown)}</div>
                </div>
            </div>
            
            <h5 style="margin-top: 1rem;">Value at Risk (VaR)</h5>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-label">95% VaR (1 Month)</div>
                    <div class="metric-value" style="color: var(--danger-color);">
                        ${formatCurrency(portfolioRisk.portfolioMetrics.valueAtRisk.var95_dollar)}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">99% VaR (1 Month)</div>
                    <div class="metric-value" style="color: var(--danger-color);">
                        ${formatCurrency(portfolioRisk.portfolioMetrics.valueAtRisk.var99_dollar)}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="results-section">
            <h4>🎯 Concentration Analysis</h4>
            <div class="alert ${concentrationAnalysis.concentrationAnalysis.overallConcentrationRisk === 'HIGH' ? 'alert-danger' : 'alert-warning'}">
                <strong>Concentration Risk:</strong> ${concentrationAnalysis.concentrationAnalysis.overallConcentrationRisk}
            </div>
            <p><strong>Herfindahl Index:</strong> ${concentrationAnalysis.concentrationAnalysis.herfindahlIndex.toFixed(2)}</p>
            
            ${concentrationAnalysis.concentrationAnalysis.alerts.length > 0 ? `
                <h5>Alerts:</h5>
                <ul>
                    ${concentrationAnalysis.concentrationAnalysis.alerts.map(a => 
                        `<li><strong>${a.type}:</strong> ${a.message}</li>`
                    ).join('')}
                </ul>
            ` : ''}
        </div>
    `;
    
    if (suitabilityAssessment) {
        html += `
            <div class="results-section">
                <h4>✓ Suitability Assessment</h4>
                <div class="alert ${suitabilityAssessment.suitabilityAssessment.overallRating === 'UNSUITABLE' ? 'alert-danger' : 'alert-warning'}">
                    <strong>Rating:</strong> ${suitabilityAssessment.suitabilityAssessment.overallRating}
                </div>
                <p>${suitabilityAssessment.suitabilityAssessment.summary}</p>
            </div>
        `;
    }
    
    if (stressTestResults && stressTestResults.stressTests.length > 0) {
        html += `
            <div class="results-section">
                <h4>⚠️ Stress Test Results</h4>
                ${stressTestResults.stressTests.map(test => `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: var(--light-color); border-radius: 8px;">
                        <h5>${test.scenarioName}</h5>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">${test.scenarioDescription}</p>
                        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                            <span><strong>Initial Value:</strong> ${formatCurrency(test.initialValue)}</span>
                            <span><strong>Stressed Value:</strong> ${formatCurrency(test.stressedValue)}</span>
                            <span style="color: var(--danger-color);"><strong>Loss:</strong> ${formatPercent(test.percentageLoss)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (recommendations && recommendations.recommendations.length > 0) {
        html += `
            <div class="results-section">
                <h4>💡 Recommendations</h4>
                ${recommendations.recommendations.map(rec => `
                    <div class="alert alert-warning">
                        <strong>${rec.category}:</strong> ${rec.recommendation}
                        ${rec.expectedImpact ? `<br><small>${rec.expectedImpact}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

