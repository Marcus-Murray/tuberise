#!/usr/bin/env node

/**
 * Auto Start Session Tracker for Cursor
 *
 * This script automatically starts the session tracker when Cursor is launched.
 * It monitors for Cursor processes and starts the tracker in the background.
 *
 * Usage: node auto-start-tracker.js
 */

import { spawn, exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoStartTracker {
  constructor() {
    this.trackerProcess = null;
    this.cursorProcess = null;
    this.isRunning = false;
    this.checkInterval = null;
    this.setupAutoStart();
  }

  async setupAutoStart() {
    console.log('🚀 Auto Start Session Tracker initialized');
    console.log('📅 Waiting for Cursor to start...');

    // Start monitoring for Cursor processes
    this.startCursorMonitoring();

    // Set up cleanup on exit
    this.setupExitHandlers();
  }

  startCursorMonitoring() {
    this.checkInterval = setInterval(async () => {
      await this.checkCursorProcess();
    }, 5000); // Check every 5 seconds
  }

  async checkCursorProcess() {
    try {
      const cursorRunning = await this.isCursorRunning();

      if (cursorRunning && !this.isRunning) {
        console.log('✅ Cursor detected - Starting session tracker');
        await this.startSessionTracker();
        this.isRunning = true;
      } else if (!cursorRunning && this.isRunning) {
        console.log('🔄 Cursor closed - Session tracker will continue running');
        // Keep tracker running for a bit in case Cursor restarts
        setTimeout(async () => {
          const stillRunning = await this.isCursorRunning();
          if (!stillRunning) {
            console.log(
              '📝 Cursor session ended - Tracker will prompt for work log update'
            );
          }
        }, 10000); // Wait 10 seconds before considering session ended
      }
    } catch (error) {
      console.error('❌ Error checking Cursor process:', error.message);
    }
  }

  async isCursorRunning() {
    return new Promise((resolve) => {
      const command =
        process.platform === 'win32'
          ? 'tasklist /FI "IMAGENAME eq Cursor.exe"'
          : 'pgrep -f "Cursor"';

      exec(command, (error, stdout) => {
        if (error) {
          resolve(false);
        } else {
          const isRunning =
            process.platform === 'win32'
              ? stdout.includes('Cursor.exe')
              : stdout.trim().length > 0;
          resolve(isRunning);
        }
      });
    });
  }

  async startSessionTracker() {
    try {
      const trackerScript = path.join(__dirname, 'session-exit-tracker.js');

      // Check if tracker script exists
      try {
        await fs.access(trackerScript);
      } catch (error) {
        console.error('❌ Session tracker script not found:', trackerScript);
        return;
      }

      // Start the session tracker
      this.trackerProcess = spawn('node', [trackerScript], {
        stdio: 'pipe',
        detached: false,
      });

      this.trackerProcess.stdout.on('data', (data) => {
        console.log(`📝 Tracker: ${data.toString().trim()}`);
      });

      this.trackerProcess.stderr.on('data', (data) => {
        console.log(`📝 Tracker: ${data.toString().trim()}`);
      });

      this.trackerProcess.on('close', (code) => {
        console.log(`📝 Session tracker exited with code ${code}`);
        this.trackerProcess = null;
      });

      this.trackerProcess.on('error', (error) => {
        console.error('❌ Session tracker error:', error.message);
        this.trackerProcess = null;
      });

      console.log('✅ Session tracker started successfully');
    } catch (error) {
      console.error('❌ Failed to start session tracker:', error.message);
    }
  }

  setupExitHandlers() {
    process.on('SIGINT', () => this.handleExit('SIGINT'));
    process.on('SIGTERM', () => this.handleExit('SIGTERM'));
    process.on('exit', () => this.handleExit('exit'));

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.handleExit('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.handleExit('unhandledRejection');
    });
  }

  async handleExit(reason) {
    console.log(`\n🔄 Auto-start tracker exiting (${reason})`);

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    if (this.trackerProcess) {
      console.log('📝 Stopping session tracker...');
      this.trackerProcess.kill('SIGTERM');
    }

    process.exit(0);
  }
}

// Start the auto-start tracker
const autoStartTracker = new AutoStartTracker();

// Keep the process alive
process.stdin.resume();
