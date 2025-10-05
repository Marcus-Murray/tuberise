#!/usr/bin/env node

/**
 * Quick Progress Update Script
 * Usage: node update-progress.js "Title" "Status" "Description" "Category"
 *
 * Status options: completed, in_progress, pending, blocked
 * Category options: setup, development, testing, deployment, documentation, mcp, infrastructure
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateProgress(
  title,
  status,
  description,
  category = 'development',
  features = [],
  problems = [],
  solutions = []
) {
  // Get project root directory (one level up from scripts/)
  const projectRoot = path.resolve(__dirname, '..');
  const progressFile = path.join(projectRoot, 'progress.md');

  const statusEmoji = {
    completed: '✅',
    in_progress: '🔄',
    pending: '⏳',
    blocked: '🚫',
  };

  const timestamp = new Date().toISOString();

  let content = '';

  try {
    content = await fs.readFile(progressFile, 'utf-8');
  } catch (error) {
    // File doesn't exist, create it
    content = `# Project Progress Tracker\n\n**Project:** Tuberise Analytics\n**Last Updated:** ${timestamp}\n\n---\n\n`;
  }

  const newEntry = `\n## ${
    statusEmoji[status]
  } ${title}\n\n**Status:** ${status.toUpperCase()}
**Category:** ${category}
**Date:** ${new Date().toLocaleDateString()}
**Description:** ${description}

${
  features.length > 0
    ? `**Features Implemented:**\n${features
        .map((f) => `- ${f}`)
        .join('\n')}\n\n`
    : ''
}${
    problems.length > 0
      ? `**Problems Encountered:**\n${problems
          .map((p) => `- ${p}`)
          .join('\n')}\n\n`
      : ''
  }${
    solutions.length > 0
      ? `**Solutions Implemented:**\n${solutions
          .map((s) => `- ${s}`)
          .join('\n')}\n\n`
      : ''
  }---\n`;

  // Update the last updated timestamp
  content = content.replace(
    /\*\*Last Updated:\*\* .*/,
    `**Last Updated:** ${timestamp}`
  );

  // Add new entry
  content += newEntry;

  await fs.writeFile(progressFile, content, 'utf-8');

  console.log(`✅ Progress updated: "${title}" - ${status}`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(`
Usage: node update-progress.js "Title" "Status" "Description" ["Category"]

Examples:
  node update-progress.js "MCP Server Setup" "completed" "Set up 4 custom MCP servers" "mcp"
  node update-progress.js "API Testing" "in_progress" "Testing YouTube API integration" "testing"
  node update-progress.js "Database Schema" "pending" "Design user and analytics tables" "development"

Status options: completed, in_progress, pending, blocked
Category options: setup, development, testing, deployment, documentation, mcp, infrastructure
  `);
  process.exit(1);
}

const [title, status, description, category = 'development'] = args;

// Validate status
const validStatuses = ['completed', 'in_progress', 'pending', 'blocked'];
if (!validStatuses.includes(status)) {
  console.error(
    `❌ Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`
  );
  process.exit(1);
}

// Validate category
const validCategories = [
  'setup',
  'development',
  'testing',
  'deployment',
  'documentation',
  'mcp',
  'infrastructure',
];
if (!validCategories.includes(category)) {
  console.error(
    `❌ Invalid category: ${category}. Must be one of: ${validCategories.join(
      ', '
    )}`
  );
  process.exit(1);
}

updateProgress(title, status, description, category).catch(console.error);
