# OpenAPI Specification (OAS) Files

This directory contains the OpenAPI 3.0 specification files for the Risk Management System API.

## Available Files

### 📄 `openapi.json`
- **Format:** JSON
- **Lines:** 326
- **Use Cases:**
  - Postman import
  - API testing tools
  - Code generation
  - CI/CD integration

### 📄 `openapi.yaml`
- **Format:** YAML
- **Lines:** 227
- **Use Cases:**
  - Human-readable format
  - Version control friendly
  - MuleSoft import
  - Documentation

## Download URLs

When the server is running, you can download the latest OAS files from:

**Local Development:**
- JSON: http://localhost:3002/openapi.json
- YAML: http://localhost:3002/openapi.yaml

**Production (Heroku):**
- JSON: https://risk-management-system-f04b786dc797.herokuapp.com/openapi.json
- YAML: https://risk-management-system-f04b786dc797.herokuapp.com/openapi.yaml

## How to Use

### Import into Postman
1. Open Postman
2. Click **Import**
3. Select **Link** tab
4. Paste the JSON URL
5. Click **Continue** to import all endpoints

### Import into MuleSoft
1. In Anypoint Studio or Design Center
2. Choose **Import API Specification**
3. Select **From URL** or upload the YAML file
4. Use the YAML URL or file
5. MuleSoft will generate connectors and flows

### Generate Client Code
Using OpenAPI Generator:

```bash
# Generate JavaScript/TypeScript client
openapi-generator-cli generate -i openapi.json -g typescript-axios -o ./generated/client

# Generate Python client
openapi-generator-cli generate -i openapi.json -g python -o ./generated/python-client

# Generate Java client
openapi-generator-cli generate -i openapi.json -g java -o ./generated/java-client
```

### Validate the Spec
```bash
# Using swagger-cli
swagger-cli validate openapi.yaml

# Using openapi-cli
openapi lint openapi.yaml
```

## API Overview

The Risk Management System API provides:

### Core Endpoints
- **Health Check** - System status and monitoring
- **Investors** - Investor profile management (CRUD)
- **Risk Profiles** - Risk tolerance and capacity profiles
- **Risk Assessments** - Questionnaire-based risk assessment
- **Portfolio Analysis** - Real-time risk calculations
- **Stress Testing** - Scenario-based stress tests
- **Recommendations** - AI-driven investment suggestions

### Key Features
- **48 RESTful endpoints**
- **6 risk calculation engines**
- **OpenAPI 3.0 compliant**
- **JSON request/response format**
- **CORS enabled**
- **No authentication required (demo mode)**

## Schemas Included

The OAS files include complete schema definitions for:

### Request/Response Objects
- `Investor` - Investor demographics and financials
- `RiskProfile` - Risk tolerance and allocation
- `PortfolioRiskRequest` - Portfolio analysis input
- `SuccessResponse` - Standard success format
- `ErrorResponse` - Standard error format

### Risk Analysis Models
- Portfolio risk metrics (VaR, Beta, Sharpe Ratio)
- Concentration analysis
- Suitability assessment
- Stress test results
- Recommendations

## Update the Spec Files

To regenerate the OAS files from the server:

```bash
# Make sure the server is running
npm start

# In another terminal, download the specs
curl http://localhost:3002/openapi.json > docs/openapi.json
curl http://localhost:3002/openapi.yaml > docs/openapi.yaml
```

## Integration Examples

### cURL
```bash
# Get health status
curl https://risk-management-system-f04b786dc797.herokuapp.com/api/v1/health

# Get all investors
curl https://risk-management-system-f04b786dc797.herokuapp.com/api/v1/investors

# Analyze portfolio risk
curl -X POST https://risk-management-system-f04b786dc797.herokuapp.com/api/v1/analysis/portfolio-risk \
  -H "Content-Type: application/json" \
  -d @portfolio-request.json
```

### Python (using requests)
```python
import requests

# Using the OAS to know the endpoints
base_url = "https://risk-management-system-f04b786dc797.herokuapp.com/api/v1"

# Get health
response = requests.get(f"{base_url}/health")
print(response.json())

# Get investors
investors = requests.get(f"{base_url}/investors").json()
```

### JavaScript (using fetch)
```javascript
const baseUrl = 'https://risk-management-system-f04b786dc797.herokuapp.com/api/v1';

// Get health status
const health = await fetch(`${baseUrl}/health`).then(r => r.json());

// Get all investors
const investors = await fetch(`${baseUrl}/investors`).then(r => r.json());
```

## Version Information

- **OpenAPI Version:** 3.0.0
- **API Version:** 1.0.0
- **Last Updated:** 2025-12-01

## Support

For API questions or issues:
- View interactive docs: https://risk-management-system-f04b786dc797.herokuapp.com/api-docs
- Check API.md for detailed endpoint documentation
- Review IMPLEMENTATION_SUMMARY.md for architecture details

## Related Documentation

- `API.md` - Complete API reference with examples
- `../WEB_UI_GUIDE.md` - Web interface documentation
- `../QUICKSTART.md` - Getting started guide
- `../IMPLEMENTATION_SUMMARY.md` - Technical architecture

