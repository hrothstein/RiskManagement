# MCP Integration Guide

The Risk Management System includes a Model Context Protocol (MCP) server that enables AI agents like Claude, Agentforce, and custom AI applications to interact with risk analysis capabilities.

## Quick Start

### Claude Desktop Configuration

Add the following to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "risk-management": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://risk-management-system-f04b786dc797.herokuapp.com/mcp/sse"]
    }
  }
}
```

**For local development:**
```json
{
  "mcpServers": {
    "risk-management": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3002/mcp/sse"]
    }
  }
}
```

After updating the config, restart Claude Desktop.

## MCP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | POST | HTTP Streamable transport (primary) |
| `/mcp/sse` | GET | SSE transport connection |
| `/mcp/sse/message` | POST | SSE transport messages |
| `/mcp/health` | GET | MCP server health check |
| `/mcp/tools` | GET | List available tools |

## Available Tools

### 1. get_investor_profile

Get the complete risk profile for an investor.

**Parameters:**
- `investorId` (required): Investor ID (e.g., "INV-001") or Customer ID (e.g., "CUST-001")

**Example:**
```
"Get John Smith's risk profile" → Agent calls get_investor_profile with investorId: "INV-001"
```

### 2. analyze_portfolio_risk

Analyze portfolio risk metrics including VaR, Sharpe ratio, beta, volatility, and concentration risk.

**Parameters:**
- `investorId` (required): The investor ID
- `holdings` (required): Array of holdings with symbol, sector, weight, and marketValue
- `totalValue` (required): Total portfolio value in dollars

**Example:**
```
"Analyze my portfolio: $100k in AAPL, $50k in MSFT, $30k in bonds"

Agent calls analyze_portfolio_risk with:
{
  "investorId": "INV-001",
  "holdings": [
    { "symbol": "AAPL", "sector": "TECHNOLOGY", "weight": 55.6, "marketValue": 100000 },
    { "symbol": "MSFT", "sector": "TECHNOLOGY", "weight": 27.8, "marketValue": 50000 },
    { "symbol": "BND", "sector": "FIXED_INCOME", "weight": 16.6, "marketValue": 30000 }
  ],
  "totalValue": 180000
}
```

### 3. run_stress_test

Run stress test scenarios against a portfolio.

**Parameters:**
- `investorId` (required): The investor ID
- `scenarioId` (required): Scenario ID (use `list_scenarios` to see options)
- `holdings` (required): Portfolio holdings
- `totalValue` (required): Total portfolio value

**Available Scenarios:**
- `SCN-001`: 2008 Financial Crisis
- `SCN-002`: 2020 COVID Crash
- `SCN-003`: Dot-Com Bubble (2000)
- `SCN-004`: Black Monday (1987)
- `SCN-005`: Rising Interest Rates
- `SCN-006`: Stagflation
- `SCN-007`: Tech Sector Crash
- `SCN-008`: Geopolitical Crisis
- `SCN-009`: Mild Recession
- `SCN-010`: Severe Recession

**Example:**
```
"What would happen to my portfolio in a 2008-style crash?"

Agent calls run_stress_test with scenarioId: "SCN-001"
```

### 4. get_recommendations

Get personalized investment recommendations.

**Parameters:**
- `investorId` (required): The investor ID
- `includeRebalancing` (optional): Include rebalancing recommendations (default: true)
- `includeDiversification` (optional): Include diversification recommendations (default: true)

### 5. list_scenarios

List available stress test scenarios.

**Parameters:**
- `category` (optional): Filter by category - "HISTORICAL", "HYPOTHETICAL", or "REGULATORY"

### 6. search_investors

Search for investors by name, email, or risk category.

**Parameters:**
- `query` (optional): Search query (matches name, email, investor ID)
- `riskCategory` (optional): Filter by risk category
- `limit` (optional): Maximum results (default: 10)

**Risk Categories:**
- CONSERVATIVE
- MODERATELY_CONSERVATIVE
- MODERATE
- MODERATELY_AGGRESSIVE
- AGGRESSIVE

## Example Conversations

### Portfolio Analysis
```
User: "How risky is my current portfolio?"

Claude: I'll analyze your portfolio risk. [Calls get_investor_profile and analyze_portfolio_risk]

Based on your holdings, your portfolio has:
- Volatility: 14.5% (within your 18% tolerance)
- Beta: 1.12 (slightly aggressive)
- VaR (95%): -$26,700 potential monthly loss
- Concentration Risk: HIGH - Technology at 52% exceeds 25% limit

I recommend reducing technology exposure and adding diversification.
```

### Stress Testing
```
User: "What if we have another 2008 crash?"

Claude: [Calls run_stress_test with SCN-001]

In a 2008 Financial Crisis scenario:
- Current Value: $180,000
- Stressed Value: $99,000
- Loss: -$81,000 (-45%)

This exceeds your 25% drawdown tolerance by 20 percentage points.
Your technology-heavy allocation would be particularly impacted.
```

### Finding Clients
```
User: "Show me all aggressive clients"

Claude: [Calls search_investors with riskCategory: "AGGRESSIVE"]

Found 5 aggressive risk profile clients:
1. INV-003 - Michael Williams - Score: 72
2. INV-015 - James Anderson - Score: 68
...
```

## Transport Details

### HTTP Streamable (Recommended)

The primary transport uses standard HTTP POST requests:

```bash
curl -X POST https://risk-management-system-f04b786dc797.herokuapp.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list"
  }'
```

### SSE Transport

For real-time streaming, connect via Server-Sent Events:

1. Establish connection: `GET /mcp/sse`
2. Receive `endpoint` event with message URL
3. Send messages: `POST /mcp/sse/message?sessionId=xxx`
4. Receive responses via SSE stream

**Note:** Heroku has a 55-second timeout. The server sends keep-alive messages every 45 seconds to maintain connections.

## Error Handling

MCP uses JSON-RPC 2.0 error format:

```json
{
  "jsonrpc": "2.0",
  "id": "request-1",
  "error": {
    "code": -32000,
    "message": "Investor not found: INV-999"
  }
}
```

**Error Codes:**
| Code | Meaning |
|------|---------|
| -32700 | Parse error |
| -32600 | Invalid request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |
| -32000 | Investor not found |
| -32001 | Scenario not found |
| -32002 | Profile not found |
| -32003 | Analysis failed |

## Health Check

Check MCP server status:

```bash
curl https://risk-management-system-f04b786dc797.herokuapp.com/mcp/health
```

Response includes:
- Server status
- Available tools
- Transport status
- Active SSE sessions
- Claude Desktop configuration example

