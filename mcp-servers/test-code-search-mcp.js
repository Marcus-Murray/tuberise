#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

class TestCodeSearchMCPServer {
  constructor() {
    this.server = new McpServer({
      name: 'test-code-search',
      version: '1.0.0',
    });

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Semantic search tool
    this.server.registerTool(
      'semantic-search',
      {
        description: 'Perform semantic code search',
        inputSchema: {
          query: z.string().describe('Search query'),
          path: z.string().optional().describe('Path to search in'),
          limit: z.number().default(20).describe('Maximum number of results'),
        },
      },
      async ({ query, path, limit }) => {
        try {
          const targetPath = path || process.cwd();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    query: query,
                    path: targetPath,
                    limit: limit,
                    results: [
                      {
                        file: 'example.js',
                        line: 10,
                        text: 'function exampleFunction() {',
                        relevance: 0.95,
                      },
                    ],
                    count: 1,
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
    console.error('Test Code Search MCP server running on stdio');
  }
}

const server = new TestCodeSearchMCPServer();
server.start().catch(console.error);
