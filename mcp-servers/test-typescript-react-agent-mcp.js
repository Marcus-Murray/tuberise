#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

class TestTypeScriptReactAgentMCPServer {
  constructor() {
    this.server = new McpServer({
      name: 'test-typescript-react-agent',
      version: '1.0.0',
    });

    this.memoryBank = new Map();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Store memory tool
    this.server.registerTool(
      'store-memory',
      {
        description: 'Store information in memory bank',
        inputSchema: {
          key: z.string().describe('Memory key'),
          value: z.string().describe('Value to store'),
          category: z
            .enum(['project', 'component', 'pattern', 'issue', 'solution'])
            .default('project')
            .describe('Memory category'),
        },
      },
      async ({ key, value, category }) => {
        try {
          this.memoryBank.set(key, {
            value,
            category,
            timestamp: new Date().toISOString(),
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Stored ${key} in ${category} memory bank`,
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

    // Retrieve memory tool
    this.server.registerTool(
      'retrieve-memory',
      {
        description: 'Retrieve information from memory bank',
        inputSchema: {
          key: z.string().optional().describe('Memory key to retrieve'),
          category: z
            .enum(['project', 'component', 'pattern', 'issue', 'solution'])
            .optional()
            .describe('Memory category to search'),
        },
      },
      async ({ key, category }) => {
        try {
          let results = [];

          if (key) {
            const entry = this.memoryBank.get(key);
            if (entry) {
              results = [entry];
            }
          } else if (category) {
            for (const [k, v] of this.memoryBank) {
              if (v.category === category) {
                results.push({ key: k, ...v });
              }
            }
          } else {
            for (const [k, v] of this.memoryBank) {
              results.push({ key: k, ...v });
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    results,
                    count: results.length,
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
    console.error('Test TypeScript React Agent MCP server running on stdio');
  }
}

const server = new TestTypeScriptReactAgentMCPServer();
server.start().catch(console.error);
