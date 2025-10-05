#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Package Manager MCP Server (mimics SourceWizard functionality)
class PackageManagerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'package-manager-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Search packages based on project needs
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'search_packages',
            description:
              'Search for npm packages based on project requirements and intent',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description:
                    'Search query for packages (e.g., "analytics dashboard react")',
                },
                projectType: {
                  type: 'string',
                  description:
                    'Type of project (e.g., "react", "node", "fullstack")',
                  default: 'fullstack',
                },
                category: {
                  type: 'string',
                  description:
                    'Package category (e.g., "ui", "database", "api", "testing")',
                  default: 'general',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'install_package',
            description: 'Install and configure a package in the project',
            inputSchema: {
              type: 'object',
              properties: {
                packageName: {
                  type: 'string',
                  description: 'Name of the package to install',
                },
                packageType: {
                  type: 'string',
                  description: 'Type of package (dev, production, peer)',
                  default: 'production',
                },
                workspace: {
                  type: 'string',
                  description: 'Workspace to install in (for monorepos)',
                  default: 'root',
                },
              },
              required: ['packageName'],
            },
          },
          {
            name: 'analyze_dependencies',
            description:
              'Analyze current project dependencies and suggest improvements',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to package.json file',
                  default: './package.json',
                },
              },
            },
          },
          {
            name: 'suggest_alternatives',
            description:
              'Suggest alternative packages for existing dependencies',
            inputSchema: {
              type: 'object',
              properties: {
                packageName: {
                  type: 'string',
                  description: 'Name of the package to find alternatives for',
                },
                reason: {
                  type: 'string',
                  description:
                    'Reason for seeking alternatives (e.g., "security", "performance", "maintenance")',
                  default: 'general',
                },
              },
              required: ['packageName'],
            },
          },
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_packages':
            return await this.searchPackages(args);
          case 'install_package':
            return await this.installPackage(args);
          case 'analyze_dependencies':
            return await this.analyzeDependencies(args);
          case 'suggest_alternatives':
            return await this.suggestAlternatives(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async searchPackages(args) {
    const { query, projectType, category } = args;

    // Simulate package search with relevant suggestions
    const packageSuggestions = {
      analytics: [
        {
          name: 'recharts',
          description: 'Composable charting library built on React and D3',
          category: 'ui',
        },
        {
          name: 'chart.js',
          description: 'Simple yet flexible JavaScript charting library',
          category: 'ui',
        },
        {
          name: 'd3',
          description: 'Data-driven document manipulation library',
          category: 'data',
        },
        {
          name: 'analytics-node',
          description: 'Official Node.js library for Analytics',
          category: 'analytics',
        },
      ],
      dashboard: [
        {
          name: 'react-grid-layout',
          description: 'A draggable and resizable grid layout for React',
          category: 'ui',
        },
        {
          name: 'react-admin',
          description: 'A frontend framework for building admin applications',
          category: 'framework',
        },
        {
          name: 'ant-design',
          description:
            'Enterprise-class UI design language and React UI library',
          category: 'ui',
        },
        {
          name: 'material-ui',
          description: 'React components implementing Google Material Design',
          category: 'ui',
        },
      ],
      react: [
        {
          name: 'react-query',
          description: 'Data fetching and state management for React',
          category: 'state',
        },
        {
          name: 'react-router',
          description: 'Declarative routing for React',
          category: 'routing',
        },
        {
          name: 'react-hook-form',
          description: 'Performant, flexible and extensible forms library',
          category: 'forms',
        },
        {
          name: 'framer-motion',
          description: 'Production-ready motion library for React',
          category: 'animation',
        },
      ],
      api: [
        {
          name: 'axios',
          description: 'Promise-based HTTP client for the browser and node.js',
          category: 'http',
        },
        {
          name: 'swr',
          description:
            'Data fetching library with caching, revalidation, and more',
          category: 'data',
        },
        {
          name: 'graphql-request',
          description: 'Minimal GraphQL client supporting Node and browsers',
          category: 'graphql',
        },
        {
          name: 'socket.io-client',
          description: 'Realtime application framework',
          category: 'realtime',
        },
      ],
      database: [
        {
          name: 'prisma',
          description: 'Next-generation ORM for Node.js and TypeScript',
          category: 'orm',
        },
        {
          name: 'mongoose',
          description: 'MongoDB object modeling tool',
          category: 'orm',
        },
        {
          name: 'typeorm',
          description: 'ORM for TypeScript and JavaScript',
          category: 'orm',
        },
        {
          name: 'sequelize',
          description: 'Easy-to-use multi SQL dialect ORM',
          category: 'orm',
        },
      ],
    };

    let suggestions = [];

    // Find relevant packages based on query
    for (const [keyword, packages] of Object.entries(packageSuggestions)) {
      if (query.toLowerCase().includes(keyword)) {
        suggestions = suggestions.concat(packages);
      }
    }

    // If no specific matches, provide general recommendations
    if (suggestions.length === 0) {
      suggestions = [
        {
          name: 'lodash',
          description: 'Modern JavaScript utility library',
          category: 'utility',
        },
        {
          name: 'date-fns',
          description: 'Modern JavaScript date utility library',
          category: 'utility',
        },
        {
          name: 'uuid',
          description: 'RFC4122 compliant UUID generator',
          category: 'utility',
        },
        {
          name: 'dotenv',
          description: 'Loads environment variables from .env file',
          category: 'config',
        },
      ];
    }

    // Filter by category if specified
    if (category !== 'general') {
      suggestions = suggestions.filter((pkg) => pkg.category === category);
    }

    const response = suggestions
      .slice(0, 10)
      .map(
        (pkg) =>
          `📦 **${pkg.name}**\n   ${pkg.description}\n   Category: ${pkg.category}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${suggestions.length} packages matching "${query}":\n\n${response}\n\n💡 Use install_package tool to install any of these packages.`,
        },
      ],
    };
  }

  async installPackage(args) {
    const { packageName, packageType, workspace } = args;

    // Simulate package installation
    const installCommand =
      packageType === 'dev'
        ? `npm install --save-dev ${packageName}`
        : `npm install ${packageName}`;

    return {
      content: [
        {
          type: 'text',
          text: `🚀 Installing ${packageName}...\n\n**Command to run:**\n\`\`\`bash\n${installCommand}\n\`\`\`\n\n**Next steps:**\n1. Run the command above in your terminal\n2. Import and use the package in your code\n3. Update your imports if needed\n\n**Package type:** ${packageType}\n**Workspace:** ${workspace}`,
        },
      ],
    };
  }

  async analyzeDependencies(args) {
    const { path } = args;

    return {
      content: [
        {
          type: 'text',
          text: `📊 Analyzing dependencies in ${path}...\n\n**Analysis Results:**\n\n🔍 **Security Check:**\n- Run \`npm audit\` to check for vulnerabilities\n- Consider updating outdated packages\n\n📦 **Bundle Size:**\n- Use \`npm ls --depth=0\` to see direct dependencies\n- Consider using \`bundle-analyzer\` for size analysis\n\n🔄 **Updates Available:**\n- Run \`npm outdated\` to see available updates\n- Consider \`npm update\` for patch updates\n\n💡 **Recommendations:**\n- Remove unused dependencies\n- Use exact versions for critical packages\n- Consider peer dependencies for shared libraries`,
        },
      ],
    };
  }

  async suggestAlternatives(args) {
    const { packageName, reason } = args;

    const alternatives = {
      moment: [
        {
          name: 'date-fns',
          reason: 'Smaller bundle size, tree-shakeable',
          category: 'performance',
        },
        {
          name: 'dayjs',
          reason: 'Moment.js compatible API with smaller size',
          category: 'performance',
        },
        {
          name: 'luxon',
          reason: 'Modern date library with better API',
          category: 'modern',
        },
      ],
      lodash: [
        {
          name: 'ramda',
          reason: 'Functional programming approach',
          category: 'functional',
        },
        {
          name: 'native methods',
          reason: 'Use built-in JavaScript methods',
          category: 'native',
        },
        {
          name: 'just-* packages',
          reason: 'Modular utilities for specific functions',
          category: 'modular',
        },
      ],
      request: [
        {
          name: 'axios',
          reason: 'Promise-based, better error handling',
          category: 'modern',
        },
        { name: 'fetch', reason: 'Native browser API', category: 'native' },
        {
          name: 'node-fetch',
          reason: 'Lightweight fetch implementation',
          category: 'lightweight',
        },
      ],
    };

    const suggestions = alternatives[packageName.toLowerCase()] || [
      {
        name: 'Check npm alternatives',
        reason: 'Use npm search or alternative websites',
        category: 'research',
      },
      {
        name: 'Community recommendations',
        reason: 'Ask in relevant communities',
        category: 'community',
      },
    ];

    const response = suggestions
      .map(
        (alt) =>
          `🔄 **${alt.name}**\n   Reason: ${alt.reason}\n   Category: ${alt.category}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `🔄 Alternatives for ${packageName}:\n\n${response}\n\n**Reason for seeking alternatives:** ${reason}\n\n💡 Consider the trade-offs before switching packages.`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('PackageManager MCP server running on stdio');
  }
}

// Start the server
const server = new PackageManagerMCPServer();
server.run().catch(console.error);
