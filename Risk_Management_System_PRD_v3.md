# Risk Management Backend System - Product Requirements Document

## 1. Executive Summary

### 1.1 Purpose
Build a Risk Management Backend System for demo purposes that provides risk assessment, scoring, and analysis capabilities for individual investors. This system showcases how MuleSoft can orchestrate risk evaluation workflows by integrating with dedicated risk calculation services.

### 1.2 Scope
- **Risk Domains:** Individual investor risk tolerance, portfolio risk metrics, concentration risk, scenario analysis
- **Core Entities:** Investors, Risk Profiles, Risk Assessments, Risk Scores, Scenarios, Recommendations
- **Tech Stack:** Node.js/Express backend, In-memory datastore
- **Deployment:** Heroku
- **Web UI:** Demo dashboard for visualizing risk data and testing API functionality
- **Integration Pattern:** RESTful APIs designed to be consumed by MuleSoft Experience/Process APIs

### 1.3 Key Features
- Risk tolerance questionnaire processing and scoring
- Portfolio risk analysis (VaR, Sharpe Ratio, Beta, Standard Deviation)
- Concentration risk detection
- Stress testing / scenario analysis
- Risk-adjusted return calculations
- Investment suitability recommendations
- RESTful APIs (open/unsecured - no auth required for demo)
- Pre-loaded with 50 investors matching Portfolio Management System customers
- Web-based demo interface for interactive testing
- Interactive API documentation (Swagger/OpenAPI 3.0)

