#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';

// API Tester MCP Server (mimics Postman functionality)
class APITesterMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'api-tester-mcp',
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
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'test_endpoint',
            description: 'Test an API endpoint with various HTTP methods',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'API endpoint URL to test',
                },
                method: {
                  type: 'string',
                  description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)',
                  default: 'GET',
                },
                headers: {
                  type: 'object',
                  description: 'HTTP headers to send',
                  default: {},
                },
                body: {
                  type: 'object',
                  description: 'Request body (for POST, PUT, PATCH)',
                },
                params: {
                  type: 'object',
                  description: 'Query parameters',
                  default: {},
                },
                timeout: {
                  type: 'number',
                  description: 'Request timeout in milliseconds',
                  default: 10000,
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'test_youtube_api',
            description: 'Test YouTube Data API endpoints',
            inputSchema: {
              type: 'object',
              properties: {
                endpoint: {
                  type: 'string',
                  description:
                    'YouTube API endpoint (channels, videos, analytics)',
                  enum: ['channels', 'videos', 'search', 'analytics'],
                },
                channelId: {
                  type: 'string',
                  description: 'YouTube channel ID',
                },
                videoId: {
                  type: 'string',
                  description:
                    'YouTube video ID (for video-specific endpoints)',
                },
                apiKey: {
                  type: 'string',
                  description: 'YouTube API key',
                },
                params: {
                  type: 'object',
                  description: 'Additional query parameters',
                  default: {},
                },
              },
              required: ['endpoint', 'apiKey'],
            },
          },
          {
            name: 'test_notion_api',
            description: 'Test Notion API endpoints',
            inputSchema: {
              type: 'object',
              properties: {
                endpoint: {
                  type: 'string',
                  description: 'Notion API endpoint',
                  enum: ['databases', 'pages', 'blocks', 'users', 'search'],
                },
                databaseId: {
                  type: 'string',
                  description: 'Notion database ID',
                },
                pageId: {
                  type: 'string',
                  description: 'Notion page ID',
                },
                accessToken: {
                  type: 'string',
                  description: 'Notion access token',
                },
                body: {
                  type: 'object',
                  description: 'Request body for POST/PATCH requests',
                },
              },
              required: ['endpoint', 'accessToken'],
            },
          },
          {
            name: 'test_backend_api',
            description: 'Test our Tuberise backend API endpoints',
            inputSchema: {
              type: 'object',
              properties: {
                endpoint: {
                  type: 'string',
                  description: 'Backend API endpoint',
                  enum: ['auth', 'analytics', 'youtube', 'notion', 'users'],
                },
                path: {
                  type: 'string',
                  description:
                    'Specific path (e.g., /login, /dashboard, /channels)',
                },
                method: {
                  type: 'string',
                  description: 'HTTP method',
                  default: 'GET',
                },
                body: {
                  type: 'object',
                  description: 'Request body',
                },
                headers: {
                  type: 'object',
                  description: 'Additional headers',
                  default: {},
                },
                baseUrl: {
                  type: 'string',
                  description: 'Base URL for the backend',
                  default: 'http://localhost:3000',
                },
              },
              required: ['endpoint', 'path'],
            },
          },
          {
            name: 'validate_response',
            description: 'Validate API response format and content',
            inputSchema: {
              type: 'object',
              properties: {
                response: {
                  type: 'object',
                  description: 'API response object to validate',
                },
                expectedSchema: {
                  type: 'object',
                  description: 'Expected response schema',
                },
                checks: {
                  type: 'array',
                  description: 'Additional validation checks',
                  items: { type: 'string' },
                },
              },
              required: ['response'],
            },
          },
          {
            name: 'generate_test_collection',
            description: 'Generate a Postman collection for API testing',
            inputSchema: {
              type: 'object',
              properties: {
                apis: {
                  type: 'array',
                  description: 'Array of API endpoints to include',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      url: { type: 'string' },
                      method: { type: 'string' },
                      headers: { type: 'object' },
                    },
                  },
                },
                collectionName: {
                  type: 'string',
                  description: 'Name for the collection',
                  default: 'Tuberise API Tests',
                },
              },
              required: ['apis'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'test_endpoint':
            return await this.testEndpoint(args);
          case 'test_youtube_api':
            return await this.testYouTubeAPI(args);
          case 'test_notion_api':
            return await this.testNotionAPI(args);
          case 'test_backend_api':
            return await this.testBackendAPI(args);
          case 'validate_response':
            return await this.validateResponse(args);
          case 'generate_test_collection':
            return await this.generateTestCollection(args);
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

  async testEndpoint(args) {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      params = {},
      timeout = 10000,
    } = args;

    try {
      const config = {
        method: method.toLowerCase(),
        url,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Tuberise-API-Tester/1.0',
          ...headers,
        },
        params,
        timeout,
      };

      if (body && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = body;
      }

      const startTime = Date.now();
      const response = await axios(config);
      const endTime = Date.now();

      return {
        content: [
          {
            type: 'text',
            text: `🌐 **API Test Results**\n\n**Request:**\n- URL: ${url}\n- Method: ${method.toUpperCase()}\n- Headers: ${JSON.stringify(
              headers,
              null,
              2
            )}\n${body ? `- Body: ${JSON.stringify(body, null, 2)}` : ''}\n${
              Object.keys(params).length
                ? `- Params: ${JSON.stringify(params, null, 2)}`
                : ''
            }\n\n**Response:**\n- Status: ${response.status} ${
              response.statusText
            }\n- Response Time: ${
              endTime - startTime
            }ms\n- Headers: ${JSON.stringify(
              response.headers,
              null,
              2
            )}\n\n**Body:**\n\`\`\`json\n${JSON.stringify(
              response.data,
              null,
              2
            )}\n\`\`\`\n\n**Performance:**\n- ✅ Response time: ${
              endTime - startTime
            }ms\n- ✅ Status: ${
              response.status >= 200 && response.status < 300
                ? 'Success'
                : 'Error'
            }`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **API Test Failed**\n\n**Request:**\n- URL: ${url}\n- Method: ${method.toUpperCase()}\n\n**Error:**\n${
              error.message
            }\n\n**Details:**\n${
              error.response
                ? `- Status: ${
                    error.response.status
                  }\n- Response: ${JSON.stringify(
                    error.response.data,
                    null,
                    2
                  )}`
                : 'Network or timeout error'
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  async testYouTubeAPI(args) {
    const { endpoint, channelId, videoId, apiKey, params = {} } = args;

    const baseUrl = 'https://www.googleapis.com/youtube/v3';
    let url,
      method = 'GET',
      body;

    switch (endpoint) {
      case 'channels':
        url = `${baseUrl}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
        break;
      case 'videos':
        url = `${baseUrl}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
        break;
      case 'search':
        url = `${baseUrl}/search?part=snippet&channelId=${channelId}&type=video&key=${apiKey}`;
        break;
      case 'analytics':
        // Note: Analytics API requires OAuth and has different endpoints
        url = `${baseUrl}/analytics/reports?ids=channel==${channelId}&metrics=views,estimatedRevenue&key=${apiKey}`;
        break;
      default:
        throw new Error(`Unknown YouTube endpoint: ${endpoint}`);
    }

    // Add additional params
    Object.keys(params).forEach((key) => {
      url += `&${key}=${params[key]}`;
    });

    return await this.testEndpoint({
      url,
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async testNotionAPI(args) {
    const { endpoint, databaseId, pageId, accessToken, body } = args;

    const baseUrl = 'https://api.notion.com/v1';
    let url,
      method = 'GET';

    switch (endpoint) {
      case 'databases':
        url = databaseId
          ? `${baseUrl}/databases/${databaseId}`
          : `${baseUrl}/databases`;
        break;
      case 'pages':
        url = pageId ? `${baseUrl}/pages/${pageId}` : `${baseUrl}/pages`;
        method = pageId ? 'GET' : 'POST';
        break;
      case 'blocks':
        url = `${baseUrl}/blocks/${pageId}/children`;
        break;
      case 'users':
        url = `${baseUrl}/users`;
        break;
      case 'search':
        url = `${baseUrl}/search`;
        method = 'POST';
        break;
      default:
        throw new Error(`Unknown Notion endpoint: ${endpoint}`);
    }

    return await this.testEndpoint({
      url,
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
      body,
    });
  }

  async testBackendAPI(args) {
    const {
      endpoint,
      path,
      method = 'GET',
      body,
      headers = {},
      baseUrl = 'http://localhost:3000',
    } = args;

    const url = `${baseUrl}/api/${endpoint}${path}`;

    return await this.testEndpoint({
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    });
  }

  async validateResponse(args) {
    const { response, expectedSchema, checks = [] } = args;

    const validations = [];

    // Basic response validation
    if (response.status >= 200 && response.status < 300) {
      validations.push('✅ Status code is in success range');
    } else {
      validations.push('❌ Status code indicates error');
    }

    // Content type validation
    if (response.headers && response.headers['content-type']) {
      if (response.headers['content-type'].includes('application/json')) {
        validations.push('✅ Response is JSON');
      } else {
        validations.push('⚠️ Response is not JSON');
      }
    }

    // Response time validation
    if (response.responseTime) {
      if (response.responseTime < 1000) {
        validations.push('✅ Response time is fast (<1s)');
      } else if (response.responseTime < 3000) {
        validations.push('⚠️ Response time is moderate (<3s)');
      } else {
        validations.push('❌ Response time is slow (>3s)');
      }
    }

    // Data validation
    if (response.data) {
      if (typeof response.data === 'object') {
        validations.push('✅ Response data is an object');

        // Check for common fields
        if (response.data.hasOwnProperty('data')) {
          validations.push('✅ Response has data field');
        }
        if (response.data.hasOwnProperty('error')) {
          validations.push('❌ Response contains error field');
        }
        if (response.data.hasOwnProperty('message')) {
          validations.push('✅ Response has message field');
        }
      } else {
        validations.push('⚠️ Response data is not an object');
      }
    } else {
      validations.push('❌ No response data');
    }

    // Custom checks
    checks.forEach((check) => {
      validations.push(`🔍 Custom check: ${check}`);
    });

    return {
      content: [
        {
          type: 'text',
          text: `📋 **Response Validation Results**\n\n**Response Summary:**\n- Status: ${
            response.status
          }\n- Response Time: ${
            response.responseTime || 'N/A'
          }ms\n- Content-Type: ${
            response.headers?.['content-type'] || 'N/A'
          }\n\n**Validation Results:**\n${validations
            .map((v) => `- ${v}`)
            .join(
              '\n'
            )}\n\n**Recommendations:**\n- Ensure consistent response format\n- Add proper error handling\n- Include response time monitoring\n- Validate input parameters`,
        },
      ],
    };
  }

  async generateTestCollection(args) {
    const { apis, collectionName = 'Tuberise API Tests' } = args;

    const collection = {
      info: {
        name: collectionName,
        description: 'Generated test collection for Tuberise Analytics API',
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: apis.map((api) => ({
        name: api.name,
        request: {
          method: api.method || 'GET',
          header: Object.entries(api.headers || {}).map(([key, value]) => ({
            key,
            value,
            type: 'text',
          })),
          url: {
            raw: api.url,
            protocol: api.url.split('://')[0],
            host: api.url.split('://')[1].split('/'),
            path: api.url.split('/').slice(3),
          },
        },
        response: [],
      })),
    };

    return {
      content: [
        {
          type: 'text',
          text: `📦 **Postman Collection Generated**\n\n**Collection:** ${collectionName}\n**Endpoints:** ${
            apis.length
          }\n\n**Import Instructions:**\n1. Copy the JSON below\n2. Open Postman\n3. Click Import > Raw Text\n4. Paste the JSON and import\n\n**Collection JSON:**\n\`\`\`json\n${JSON.stringify(
            collection,
            null,
            2
          )}\n\`\`\`\n\n**Next Steps:**\n- Add environment variables for base URLs and API keys\n- Create test scripts for response validation\n- Set up automated testing workflows`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('APITester MCP server running on stdio');
  }
}

// Start the server
const server = new APITesterMCPServer();
server.run().catch(console.error);
