/**
 * MCP Routes
 * Express routes for Model Context Protocol endpoints
 * 
 * Endpoints:
 * - POST /mcp - HTTP Streamable transport
 * - GET /mcp/sse - SSE transport connection
 * - POST /mcp/sse/message - SSE transport messages
 * - GET /mcp/health - MCP health check
 */

const express = require('express');
const router = express.Router();
const { mcpServer } = require('../mcp/mcpServer');
const { toolDefinitions } = require('../mcp/toolDefinitions');

/**
 * @swagger
 * tags:
 *   name: MCP
 *   description: Model Context Protocol endpoints for AI agent integration
 */

/**
 * @swagger
 * /mcp:
 *   post:
 *     summary: MCP HTTP Streamable Transport
 *     description: Primary MCP endpoint for JSON-RPC requests from AI agents
 *     tags: [MCP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jsonrpc:
 *                 type: string
 *                 example: "2.0"
 *               id:
 *                 type: string
 *                 example: "request-1"
 *               method:
 *                 type: string
 *                 enum: [initialize, tools/list, tools/call, ping]
 *                 example: "tools/list"
 *               params:
 *                 type: object
 *     responses:
 *       200:
 *         description: JSON-RPC response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jsonrpc:
 *                   type: string
 *                   example: "2.0"
 *                 id:
 *                   type: string
 *                 result:
 *                   type: object
 */
router.post('/', async (req, res) => {
  await mcpServer.handleHttpRequest(req, res);
});

/**
 * @swagger
 * /mcp/sse:
 *   get:
 *     summary: MCP SSE Transport - Establish Connection
 *     description: Establish Server-Sent Events connection for real-time MCP communication
 *     tags: [MCP]
 *     responses:
 *       200:
 *         description: SSE stream established
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get('/sse', (req, res) => {
  mcpServer.handleSseConnection(req, res);
});

/**
 * @swagger
 * /mcp/sse/message:
 *   post:
 *     summary: MCP SSE Transport - Send Message
 *     description: Send JSON-RPC message over established SSE connection
 *     tags: [MCP]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: SSE session ID received from /mcp/sse endpoint event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jsonrpc:
 *                 type: string
 *               id:
 *                 type: string
 *               method:
 *                 type: string
 *               params:
 *                 type: object
 *     responses:
 *       202:
 *         description: Message accepted, response sent via SSE
 *       400:
 *         description: Session ID required
 *       404:
 *         description: Session not found
 */
router.post('/sse/message', async (req, res) => {
  await mcpServer.handleSseMessage(req, res);
});

/**
 * @swagger
 * /mcp/health:
 *   get:
 *     summary: MCP Server Health Check
 *     description: Returns MCP server status, available tools, and transport information
 *     tags: [MCP]
 *     responses:
 *       200:
 *         description: MCP health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     server:
 *                       type: object
 *                     transports:
 *                       type: object
 *                     tools:
 *                       type: array
 */
router.get('/health', (req, res) => {
  const serverInfo = mcpServer.getServerInfo();
  const sessionStats = mcpServer.getSessionStats();

  res.json({
    success: true,
    data: {
      status: 'healthy',
      server: {
        name: serverInfo.name,
        version: serverInfo.version,
        protocolVersion: serverInfo.protocolVersion
      },
      transports: {
        httpStreamable: {
          enabled: true,
          endpoint: '/mcp'
        },
        sse: {
          enabled: true,
          connectionEndpoint: '/mcp/sse',
          messageEndpoint: '/mcp/sse/message',
          activeSessions: sessionStats.activeSessions
        }
      },
      tools: toolDefinitions.map(t => ({
        name: t.name,
        description: t.description
      })),
      claudeDesktopConfig: {
        mcpServers: {
          'risk-management': {
            command: 'npx',
            args: ['-y', 'mcp-remote', `${getBaseUrl(req)}/mcp/sse`]
          }
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /mcp/tools:
 *   get:
 *     summary: List Available MCP Tools
 *     description: Returns detailed information about all available MCP tools
 *     tags: [MCP]
 *     responses:
 *       200:
 *         description: List of MCP tools
 */
router.get('/tools', (req, res) => {
  res.json({
    success: true,
    data: {
      count: toolDefinitions.length,
      tools: toolDefinitions
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Helper to get base URL from request
 */
function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
}

module.exports = router;

