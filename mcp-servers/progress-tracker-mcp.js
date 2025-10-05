#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProgressTrackerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'progress-tracker',
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
    // Add progress entry
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'add_progress_entry',
            description: 'Add a new progress entry to the progress.md file',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the progress entry',
                },
                status: {
                  type: 'string',
                  enum: ['completed', 'in_progress', 'pending', 'blocked'],
                  description: 'Status of the task/feature',
                },
                description: {
                  type: 'string',
                  description: 'Detailed description of what was accomplished',
                },
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of features implemented',
                },
                problems: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of problems encountered',
                },
                solutions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of solutions implemented',
                },
                category: {
                  type: 'string',
                  enum: [
                    'setup',
                    'development',
                    'testing',
                    'deployment',
                    'documentation',
                    'mcp',
                    'infrastructure',
                  ],
                  description: 'Category of the progress entry',
                },
                timestamp: {
                  type: 'string',
                  description: 'Timestamp for the entry (ISO format)',
                  default: new Date().toISOString(),
                },
              },
              required: ['title', 'status', 'description', 'category'],
            },
          },
          {
            name: 'update_progress_status',
            description: 'Update the status of an existing progress entry',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the progress entry to update',
                },
                newStatus: {
                  type: 'string',
                  enum: ['completed', 'in_progress', 'pending', 'blocked'],
                  description: 'New status for the entry',
                },
                additionalNotes: {
                  type: 'string',
                  description: 'Additional notes to add to the entry',
                },
              },
              required: ['title', 'newStatus'],
            },
          },
          {
            name: 'add_milestone',
            description:
              'Add a major milestone or checkpoint to the progress file',
            inputSchema: {
              type: 'object',
              properties: {
                milestone: {
                  type: 'string',
                  description: 'Name of the milestone',
                },
                description: {
                  type: 'string',
                  description: 'Description of what was achieved',
                },
                achievements: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of specific achievements',
                },
                nextSteps: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Next steps or upcoming tasks',
                },
                date: {
                  type: 'string',
                  description: 'Date of the milestone (ISO format)',
                  default: new Date().toISOString(),
                },
              },
              required: ['milestone', 'description'],
            },
          },
          {
            name: 'generate_progress_summary',
            description: 'Generate a summary of current progress',
            inputSchema: {
              type: 'object',
              properties: {
                includeStats: {
                  type: 'boolean',
                  description: 'Include statistics in the summary',
                  default: true,
                },
                format: {
                  type: 'string',
                  enum: ['markdown', 'json', 'text'],
                  description: 'Output format for the summary',
                  default: 'markdown',
                },
              },
            },
          },
          {
            name: 'backup_progress',
            description: 'Create a backup of the current progress.md file',
            inputSchema: {
              type: 'object',
              properties: {
                backupName: {
                  type: 'string',
                  description: 'Name for the backup file',
                  default: `progress-backup-${
                    new Date().toISOString().split('T')[0]
                  }.md`,
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'add_progress_entry':
            return await this.addProgressEntry(args);
          case 'update_progress_status':
            return await this.updateProgressStatus(args);
          case 'add_milestone':
            return await this.addMilestone(args);
          case 'generate_progress_summary':
            return await this.generateProgressSummary(args);
          case 'backup_progress':
            return await this.backupProgress(args);
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

  async addProgressEntry(args) {
    const schema = z.object({
      title: z.string(),
      status: z.enum(['completed', 'in_progress', 'pending', 'blocked']),
      description: z.string(),
      features: z.array(z.string()).optional(),
      problems: z.array(z.string()).optional(),
      solutions: z.array(z.string()).optional(),
      category: z.enum([
        'setup',
        'development',
        'testing',
        'deployment',
        'documentation',
        'mcp',
        'infrastructure',
      ]),
      timestamp: z.string().optional().default(new Date().toISOString()),
    });

    const validated = schema.parse(args);

    // Get project root directory (one level up from mcp-servers/)
    const projectRoot = path.resolve(__dirname, '..');
    const progressFile = path.join(projectRoot, 'progress.md');
    let content = '';

    try {
      content = await fs.readFile(progressFile, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      content = `# Project Progress Tracker\n\n**Project:** Tuberise Analytics\n**Last Updated:** ${new Date().toISOString()}\n\n---\n\n`;
    }

    const statusEmoji = {
      completed: '✅',
      in_progress: '🔄',
      pending: '⏳',
      blocked: '🚫',
    };

    const newEntry = `\n## ${statusEmoji[validated.status]} ${
      validated.title
    }\n\n**Status:** ${validated.status.toUpperCase()}
**Category:** ${validated.category}
**Date:** ${new Date(validated.timestamp).toLocaleDateString()}
**Description:** ${validated.description}

${
  validated.features && validated.features.length > 0
    ? `**Features Implemented:**\n${validated.features
        .map((f) => `- ${f}`)
        .join('\n')}\n\n`
    : ''
}${
      validated.problems && validated.problems.length > 0
        ? `**Problems Encountered:**\n${validated.problems
            .map((p) => `- ${p}`)
            .join('\n')}\n\n`
        : ''
    }${
      validated.solutions && validated.solutions.length > 0
        ? `**Solutions Implemented:**\n${validated.solutions
            .map((s) => `- ${s}`)
            .join('\n')}\n\n`
        : ''
    }---\n`;

    // Update the last updated timestamp
    content = content.replace(
      /\*\*Last Updated:\*\* .*/,
      `**Last Updated:** ${new Date().toISOString()}`
    );

    // Add new entry
    content += newEntry;

    await fs.writeFile(progressFile, content, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added progress entry: "${validated.title}" with status: ${validated.status}`,
        },
      ],
    };
  }

  async updateProgressStatus(args) {
    const schema = z.object({
      title: z.string(),
      newStatus: z.enum(['completed', 'in_progress', 'pending', 'blocked']),
      additionalNotes: z.string().optional(),
    });

    const validated = schema.parse(args);

    // Get project root directory (one level up from mcp-servers/)
    const projectRoot = path.resolve(__dirname, '..');
    const progressFile = path.join(projectRoot, 'progress.md');
    let content = await fs.readFile(progressFile, 'utf-8');

    const statusEmoji = {
      completed: '✅',
      in_progress: '🔄',
      pending: '⏳',
      blocked: '🚫',
    };

    // Find and update the entry
    const entryRegex = new RegExp(
      `(## [^\\n]*${validated.title}[^\\n]*\\n[\\s\\S]*?)(---)`,
      'g'
    );
    content = content.replace(entryRegex, (match, entryContent, separator) => {
      // Update status
      let updatedContent = entryContent.replace(
        /\*\*Status:\*\* .*/,
        `**Status:** ${validated.newStatus.toUpperCase()}`
      );

      // Update emoji in title
      updatedContent = updatedContent.replace(
        /^## [^\\n]*/,
        `## ${statusEmoji[validated.newStatus]} ${validated.title}`
      );

      // Add additional notes if provided
      if (validated.additionalNotes) {
        updatedContent += `**Additional Notes:** ${validated.additionalNotes}\n\n`;
      }

      return updatedContent + separator;
    });

    // Update last updated timestamp
    content = content.replace(
      /\*\*Last Updated:\*\* .*/,
      `**Last Updated:** ${new Date().toISOString()}`
    );

    await fs.writeFile(progressFile, content, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated progress entry: "${validated.title}" to status: ${validated.newStatus}`,
        },
      ],
    };
  }

  async addMilestone(args) {
    const schema = z.object({
      milestone: z.string(),
      description: z.string(),
      achievements: z.array(z.string()).optional(),
      nextSteps: z.array(z.string()).optional(),
      date: z.string().optional().default(new Date().toISOString()),
    });

    const validated = schema.parse(args);

    // Get project root directory (one level up from mcp-servers/)
    const projectRoot = path.resolve(__dirname, '..');
    const progressFile = path.join(projectRoot, 'progress.md');
    let content = await fs.readFile(progressFile, 'utf-8');

    const milestoneEntry = `\n# 🎯 MILESTONE: ${
      validated.milestone
    }\n\n**Date:** ${new Date(validated.date).toLocaleDateString()}
**Description:** ${validated.description}

${
  validated.achievements && validated.achievements.length > 0
    ? `**Key Achievements:**\n${validated.achievements
        .map((a) => `- ✅ ${a}`)
        .join('\n')}\n\n`
    : ''
}${
      validated.nextSteps && validated.nextSteps.length > 0
        ? `**Next Steps:**\n${validated.nextSteps
            .map((s) => `- 📋 ${s}`)
            .join('\n')}\n\n`
        : ''
    }---\n\n`;

    // Update the last updated timestamp
    content = content.replace(
      /\*\*Last Updated:\*\* .*/,
      `**Last Updated:** ${new Date().toISOString()}`
    );

    // Add milestone entry
    content += milestoneEntry;

    await fs.writeFile(progressFile, content, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added milestone: "${validated.milestone}"`,
        },
      ],
    };
  }

  async generateProgressSummary(args) {
    const schema = z.object({
      includeStats: z.boolean().default(true),
      format: z.enum(['markdown', 'json', 'text']).default('markdown'),
    });

    const validated = schema.parse(args);

    // Get project root directory (one level up from mcp-servers/)
    const projectRoot = path.resolve(__dirname, '..');
    const progressFile = path.join(projectRoot, 'progress.md');
    let content = '';

    try {
      content = await fs.readFile(progressFile, 'utf-8');
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: 'No progress file found. Use add_progress_entry to create your first entry.',
          },
        ],
      };
    }

    // Parse the content to extract statistics
    const entries = content.match(/## [^\\n]*/g) || [];
    const milestones = content.match(/# 🎯 MILESTONE: [^\\n]*/g) || [];

    const statusCounts = {
      completed: (content.match(/\*\*Status:\*\* COMPLETED/g) || []).length,
      in_progress: (content.match(/\*\*Status:\*\* IN_PROGRESS/g) || []).length,
      pending: (content.match(/\*\*Status:\*\* PENDING/g) || []).length,
      blocked: (content.match(/\*\*Status:\*\* BLOCKED/g) || []).length,
    };

    let summary = '';

    if (validated.format === 'json') {
      summary = JSON.stringify(
        {
          totalEntries: entries.length,
          milestones: milestones.length,
          statusBreakdown: statusCounts,
          lastUpdated:
            content.match(/\*\*Last Updated:\*\* (.*)/)?.[1] || 'Unknown',
        },
        null,
        2
      );
    } else if (validated.format === 'text') {
      summary = `Progress Summary:
- Total Entries: ${entries.length}
- Milestones: ${milestones.length}
- Completed: ${statusCounts.completed}
- In Progress: ${statusCounts.in_progress}
- Pending: ${statusCounts.pending}
- Blocked: ${statusCounts.blocked}`;
    } else {
      summary = `# Progress Summary\n\n${
        validated.includeStats
          ? `**Statistics:**\n- Total Entries: ${entries.length}\n- Milestones: ${milestones.length}\n- Completed: ${statusCounts.completed}\n- In Progress: ${statusCounts.in_progress}\n- Pending: ${statusCounts.pending}\n- Blocked: ${statusCounts.blocked}\n\n`
          : ''
      }**Last Updated:** ${
        content.match(/\*\*Last Updated:\*\* (.*)/)?.[1] || 'Unknown'
      }`;
    }

    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    };
  }

  async backupProgress(args) {
    const schema = z.object({
      backupName: z
        .string()
        .default(
          `progress-backup-${new Date().toISOString().split('T')[0]}.md`
        ),
    });

    const validated = schema.parse(args);

    // Get project root directory (one level up from mcp-servers/)
    const projectRoot = path.resolve(__dirname, '..');
    const progressFile = path.join(projectRoot, 'progress.md');
    const backupFile = path.join(projectRoot, validated.backupName);

    try {
      const content = await fs.readFile(progressFile, 'utf-8');
      await fs.writeFile(backupFile, content, 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text: `Successfully created backup: ${validated.backupName}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Progress Tracker MCP server running on stdio');
  }
}

const server = new ProgressTrackerMCPServer();
server.run().catch(console.error);
