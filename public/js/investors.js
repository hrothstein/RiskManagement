// Investors Page JavaScript

let allInvestors = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadInvestors();
    setupFilters();
});

async function loadInvestors() {
    const grid = document.getElementById('investorGrid');
    showLoading(grid);

    try {
        const response = await apiCall('/investors');
        allInvestors = response.data.investors;
        displayInvestors(allInvestors);
    } catch (error) {
        showError(grid, 'Failed to load investors');
    }
}

function displayInvestors(investors) {
    const grid = document.getElementById('investorGrid');

    if (investors.length === 0) {
        grid.innerHTML = '<div class="loading">No investors found</div>';
        return;
    }

    grid.innerHTML = investors.map(inv => `
        <div class="investor-card" onclick="showInvestorDetails('${inv.investorId}')">
            <div class="investor-header">
                <div>
                    <div class="investor-name">${inv.firstName} ${inv.lastName}</div>
                    <div class="investor-id">${inv.investorId}</div>
                </div>
                <span class="risk-badge ${getRiskCategoryClass(inv.investmentExperience)}">
                    ${inv.investmentExperience}
                </span>
            </div>
            <div class="investor-details">
                <div><strong>Email:</strong> ${inv.email}</div>
                <div><strong>Horizon:</strong> ${formatRiskCategory(inv.investmentHorizon)}</div>
                <div><strong>Income:</strong> ${formatCurrency(inv.annualIncome)}</div>
                <div><strong>Net Worth:</strong> ${formatCurrency(inv.netWorth)}</div>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterExperience = document.getElementById('filterExperience');
    const filterHorizon = document.getElementById('filterHorizon');

    const applyFilters = () => {
        let filtered = allInvestors;

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(inv =>
                inv.firstName.toLowerCase().includes(searchTerm) ||
                inv.lastName.toLowerCase().includes(searchTerm) ||
                inv.email.toLowerCase().includes(searchTerm) ||
                inv.investorId.toLowerCase().includes(searchTerm)
            );
        }

        const experience = filterExperience.value;
        if (experience) {
            filtered = filtered.filter(inv => inv.investmentExperience === experience);
        }

        const horizon = filterHorizon.value;
        if (horizon) {
            filtered = filtered.filter(inv => inv.investmentHorizon === horizon);
        }

        displayInvestors(filtered);
    };

    searchInput.addEventListener('input', applyFilters);
    filterExperience.addEventListener('change', applyFilters);
    filterHorizon.addEventListener('change', applyFilters);
}

async function showInvestorDetails(investorId) {
    const modal = document.getElementById('investorModal');
    const detailsContainer = document.getElementById('investorDetails');

    openModal('investorModal');
    showLoading(detailsContainer);

    try {
        const response = await apiCall(`/investors/${investorId}/profile`);
        const { investor, riskProfile } = response.data;

        detailsContainer.innerHTML = `
            <h2>${investor.firstName} ${investor.lastName}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">${investor.investorId} | ${investor.email}</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h3>Personal Information</h3>
                    <div style="margin-top: 1rem;">
                        <p><strong>Date of Birth:</strong> ${formatDate(investor.dateOfBirth)}</p>
                        <p><strong>Age:</strong> ${investor.age}</p>
                        <p><strong>Phone:</strong> ${investor.phone}</p>
                        <p><strong>Employment:</strong> ${formatRiskCategory(investor.employmentStatus)}</p>
                    </div>

                    <h3 style="margin-top: 2rem;">Financial Information</h3>
                    <div style="margin-top: 1rem;">
                        <p><strong>Annual Income:</strong> ${formatCurrency(investor.annualIncome)}</p>
                        <p><strong>Net Worth:</strong> ${formatCurrency(investor.netWorth)}</p>
                        <p><strong>Liquid Net Worth:</strong> ${formatCurrency(investor.liquidNetWorth)}</p>
                    </div>

                    <h3 style="margin-top: 2rem;">Investment Profile</h3>
                    <div style="margin-top: 1rem;">
                        <p><strong>Experience:</strong> ${formatRiskCategory(investor.investmentExperience)}</p>
                        <p><strong>Horizon:</strong> ${formatRiskCategory(investor.investmentHorizon)}</p>
                    </div>
                </div>

                <div>
                    ${riskProfile ? `
                        <h3>Risk Profile</h3>
                        <div style="margin-top: 1rem;">
                            <p>
                                <span class="risk-badge ${getRiskCategoryClass(riskProfile.riskCategory)}">
                                    ${formatRiskCategory(riskProfile.riskCategory)}
                                </span>
                            </p>
                            <p style="margin-top: 1rem;"><strong>Composite Score:</strong> ${riskProfile.compositeRiskScore}</p>
                            <p><strong>Max Volatility:</strong> ${riskProfile.maxVolatilityTolerance}%</p>
                            <p><strong>Max Drawdown:</strong> ${riskProfile.maxDrawdownTolerance}%</p>
                        </div>

                        <h3 style="margin-top: 2rem;">Recommended Allocation</h3>
                        <div style="margin-top: 1rem;">
                            <div style="margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Equities</span>
                                    <strong>${riskProfile.recommendedAllocation.equities}%</strong>
                                </div>
                                <div style="background: var(--light-color); height: 8px; border-radius: 4px; margin-top: 4px;">
                                    <div style="background: var(--primary-color); height: 100%; width: ${riskProfile.recommendedAllocation.equities}%; border-radius: 4px;"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Fixed Income</span>
                                    <strong>${riskProfile.recommendedAllocation.fixedIncome}%</strong>
                                </div>
                                <div style="background: var(--light-color); height: 8px; border-radius: 4px; margin-top: 4px;">
                                    <div style="background: var(--secondary-color); height: 100%; width: ${riskProfile.recommendedAllocation.fixedIncome}%; border-radius: 4px;"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Alternatives</span>
                                    <strong>${riskProfile.recommendedAllocation.alternatives}%</strong>
                                </div>
                                <div style="background: var(--light-color); height: 8px; border-radius: 4px; margin-top: 4px;">
                                    <div style="background: var(--warning-color); height: 100%; width: ${riskProfile.recommendedAllocation.alternatives}%; border-radius: 4px;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Cash</span>
                                    <strong>${riskProfile.recommendedAllocation.cash}%</strong>
                                </div>
                                <div style="background: var(--light-color); height: 8px; border-radius: 4px; margin-top: 4px;">
                                    <div style="background: var(--text-secondary); height: 100%; width: ${riskProfile.recommendedAllocation.cash}%; border-radius: 4px;"></div>
                                </div>
                            </div>
                        </div>
                    ` : '<p>No risk profile available</p>'}
                </div>
            </div>
        `;
    } catch (error) {
        showError(detailsContainer, 'Failed to load investor details');
    }
}

