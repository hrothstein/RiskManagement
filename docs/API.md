# Risk Management System API Documentation

## Base URL

```
http://localhost:3002/api/v1
```

**Note:** Port can be configured via PORT environment variable.

## Response Format

All API responses follow this standard format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-10-15T10:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-10-15T10:00:00Z"
}
```

---

## Health Check

### GET /health

Check system health and data statistics.

**Response:**

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
      "assessments": 50,
      "scenarios": 10,
      "riskFactors": 10,
      "benchmarks": 5,
      "scores": 0,
      "recommendations": 0
    }
  }
}
```

---

## Reference Data APIs

### GET /questionnaire

Get risk assessment questionnaire with all questions.

### GET /risk-categories

Get all risk category definitions (Conservative to Aggressive).

### GET /risk-factors

Get all risk factor definitions.

### GET /benchmarks

Get all market benchmark data.

---

## Investor APIs

### GET /investors

List all investors.

### GET /investors/:investorId

Get specific investor by ID.

### GET /investors/:investorId/profile

Get investor with active risk profile.

**Example:**
```
GET /investors/INV-001/profile
```

### GET /investors/customer/:customerId

Get investor by customer ID (external reference).

### POST /investors

Create new investor.

### PUT /investors/:investorId

Update investor details.

### DELETE /investors/:investorId

Delete investor.

---

## Risk Assessment APIs

### POST /assessments

Submit a risk assessment questionnaire.

**Request Body:**
```json
{
  "investorId": "INV-001",
  "assessmentType": "COMPREHENSIVE",
  "responses": [
    { "questionId": "Q1", "selectedOption": "C" },
    { "questionId": "Q2", "selectedOption": "D" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "ASM-051",
    "status": "COMPLETED",
    "rawScore": 48,
    "percentileScore": 64,
    "riskProfile": {
      "profileId": "PRF-051",
      "riskCategory": "MODERATELY_AGGRESSIVE",
      "compositeRiskScore": 64
    }
  }
}
```

### GET /assessments/:assessmentId

Get assessment by ID.

### GET /investors/:investorId/assessments

Get all assessments for an investor.

---

## Risk Profile APIs

### GET /profiles/:profileId

Get risk profile by ID.

### GET /investors/:investorId/profiles/active

Get active risk profile for investor.

**Response:**
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
    }
  }
}
```

---

## Analysis APIs (Core Risk Calculations)

### POST /analysis/portfolio-risk

Calculate comprehensive portfolio risk metrics.

**Request Body:**
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
      }
    ],
    "cashPosition": 15000.00
  },
  "benchmarkSymbol": "SPY"
}
```

**Response:** Returns portfolio volatility, beta, Sharpe ratio, VaR, max drawdown, etc.

### POST /analysis/concentration

Analyze portfolio concentration risk.

**Request Body:**
```json
{
  "investorId": "INV-001",
  "holdings": [
    { "symbol": "AAPL", "sector": "TECHNOLOGY", "weight": 22.5 }
  ],
  "thresholds": {
    "singlePositionLimit": 10,
    "sectorLimit": 25,
    "top5Limit": 50
  }
}
```

**Response:** Returns concentration metrics and breach alerts.

### POST /analysis/suitability

Check if portfolio is suitable for investor's risk profile.

**Request Body:**
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
    }
  }
}
```

**Response:** Returns suitability rating and required actions.

### POST /analysis/stress-test

Run stress test scenarios on portfolio.

**Request Body:**
```json
{
  "investorId": "INV-001",
  "scenarioId": "SCN-001",
  "portfolioData": {
    "totalValue": 485000.00,
    "holdings": [...]
  }
}
```

**Response:** Returns scenario impact and recovery estimates.

### POST /analysis/comprehensive

Perform full risk analysis with all metrics.

**Request Body:**
```json
{
  "investorId": "INV-001",
  "portfolioData": {...},
  "includeStressTests": true,
  "scenarioIds": ["SCN-001", "SCN-002"],
  "benchmarkSymbol": "SPY"
}
```

**Response:** Returns:
- Portfolio risk metrics
- Concentration analysis
- Suitability assessment
- Stress test results
- Recommendations
- Executive summary

---

## Scenario APIs

### GET /scenarios

List all stress test scenarios.

### GET /scenarios/:scenarioId

Get specific scenario.

### GET /scenarios/category/:category

Get scenarios by category (HISTORICAL, HYPOTHETICAL, REGULATORY).

### POST /scenarios

Create custom scenario.

---

## Recommendation APIs

### GET /recommendations

List all recommendations.

### GET /investors/:investorId/recommendations/active

Get active recommendations for investor.

### PUT /recommendations/:recommendationId/status

Update recommendation status.

**Request Body:**
```json
{
  "status": "ACKNOWLEDGED",
  "notes": "Client acknowledged during quarterly review"
}
```

---

## Score APIs

### GET /investors/:investorId/scores/latest

Get latest risk score for investor.

### POST /scores

Create risk score record from analysis.

---

## MuleSoft Integration Examples

### Example 1: New Client Onboarding

```
1. POST /investors (create investor)
2. GET /questionnaire (get questions)
3. POST /assessments (submit responses)
4. GET /investors/:id/profiles/active (get generated profile)
```

### Example 2: Portfolio Risk Check

```
1. GET /investors/:id/profile (get risk limits)
2. POST /analysis/portfolio-risk (calculate metrics)
3. POST /analysis/suitability (check alignment)
```

### Example 3: Comprehensive Review

```
POST /analysis/comprehensive (with full portfolio data)
→ Returns complete risk analysis and recommendations
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Resource not found |
| `INVALID_INPUT` | Invalid request parameters |
| `ANALYSIS_ERROR` | Error during risk calculation |
| `INTERNAL_ERROR` | Server error |

---

## Rate Limits

No rate limits for demo purposes.

## Authentication

No authentication required for demo purposes.

