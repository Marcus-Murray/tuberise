#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

class TestAIValidationMCPServer {
  constructor() {
    this.server = new McpServer({
      name: 'test-ai-validation',
      version: '1.0.0',
    });

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Simple test tool
    this.server.registerTool(
      'test-tool',
      {
        description: 'A simple test tool for validation',
        inputSchema: {
          message: z.string().describe('Test message to process'),
        },
      },
      async ({ message }) => {
        try {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Received: ${message}`,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
      }
    );
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Test AI Validation MCP server running on stdio');
  }
}

const server = new TestAIValidationMCPServer();
server.start().catch(console.error);
