/**
 * MCP Tool Definitions
 * JSON schemas for all MCP tools exposed by the Risk Management System
 */

const toolDefinitions = [
  {
    name: 'get_investor_profile',
    description: 'Get the complete risk profile for an investor including risk tolerance, recommended allocations, and risk limits. Can look up by investor ID (INV-001) or customer ID (CUST-001).',
    inputSchema: {
      type: 'object',
      properties: {
        investorId: {
          type: 'string',
          description: 'The investor ID (e.g., INV-001) or customer ID (e.g., CUST-001)'
        }
      },
      required: ['investorId']
    }
  },
  {
    name: 'analyze_portfolio_risk',
    description: 'Analyze portfolio risk metrics including VaR (Value at Risk), Sharpe ratio, beta, volatility, and concentration risk. Compares results against the investor\'s risk profile.',
    inputSchema: {
      type: 'object',
      properties: {
        investorId: {
          type: 'string',
          description: 'The investor ID to analyze'
        },
        holdings: {
          type: 'array',
          description: 'Array of portfolio holdings',
          items: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'Stock/security symbol (e.g., AAPL, MSFT)'
              },
              sector: {
                type: 'string',
                description: 'Sector classification (e.g., TECHNOLOGY, HEALTHCARE, FINANCIAL)',
                enum: ['TECHNOLOGY', 'FINANCIAL', 'HEALTHCARE', 'CONSUMER_DISCRETIONARY', 
                       'CONSUMER_STAPLES', 'UTILITIES', 'ENERGY', 'REAL_ESTATE', 
                       'INDUSTRIALS', 'MATERIALS', 'TELECOMMUNICATIONS', 'FIXED_INCOME']
              },
              weight: {
                type: 'number',
                description: 'Portfolio weight as percentage (e.g., 25 for 25%)'
              },
              marketValue: {
                type: 'number',
                description: 'Current market value in dollars'
              }
            },
            required: ['symbol', 'weight']
          }
        },
        totalValue: {
          type: 'number',
          description: 'Total portfolio value in dollars'
        }
      },
      required: ['investorId', 'holdings', 'totalValue']
    }
  },
  {
    name: 'run_stress_test',
    description: 'Run stress test scenarios (e.g., 2008 financial crisis, COVID crash) against a portfolio to estimate potential losses and compare against investor\'s risk tolerance.',
    inputSchema: {
      type: 'object',
      properties: {
        investorId: {
          type: 'string',
          description: 'The investor ID'
        },
        scenarioId: {
          type: 'string',
          description: 'Stress test scenario ID. Use list_scenarios to see available options. Examples: SCN-001 (2008 Financial Crisis), SCN-002 (2020 COVID Crash)'
        },
        holdings: {
          type: 'array',
          description: 'Portfolio holdings to stress test',
          items: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'Stock/security symbol'
              },
              sector: {
                type: 'string',
                description: 'Sector classification'
              },
              marketValue: {
                type: 'number',
                description: 'Current market value in dollars'
              }
            },
            required: ['symbol', 'marketValue']
          }
        },
        totalValue: {
          type: 'number',
          description: 'Total portfolio value in dollars'
        }
      },
      required: ['investorId', 'scenarioId', 'holdings', 'totalValue']
    }
  },
  {
    name: 'get_recommendations',
    description: 'Get personalized investment recommendations based on investor\'s risk profile and current portfolio composition. Returns actionable suggestions for rebalancing and diversification.',
    inputSchema: {
      type: 'object',
      properties: {
        investorId: {
          type: 'string',
          description: 'The investor ID'
        },
        includeRebalancing: {
          type: 'boolean',
          description: 'Include rebalancing recommendations (default: true)',
          default: true
        },
        includeDiversification: {
          type: 'boolean',
          description: 'Include diversification recommendations (default: true)',
          default: true
        }
      },
      required: ['investorId']
    }
  },
  {
    name: 'list_scenarios',
    description: 'List all available stress test scenarios with their parameters. Scenarios include historical events (2008 crash, COVID) and hypothetical situations (tech crash, stagflation).',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['HISTORICAL', 'HYPOTHETICAL', 'REGULATORY'],
          description: 'Filter scenarios by category. HISTORICAL = past market events, HYPOTHETICAL = potential future scenarios, REGULATORY = standard regulatory stress tests'
        }
      }
    }
  },
  {
    name: 'search_investors',
    description: 'Search for investors by name, email, or risk category. Useful for finding investor IDs or getting a list of clients by risk profile.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query - matches against name or email (e.g., "Smith", "john@")'
        },
        riskCategory: {
          type: 'string',
          enum: ['CONSERVATIVE', 'MODERATELY_CONSERVATIVE', 'MODERATE', 'MODERATELY_AGGRESSIVE', 'AGGRESSIVE'],
          description: 'Filter by risk category'
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 10)',
          default: 10
        }
      }
    }
  }
];

module.exports = { toolDefinitions };

