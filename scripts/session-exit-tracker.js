#!/usr/bin/env node

/**
 * Session Exit Tracker - Automated Work Log Updates
 *
 * This script monitors for Cursor exit events and provides a popup
 * to update work logs automatically.
 *
 * Usage: node session-exit-tracker.js
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SessionExitTracker {
  constructor() {
    this.sessionStartTime = new Date();
    this.sessionEndTime = null;
    this.sessionDuration = null;
    // Get project root directory (one level up from scripts/)
    const projectRoot = path.resolve(__dirname, '..');
    this.workLogFile = path.join(projectRoot, 'process-status.md');
    this.progressFile = path.join(projectRoot, 'progress.md');
    this.setupExitHandlers();
  }

  setupExitHandlers() {
    // Handle various exit events
    process.on('SIGINT', () => this.handleExit('SIGINT'));
    process.on('SIGTERM', () => this.handleExit('SIGTERM'));
    process.on('exit', () => this.handleExit('exit'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.handleExit('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.handleExit('unhandledRejection');
    });

    console.log('🔄 Session Exit Tracker initialized');
    console.log(`📅 Session started: ${this.sessionStartTime.toISOString()}`);
    console.log('💡 Press Ctrl+C or close Cursor to trigger work log update');
  }

  async handleExit(reason) {
    this.sessionEndTime = new Date();
    this.sessionDuration = this.sessionEndTime - this.sessionStartTime;

    console.log('\n🔄 Session ending...');
    console.log(
      `⏱️  Session duration: ${this.formatDuration(this.sessionDuration)}`
    );

    // Show popup for work log update
    await this.showWorkLogPopup();
  }

  async showWorkLogPopup() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n' + '='.repeat(60));
    console.log('📝 WORK LOG UPDATE REQUIRED');
    console.log('='.repeat(60));

    try {
      const sessionSummary = await this.promptForInput(
        rl,
        '📋 Session Summary (what was accomplished): '
      );
      const features = await this.promptForInput(
        rl,
        '🔧 Features Implemented (comma-separated): '
      );
      const problems = await this.promptForInput(
        rl,
        '🚨 Problems Encountered (comma-separated, or "none"): '
      );
      const solutions = await this.promptForInput(
        rl,
        '✅ Solutions Implemented (comma-separated, or "none"): '
      );
      const nextSteps = await this.promptForInput(
        rl,
        '🚀 Next Steps (comma-separated): '
      );
      const status = await this.promptForInput(
        rl,
        '📊 Session Status (completed/in_progress/blocked): '
      );

      // Validate status
      const validStatuses = ['completed', 'in_progress', 'blocked'];
      if (!validStatuses.includes(status.toLowerCase())) {
        console.log('⚠️  Invalid status, defaulting to "completed"');
        status = 'completed';
      }

      // Parse comma-separated values
      const featuresList =
        features.toLowerCase() === 'none'
          ? []
          : features
              .split(',')
              .map((f) => f.trim())
              .filter((f) => f);
      const problemsList =
        problems.toLowerCase() === 'none'
          ? []
          : problems
              .split(',')
              .map((p) => p.trim())
              .filter((p) => p);
      const solutionsList =
        solutions.toLowerCase() === 'none'
          ? []
          : solutions
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s);
      const nextStepsList = nextSteps
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      // Update work logs
      await this.updateWorkLogs({
        sessionSummary,
        features: featuresList,
        problems: problemsList,
        solutions: solutionsList,
        nextSteps: nextStepsList,
        status: status.toLowerCase(),
      });

      console.log('\n✅ Work logs updated successfully!');
    } catch (error) {
      console.error('❌ Error updating work logs:', error.message);
    } finally {
      rl.close();
    }
  }

  promptForInput(rl, question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async updateWorkLogs(data) {
    const timestamp = new Date().toISOString();

    // Update progress.md
    await this.updateProgressFile(data, timestamp);

    // Update process-status.md
    await this.updateProcessStatusFile(data, timestamp);

    // Create session summary file
    await this.createSessionSummary(data, timestamp);
  }

  async updateProgressFile(data, timestamp) {
    let content = '';

    try {
      content = await fs.readFile(this.progressFile, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      content = `# Project Progress Tracker\n\n**Project:** Tuberise Analytics\n**Last Updated:** ${timestamp}\n\n---\n\n`;
    }

    const statusEmoji = {
      completed: '✅',
      in_progress: '🔄',
      blocked: '🚫',
    };

    const newEntry = `\n## ${
      statusEmoji[data.status]
    } Session Work Log - ${new Date().toLocaleDateString()}\n\n**Status:** ${data.status.toUpperCase()}\n**Category:** documentation\n**Date:** ${new Date().toLocaleDateString()}\n**Duration:** ${this.formatDuration(
      this.sessionDuration
    )}\n**Description:** ${data.sessionSummary}

${
  data.features.length > 0
    ? `**Features Implemented:**\n${data.features
        .map((f) => `- ${f}`)
        .join('\n')}\n\n`
    : ''
}${
      data.problems.length > 0
        ? `**Problems Encountered:**\n${data.problems
            .map((p) => `- ${p}`)
            .join('\n')}\n\n`
        : ''
    }${
      data.solutions.length > 0
        ? `**Solutions Implemented:**\n${data.solutions
            .map((s) => `- ${s}`)
            .join('\n')}\n\n`
        : ''
    }${
      data.nextSteps.length > 0
        ? `**Next Steps:**\n${data.nextSteps
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

    await fs.writeFile(this.progressFile, content, 'utf-8');
  }

  async updateProcessStatusFile(data, timestamp) {
    let content = '';

    try {
      content = await fs.readFile(this.workLogFile, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      content = `# Process Status & Work Log\n\n## Project Overview\n**Project:** Tuberise Analytics\n**Session Date:** ${new Date().toLocaleDateString()}\n**Status:** ${data.status.toUpperCase()}\n\n---\n\n`;
    }

    const sessionEntry = `\n## 📋 Session Summary - ${new Date().toLocaleDateString()}\n\n**Session Duration:** ${this.formatDuration(
      this.sessionDuration
    )}\n**Status:** ${data.status.toUpperCase()}\n**Summary:** ${
      data.sessionSummary
    }\n\n### 🔧 Features Implemented:\n${
      data.features.length > 0
        ? data.features.map((f) => `- ${f}`).join('\n')
        : '- None'
    }\n\n### 🚨 Problems Encountered:\n${
      data.problems.length > 0
        ? data.problems.map((p) => `- ${p}`).join('\n')
        : '- None'
    }\n\n### ✅ Solutions Implemented:\n${
      data.solutions.length > 0
        ? data.solutions.map((s) => `- ${s}`).join('\n')
        : '- None'
    }\n\n### 🚀 Next Steps:\n${
      data.nextSteps.length > 0
        ? data.nextSteps.map((s) => `- ${s}`).join('\n')
        : '- None'
    }\n\n---\n\n`;

    // Update the last updated timestamp
    content = content.replace(
      /\*\*Last Updated:\*\* .*/,
      `**Last Updated:** ${timestamp}`
    );

    // Add new entry
    content += sessionEntry;

    await fs.writeFile(this.workLogFile, content, 'utf-8');
  }

  async createSessionSummary(data, timestamp) {
    // Get project root directory (one level up from scripts/)
    const projectRoot = path.resolve(__dirname, '..');
    const summaryFile = path.join(
      projectRoot,
      `session-summary-${new Date().toISOString().split('T')[0]}.md`
    );

    const summaryContent = `# Session Summary - ${new Date().toLocaleDateString()}\n\n**Session Duration:** ${this.formatDuration(
      this.sessionDuration
    )}\n**Status:** ${data.status.toUpperCase()}\n**Timestamp:** ${timestamp}\n\n## 📋 Summary\n${
      data.sessionSummary
    }\n\n## 🔧 Features Implemented\n${
      data.features.length > 0
        ? data.features.map((f) => `- ${f}`).join('\n')
        : '- None'
    }\n\n## 🚨 Problems Encountered\n${
      data.problems.length > 0
        ? data.problems.map((p) => `- ${p}`).join('\n')
        : '- None'
    }\n\n## ✅ Solutions Implemented\n${
      data.solutions.length > 0
        ? data.solutions.map((s) => `- ${s}`).join('\n')
        : '- None'
    }\n\n## 🚀 Next Steps\n${
      data.nextSteps.length > 0
        ? data.nextSteps.map((s) => `- ${s}`).join('\n')
        : '- None'
    }\n\n---\n\n*Generated automatically by Session Exit Tracker*`;

    await fs.writeFile(summaryFile, summaryContent, 'utf-8');
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Start the session tracker
const tracker = new SessionExitTracker();

// Keep the process alive
process.stdin.resume();
