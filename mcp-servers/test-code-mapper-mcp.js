#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

class TestCodeMapperMCPServer {
  constructor() {
    this.server = new McpServer({
      name: 'test-code-mapper',
      version: '1.0.0',
    });

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Generate dependency map tool
    this.server.registerTool(
      'generate-map',
      {
        description: 'Generate code dependency map',
        inputSchema: {
          path: z.string().optional().describe('Path to analyze'),
          outputFormat: z
            .enum(['json', 'graph', 'text'])
            .default('json')
            .describe('Output format'),
        },
      },
      async ({ path, outputFormat }) => {
        try {
          const targetPath = path || process.cwd();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    path: targetPath,
                    format: outputFormat,
                    map: {
                      nodes: [
                        { id: 'file1.js', type: 'javascript', dependencies: 2 },
                        { id: 'file2.js', type: 'javascript', dependencies: 1 },
                      ],
                      edges: [
                        {
                          source: 'file1.js',
                          target: 'file2.js',
                          type: 'import',
                        },
                      ],
                    },
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
    console.error('Test Code Mapper MCP server running on stdio');
  }
}

const server = new TestCodeMapperMCPServer();
server.start().catch(console.error);
