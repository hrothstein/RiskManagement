// Scenarios Page JavaScript

let allScenarios = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    await loadScenarios();
    setupFilterButtons();
});

async function loadScenarios() {
    const grid = document.getElementById('scenarioGrid');
    showLoading(grid);

    try {
        const response = await apiCall('/scenarios');
        allScenarios = response.data.scenarios;
        displayScenarios(allScenarios);
    } catch (error) {
        showError(grid, 'Failed to load scenarios');
    }
}

function displayScenarios(scenarios) {
    const grid = document.getElementById('scenarioGrid');

    if (scenarios.length === 0) {
        grid.innerHTML = '<div class="loading">No scenarios found</div>';
        return;
    }

    grid.innerHTML = scenarios.map(scenario => `
        <div class="scenario-card" onclick="showScenarioDetails('${scenario.scenarioId}')">
            <div class="scenario-header">
                <div class="scenario-title">${scenario.scenarioName}</div>
                <span class="scenario-category ${scenario.scenarioCategory.toLowerCase()}">
                    ${scenario.scenarioCategory}
                </span>
            </div>
            <div class="scenario-description">
                ${scenario.scenarioDescription}
            </div>
            <div class="scenario-impact">
                <span>Equity Impact:</span>
                <span class="impact-value">${scenario.shockParameters.equityShock}%</span>
            </div>
            <div class="scenario-impact">
                <span>Bond Impact:</span>
                <span class="impact-value" style="color: ${scenario.shockParameters.bondShock > 0 ? 'var(--secondary-color)' : 'var(--danger-color)'};">
                    ${scenario.shockParameters.bondShock > 0 ? '+' : ''}${scenario.shockParameters.bondShock}%
                </span>
            </div>
        </div>
    `).join('');
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Apply filter
            const filter = btn.dataset.filter;
            currentFilter = filter;
            
            if (filter === 'all') {
                displayScenarios(allScenarios);
            } else {
                const filtered = allScenarios.filter(s => s.scenarioCategory === filter);
                displayScenarios(filtered);
            }
        });
    });
}

async function showScenarioDetails(scenarioId) {
    const modal = document.getElementById('scenarioModal');
    const detailsContainer = document.getElementById('scenarioDetails');

    openModal('scenarioModal');
    showLoading(detailsContainer);

    try {
        const response = await apiCall(`/scenarios/${scenarioId}`);
        const scenario = response.data.scenario;

        detailsContainer.innerHTML = `
            <h2>${scenario.scenarioName}</h2>
            <span class="scenario-category ${scenario.scenarioCategory.toLowerCase()}" style="display: inline-block; margin-bottom: 1rem;">
                ${scenario.scenarioCategory}
            </span>
            
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">${scenario.scenarioDescription}</p>
            
            <h3>Shock Parameters</h3>
            <div style="margin: 1rem 0;">
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-label">Equity Shock</div>
                        <div class="metric-value" style="color: var(--danger-color);">
                            ${scenario.shockParameters.equityShock}%
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Bond Shock</div>
                        <div class="metric-value" style="color: ${scenario.shockParameters.bondShock > 0 ? 'var(--secondary-color)' : 'var(--danger-color)'};">
                            ${scenario.shockParameters.bondShock > 0 ? '+' : ''}${scenario.shockParameters.bondShock}%
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Credit Spread Change</div>
                        <div class="metric-value">
                            ${scenario.shockParameters.creditSpreadChange} bps
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Volatility Spike</div>
                        <div class="metric-value">
                            +${scenario.shockParameters.volatilitySpike}%
                        </div>
                    </div>
                </div>
            </div>
            
            <h3 style="margin-top: 2rem;">Sector-Specific Shocks</h3>
            <div style="margin-top: 1rem;">
                ${Object.entries(scenario.sectorShocks).map(([sector, shock]) => `
                    <div style="margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${formatRiskCategory(sector)}</span>
                            <strong style="color: ${shock > 0 ? 'var(--secondary-color)' : 'var(--danger-color)'};">
                                ${shock > 0 ? '+' : ''}${shock}%
                            </strong>
                        </div>
                        <div style="background: var(--light-color); height: 6px; border-radius: 3px; margin-top: 4px;">
                            <div style="background: ${shock > 0 ? 'var(--secondary-color)' : 'var(--danger-color)'}; height: 100%; width: ${Math.abs(shock)}%; border-radius: 3px;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: var(--light-color); border-radius: 8px;">
                <p><strong>Status:</strong> ${scenario.isActive ? '✓ Active' : '✗ Inactive'}</p>
                <p><strong>Created:</strong> ${formatDate(scenario.createdAt)}</p>
            </div>
        `;
    } catch (error) {
        showError(detailsContainer, 'Failed to load scenario details');
    }
}

