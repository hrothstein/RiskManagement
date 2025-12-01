// Dashboard Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    await loadRiskCategories();
    await loadHealthStatus();
});

async function loadStats() {
    try {
        const response = await apiCall('/health');
        const { datastore } = response.data;

        document.getElementById('investorCount').textContent = formatNumber(datastore.investors);
        document.getElementById('profileCount').textContent = formatNumber(datastore.profiles);
        document.getElementById('assessmentCount').textContent = formatNumber(datastore.assessments);
        document.getElementById('scenarioCount').textContent = formatNumber(datastore.scenarios);
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadRiskCategories() {
    const container = document.getElementById('riskCategories');
    showLoading(container);

    try {
        const response = await apiCall('/risk-categories');
        const categories = response.data.categories;

        container.innerHTML = categories.map(cat => `
            <div class="risk-category ${getRiskCategoryClass(cat.name)}">
                <h4>${formatRiskCategory(cat.name)}</h4>
                <p><strong>Score Range:</strong> ${cat.scoreRange.min}-${cat.scoreRange.max}</p>
                <p><strong>Equities:</strong> ${cat.typicalAllocation.equities}%</p>
                <p><strong>Max Drawdown:</strong> ${cat.maxDrawdownTolerance}%</p>
            </div>
        `).join('');
    } catch (error) {
        showError(container, 'Failed to load risk categories');
    }
}

async function loadHealthStatus() {
    const container = document.getElementById('healthStatus');
    showLoading(container);

    try {
        const response = await apiCall('/health');
        const { status, version, uptime, datastore } = response.data;

        const uptimeMinutes = Math.floor(uptime / 60);
        const uptimeHours = Math.floor(uptimeMinutes / 60);

        container.innerHTML = `
            <div class="health-item">
                <span class="health-label">Status</span>
                <span class="health-value" style="color: var(--secondary-color); font-weight: bold;">
                    ✓ ${status.toUpperCase()}
                </span>
            </div>
            <div class="health-item">
                <span class="health-label">Version</span>
                <span class="health-value">${version}</span>
            </div>
            <div class="health-item">
                <span class="health-label">Uptime</span>
                <span class="health-value">${uptimeHours}h ${uptimeMinutes % 60}m</span>
            </div>
            <div class="health-item">
                <span class="health-label">Total Records</span>
                <span class="health-value">${Object.values(datastore).reduce((a, b) => a + b, 0)} records</span>
            </div>
        `;
    } catch (error) {
        showError(container, 'Failed to load health status');
    }
}

