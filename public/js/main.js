// Risk Management System - Common JavaScript Functions

const API_BASE = '/api/v1';

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Format number with commas
function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

// Format percentage
function formatPercent(value, decimals = 1) {
    return value.toFixed(decimals) + '%';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// API call wrapper
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Show loading spinner
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

// Show error message
function showError(element, message) {
    if (element) {
        element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
}

// Get risk category badge class
function getRiskCategoryClass(category) {
    const categoryUpper = category.toUpperCase();
    if (categoryUpper.includes('CONSERVATIVE')) return 'conservative';
    if (categoryUpper.includes('AGGRESSIVE')) return 'aggressive';
    return 'moderate';
}

// Format risk category name
function formatRiskCategory(category) {
    return category.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Close buttons
document.addEventListener('DOMContentLoaded', () => {
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});

