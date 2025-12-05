/**
 * MCP Server Implementation
 * Model Context Protocol server for AI agent integration
 * 
 * Supports:
 * - HTTP Streamable Transport (POST /mcp)
 * - SSE Transport (GET /mcp/sse, POST /mcp/sse/message)
 */

const { v4: uuidv4 } = require('uuid');
const { toolDefinitions } = require('./toolDefinitions');
const { handleToolCall } = require('./toolHandlers');

// SSE session storage (in-memory, resets on server restart)
const sseSessions = new Map();

// Heroku timeout is 55 seconds, send keep-alive every 45 seconds
const SSE_KEEPALIVE_INTERVAL = 45000;

/**
 * MCP Server Class
 */
class RiskManagementMCPServer {
  constructor() {
    this.serverInfo = {
      name: 'risk-management-mcp',
      version: '1.0.0',
      protocolVersion: '2024-11-05'
    };
    
    this.capabilities = {
      tools: {}
    };
  }

  /**
   * Get server info for initialization
   */
  getServerInfo() {
    return {
      ...this.serverInfo,
      capabilities: this.capabilities
    };
  }

  /**
   * Get list of available tools
   */
  getTools() {
    return toolDefinitions;
  }

  /**
   * Handle JSON-RPC request
   */
  async handleRequest(request) {
    const { jsonrpc, id, method, params } = request;

    // Validate JSON-RPC version
    if (jsonrpc !== '2.0') {
      return this.createError(id, -32600, 'Invalid Request: jsonrpc must be "2.0"');
    }

    try {
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id, params);
        
        case 'tools/list':
          return this.handleToolsList(id);
        
        case 'tools/call':
          return await this.handleToolsCall(id, params);
        
        case 'ping':
          return this.createResult(id, {});
        
        default:
          return this.createError(id, -32601, `Method not found: ${method}`);
      }
    } catch (error) {
      console.error('MCP request error:', error);
      return this.createError(id, -32603, `Internal error: ${error.message}`);
    }
  }

  /**
   * Handle initialize request
   */
  handleInitialize(id, params) {
    return this.createResult(id, {
      protocolVersion: this.serverInfo.protocolVersion,
      serverInfo: {
        name: this.serverInfo.name,
        version: this.serverInfo.version
      },
      capabilities: this.capabilities
    });
  }

  /**
   * Handle tools/list request
   */
  handleToolsList(id) {
    return this.createResult(id, {
      tools: this.getTools()
    });
  }

  /**
   * Handle tools/call request
   */
  async handleToolsCall(id, params) {
    const { name, arguments: args } = params || {};

    if (!name) {
      return this.createError(id, -32602, 'Invalid params: tool name is required');
    }

    // Check if tool exists
    const toolExists = toolDefinitions.some(t => t.name === name);
    if (!toolExists) {
      return this.createError(id, -32601, `Method not found: ${name}`);
    }

    // Call the tool handler
    const result = await handleToolCall(name, args || {});

    // Check for tool-level errors
    if (result.error) {
      return this.createError(id, result.code || -32603, result.message);
    }

    // Return successful result
    return this.createResult(id, {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    });
  }

  /**
   * Create JSON-RPC success result
   */
  createResult(id, result) {
    return {
      jsonrpc: '2.0',
      id,
      result
    };
  }

  /**
   * Create JSON-RPC error response
   */
  createError(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }

  // =========================================
  // HTTP Streamable Transport Handlers
  // =========================================

  /**
   * Handle HTTP Streamable request (POST /mcp)
   */
  async handleHttpRequest(req, res) {
    try {
      const request = req.body;
      
      // Handle batch requests
      if (Array.isArray(request)) {
        const responses = await Promise.all(
          request.map(r => this.handleRequest(r))
        );
        return res.json(responses);
      }

      // Handle single request
      const response = await this.handleRequest(request);
      return res.json(response);

    } catch (error) {
      console.error('HTTP transport error:', error);
      return res.status(500).json(
        this.createError(null, -32603, `Internal error: ${error.message}`)
      );
    }
  }

  // =========================================
  // SSE Transport Handlers
  // =========================================

  /**
   * Handle SSE connection establishment (GET /mcp/sse)
   */
  handleSseConnection(req, res) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering

    // Generate session ID
    const sessionId = uuidv4();

    // Store session
    const session = {
      id: sessionId,
      res,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    sseSessions.set(sessionId, session);

    console.log(`SSE session created: ${sessionId}`);

    // Send endpoint event with message URL
    const messageUrl = `/mcp/sse/message?sessionId=${sessionId}`;
    res.write(`event: endpoint\ndata: ${messageUrl}\n\n`);

    // Set up keep-alive interval for Heroku
    const keepAliveInterval = setInterval(() => {
      if (sseSessions.has(sessionId)) {
        try {
          res.write(`: keep-alive\n\n`);
          session.lastActivity = new Date();
        } catch (error) {
          clearInterval(keepAliveInterval);
          sseSessions.delete(sessionId);
        }
      } else {
        clearInterval(keepAliveInterval);
      }
    }, SSE_KEEPALIVE_INTERVAL);

    // Handle client disconnect
    req.on('close', () => {
      console.log(`SSE session closed: ${sessionId}`);
      clearInterval(keepAliveInterval);
      sseSessions.delete(sessionId);
    });

    // Handle errors
    req.on('error', (error) => {
      console.error(`SSE session error: ${sessionId}`, error);
      clearInterval(keepAliveInterval);
      sseSessions.delete(sessionId);
    });
  }

  /**
   * Handle SSE message (POST /mcp/sse/message)
   */
  async handleSseMessage(req, res) {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json(
        this.createError(null, -32602, 'Session ID is required')
      );
    }

    const session = sseSessions.get(sessionId);
    if (!session) {
      return res.status(404).json(
        this.createError(null, -32602, 'Session not found or expired')
      );
    }

    try {
      const request = req.body;
      const response = await this.handleRequest(request);

      // Update session activity
      session.lastActivity = new Date();

      // Send response via SSE
      session.res.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);

      // Acknowledge to the poster
      return res.status(202).json({ status: 'accepted' });

    } catch (error) {
      console.error('SSE message error:', error);
      return res.status(500).json(
        this.createError(null, -32603, `Internal error: ${error.message}`)
      );
    }
  }

  /**
   * Get SSE session stats
   */
  getSessionStats() {
    return {
      activeSessions: sseSessions.size,
      sessions: Array.from(sseSessions.values()).map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        lastActivity: s.lastActivity
      }))
    };
  }

  /**
   * Clean up stale SSE sessions (older than 1 hour)
   */
  cleanupStaleSessions() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleaned = 0;

    for (const [sessionId, session] of sseSessions) {
      if (session.lastActivity < oneHourAgo) {
        try {
          session.res.end();
        } catch (e) {
          // Connection may already be closed
        }
        sseSessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} stale SSE sessions`);
    }

    return cleaned;
  }
}

// Create singleton instance
const mcpServer = new RiskManagementMCPServer();

// Clean up stale sessions every 15 minutes
setInterval(() => {
  mcpServer.cleanupStaleSessions();
}, 15 * 60 * 1000);

module.exports = {
  mcpServer,
  RiskManagementMCPServer
};

