# Risk Management System - Web UI & API Documentation Guide

## 🎉 What's New

The Risk Management System now includes:
1. **Fully Functional Web UI** - Modern, responsive interface for managing and analyzing portfolios
2. **Interactive Swagger API Documentation** - Complete API reference with try-it-out functionality

## 🌐 Accessing the System

### Web UI Dashboard
**URL:** http://localhost:3002/

The main dashboard provides:
- System health status and statistics
- Quick action buttons for common tasks
- Risk categories overview
- Navigation to all features

### Swagger API Documentation
**URL:** http://localhost:3002/api-docs

Interactive API documentation with:
- Complete endpoint reference
- Request/response schemas
- Try-it-out functionality
- Example requests and responses

### REST API
**Base URL:** http://localhost:3002/api/v1

The original RESTful API remains fully functional for MuleSoft integration.

---

## 📱 Web UI Features

### 1. Dashboard (`/`)
- **System Statistics**: View total investors, profiles, assessments, and scenarios
- **Health Status**: Monitor system uptime and data store status
- **Risk Categories**: Quick reference for all risk categories
- **Quick Actions**: Fast navigation to key features

### 2. Investors Page (`/investors.html`)
**Features:**
- Browse all 50 pre-loaded investors
- Search by name, email, or ID
- Filter by experience level and investment horizon
- Click any investor to view detailed profile

**Detailed Investor View:**
- Personal information (age, contact, employment)
- Financial information (income, net worth)
- Investment profile (experience, horizon)
- Risk profile with current category
- Recommended asset allocation with visual charts

### 3. Risk Analyzer (`/analyzer.html`)
**Features:**
- Build custom portfolios or select from existing investors
- Add multiple holdings with details:
  - Symbol (e.g., AAPL, MSFT)
  - Sector classification
  - Market value
  - Beta coefficient
- Load sample portfolio with one click
- Optional stress testing
- Real-time comprehensive analysis

**Analysis Results Include:**
- **Executive Summary**: Overall risk level and key findings
- **Portfolio Risk Metrics**: Volatility, Beta, Sharpe Ratio, Max Drawdown
- **Value at Risk (VaR)**: 95% and 99% confidence levels
- **Concentration Analysis**: Sector concentration and alerts
- **Suitability Assessment**: Portfolio fit for investor profile
- **Stress Test Results**: Impact of market scenarios
- **Recommendations**: Actionable suggestions for improvement

### 4. Stress Scenarios (`/scenarios.html`)
**Features:**
- Browse all 10 stress test scenarios
- Filter by category (Historical, Hypothetical, Regulatory)
- View detailed scenario information:
  - Market shock parameters
  - Sector-specific impacts
  - Historical context

**Scenario Details:**
- Equity and bond shock percentages
- Credit spread changes
- Volatility spikes
- Sector-by-sector breakdown

---

## 🚀 Quick Start Examples

### Example 1: View an Investor's Risk Profile
1. Navigate to http://localhost:3002/investors.html
2. Find "John Smith (INV-001)" or search for any investor
3. Click on the investor card
4. View complete profile including:
   - Risk category: MODERATE
   - Recommended allocation: 60% equities, 30% fixed income
   - Risk tolerance metrics

### Example 2: Analyze a Portfolio
1. Go to http://localhost:3002/analyzer.html
2. Click "Load Sample" to populate with test data
3. Optionally select an investor from the dropdown
4. Check "Include Stress Tests" for comprehensive analysis
5. Click "Analyze Portfolio"
6. Review:
   - Portfolio volatility: ~11-14%
   - VaR calculations
   - Concentration warnings
   - Stress test impacts
   - Personalized recommendations

### Example 3: Explore Stress Scenarios
1. Visit http://localhost:3002/scenarios.html
2. Click filter buttons to view specific categories
3. Click any scenario card (e.g., "2008 Financial Crisis")
4. View detailed impact:
   - Equity shock: -45%
   - Sector impacts ranging from -10% to -60%
   - Credit spread changes

---

## 📚 API Documentation via Swagger

### Using Swagger UI

**Access:** http://localhost:3002/api-docs

#### Key Features:
1. **Browse All Endpoints**: Organized by tags (Health, Investors, Analysis, etc.)
2. **View Schemas**: Complete request/response data structures
3. **Try It Out**: Execute API calls directly from the browser
4. **Examples**: Pre-populated with sample requests

#### Example API Calls in Swagger:

**1. Get Health Status**
- Endpoint: `GET /health`
- Click "Try it out" → "Execute"
- View system status and data counts

**2. Get All Investors**
- Endpoint: `GET /investors`
- Returns all 50 investors with profiles

**3. Analyze Portfolio Risk**
- Endpoint: `POST /analysis/portfolio-risk`
- Use the example request or customize
- View comprehensive risk calculations

**4. Run Comprehensive Analysis**
- Endpoint: `POST /analysis/comprehensive`
- Most powerful endpoint
- Combines all risk engines

---

## 🎨 UI Design Highlights

### Modern & Responsive
- Clean, professional design
- Mobile-friendly responsive layout
- Smooth animations and transitions
- Intuitive navigation

### Color-Coded Risk Levels
- **Green**: Conservative/Low Risk
- **Yellow/Orange**: Moderate Risk
- **Red**: Aggressive/High Risk

### Interactive Elements
- Modal dialogs for detailed views
- Real-time filtering and search
- Dynamic form building (holdings)
- Progress indicators

---

## 🔌 Integration Points

### MuleSoft Integration
The Web UI is built on top of the same REST API designed for MuleSoft:

**MuleSoft → API → Backend**
- All API endpoints remain unchanged
- No authentication required (demo mode)
- JSON request/response format
- RESTful design patterns

