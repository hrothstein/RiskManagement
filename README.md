# Risk Management Backend System

A demo Risk Management Backend System that provides risk assessment, scoring, and analysis capabilities for individual investors. This system is designed to integrate with MuleSoft for orchestrating risk evaluation workflows.

## Features

- Risk tolerance questionnaire processing and scoring
- Portfolio risk analysis (VaR, Sharpe Ratio, Beta, Standard Deviation)
- Concentration risk detection
- Stress testing / scenario analysis
- Risk-adjusted return calculations
- Investment suitability recommendations
- RESTful APIs (open/unsecured - no auth required for demo)
- Pre-loaded with 50 investors

## Tech Stack

- **Backend:** Node.js 18+, Express.js
- **Datastore:** In-memory JavaScript objects (resets on restart)
- **Port:** 3002
- **Deployment:** Heroku

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

The server will start on port 3002: `http://localhost:3002`

## API Documentation

Base URL: `http://localhost:3002/api/v1`

### Health Check

```
GET /api/v1/health
```

### Main API Groups

- **/investors** - Investor management
- **/assessments** - Risk assessments and questionnaires
- **/profiles** - Risk profiles
- **/analysis** - Portfolio risk analysis (core calculation endpoints)
- **/scores** - Risk score history
- **/scenarios** - Stress test scenarios
- **/recommendations** - Investment recommendations
- **/questionnaire** - Risk assessment questions
- **/risk-factors** - Risk factor definitions
- **/benchmarks** - Market benchmarks
- **/risk-categories** - Risk category definitions

## Project Structure

```
risk-management-system/
├── package.json
├── README.md
├── server/
│   ├── index.js                    # Express server entry
│   ├── datastore.js                # In-memory data store
│   ├── seed.js                     # Seed data loader
│   ├── routes/
│   │   ├── investors.js
│   │   ├── assessments.js
│   │   ├── profiles.js
│   │   ├── analysis.js             # Core risk analysis endpoints
│   │   ├── scores.js
│   │   ├── scenarios.js
│   │   ├── recommendations.js
│   │   ├── reference.js            # Questionnaire, factors, benchmarks
│   │   └── health.js
│   ├── services/
│   │   ├── riskEngine.js           # Portfolio risk calculations
│   │   ├── scoringEngine.js        # Assessment scoring
│   │   ├── concentrationService.js # Concentration analysis
│   │   ├── suitabilityService.js   # Suitability checks
│   │   ├── stressTestService.js    # Scenario analysis
│   │   └── recommendationService.js # Generate recommendations
│   └── data/
│       ├── customers.json          # 50 customers
│       ├── questionnaire.json      # Risk assessment questions
│       ├── scenarios.json          # Stress test scenarios
│       ├── riskFactors.json        # Risk factor definitions
│       └── benchmarks.json         # Benchmark data
```

## Docker

```bash
# Build image
docker build -t risk-management-system .

# Run container
docker run -p 3002:3002 risk-management-system
```

## Integration with MuleSoft

This system is designed to be consumed by MuleSoft APIs:

1. **Experience API** - Mobile/Web applications
2. **Process API** - Orchestration layer
3. **System API** - This Risk Management API

Example integration flow:
- MuleSoft Process API retrieves portfolio data from Portfolio Management System
- Calls Risk Management API for risk analysis
- Returns enriched data to Experience API for display

## License

ISC