### 1.4 Integration Context
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MuleSoft Integration Layer                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  Experience API  │  │   Process API    │  │      System APIs         │   │
│  │  (Mobile/Web)    │──│ (Orchestration)  │──│  ┌────────────────────┐  │   │
│  └──────────────────┘  └──────────────────┘  │  │ Portfolio Mgmt API │  │   │
│                                              │  ├────────────────────┤  │   │
│                                              │  │ Risk Mgmt API ◄────│──│───│
│                                              │  ├────────────────────┤  │   │
│                                              │  │ Core Banking API   │  │   │
│                                              │  └────────────────────┘  │   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Architecture

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│              Risk Management Backend System                  │
│                                                              │
│  ┌──────────────────┐    ┌─────────────────────────────────┐│
│  │   Web UI (Demo)  │    │   Node.js/Express API Server    ││
│  │  Static Files    │───▶│          /api/v1/*              ││
│  │  Port: 3002      │    │          Port: 3002             ││
│  └──────────────────┘    └─────────────────────────────────┘│
│                                       │                      │
│            ┌──────────────────────────┼──────────────────┐  │
│            ▼                          ▼                  ▼  │
│      ┌──────────┐           ┌──────────────┐    ┌───────────┐│
│      │  Risk    │           │   Scoring    │    │ Analytics ││
│      │  Engine  │           │   Engine     │    │  Engine   ││
│      └──────────┘           └──────────────┘    └───────────┘│
│            │                          │                  │   │
│            └──────────────────────────┼──────────────────┘   │
│                                       ▼                      │
│                          ┌──────────────────────────┐       │
│                          │   In-Memory Datastore    │       │
│                          │   (Resets on Restart)    │       │
│                          └──────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js 18+, Express.js |
| Datastore | In-memory JavaScript objects |
| Risk Calculations | Custom JavaScript modules |
| Web UI | Static HTML/CSS/JavaScript |
| API Documentation | Swagger UI, OpenAPI 3.0 |
| Authentication | None (open APIs for demo) |
| Deployment | Heroku |
| Port | 3002 (to avoid conflict with Portfolio System on 3001) |

**Dependencies:**
```javascript
{
  "dependencies": {
    "express": "^4.19.2",
    "uuid": "^10.0.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",              // HTTP request logging
    "swagger-ui-express": "^5.0.1",   // Swagger UI
    "swagger-jsdoc": "^6.2.8",        // OpenAPI spec generation
    "js-yaml": "^4.1.0"               // YAML export
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

**Server Binding:**
```javascript
// Production: Binds to 0.0.0.0 for Heroku
// Development: Binds to 127.0.0.1 for local security
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
```

### 2.3 In-Memory Datastore Structure

```javascript
const datastore = {
  investors: [],              // 50 investors (same as Portfolio customers)
  riskProfiles: [],           // Calculated risk profiles per investor
  riskAssessments: [],        // Questionnaire responses and results
  riskScores: [],             // Point-in-time risk score snapshots
  scenarios: [],              // Predefined stress test scenarios
  recommendations: [],        // Generated investment recommendations
  riskFactors: [],            // Risk factor definitions and weights
  benchmarks: []              // Market benchmarks for comparison
};
```

---

## 3. Data Models

### 3.1 Investors

Aligned with Portfolio Management System customers for demo consistency.

```javascript
{
  "investorId": "INV-001",
  "customerId": "CUST-001",         // Reference to bankingcoredemo/Portfolio system
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@email.com",
  "dateOfBirth": "1975-03-15",
  "age": 49,                         // Calculated field
  "employmentStatus": "EMPLOYED",    // EMPLOYED, SELF_EMPLOYED, RETIRED, UNEMPLOYED
  "annualIncome": 150000,
  "netWorth": 850000,
  "liquidNetWorth": 450000,          // Excludes primary residence
  "investmentExperience": "INTERMEDIATE", // NOVICE, INTERMEDIATE, EXPERIENCED, EXPERT
  "investmentHorizon": "LONG_TERM",  // SHORT_TERM (<3yr), MEDIUM_TERM (3-10yr), LONG_TERM (>10yr)
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Investment Experience Distribution (for seed data):**
- NOVICE: 10 investors
- INTERMEDIATE: 20 investors
- EXPERIENCED: 15 investors
- EXPERT: 5 investors

**Investment Horizon Distribution:**
- SHORT_TERM: 8 investors
- MEDIUM_TERM: 17 investors
- LONG_TERM: 25 investors

### 3.2 Risk Assessments (Questionnaire)

```javascript
{
  "assessmentId": "ASM-001",
  "investorId": "INV-001",
  "assessmentDate": "2024-10-15T10:00:00Z",
  "assessmentType": "COMPREHENSIVE",  // COMPREHENSIVE, QUICK, ANNUAL_REVIEW
  "status": "COMPLETED",              // PENDING, IN_PROGRESS, COMPLETED
  "responses": [
    {
      "questionId": "Q1",
      "questionCategory": "RISK_TOLERANCE",
      "questionText": "If your portfolio lost 20% in a month, what would you do?",
      "selectedOption": "C",
      "optionText": "Hold and wait for recovery",
      "score": 3
    },
    {
      "questionId": "Q2",
      "questionCategory": "TIME_HORIZON",
      "questionText": "When do you expect to need this money?",
      "selectedOption": "D",
      "optionText": "More than 15 years",
      "score": 5
    }
    // ... additional questions
  ],
  "rawScore": 68,                     // Sum of all question scores
  "maxPossibleScore": 100,
  "percentileScore": 68,              // Normalized 0-100
  "createdAt": "2024-10-15T10:00:00Z"
}
```

### 3.3 Risk Profiles

```javascript
{
  "profileId": "PRF-001",
  "investorId": "INV-001",
  "assessmentId": "ASM-001",          // Source assessment
  "profileDate": "2024-10-15T10:00:00Z",
  "isActive": true,                   // Current active profile
  
  // Risk Tolerance Scores (0-100)
  "riskToleranceScore": 65,
  "riskCapacityScore": 72,            // Ability to take risk (financial)
  "riskRequiredScore": 58,            // Risk needed to meet goals
  "compositeRiskScore": 65,           // Weighted combination
  
  // Risk Category
  "riskCategory": "MODERATE",         // CONSERVATIVE, MODERATELY_CONSERVATIVE, 
                                      // MODERATE, MODERATELY_AGGRESSIVE, AGGRESSIVE
  "riskCategoryCode": 3,              // 1-5 numeric
  
  // Behavioral Factors
  "lossAversionScore": 45,            // Sensitivity to losses (higher = more averse)
  "volatilityToleranceScore": 60,     // Comfort with price swings
  "timeHorizonScore": 75,             // Longer horizon = higher score
  
  // Recommended Allocations
  "recommendedAllocation": {
    "equities": 60,
    "fixedIncome": 30,
    "alternatives": 5,
    "cash": 5
  },
  
  // Risk Limits
  "maxDrawdownTolerance": 25,         // Percentage
  "maxVolatilityTolerance": 18,       // Annual standard deviation %
  "maxConcentrationLimit": 25,        // Single position limit %
  
  "validFrom": "2024-10-15T00:00:00Z",
  "validTo": null,                    // Null if current
  "createdAt": "2024-10-15T10:00:00Z",
  "updatedAt": "2024-10-15T10:00:00Z"
}
```

**Risk Category Distribution (seed data):**
- CONSERVATIVE: 8 investors
- MODERATELY_CONSERVATIVE: 12 investors
- MODERATE: 15 investors
- MODERATELY_AGGRESSIVE: 10 investors
- AGGRESSIVE: 5 investors

### 3.4 Risk Scores (Point-in-Time Analysis)

```javascript
{
  "scoreId": "SCR-001",
  "investorId": "INV-001",
  "profileId": "PRF-001",
  "scoreDate": "2024-10-15T16:00:00Z",
  "scoreType": "PORTFOLIO_RISK",       // PORTFOLIO_RISK, CONCENTRATION, SUITABILITY
  
  // Portfolio Risk Metrics (calculated from input portfolio data)
  "portfolioMetrics": {
    "totalValue": 485000.00,
    "volatility": 14.5,               // Annual standard deviation %
    "beta": 1.12,                     // Market sensitivity
    "sharpeRatio": 1.25,              // Risk-adjusted return
    "sortinoRatio": 1.45,             // Downside risk-adjusted
    "treynorRatio": 0.08,             // Beta-adjusted return
    "maxDrawdown": -18.5,             // Worst peak-to-trough %
    "valueAtRisk95": -28500.00,       // 95% VaR (dollar amount)
    "valueAtRisk99": -42750.00,       // 99% VaR (dollar amount)
    "expectedShortfall": -35200.00,   // CVaR / Expected Shortfall
    "trackingError": 3.2              // Deviation from benchmark %
  },
  
  // Concentration Analysis
  "concentrationMetrics": {
    "topHoldingWeight": 22.5,         // Largest single position %
    "top5HoldingsWeight": 58.3,       // Top 5 combined %
    "sectorConcentration": {
      "TECHNOLOGY": 38.5,
      "HEALTHCARE": 15.2,
      "FINANCIAL": 12.8
    },
    "herfindahlIndex": 0.085,         // Concentration measure (0-1)
    "numberOfPositions": 12,
    "concentrationRisk": "ELEVATED"   // LOW, MODERATE, ELEVATED, HIGH
  },
  
  // Risk vs Profile Comparison
  "profileAlignment": {
    "isAligned": false,
    "volatilityVsTarget": 2.5,        // Actual - Target (positive = over)
    "riskLevelMismatch": "OVER",      // UNDER, ALIGNED, OVER
    "alignmentScore": 72,             // 0-100, 100 = perfect alignment
    "alerts": [
      {
        "alertType": "CONCENTRATION",
        "severity": "WARNING",
        "message": "Technology sector allocation exceeds recommended limit"
      },
      {
        "alertType": "VOLATILITY",
        "severity": "INFO",
        "message": "Portfolio volatility slightly above target range"
      }
    ]
  },
  
  "createdAt": "2024-10-15T16:00:00Z"
}
```

### 3.5 Scenarios (Stress Tests)

```javascript
{
  "scenarioId": "SCN-001",
  "scenarioName": "2008 Financial Crisis",
  "scenarioDescription": "Simulates market conditions similar to 2008 financial crisis",
  "scenarioCategory": "HISTORICAL",    // HISTORICAL, HYPOTHETICAL, REGULATORY
  "isActive": true,
  
  "shockParameters": {
    "equityShock": -45,               // Percentage change
    "bondShock": 8,                   // Flight to quality
    "creditSpreadChange": 350,        // Basis points
    "volatilitySpike": 80,            // VIX level
    "correlationShift": 0.85          // Correlation goes to 1
  },
  
  // Sector-specific shocks
  "sectorShocks": {
    "TECHNOLOGY": -50,
    "FINANCIAL": -60,
    "HEALTHCARE": -25,
    "CONSUMER_DISCRETIONARY": -45,
    "CONSUMER_STAPLES": -15,
    "UTILITIES": -10,
    "ENERGY": -35,
    "REAL_ESTATE": -40
  },
  
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Seed Scenarios (10 total):**

| Scenario | Type | Equity Shock |
|----------|------|--------------|
| 2008 Financial Crisis | HISTORICAL | -45% |
| 2020 COVID Crash | HISTORICAL | -34% |
| Dot-Com Bubble (2000) | HISTORICAL | -49% |
| Black Monday (1987) | HISTORICAL | -22% |
| Rising Interest Rates | HYPOTHETICAL | -15% |
| Stagflation | HYPOTHETICAL | -25% |
| Tech Sector Crash | HYPOTHETICAL | -40% (tech -60%) |
| Geopolitical Crisis | HYPOTHETICAL | -20% |
| Mild Recession | REGULATORY | -20% |
| Severe Recession | REGULATORY | -40% |

### 3.6 Recommendations

```javascript
{
  "recommendationId": "REC-001",
  "investorId": "INV-001",
  "profileId": "PRF-001",
  "scoreId": "SCR-001",
  "generatedDate": "2024-10-15T16:30:00Z",
  "status": "ACTIVE",                  // ACTIVE, ACKNOWLEDGED, IMPLEMENTED, DISMISSED
  
  "overallAssessment": {
    "suitabilityScore": 72,           // 0-100
    "suitabilityRating": "SUITABLE_WITH_CAVEATS", 
    // HIGHLY_SUITABLE, SUITABLE, SUITABLE_WITH_CAVEATS, REVIEW_REQUIRED, NOT_SUITABLE
    "summary": "Portfolio is generally aligned with risk profile but shows elevated concentration risk in technology sector."
  },
  
  "recommendations": [
    {
      "recommendationId": "REC-001-A",
      "category": "REBALANCING",
      "priority": "HIGH",
      "title": "Reduce Technology Concentration",
      "description": "Consider reducing technology sector exposure from 38.5% to recommended 25% maximum",
      "currentValue": 38.5,
      "targetValue": 25.0,
      "expectedImpact": {
        "volatilityReduction": 2.1,
        "concentrationImprovement": "HIGH"
      }
    },
    {
      "recommendationId": "REC-001-B",
      "category": "DIVERSIFICATION",
      "priority": "MEDIUM",
      "title": "Increase International Exposure",
      "description": "Adding international diversification could reduce portfolio correlation and improve risk-adjusted returns",
      "currentValue": 5.0,
      "targetValue": 15.0,
      "expectedImpact": {
        "correlationReduction": 0.15,
        "diversificationBenefit": "MODERATE"
      }
    },
    {
      "recommendationId": "REC-001-C",
      "category": "INCOME",
      "priority": "LOW",
      "title": "Consider Dividend-Paying Securities",
      "description": "Given your moderate risk profile, dividend stocks may provide stability and income",
      "currentValue": 8.0,
      "targetValue": 15.0,
      "expectedImpact": {
        "incomeIncrease": 1.2,
        "volatilityReduction": 0.8
      }
    }
  ],
  
  "nextReviewDate": "2025-01-15",
  "createdAt": "2024-10-15T16:30:00Z"
}
```

### 3.7 Risk Factors

```javascript
{
  "factorId": "FAC-001",
  "factorName": "Market Risk",
  "factorCode": "MARKET",
  "factorCategory": "SYSTEMATIC",     // SYSTEMATIC, UNSYSTEMATIC
  "description": "Risk of losses due to overall market movements",
  "defaultWeight": 0.35,              // Weight in risk calculations
  "benchmarkIndex": "SPY",
  "currentLevel": 0.65,               // 0-1 scale, current market risk level
  "historicalAverage": 0.50,
  "isActive": true
}
```

**Seed Risk Factors:**
- Market Risk (SYSTEMATIC)
- Interest Rate Risk (SYSTEMATIC)
- Inflation Risk (SYSTEMATIC)
- Credit Risk (SYSTEMATIC)
- Concentration Risk (UNSYSTEMATIC)
- Liquidity Risk (UNSYSTEMATIC)
- Currency Risk (SYSTEMATIC)
- Sector Risk (UNSYSTEMATIC)
- Volatility Risk (SYSTEMATIC)
- Sequence Risk (UNSYSTEMATIC)

### 3.8 Benchmarks

```javascript
{
  "benchmarkId": "BM-001",
  "benchmarkName": "S&P 500 Total Return",
  "benchmarkSymbol": "SPY",
  "benchmarkType": "EQUITY",          // EQUITY, FIXED_INCOME, BALANCED, CUSTOM
  "annualizedReturn": 10.5,           // Historical %
  "annualizedVolatility": 15.2,       // Historical %
  "sharpeRatio": 0.69,
  "maxDrawdown": -33.8,
  "isDefault": true,
  "isActive": true
}
```

---

## 4. API Specifications

### 4.1 Base URL
```
http://localhost:3002/api/v1
```

### 4.2 Common Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-10-15T10:00:00Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Investor not found"
  },
  "timestamp": "2024-10-15T10:00:00Z"
}
```

### 4.3 Investor APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/investors` | List all investors |
| GET | `/investors/:investorId` | Get investor by ID |
| GET | `/investors/:investorId/profile` | Get investor with active risk profile |
| GET | `/investors/customer/:customerId` | Get investor by customer ID (external reference) |
| POST | `/investors` | Create new investor |
| PUT | `/investors/:investorId` | Update investor |
| DELETE | `/investors/:investorId` | Delete investor |

**GET /investors/:investorId/profile Response:**
```json
{
  "success": true,
  "data": {
    "investor": { ... },
    "riskProfile": {
      "profileId": "PRF-001",
      "riskCategory": "MODERATE",
      "compositeRiskScore": 65,
      "recommendedAllocation": {
        "equities": 60,
        "fixedIncome": 30,
        "alternatives": 5,
        "cash": 5
      },
      "maxDrawdownTolerance": 25,
      "maxVolatilityTolerance": 18,
      "lastAssessmentDate": "2024-10-15T10:00:00Z"
    }
  }
}
```

### 4.4 Risk Assessment APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assessments` | List all assessments |
| GET | `/assessments/:assessmentId` | Get assessment by ID |
| GET | `/investors/:investorId/assessments` | Get assessments for investor |
| POST | `/assessments` | Create/submit new assessment |
| POST | `/assessments/score` | Score an assessment (calculate results) |

**POST /assessments Request (Submit Questionnaire):**
```json
{
  "investorId": "INV-001",
  "assessmentType": "COMPREHENSIVE",
  "responses": [
    { "questionId": "Q1", "selectedOption": "C" },
    { "questionId": "Q2", "selectedOption": "D" },
    { "questionId": "Q3", "selectedOption": "B" }
    // ... all question responses
  ]
}
```

**POST /assessments Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "ASM-001",
    "status": "COMPLETED",
    "rawScore": 68,
    "percentileScore": 68,
    "riskProfile": {
      "profileId": "PRF-001",
      "riskCategory": "MODERATE",
      "compositeRiskScore": 65
    }
  }
}
```

### 4.5 Risk Profile APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles` | List all risk profiles |
| GET | `/profiles/:profileId` | Get profile by ID |
| GET | `/investors/:investorId/profiles` | Get all profiles for investor |
| GET | `/investors/:investorId/profiles/active` | Get active profile for investor |
| POST | `/profiles` | Create profile (admin override) |
| PUT | `/profiles/:profileId` | Update profile |

**GET /investors/:investorId/profiles/active Response:**
```json
{
  "success": true,
  "data": {
    "profileId": "PRF-001",
    "investorId": "INV-001",
    "riskCategory": "MODERATE",
    "riskCategoryCode": 3,
    "compositeRiskScore": 65,
    "riskToleranceScore": 65,
    "riskCapacityScore": 72,
    "recommendedAllocation": {
      "equities": 60,
      "fixedIncome": 30,
      "alternatives": 5,
      "cash": 5
    },
    "riskLimits": {
      "maxDrawdownTolerance": 25,
      "maxVolatilityTolerance": 18,
      "maxConcentrationLimit": 25
    },
    "validFrom": "2024-10-15T00:00:00Z",
    "isActive": true
  }
}
```

### 4.6 Risk Analysis APIs (Core Calculation Endpoints)

These are the primary endpoints for analyzing portfolio risk. They accept portfolio data as input and return risk calculations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analysis/portfolio-risk` | Calculate portfolio risk metrics |
| POST | `/analysis/concentration` | Analyze concentration risk |
| POST | `/analysis/suitability` | Check portfolio suitability vs profile |
| POST | `/analysis/stress-test` | Run stress test scenario |
| POST | `/analysis/comprehensive` | Full risk analysis (all metrics) |

**POST /analysis/portfolio-risk Request:**
```json
{
  "investorId": "INV-001",
  "portfolioData": {
    "totalValue": 485000.00,
    "holdings": [
      {
        "symbol": "AAPL",
        "securityType": "STOCK",
        "sector": "TECHNOLOGY",
        "quantity": 200,
        "marketValue": 35700.00,
        "weight": 7.36,
        "beta": 1.25,
        "annualizedVolatility": 28.5
      },
      {
        "symbol": "MSFT",
        "securityType": "STOCK",
        "sector": "TECHNOLOGY",
        "quantity": 150,
        "marketValue": 63000.00,
        "weight": 13.0,
        "beta": 1.15,
        "annualizedVolatility": 25.2
      }
      // ... additional holdings
    ],
    "cashPosition": 15000.00,
    "assetAllocation": {
      "STOCK": 70.0,
      "BOND": 18.0,
      "ETF": 8.0,
      "CASH": 4.0
    }
  },
  "benchmarkSymbol": "SPY",
  "analysisDate": "2024-10-15"
}
```

**POST /analysis/portfolio-risk Response:**
```json
{
  "success": true,
  "data": {
    "investorId": "INV-001",
    "analysisDate": "2024-10-15T16:00:00Z",
    "portfolioMetrics": {
      "totalValue": 485000.00,
      "portfolioVolatility": 14.5,
      "portfolioBeta": 1.12,
      "sharpeRatio": 1.25,
      "sortinoRatio": 1.45,
      "treynorRatio": 0.08,
      "informationRatio": 0.42,
      "maxDrawdown": -18.5,
      "valueAtRisk": {
        "var95_percent": -5.88,
        "var95_dollar": -28500.00,
        "var99_percent": -8.81,
        "var99_dollar": -42750.00,
        "timeHorizon": "1_MONTH"
      },
      "expectedShortfall": {
        "es95_dollar": -35200.00,
        "es99_dollar": -48500.00
      },
      "trackingError": 3.2,
      "rSquared": 0.89
    },
    "riskDecomposition": {
      "systematicRisk": 68.5,
      "unsystematicRisk": 31.5,
      "topRiskContributors": [
        { "symbol": "AAPL", "riskContribution": 15.2 },
        { "symbol": "MSFT", "riskContribution": 12.8 },
        { "symbol": "NVDA", "riskContribution": 11.5 }
      ]
    },
    "benchmark": {
      "symbol": "SPY",
      "benchmarkReturn": 10.5,
      "portfolioReturn": 12.8,
      "alpha": 2.3,
      "benchmarkVolatility": 15.2
    }
  }
}
```

**POST /analysis/concentration Request:**
```json
{
  "investorId": "INV-001",
  "holdings": [
    { "symbol": "AAPL", "sector": "TECHNOLOGY", "weight": 22.5 },
    { "symbol": "MSFT", "sector": "TECHNOLOGY", "weight": 18.2 },
    { "symbol": "GOOGL", "sector": "TECHNOLOGY", "weight": 12.1 }
    // ... all holdings with weights
  ],
  "thresholds": {
    "singlePositionLimit": 10,
    "sectorLimit": 25,
    "top5Limit": 50
  }
}
```

**POST /analysis/concentration Response:**
```json
{
  "success": true,
  "data": {
    "concentrationAnalysis": {
      "singlePosition": {
        "topHolding": "AAPL",
        "topHoldingWeight": 22.5,
        "limit": 10,
        "status": "BREACHED",
        "breach": 12.5
      },
      "sectorConcentration": {
        "topSector": "TECHNOLOGY",
        "topSectorWeight": 52.8,
        "limit": 25,
        "status": "BREACHED",
        "breach": 27.8,
        "sectorBreakdown": {
          "TECHNOLOGY": 52.8,
          "HEALTHCARE": 15.2,
          "FINANCIAL": 12.0,
          "OTHER": 20.0
        }
      },
      "top5Concentration": {
        "top5Weight": 65.3,
        "limit": 50,
        "status": "BREACHED",
        "breach": 15.3
      },
      "herfindahlIndex": 0.125,
      "effectivePositions": 8.0,
      "overallConcentrationRisk": "HIGH"
    },
    "alerts": [
      {
        "alertType": "SINGLE_POSITION",
        "severity": "HIGH",
        "symbol": "AAPL",
        "message": "AAPL position (22.5%) exceeds 10% single position limit"
      },
      {
        "alertType": "SECTOR",
        "severity": "HIGH",
        "sector": "TECHNOLOGY",
        "message": "Technology sector (52.8%) exceeds 25% sector limit"
      }
    ]
  }
}
```

**POST /analysis/suitability Request:**
```json
{
  "investorId": "INV-001",
  "portfolioData": {
    "totalValue": 485000.00,
    "portfolioVolatility": 14.5,
    "portfolioBeta": 1.12,
    "maxDrawdown": -18.5,
    "assetAllocation": {
      "equities": 70,
      "fixedIncome": 18,
      "alternatives": 4,
      "cash": 8
    },
    "topHoldingWeight": 22.5,
    "sectorConcentration": {
      "TECHNOLOGY": 52.8
    }
  }
}
```

**POST /analysis/suitability Response:**
```json
{
  "success": true,
  "data": {
    "suitabilityAssessment": {
      "overallRating": "SUITABLE_WITH_CAVEATS",
      "overallScore": 68,
      "recommendation": "Portfolio is generally suitable but requires attention to concentration risk",
      "dimensions": {
        "riskAlignment": {
          "score": 75,
          "status": "ALIGNED",
          "detail": "Portfolio volatility within acceptable range for risk profile"
        },
        "allocationAlignment": {
          "score": 72,
          "status": "MINOR_DEVIATION",
          "detail": "Equity allocation 10% above recommended level",
          "actual": { "equities": 70, "fixedIncome": 18 },
          "recommended": { "equities": 60, "fixedIncome": 30 }
        },
        "concentrationCompliance": {
          "score": 45,
          "status": "NON_COMPLIANT",
          "detail": "Multiple concentration limits breached"
        },
        "timeHorizonFit": {
          "score": 85,
          "status": "ALIGNED",
          "detail": "Portfolio composition appropriate for long-term horizon"
        }
      }
    },
    "riskProfile": {
      "profileId": "PRF-001",
      "riskCategory": "MODERATE",
      "maxVolatilityTolerance": 18,
      "maxDrawdownTolerance": 25
    },
    "actionRequired": true,
    "requiredActions": [
      "Address concentration risk in Technology sector",
      "Reduce single position exposure in AAPL"
    ]
  }
}
```

**POST /analysis/stress-test Request:**
```json
{
  "investorId": "INV-001",
  "scenarioId": "SCN-001",           // Or scenarioIds for multiple
  "portfolioData": {
    "totalValue": 485000.00,
    "holdings": [
      {
        "symbol": "AAPL",
        "sector": "TECHNOLOGY",
        "marketValue": 109225.00,
        "weight": 22.5
      }
      // ... all holdings
    ]
  }
}
```

**POST /analysis/stress-test Response:**
```json
{
  "success": true,
  "data": {
    "scenarioResults": {
      "scenarioId": "SCN-001",
      "scenarioName": "2008 Financial Crisis",
      "portfolioImpact": {
        "currentValue": 485000.00,
        "stressedValue": 290000.00,
        "dollarLoss": -195000.00,
        "percentageLoss": -40.21,
        "recoveryTime": "24-36 months (estimated)"
      },
      "holdingImpacts": [
        {
          "symbol": "AAPL",
          "currentValue": 109225.00,
          "stressedValue": 54612.50,
          "loss": -54612.50,
          "lossPercent": -50.0,
          "sectorShock": "TECHNOLOGY"
        }
        // ... all holdings
      ],
      "worstHit": [
        { "symbol": "JPM", "lossPercent": -60.0 },
        { "symbol": "AAPL", "lossPercent": -50.0 },
        { "symbol": "MSFT", "lossPercent": -50.0 }
      ],
      "bestProtected": [
        { "symbol": "BND", "lossPercent": 8.0 },
        { "symbol": "JNJ", "lossPercent": -15.0 }
      ]
    },
    "riskProfileComparison": {
      "maxDrawdownTolerance": 25,
      "scenarioDrawdown": 40.21,
      "exceedsToleranceBy": 15.21,
      "warning": "Scenario loss exceeds investor's stated maximum drawdown tolerance"
    }
  }
}
```

**POST /analysis/comprehensive Request:**
```json
{
  "investorId": "INV-001",
  "portfolioData": { ... },
  "includeStressTests": true,
  "scenarioIds": ["SCN-001", "SCN-002", "SCN-005"],
  "benchmarkSymbol": "SPY"
}
```

**POST /analysis/comprehensive Response:**
```json
{
  "success": true,
  "data": {
    "investorId": "INV-001",
    "analysisTimestamp": "2024-10-15T16:00:00Z",
    "portfolioRisk": { ... },         // Full portfolio-risk response
    "concentrationAnalysis": { ... }, // Full concentration response
    "suitabilityAssessment": { ... }, // Full suitability response
    "stressTestResults": [ ... ],     // Array of stress test results
    "recommendations": [ ... ],       // Generated recommendations
    "executiveSummary": {
      "overallRiskLevel": "MODERATE_HIGH",
      "keyFindings": [
        "Portfolio volatility (14.5%) is within acceptable range",
        "Significant concentration risk in Technology sector (52.8%)",
        "Single position limit breached for AAPL (22.5%)",
        "Stress scenarios indicate potential losses exceeding stated tolerance"
      ],
      "priorityActions": [
        "Reduce Technology exposure by reallocating ~27% to other sectors",
        "Trim AAPL position to below 10%",
        "Consider adding defensive positions for downside protection"
      ],
      "nextReviewDate": "2025-01-15"
    }
  }
}
```

### 4.7 Risk Score APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scores` | List all risk scores |
| GET | `/scores/:scoreId` | Get score by ID |
| GET | `/investors/:investorId/scores` | Get all scores for investor |
| GET | `/investors/:investorId/scores/latest` | Get latest score for investor |
| POST | `/scores` | Create risk score (from analysis) |

### 4.8 Scenario APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scenarios` | List all scenarios |
| GET | `/scenarios/:scenarioId` | Get scenario by ID |
| GET | `/scenarios/category/:category` | Get scenarios by category |
| POST | `/scenarios` | Create custom scenario |
| PUT | `/scenarios/:scenarioId` | Update scenario |
| DELETE | `/scenarios/:scenarioId` | Delete scenario |

### 4.9 Recommendation APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations` | List all recommendations |
| GET | `/recommendations/:recommendationId` | Get recommendation by ID |
| GET | `/investors/:investorId/recommendations` | Get recommendations for investor |
| GET | `/investors/:investorId/recommendations/active` | Get active recommendations |
| PUT | `/recommendations/:recommendationId/status` | Update recommendation status |

**PUT /recommendations/:recommendationId/status Request:**
```json
{
  "status": "ACKNOWLEDGED",
  "notes": "Client acknowledged during quarterly review"
}
```

### 4.10 Reference Data APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/questionnaire` | Get risk assessment questionnaire |
| GET | `/questionnaire/:type` | Get questionnaire by type |
| GET | `/risk-factors` | Get all risk factors |
| GET | `/benchmarks` | Get all benchmarks |
| GET | `/risk-categories` | Get risk category definitions |

**GET /questionnaire Response:**
```json
{
  "success": true,
  "data": {
    "questionnaireType": "COMPREHENSIVE",
    "totalQuestions": 15,
    "estimatedTime": "5-10 minutes",
    "categories": ["RISK_TOLERANCE", "TIME_HORIZON", "FINANCIAL_SITUATION", "INVESTMENT_KNOWLEDGE"],
    "questions": [
      {
        "questionId": "Q1",
        "questionNumber": 1,
        "category": "RISK_TOLERANCE",
        "questionText": "If your portfolio lost 20% of its value in a month, what would you most likely do?",
        "options": [
          { "optionId": "A", "text": "Sell everything to prevent further losses", "score": 1 },
          { "optionId": "B", "text": "Sell some positions to reduce risk", "score": 2 },
          { "optionId": "C", "text": "Hold and wait for recovery", "score": 3 },
          { "optionId": "D", "text": "Buy more at lower prices", "score": 4 },
          { "optionId": "E", "text": "Significantly increase positions", "score": 5 }
        ]
      }
      // ... additional questions
    ],
    "scoringGuide": {
      "15-30": { "category": "CONSERVATIVE", "code": 1 },
      "31-45": { "category": "MODERATELY_CONSERVATIVE", "code": 2 },
      "46-55": { "category": "MODERATE", "code": 3 },
      "56-65": { "category": "MODERATELY_AGGRESSIVE", "code": 4 },
      "66-75": { "category": "AGGRESSIVE", "code": 5 }
    }
  }
}
```

**GET /risk-categories Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "code": 1,
        "name": "CONSERVATIVE",
        "description": "Prioritizes capital preservation with minimal risk tolerance",
        "scoreRange": { "min": 0, "max": 30 },
        "typicalAllocation": {
          "equities": 20,
          "fixedIncome": 60,
          "alternatives": 5,
          "cash": 15
        },
        "typicalVolatility": { "min": 4, "max": 8 },
        "maxDrawdownTolerance": 10
      },
      {
        "code": 2,
        "name": "MODERATELY_CONSERVATIVE",
        "description": "Seeks stability with modest growth potential",
        "scoreRange": { "min": 31, "max": 45 },
        "typicalAllocation": {
          "equities": 40,
          "fixedIncome": 45,
          "alternatives": 5,
          "cash": 10
        },
        "typicalVolatility": { "min": 6, "max": 12 },
        "maxDrawdownTolerance": 15
      },
      {
        "code": 3,
        "name": "MODERATE",
        "description": "Balanced approach between growth and stability",
        "scoreRange": { "min": 46, "max": 55 },
        "typicalAllocation": {
          "equities": 60,
          "fixedIncome": 30,
          "alternatives": 5,
          "cash": 5
        },
        "typicalVolatility": { "min": 10, "max": 18 },
        "maxDrawdownTolerance": 25
      },
      {
        "code": 4,
        "name": "MODERATELY_AGGRESSIVE",
        "description": "Growth-oriented with higher risk tolerance",
        "scoreRange": { "min": 56, "max": 65 },
        "typicalAllocation": {
          "equities": 75,
          "fixedIncome": 15,
          "alternatives": 7,
          "cash": 3
        },
        "typicalVolatility": { "min": 14, "max": 22 },
        "maxDrawdownTolerance": 35
      },
      {
        "code": 5,
        "name": "AGGRESSIVE",
        "description": "Maximum growth with high volatility tolerance",
        "scoreRange": { "min": 66, "max": 100 },
        "typicalAllocation": {
          "equities": 90,
          "fixedIncome": 5,
          "alternatives": 3,
          "cash": 2
        },
        "typicalVolatility": { "min": 18, "max": 30 },
        "maxDrawdownTolerance": 50
      }
    ]
  }
}
```

### 4.11 Health Check API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health check |

**GET /health Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "risk-management-system",
    "version": "1.0.0",
    "uptime": 3600,
    "datastore": {
      "investors": 50,
      "profiles": 50,
      "scenarios": 10
    }
  }
}
```

### 4.12 API Documentation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api-docs` | Interactive Swagger UI documentation |
| GET | `/openapi.json` | OpenAPI 3.0 specification (JSON) |
| GET | `/openapi.yaml` | OpenAPI 3.0 specification (YAML) |

These endpoints enable:
- Postman/Insomnia import via JSON spec
- MuleSoft Design Center import via YAML spec
- Client code generation using OpenAPI Generator
- Interactive "Try It Out" functionality for all endpoints

### 4.13 Web UI Pages

The system includes a demo Web UI for interactive testing and demonstrations.

| Page | URL Path | Description |
|------|----------|-------------|
| Dashboard | `/` | System overview, health status, investor statistics |
| Investors | `/investors.html` | Browse/search all 50 investors, view risk profiles |
| Risk Analyzer | `/analyzer.html` | Interactive portfolio risk calculator |
| Scenarios | `/scenarios.html` | Browse and view stress test scenarios |

**Dashboard Features:**
- System health indicator
- Total investor count and profile distribution
- Quick links to API documentation
- Recent activity summary

**Investors Page Features:**
- Searchable investor list
- Filter by risk category
- Click to view detailed risk profile modal
- View recommended allocations and risk limits

**Risk Analyzer Features:**
- Input portfolio holdings (symbol, sector, weight)
- Calculate portfolio risk metrics
- View VaR, Sharpe ratio, beta
- Concentration analysis with breach detection

**Scenarios Page Features:**
- Browse all 10 stress test scenarios
- View scenario parameters and sector shocks
- Historical vs hypothetical scenario comparison

---

## 5. Risk Calculation Formulas

### 5.1 Portfolio Risk Metrics

**Portfolio Volatility (Standard Deviation):**
```
σp = √(Σ wi² * σi² + Σ Σ wi * wj * σi * σj * ρij)
where:
  wi, wj = weights of assets i and j
  σi, σj = standard deviations of assets i and j
  ρij = correlation between assets i and j
```

**Portfolio Beta:**
```
βp = Σ wi * βi
where:
  wi = weight of asset i
  βi = beta of asset i
```

**Value at Risk (VaR) - Parametric:**
```
VaR95 = Portfolio Value * (μ - 1.645 * σ)
VaR99 = Portfolio Value * (μ - 2.326 * σ)
where:
  μ = expected return (assumed 0 for short-term)
  σ = portfolio volatility
```

**Sharpe Ratio:**
```
Sharpe = (Rp - Rf) / σp
where:
  Rp = portfolio return
  Rf = risk-free rate
  σp = portfolio standard deviation
```

**Sortino Ratio:**
```
Sortino = (Rp - Rf) / σd
where:
  σd = downside deviation (only negative returns)
```

**Treynor Ratio:**
```
Treynor = (Rp - Rf) / βp
```

**Herfindahl Index (Concentration):**
```
H = Σ wi²
where wi = weight of position i
Effective Positions = 1 / H
```

### 5.2 Simplified Calculations for Demo

For the demo system, we'll use simplified versions with pre-defined security characteristics:

```javascript
// Simplified beta values per security type
const typicalBetas = {
  'STOCK_TECH': 1.25,
  'STOCK_FINANCIAL': 1.15,
  'STOCK_HEALTHCARE': 0.85,
  'STOCK_CONSUMER': 1.05,
  'STOCK_UTILITIES': 0.60,
  'BOND': 0.10,
  'ETF_BROAD': 1.00,
  'ETF_SECTOR': 1.20
};

// Simplified volatility values (annual %)
const typicalVolatility = {
  'STOCK_TECH': 28,
  'STOCK_FINANCIAL': 22,
  'STOCK_HEALTHCARE': 18,
  'STOCK_CONSUMER': 20,
  'STOCK_UTILITIES': 14,
  'BOND': 6,
  'ETF_BROAD': 15,
  'ETF_SECTOR': 22
};
```

---

## 6. Seed Data Requirements

### 6.1 Investors
- Load exact 50 customers from bankingcoredemo (same as Portfolio system)
- Assign additional investor-specific attributes:
  - Employment status, annual income, net worth
  - Investment experience level
  - Investment horizon

### 6.2 Risk Profiles
- Generate one active risk profile per investor
- Distribute across 5 risk categories per distribution above
- Include realistic scores and recommended allocations

### 6.3 Risk Assessments
- Generate one completed assessment per investor
- Include realistic questionnaire responses
- Scores should align with resulting risk profiles

### 6.4 Scenarios
- Pre-load 10 stress test scenarios (historical and hypothetical)
- Include sector-specific shock parameters

### 6.5 Risk Factors
- Pre-load 10 risk factors with descriptions and weights

### 6.6 Benchmarks
- Pre-load 5 common benchmarks:
  - S&P 500 Total Return (SPY)
  - Bloomberg US Aggregate Bond (AGG)
  - MSCI World Index
  - Bloomberg Commodity Index
  - 60/40 Balanced Portfolio

---

## 7. Project Structure

```
risk-management-system/
├── package.json                    # Root package.json
├── package-lock.json
├── Procfile                        # Heroku process definition
├── Dockerfile
├── .gitignore
├── README.md
├── QUICKSTART.md                   # Quick setup guide
├── IMPLEMENTATION_SUMMARY.md       # Architecture overview
├── WEB_UI_GUIDE.md                 # Web UI documentation
├── PRD_UPDATE_NOTES.md             # Implementation change log
│
├── public/                         # Web UI assets
│   ├── index.html                  # Dashboard page
│   ├── investors.html              # Investor browser
│   ├── analyzer.html               # Portfolio analyzer
│   ├── scenarios.html              # Scenario viewer
│   ├── css/
│   │   └── styles.css              # Complete styling
│   ├── js/
│   │   ├── main.js                 # Common utilities
│   │   ├── dashboard.js            # Dashboard logic
│   │   ├── investors.js            # Investor page logic
│   │   ├── analyzer.js             # Analyzer logic
│   │   └── scenarios.js            # Scenario logic
│   └── images/
│
├── docs/
│   ├── API.md                      # API documentation
│   ├── OAS_README.md               # OpenAPI usage guide
│   ├── openapi.json                # OpenAPI spec (JSON)
│   └── openapi.yaml                # OpenAPI spec (YAML)
│
└── server/
    ├── index.js                    # Express server entry
    ├── datastore.js                # In-memory data store
    ├── seed.js                     # Seed data loader
    ├── swagger.js                  # Swagger configuration
    ├── routes/
    │   ├── health.js
    │   ├── reference.js            # Questionnaire, factors, benchmarks
    │   ├── investors.js
    │   ├── assessments.js
    │   ├── profiles.js
    │   ├── scores.js
    │   ├── scenarios.js
    │   ├── recommendations.js
    │   └── analysis.js             # Core risk analysis endpoints
    ├── services/
    │   ├── riskEngine.js           # Portfolio risk calculations
    │   ├── scoringEngine.js        # Assessment scoring
    │   ├── concentrationService.js # Concentration analysis
    │   ├── suitabilityService.js   # Suitability checks
    │   ├── stressTestService.js    # Scenario analysis
    │   └── recommendationService.js # Generate recommendations
    ├── utils/
    │   └── response.js             # Response formatting utilities
    └── data/
        ├── customers.json          # 50 customers from bankingcoredemo
        ├── questionnaire.json      # Risk assessment questions
        ├── scenarios.json          # Stress test scenarios
        ├── riskFactors.json        # Risk factor definitions
        └── benchmarks.json         # Benchmark data
```

---

## 8. Build Instructions for Cursor

### 8.1 Prerequisites
- Node.js 18+
- npm or yarn

### 8.2 Git Workflow

**CRITICAL: Do NOT commit directly to main branch**

```bash
# Clone the repo (or create new)
git clone <repo-url>
cd risk-management-system

# Pull latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/initial-build

# ... do all work on feature branch ...

# When complete, push for review
git push origin feature/initial-build

# Create Pull Request for review
# Only merge to main after review and approval
```

### 8.3 Implementation Order

**Phase 1: Backend Foundation**
1. Initialize Node.js project with Express
2. Create datastore.js with in-memory structure
3. Create seed.js with all seed data
4. Implement health endpoint
5. Test with Postman/curl

**Phase 2: Reference Data APIs**
1. Implement questionnaire route
2. Implement risk-factors route
3. Implement benchmarks route
4. Implement risk-categories route
5. Test all endpoints

**Phase 3: Core Entity APIs**
1. Implement investor routes with CRUD
2. Implement assessment routes
3. Implement profile routes
4. Implement score routes
5. Implement scenario routes
6. Implement recommendation routes
7. Test all endpoints

**Phase 4: Risk Engines**
1. Create riskEngine.js for portfolio calculations
2. Create scoringEngine.js for questionnaire scoring
3. Create concentrationService.js
4. Create suitabilityService.js
5. Create stressTestService.js
6. Create recommendationService.js
7. Unit test all calculations

**Phase 5: Analysis APIs**
1. Implement POST /analysis/portfolio-risk
2. Implement POST /analysis/concentration
3. Implement POST /analysis/suitability
4. Implement POST /analysis/stress-test
5. Implement POST /analysis/comprehensive
6. Integration test all analysis endpoints

**Phase 6: Polish**
1. Add input validation
2. Add comprehensive error handling
3. Add request logging
4. Test all edge cases
5. Update documentation

### 8.4 Running Locally

```bash
cd server
npm install
npm run dev    # Runs on port 3002
```

### 8.5 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

WORKDIR /app/server

EXPOSE 3002

ENV PORT=3002

CMD ["node", "index.js"]
```

---

## 9. Deployment

### 9.1 Heroku Deployment

**Production Environment:**

| Resource | URL |
|----------|-----|
| Web UI | https://risk-management-system-f04b786dc797.herokuapp.com/ |
| API Base | https://risk-management-system-f04b786dc797.herokuapp.com/api/v1 |
| API Docs | https://risk-management-system-f04b786dc797.herokuapp.com/api-docs |
| Health Check | https://risk-management-system-f04b786dc797.herokuapp.com/api/v1/health |
| OpenAPI JSON | https://risk-management-system-f04b786dc797.herokuapp.com/openapi.json |
| OpenAPI YAML | https://risk-management-system-f04b786dc797.herokuapp.com/openapi.yaml |
| GitHub | https://github.com/hrothstein/RiskManagement |

Note: No database addon needed - data is in-memory and resets on dyno restart.

### 9.2 Environment Variables

```bash
NODE_ENV=production
PORT=3002
BASE_URL=https://risk-management-system-f04b786dc797.herokuapp.com
API_BASE_URL=/api/v1
```

### 9.3 Local Development URLs

| Resource | URL |
|----------|-----|
| Web UI | http://localhost:3002/ |
| API Base | http://localhost:3002/api/v1 |
| API Docs | http://localhost:3002/api-docs |
| Health Check | http://localhost:3002/api/v1/health |

---

## 10. Demo Scenarios

### 10.1 MuleSoft Integration Demo Points

**Scenario 1: New Investor Onboarding Flow**
1. MuleSoft Process API receives new client from Salesforce FSC
2. Call `POST /investors` to create investor record
3. Return questionnaire via `GET /questionnaire`
4. Submit responses via `POST /assessments`
5. Retrieve generated profile via `GET /investors/:id/profiles/active`
6. Store profile back in Salesforce FSC

**Scenario 2: Portfolio Risk Assessment**
1. MuleSoft Process API aggregates portfolio from Portfolio Management System
2. Call `POST /analysis/comprehensive` with portfolio data
3. Return risk metrics and recommendations to Experience API
4. Display in mobile app or advisor console

**Scenario 3: Suitability Check Before Trade**
1. Advisor proposes trade in wealth management system
2. MuleSoft Process API calculates new portfolio composition
3. Call `POST /analysis/suitability` with proposed portfolio
4. Return suitability rating and any compliance alerts
5. Block trade if NOT_SUITABLE, allow with warning if SUITABLE_WITH_CAVEATS

**Scenario 4: Stress Test During Market Volatility**
1. Market volatility trigger detected
2. MuleSoft Process API retrieves all client portfolios
3. Call `POST /analysis/stress-test` for each portfolio
4. Aggregate results and identify at-risk clients
5. Generate proactive advisor notifications

**Scenario 5: Quarterly Review Preparation**
1. Scheduled job triggers quarterly review process
2. For each investor, call `POST /analysis/comprehensive`
3. Compare current vs previous quarter risk scores
4. Generate recommendations report
5. Push to Salesforce FSC for advisor action

### 10.2 API Chaining Examples

**Simple Risk Check:**
```
MuleSoft → GET /investors/:customerId/profile
        → Returns risk profile with limits
```

**Full Risk Analysis:**
```
MuleSoft → GET /investors/:customerId/profile
        → POST /analysis/portfolio-risk (with Portfolio API data)
        → POST /analysis/concentration
        → POST /analysis/suitability
        → Returns composite risk assessment
```

**What-If Analysis:**
```
MuleSoft → POST /analysis/stress-test (with scenarioId: "SCN-001")
        → POST /analysis/stress-test (with scenarioId: "SCN-002")
        → Compare and return worst-case scenario impact
```

---

## 11. Future Enhancements (Out of Scope for MVP)

- MCP integration for AI agent interactions
- Real-time market data integration for dynamic VaR
- Monte Carlo simulation for VaR
- Factor-based risk decomposition (Fama-French)
- Liquidity risk scoring
- ESG risk factors
- Tax-lot optimization recommendations
- Multi-currency risk analysis
- Options/derivatives risk (Greeks)
- Regulatory capital calculations
- Historical performance tracking
- Goal-based risk assessment
- Client household-level risk aggregation

---

## 12. Acceptance Criteria

### 12.1 Reference Data
- [x] Questionnaire endpoint returns complete 15-question assessment
- [x] Risk categories endpoint returns all 5 categories with allocations
- [x] Risk factors endpoint returns all 10 factors
- [x] Benchmarks endpoint returns all 5 benchmarks
- [x] Health endpoint returns correct status

### 12.2 Entity APIs
- [x] All CRUD operations working for investors
- [x] Assessments can be created and scored
- [x] Profiles are generated from assessments
- [x] Scores are recorded from analysis
- [x] Scenarios can be retrieved and modified
- [x] Recommendations can be updated

### 12.3 Analysis APIs
- [x] Portfolio risk endpoint calculates all metrics correctly
- [x] Concentration endpoint identifies all limit breaches
- [x] Suitability endpoint compares portfolio vs profile correctly
- [x] Stress test endpoint applies scenario shocks correctly
- [x] Comprehensive endpoint aggregates all analyses

### 12.4 Risk Engine Calculations
- [x] Portfolio volatility calculation accurate
- [x] Beta calculation accurate
- [x] VaR calculations accurate (95% and 99%)
- [x] Sharpe ratio calculation accurate
- [x] Herfindahl index calculation accurate
- [x] Stress test impact calculations accurate

### 12.5 Seed Data
- [x] 50 investors loaded matching Portfolio system customers
- [x] 50 risk profiles generated
- [x] 50 assessments with responses
- [x] 10 scenarios loaded
- [x] All reference data loaded

### 12.6 Deployment
- [x] Docker build succeeds
- [x] Heroku deployment works on port 3002
- [x] Data resets cleanly on restart
- [x] All endpoints accessible externally

### 12.7 Web UI
- [x] Dashboard displays system health and statistics
- [x] Investors page lists all 50 investors with search/filter
- [x] Investor detail modal shows complete profile
- [x] Risk Analyzer accepts portfolio input and returns analysis
- [x] Scenarios page displays all 10 stress test scenarios
- [x] All pages are responsive and mobile-friendly

### 12.8 API Documentation
- [x] Swagger UI accessible at /api-docs
- [x] OpenAPI JSON spec downloadable at /openapi.json
- [x] OpenAPI YAML spec downloadable at /openapi.yaml
- [x] All endpoints documented with request/response schemas
- [x] "Try It Out" functionality works for all endpoints

---

## 13. Questionnaire Questions (Seed Data)

### Risk Assessment Questionnaire (15 Questions)

**Category: RISK_TOLERANCE (5 questions)**

**Q1:** If your portfolio lost 20% of its value in a month, what would you most likely do?
- A: Sell everything to prevent further losses (1)
- B: Sell some positions to reduce risk (2)
- C: Hold and wait for recovery (3)
- D: Buy more at lower prices (4)
- E: Significantly increase positions (5)

**Q2:** Which statement best describes your comfort with investment volatility?
- A: I cannot tolerate any loss of principal (1)
- B: I can tolerate small fluctuations (up to 5%) (2)
- C: I can tolerate moderate fluctuations (up to 15%) (3)
- D: I can tolerate significant fluctuations (up to 25%) (4)
- E: I can tolerate extreme fluctuations (more than 25%) (5)

**Q3:** How would you describe your primary investment approach?
- A: Preserve capital at all costs (1)
- B: Generate steady income with minimal risk (2)
- C: Balance between growth and stability (3)
- D: Maximize long-term growth accepting short-term volatility (4)
- E: Pursue aggressive growth regardless of volatility (5)

**Q4:** When you hear about a market correction, your first reaction is:
- A: Panic and consider selling immediately (1)
- B: Worry and monitor closely (2)
- C: Accept it as normal market behavior (3)
- D: See it as a potential buying opportunity (4)
- E: Get excited about discounted prices (5)

**Q5:** What is the maximum annual loss you could accept without changing your strategy?
- A: 0% - I cannot accept any loss (1)
- B: Up to 5% (2)
- C: Up to 15% (3)
- D: Up to 25% (4)
- E: More than 25% (5)

**Category: TIME_HORIZON (3 questions)**

**Q6:** When do you expect to need to withdraw a significant portion (>25%) of this investment?
- A: Within 1 year (1)
- B: 1-3 years (2)
- C: 3-7 years (3)
- D: 7-15 years (4)
- E: More than 15 years (5)

**Q7:** What is your primary investment goal?
- A: Emergency fund / near-term purchase (1)
- B: Income generation for current expenses (2)
- C: Major purchase in 5-10 years (3)
- D: Retirement (10+ years away) (4)
- E: Wealth building for next generation (5)

**Q8:** How stable is your current income and employment?
- A: Very unstable / approaching retirement (1)
- B: Somewhat unstable (2)
- C: Moderately stable (3)
- D: Stable with growth potential (4)
- E: Very stable with high growth potential (5)

**Category: FINANCIAL_SITUATION (4 questions)**

**Q9:** What percentage of your total investable assets does this portfolio represent?
- A: More than 75% (1)
- B: 50-75% (2)
- C: 25-50% (3)
- D: 10-25% (4)
- E: Less than 10% (5)

**Q10:** How many months of expenses do you have in emergency savings (outside this portfolio)?
- A: Less than 1 month (1)
- B: 1-3 months (2)
- C: 3-6 months (3)
- D: 6-12 months (4)
- E: More than 12 months (5)

**Q11:** What is your current debt-to-income ratio?
- A: High (debt payments > 40% of income) (1)
- B: Moderate-High (30-40%) (2)
- C: Moderate (20-30%) (3)
- D: Low (10-20%) (4)
- E: Very low or no debt (<10%) (5)

**Q12:** How dependent are you on investment income for living expenses?
- A: Completely dependent (1)
- B: Heavily dependent (50%+) (2)
- C: Partially dependent (25-50%) (3)
- D: Slightly dependent (<25%) (4)
- E: Not dependent at all (5)

**Category: INVESTMENT_KNOWLEDGE (3 questions)**

**Q13:** How would you rate your understanding of investment concepts (diversification, asset allocation, risk/return)?
- A: No understanding (1)
- B: Basic understanding (2)
- C: Moderate understanding (3)
- D: Good understanding (4)
- E: Expert understanding (5)

**Q14:** How many years of investment experience do you have?
- A: None (1)
- B: Less than 2 years (2)
- C: 2-5 years (3)
- D: 5-10 years (4)
- E: More than 10 years (5)

**Q15:** Which investment types have you owned? (Select highest complexity owned)
- A: Only savings accounts / CDs (1)
- B: Mutual funds / ETFs (2)
- C: Individual stocks and bonds (3)
- D: Options, futures, or margin accounts (4)
- E: Complex derivatives, private equity, or alternatives (5)

---

## 14. Reference: 50 Investors from BankingCoreDemo

Use the same customer data structure as Portfolio Management System. Here are the first 5 as reference with additional investor fields:

```json
[
  {
    "investorId": "INV-001",
    "customerId": "CUST-001",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@email.com",
    "phone": "555-0101",
    "dateOfBirth": "1975-03-15",
    "age": 49,
    "employmentStatus": "EMPLOYED",
    "annualIncome": 150000,
    "netWorth": 850000,
    "liquidNetWorth": 450000,
    "investmentExperience": "EXPERIENCED",
    "investmentHorizon": "LONG_TERM"
  },
  {
    "investorId": "INV-002",
    "customerId": "CUST-002",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "555-0102",
    "dateOfBirth": "1982-07-22",
    "age": 42,
    "employmentStatus": "EMPLOYED",
    "annualIncome": 95000,
    "netWorth": 420000,
    "liquidNetWorth": 180000,
    "investmentExperience": "INTERMEDIATE",
    "investmentHorizon": "LONG_TERM"
  },
  {
    "investorId": "INV-003",
    "customerId": "CUST-003",
    "firstName": "Michael",
    "lastName": "Williams",
    "email": "michael.williams@email.com",
    "phone": "555-0103",
    "dateOfBirth": "1968-11-30",
    "age": 56,
    "employmentStatus": "EMPLOYED",
    "annualIncome": 225000,
    "netWorth": 1850000,
    "liquidNetWorth": 950000,
    "investmentExperience": "EXPERT",
    "investmentHorizon": "MEDIUM_TERM"
  },
  {
    "investorId": "INV-004",
    "customerId": "CUST-004",
    "firstName": "Emily",
    "lastName": "Brown",
    "email": "emily.brown@email.com",
    "phone": "555-0104",
    "dateOfBirth": "1990-04-18",
    "age": 34,
    "employmentStatus": "EMPLOYED",
    "annualIncome": 78000,
    "netWorth": 125000,
    "liquidNetWorth": 65000,
    "investmentExperience": "NOVICE",
    "investmentHorizon": "LONG_TERM"
  },
  {
    "investorId": "INV-005",
    "customerId": "CUST-005",
    "firstName": "David",
    "lastName": "Jones",
    "email": "david.jones@email.com",
    "phone": "555-0105",
    "dateOfBirth": "1978-09-05",
    "age": 46,
    "employmentStatus": "SELF_EMPLOYED",
    "annualIncome": 180000,
    "netWorth": 620000,
    "liquidNetWorth": 280000,
    "investmentExperience": "INTERMEDIATE",
    "investmentHorizon": "MEDIUM_TERM"
  }
]
```

**Note:** Generate remaining 45 investors with varied attributes matching the distributions specified in section 3.1.

---

**END OF PRD**

Ready for Cursor implementation!