**Web UI → API → Backend**
- UI makes same API calls as MuleSoft would
- Demonstrates proper API usage
- Useful for testing MuleSoft integrations

### API Endpoints (Key Routes)

**Reference Data:**
- `GET /api/v1/questionnaire`
- `GET /api/v1/risk-categories`
- `GET /api/v1/risk-factors`
- `GET /api/v1/benchmarks`

**Investors:**
- `GET /api/v1/investors`
- `GET /api/v1/investors/:id`
- `GET /api/v1/investors/:id/profile`

**Risk Analysis:**
- `POST /api/v1/analysis/portfolio-risk`
- `POST /api/v1/analysis/concentration`
- `POST /api/v1/analysis/suitability`
- `POST /api/v1/analysis/stress-test`
- `POST /api/v1/analysis/comprehensive`

**Scenarios:**
- `GET /api/v1/scenarios`
- `GET /api/v1/scenarios/:id`

---

## 🛠️ Technical Stack

### Web UI
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies
- **Responsive Design**: Mobile-first approach

### API Documentation
- **Swagger UI Express**: Interactive API docs
- **OpenAPI 3.0**: Industry-standard specification
- **swagger-jsdoc**: Generate docs from code comments

### Backend
- **Node.js 18+**
- **Express.js**: Web framework
- **In-memory Data Store**: Fast access, resets on restart
- **CORS enabled**: Cross-origin requests supported

---

## 📊 Sample Data

### Investors (50 pre-loaded)
- **INV-001 to INV-050**
- Diverse risk profiles (Conservative to Aggressive)
- Various income levels ($50K - $500K)
- Different investment experiences
- Multiple investment horizons

### Risk Profiles (50)
- Auto-generated from assessments
- 5 risk categories
- Recommended allocations
- Tolerance thresholds

### Stress Scenarios (10)
1. 2008 Financial Crisis
2. COVID-19 Market Crash
3. Dot-com Bubble Burst
4. Interest Rate Spike
5. Inflation Surge
6. Geopolitical Crisis
7. Banking System Failure
8. Currency Crisis
9. CCAR Adverse Scenario
10. CCAR Severely Adverse

### Risk Factors (10)
- Equity Risk Premium
- Credit Spread
- Interest Rate Risk
- Volatility Index (VIX)
- Liquidity Risk
- Currency Risk
- Inflation Risk
- Geopolitical Risk
- Sector Concentration
- Market Correlation

### Benchmarks (5)
- S&P 500 (SPY)
- Total Bond Market (AGG)
- MSCI World Index
- Bloomberg Commodity Index
- 60/40 Balanced Portfolio

---

## 💡 Tips & Tricks

### For Demo Purposes:
1. **Start with the Dashboard**: Get familiar with system statistics
2. **Browse Investors**: See real risk profiles and allocations
3. **Use Sample Portfolio**: Quick way to see analysis results
4. **Try Stress Tests**: Enable to see worst-case scenarios
5. **Compare Scenarios**: Click different scenarios to see variations

### For Development:
1. **Check Swagger First**: Understand API contract before coding
2. **Use Browser DevTools**: Monitor API calls in Network tab
3. **Test in Swagger**: Validate requests before implementing
4. **View Source**: JavaScript code is well-commented
5. **Customize Sample**: Modify sample portfolio to test edge cases

### For Integration:
1. **Reference Swagger Schemas**: Exact data structures for requests
2. **Test with curl**: Validate API independently of UI
3. **Check Response Format**: Consistent success/error structure
4. **Use API Endpoint**: `/api` returns all important URLs
5. **Monitor Health**: `/api/v1/health` for system status

---

## 🚦 Server URLs

When server is running on port 3002:

| Service | URL | Purpose |
|---------|-----|---------|
| **Web UI** | http://localhost:3002/ | Main dashboard and UI |
| **API Docs** | http://localhost:3002/api-docs | Interactive Swagger documentation |
| **API Base** | http://localhost:3002/api/v1 | RESTful API endpoints |
| **Health Check** | http://localhost:3002/api/v1/health | System health status |
| **API Info** | http://localhost:3002/api | Server information |

---

## 🎯 Next Steps

### Using the Web UI:
1. Open http://localhost:3002/ in your browser
2. Explore the dashboard and statistics
3. Browse investors and their risk profiles
4. Try analyzing a portfolio
5. View stress test scenarios

### Using the API:
1. Open http://localhost:3002/api-docs
2. Browse available endpoints
3. Try executing API calls
4. Review request/response examples
5. Integrate with your MuleSoft flows

### For MuleSoft Integration:
1. Use Swagger docs as your API contract
2. Point MuleSoft Process APIs to http://localhost:3002/api/v1
3. Test endpoints in Swagger first
4. Implement error handling for API responses
5. Use the Web UI to validate results

---

## 📞 Support

For issues or questions:
- Check the Swagger documentation: http://localhost:3002/api-docs
- Review `docs/API.md` for detailed API specifications
- See `IMPLEMENTATION_SUMMARY.md` for system architecture
- Check `QUICKSTART.md` for setup instructions

---

## ✅ System Status

Current deployment includes:
- ✅ 4 Web UI pages (Dashboard, Investors, Analyzer, Scenarios)
- ✅ Complete CSS styling (modern, responsive design)
- ✅ 5 JavaScript modules (main, dashboard, investors, analyzer, scenarios)
- ✅ Interactive Swagger API documentation
- ✅ 48 RESTful API endpoints
- ✅ 50 pre-loaded investors with profiles
- ✅ 10 stress test scenarios
- ✅ 6 risk calculation engines

**Everything is ready for demo and production use!** 🎉

