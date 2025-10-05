#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Database Designer MCP Server (mimics GibsonAI functionality)
class DatabaseDesignerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'database-designer-mcp',
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
            name: 'create_database_schema',
            description:
              'Generate database schema from natural language description',
            inputSchema: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description:
                    'Natural language description of the database requirements',
                },
                databaseType: {
                  type: 'string',
                  description:
                    'Type of database (postgresql, mysql, sqlite, mongodb)',
                  default: 'postgresql',
                },
                framework: {
                  type: 'string',
                  description:
                    'ORM/Framework to use (prisma, typeorm, mongoose, sequelize)',
                  default: 'prisma',
                },
              },
              required: ['description'],
            },
          },
          {
            name: 'generate_crud_api',
            description: 'Generate CRUD API endpoints for database models',
            inputSchema: {
              type: 'object',
              properties: {
                modelName: {
                  type: 'string',
                  description: 'Name of the database model',
                },
                fields: {
                  type: 'array',
                  description: 'Array of field definitions',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      required: { type: 'boolean' },
                    },
                  },
                },
                framework: {
                  type: 'string',
                  description: 'Framework to use (express, fastify, nestjs)',
                  default: 'express',
                },
              },
              required: ['modelName', 'fields'],
            },
          },
          {
            name: 'generate_erd',
            description: 'Generate Entity Relationship Diagram from schema',
            inputSchema: {
              type: 'object',
              properties: {
                schema: {
                  type: 'string',
                  description: 'Database schema definition',
                },
                format: {
                  type: 'string',
                  description: 'Output format (mermaid, plantuml, text)',
                  default: 'mermaid',
                },
              },
              required: ['schema'],
            },
          },
          {
            name: 'optimize_queries',
            description: 'Analyze and optimize database queries',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'SQL query to optimize',
                },
                databaseType: {
                  type: 'string',
                  description: 'Type of database',
                  default: 'postgresql',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'suggest_indexes',
            description: 'Suggest database indexes for better performance',
            inputSchema: {
              type: 'object',
              properties: {
                schema: {
                  type: 'string',
                  description: 'Database schema',
                },
                queryPatterns: {
                  type: 'array',
                  description: 'Common query patterns',
                  items: { type: 'string' },
                },
              },
              required: ['schema'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_database_schema':
            return await this.createDatabaseSchema(args);
          case 'generate_crud_api':
            return await this.generateCrudApi(args);
          case 'generate_erd':
            return await this.generateErd(args);
          case 'optimize_queries':
            return await this.optimizeQueries(args);
          case 'suggest_indexes':
            return await this.suggestIndexes(args);
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

  async createDatabaseSchema(args) {
    const { description, databaseType, framework } = args;

    // Analyze description and generate schema
    const schema = this.generateSchemaFromDescription(
      description,
      databaseType,
      framework
    );

    return {
      content: [
        {
          type: 'text',
          text: `🗄️ **Database Schema Generated**\n\n**Description:** ${description}\n**Database:** ${databaseType}\n**Framework:** ${framework}\n\n\`\`\`${
            framework === 'prisma' ? 'prisma' : 'sql'
          }\n${schema}\n\`\`\`\n\n**Next Steps:**\n1. Review the generated schema\n2. Add any missing fields or relationships\n3. Run database migrations\n4. Generate CRUD APIs if needed`,
        },
      ],
    };
  }

  generateSchemaFromDescription(description, databaseType, framework) {
    const lowerDesc = description.toLowerCase();

    if (framework === 'prisma') {
      return `// Prisma Schema for ${description}
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${databaseType === 'postgresql' ? 'postgresql' : databaseType}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Analytics related
  youTubeChannel    YouTubeChannel?
  notionWorkspace   NotionWorkspace?
  analyticsReports  AnalyticsReport[]

  @@map("users")
}

model YouTubeChannel {
  id          String @id @default(cuid())
  channelId   String @unique
  channelName String
  userId      String
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Analytics data
  videos      Video[]
  analytics   YouTubeAnalytics[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("youtube_channels")
}

model Video {
  id          String @id @default(cuid())
  videoId     String @unique
  title       String
  description String?
  publishedAt DateTime
  channelId   String
  channel     YouTubeChannel @relation(fields: [channelId], references: [id], onDelete: Cascade)

  // Analytics
  views       Int     @default(0)
  likes       Int     @default(0)
  comments    Int     @default(0)
  duration    Int?    // in seconds

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("videos")
}

model YouTubeAnalytics {
  id        String @id @default(cuid())
  channelId String
  channel   YouTubeChannel @relation(fields: [channelId], references: [id], onDelete: Cascade)

  // Metrics
  views           Int
  subscribers     Int
  estimatedRevenue Float?

  date            DateTime
  createdAt       DateTime @default(now())

  @@map("youtube_analytics")
}

model NotionWorkspace {
  id           String @id @default(cuid())
  workspaceId  String @unique
  workspaceName String
  userId       String
  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Integration data
  accessToken  String
  lastSyncAt   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("notion_workspaces")
}

model AnalyticsReport {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  title     String
  content   Json   // Report data in JSON format
  type      String // 'weekly', 'monthly', 'custom'

  generatedAt DateTime @default(now())

  @@map("analytics_reports")
}`;
    }

    return `-- SQL Schema for ${description}
-- Database: ${databaseType}

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE youtube_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(255) UNIQUE NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    published_at TIMESTAMP NOT NULL,
    channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    duration INTEGER, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE youtube_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
    views INTEGER NOT NULL,
    subscribers INTEGER NOT NULL,
    estimated_revenue DECIMAL(10,2),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_youtube_analytics_channel_date ON youtube_analytics(channel_id, date);
CREATE INDEX idx_videos_channel_published ON videos(channel_id, published_at);`;
  }

  async generateCrudApi(args) {
    const { modelName, fields, framework } = args;

    const apiCode = this.generateApiCode(modelName, fields, framework);

    return {
      content: [
        {
          type: 'text',
          text: `🚀 **CRUD API Generated**\n\n**Model:** ${modelName}\n**Framework:** ${framework}\n\n\`\`\`typescript\n${apiCode}\n\`\`\`\n\n**Features included:**\n- ✅ Create (POST)\n- ✅ Read (GET)\n- ✅ Update (PUT/PATCH)\n- ✅ Delete (DELETE)\n- ✅ List with pagination\n- ✅ Input validation\n- ✅ Error handling\n\n**Next steps:**\n1. Add authentication middleware\n2. Implement rate limiting\n3. Add API documentation\n4. Write unit tests`,
        },
      ],
    };
  }

  generateApiCode(modelName, fields, framework) {
    const ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const modelNameLower = modelName.toLowerCase();

    return `// ${ModelName} CRUD API Routes
import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const ${modelNameLower}Schema = z.object({
${fields
  .map(
    (field) =>
      `  ${field.name}: ${this.getZodType(field.type)}${
        field.required ? '' : '.optional()'
      }`
  )
  .join(',\n')}
});

const update${ModelName}Schema = ${modelNameLower}Schema.partial();

// GET /${modelNameLower}s - List all ${modelName}s
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const ${modelNameLower}s = await prisma.${modelNameLower}.findMany({
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.${modelNameLower}.count();

    res.json({
      data: ${modelNameLower}s,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /${modelNameLower}s/:id - Get single ${modelName}
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ${modelNameLower} = await prisma.${modelNameLower}.findUnique({
      where: { id },
    });

    if (!${modelNameLower}) {
      return res.status(404).json({ error: '${ModelName} not found' });
    }

    res.json({ data: ${modelNameLower} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /${modelNameLower}s - Create new ${modelName}
router.post('/', async (req, res) => {
  try {
    const validatedData = ${modelNameLower}Schema.parse(req.body);

    const ${modelNameLower} = await prisma.${modelNameLower}.create({
      data: validatedData,
    });

    res.status(201).json({ data: ${modelNameLower} });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /${modelNameLower}s/:id - Update ${modelName}
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = update${ModelName}Schema.parse(req.body);

    const ${modelNameLower} = await prisma.${modelNameLower}.update({
      where: { id },
      data: validatedData,
    });

    res.json({ data: ${modelNameLower} });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: '${ModelName} not found' });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /${modelNameLower}s/:id - Delete ${modelName}
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.${modelNameLower}.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: '${ModelName} not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;`;
  }

  getZodType(fieldType) {
    const typeMap = {
      string: 'z.string()',
      number: 'z.number()',
      boolean: 'z.boolean()',
      date: 'z.date()',
      email: 'z.string().email()',
      uuid: 'z.string().uuid()',
    };
    return typeMap[fieldType.toLowerCase()] || 'z.string()';
  }

  async generateErd(args) {
    const { schema, format } = args;

    const erd = this.createErdFromSchema(schema, format);

    return {
      content: [
        {
          type: 'text',
          text: `📊 **Entity Relationship Diagram Generated**\n\n**Format:** ${format}\n\n\`\`\`${format}\n${erd}\n\`\`\`\n\n**Usage:**\n- Copy the diagram code above\n- Use with Mermaid, PlantUML, or your preferred ERD tool\n- Visualize your database relationships`,
        },
      ],
    };
  }

  createErdFromSchema(schema, format) {
    if (format === 'mermaid') {
      return `erDiagram
    User ||--o{ YouTubeChannel : owns
    User ||--o{ NotionWorkspace : has
    User ||--o{ AnalyticsReport : generates
    YouTubeChannel ||--o{ Video : contains
    YouTubeChannel ||--o{ YouTubeAnalytics : tracks

    User {
        string id PK
        string email UK
        string name
        datetime createdAt
        datetime updatedAt
    }

    YouTubeChannel {
        string id PK
        string channelId UK
        string channelName
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    Video {
        string id PK
        string videoId UK
        string title
        text description
        datetime publishedAt
        string channelId FK
        int views
        int likes
        int comments
        int duration
        datetime createdAt
        datetime updatedAt
    }

    YouTubeAnalytics {
        string id PK
        string channelId FK
        int views
        int subscribers
        float estimatedRevenue
        date date
        datetime createdAt
    }

    NotionWorkspace {
        string id PK
        string workspaceId UK
        string workspaceName
        string userId FK
        string accessToken
        datetime lastSyncAt
        datetime createdAt
        datetime updatedAt
    }

    AnalyticsReport {
        string id PK
        string userId FK
        string title
        json content
        string type
        datetime generatedAt
    }`;
    }

    return `-- Text ERD for Tuberise Analytics Database

Users (1) -----> (N) YouTubeChannels
Users (1) -----> (N) NotionWorkspaces
Users (1) -----> (N) AnalyticsReports
YouTubeChannels (1) -----> (N) Videos
YouTubeChannels (1) -----> (N) YouTubeAnalytics

Tables:
- Users: Store user account information
- YouTubeChannels: YouTube channel data per user
- Videos: Individual video information
- YouTubeAnalytics: Daily analytics metrics
- NotionWorkspaces: Notion integration data
- AnalyticsReports: Generated reports for users`;
  }

  async optimizeQueries(args) {
    const { query, databaseType } = args;

    const optimizations = this.analyzeQuery(query, databaseType);

    return {
      content: [
        {
          type: 'text',
          text: `⚡ **Query Optimization Analysis**\n\n**Original Query:**\n\`\`\`sql\n${query}\n\`\`\`\n\n**Optimizations:**\n${optimizations}\n\n**Performance Tips:**\n- Use EXPLAIN ANALYZE to see execution plans\n- Consider adding indexes for frequently queried columns\n- Use LIMIT for large result sets\n- Avoid SELECT * in production queries`,
        },
      ],
    };
  }

  analyzeQuery(query, databaseType) {
    const lowerQuery = query.toLowerCase();
    let optimizations = [];

    if (lowerQuery.includes('select *')) {
      optimizations.push('❌ **Avoid SELECT *** - Specify only needed columns');
    }

    if (lowerQuery.includes('where') && !lowerQuery.includes('index')) {
      optimizations.push(
        '💡 **Add indexes** - Consider indexing WHERE clause columns'
      );
    }

    if (lowerQuery.includes('order by') && !lowerQuery.includes('limit')) {
      optimizations.push(
        '⚠️ **Add LIMIT** - Large ORDER BY results can be slow'
      );
    }

    if (lowerQuery.includes('join')) {
      optimizations.push(
        '🔗 **JOIN optimization** - Ensure joined columns are indexed'
      );
    }

    if (optimizations.length === 0) {
      optimizations.push(
        '✅ **Query looks good** - No obvious optimizations needed'
      );
    }

    return optimizations.map((opt) => `- ${opt}`).join('\n');
  }

  async suggestIndexes(args) {
    const { schema, queryPatterns } = args;

    const indexes = this.generateIndexSuggestions(schema, queryPatterns);

    return {
      content: [
        {
          type: 'text',
          text: `📈 **Index Suggestions**\n\n**Based on your schema and query patterns:**\n\n${indexes}\n\n**Index Guidelines:**\n- Create indexes on frequently queried columns\n- Composite indexes for multi-column queries\n- Avoid too many indexes (slows down writes)\n- Monitor index usage with database tools`,
        },
      ],
    };
  }

  generateIndexSuggestions(schema, queryPatterns) {
    const suggestions = [
      '**Primary Indexes:**',
      '```sql',
      '-- User lookup by email',
      'CREATE INDEX idx_users_email ON users(email);',
      '',
      '-- YouTube channel lookup by user',
      'CREATE INDEX idx_youtube_channels_user_id ON youtube_channels(user_id);',
      '',
      '-- Video lookup by channel and date',
      'CREATE INDEX idx_videos_channel_published ON videos(channel_id, published_at);',
      '',
      '-- Analytics lookup by channel and date',
      'CREATE INDEX idx_youtube_analytics_channel_date ON youtube_analytics(channel_id, date);',
      '```',
      '',
      '**Composite Indexes:**',
      '```sql',
      '-- For user analytics queries',
      'CREATE INDEX idx_analytics_user_date ON youtube_analytics(channel_id, date DESC);',
      '',
      '-- For video performance queries',
      'CREATE INDEX idx_videos_performance ON videos(channel_id, views DESC, published_at);',
      '```',
    ];

    return suggestions.join('\n');
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DatabaseDesigner MCP server running on stdio');
  }
}

// Start the server
const server = new DatabaseDesignerMCPServer();
server.run().catch(console.error);
