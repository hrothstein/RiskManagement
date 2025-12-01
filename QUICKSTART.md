# Quick Start Guide

## Running the Risk Management System

### Option 1: Standard Port (3002)

```bash
cd /Users/hrothstein/cursorrepos/RiskSystem
npm start
```

### Option 2: Alternative Port (if 3002 has issues)

```bash
PORT=8080 npm start
```

### Option 3: Development Mode (auto-restart)

```bash
npm run dev
```

## Testing the API

Once the server starts, you should see:

```
🌱 Starting data seeding...
  ✓ Loaded 10 scenarios
  ✓ Loaded 10 risk factors
  ✓ Loaded 5 benchmarks
  ✓ Loaded 50 investors
  ✓ Generated 50 assessments
  ✓ Generated 50 risk profiles

🚀 Risk Management System started successfully!
📍 Server running on port 8080
🌐 API Base URL: http://localhost:8080/api/v1
💚 Health Check: http://localhost:8080/api/v1/health
```

## Quick API Tests

### 1. Health Check
```bash
curl http://localhost:8080/api/v1/health
```

### 2. List All Investors
```bash
curl http://localhost:8080/api/v1/investors
```

### 3. Get Risk Questionnaire
```bash
curl http://localhost:8080/api/v1/questionnaire
```

### 4. Get Investor with Profile
```bash
curl http://localhost:8080/api/v1/investors/INV-001/profile
```

### 5. Portfolio Risk Analysis (Example)
```bash
curl -X POST http://localhost:8080/api/v1/analysis/portfolio-risk \
  -H "Content-Type: application/json" \
  -d '{
    "investorId": "INV-001",
    "portfolioData": {
      "totalValue": 500000,
      "holdings": [
        {
          "symbol": "AAPL",
          "securityType": "STOCK",
          "sector": "TECHNOLOGY",
          "quantity": 200,
          "marketValue": 35000,
          "weight": 7.0,
          "beta": 1.25,
          "annualizedVolatility": 28.5
        },
        {
          "symbol": "MSFT",
          "securityType": "STOCK",
          "sector": "TECHNOLOGY",
          "quantity": 150,
          "marketValue": 60000,
          "weight": 12.0,
          "beta": 1.15,
          "annualizedVolatility": 25.2
        },
        {
          "symbol": "BND",
          "securityType": "BOND",
          "sector": "FIXED_INCOME",
          "quantity": 1000,
          "marketValue": 85000,
          "weight": 17.0,
          "beta": 0.10,
          "annualizedVolatility": 4.5
        }
      ]
    },
    "benchmarkSymbol": "SPY"
  }'
```

### 6. Comprehensive Risk Analysis
```bash
curl -X POST http://localhost:8080/api/v1/analysis/comprehensive \
  -H "Content-Type: application/json" \
  -d '{
    "investorId": "INV-001",
    "portfolioData": {
      "totalValue": 500000,
      "holdings": [
        {
          "symbol": "AAPL",
          "securityType": "STOCK",
          "sector": "TECHNOLOGY",
          "marketValue": 112500,
          "weight": 22.5,
          "beta": 1.25,
          "annualizedVolatility": 28.5
        },
        {
          "symbol": "MSFT",
          "securityType": "STOCK",
          "sector": "TECHNOLOGY",
          "marketValue": 91000,
          "weight": 18.2,
          "beta": 1.15,
          "annualizedVolatility": 25.2
        }
      ],
      "assetAllocation": {
        "equities": 70,
        "fixedIncome": 20,
        "alternatives": 5,
        "cash": 5
      }
    },
    "includeStressTests": true,
    "scenarioIds": ["SCN-001", "SCN-002"],
    "benchmarkSymbol": "SPY"
  }'
```

## View Available Data

### All Scenarios
```bash
curl http://localhost:8080/api/v1/scenarios
```

### Risk Categories
```bash
curl http://localhost:8080/api/v1/risk-categories
```

### Risk Factors
```bash
curl http://localhost:8080/api/v1/risk-factors
```

### Benchmarks
```bash
curl http://localhost:8080/api/v1/benchmarks
```

## Using with Postman

1. Import the base URL: `http://localhost:8080/api/v1`
2. All endpoints return JSON
3. No authentication required (demo mode)
4. See `docs/API.md` for complete endpoint documentation

## Common Issues

### Port Already in Use
```bash
# Use different port
PORT=8081 npm start
```

### Permission Denied on macOS
```bash
# Try higher port number
PORT=8080 npm start
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Server is running
2. 📖 Read `docs/API.md` for complete API documentation
3. 🧪 Test endpoints with curl or Postman
4. 🔗 Integrate with MuleSoft Process APIs
5. 🚀 Deploy to Heroku when ready

## Deployment to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create risk-management-demo

# Push code
git push heroku main

# Open app
heroku open
```

The app will be available at: `https://risk-management-demo.herokuapp.com`

## Support

- API Documentation: `docs/API.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- PRD Reference: `Risk_Management_System_PRD.md`

