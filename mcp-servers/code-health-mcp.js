#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodeHealthMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'code-health',
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
    // Analyze code health
    this.server.setRequestHandler('code-health/analyze', async args => {
      const schema = z.object({
        path: z.string().optional(),
        includeMetrics: z.array(z.string()).optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const healthReport = await this.analyzeCodeHealth(
          targetPath,
          validated.includeMetrics
        );

        return {
          success: true,
          report: healthReport,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    });

    // Check specific metrics
    this.server.setRequestHandler('code-health/check-metric', async args => {
      const schema = z.object({
        metric: z.string(),
        path: z.string().optional(),
        threshold: z.number().optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const result = await this.checkMetric(
          targetPath,
          validated.metric,
          validated.threshold
        );

        return {
          success: true,
          metric: validated.metric,
          result,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    });

    // Generate health recommendations
    this.server.setRequestHandler('code-health/recommendations', async args => {
      const schema = z.object({
        path: z.string().optional(),
        focusAreas: z.array(z.string()).optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const recommendations = await this.generateRecommendations(
          targetPath,
          validated.focusAreas
        );

        return {
          success: true,
          recommendations,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    });
  }

  async analyzeCodeHealth(targetPath, includeMetrics) {
    const analysis = {
      overallScore: 0,
      metrics: {},
      issues: [],
      recommendations: [],
      summary: {},
    };

    // Core metrics to analyze
    const defaultMetrics = [
      'complexity',
      'duplication',
      'test-coverage',
      'security',
      'performance',
      'maintainability',
      'dependencies',
      'documentation',
    ];

    const metricsToAnalyze = includeMetrics || defaultMetrics;

    for (const metric of metricsToAnalyze) {
      const result = await this.analyzeMetric(targetPath, metric);
      analysis.metrics[metric] = result;
      analysis.overallScore += result.score;
    }

    analysis.overallScore = analysis.overallScore / metricsToAnalyze.length;
    analysis.summary = this.generateSummary(analysis.metrics);
    analysis.issues = this.identifyIssues(analysis.metrics);
    analysis.recommendations = this.generateRecommendations(
      targetPath,
      metricsToAnalyze
    );

    return analysis;
  }

  async analyzeMetric(targetPath, metric) {
    switch (metric) {
      case 'complexity':
        return await this.analyzeComplexity(targetPath);
      case 'duplication':
        return await this.analyzeDuplication(targetPath);
      case 'test-coverage':
        return await this.analyzeTestCoverage(targetPath);
      case 'security':
        return await this.analyzeSecurity(targetPath);
      case 'performance':
        return await this.analyzePerformance(targetPath);
      case 'maintainability':
        return await this.analyzeMaintainability(targetPath);
      case 'dependencies':
        return await this.analyzeDependencies(targetPath);
      case 'documentation':
        return await this.analyzeDocumentation(targetPath);
      default:
        return { score: 0, details: 'Unknown metric' };
    }
  }

  async analyzeComplexity(targetPath) {
    const files = await this.getSourceFiles(targetPath);
    let totalComplexity = 0;
    let fileCount = 0;
    const complexityIssues = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const complexity = this.calculateComplexity(content);
        totalComplexity += complexity;
        fileCount++;

        if (complexity > 10) {
          complexityIssues.push({
            file,
            complexity,
            severity: complexity > 20 ? 'high' : 'medium',
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const avgComplexity = fileCount > 0 ? totalComplexity / fileCount : 0;
    const score = Math.max(0, 100 - avgComplexity * 5);

    return {
      score: Math.round(score),
      details: {
        averageComplexity: Math.round(avgComplexity * 100) / 100,
        totalFiles: fileCount,
        issues: complexityIssues,
      },
    };
  }

  calculateComplexity(content) {
    let complexity = 1; // Base complexity

    // Count control flow statements
    const controlFlowPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bdo\s*{/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\b&&/g,
      /\b\|\|/g,
      /\?\s*.*\s*:/g, // Ternary operators
    ];

    controlFlowPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  async analyzeDuplication(targetPath) {
    const files = await this.getSourceFiles(targetPath);
    const codeBlocks = new Map();
    let totalBlocks = 0;
    let duplicateBlocks = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const blocks = this.extractCodeBlocks(content);

        for (const block of blocks) {
          totalBlocks++;
          const hash = this.hashCode(block);

          if (codeBlocks.has(hash)) {
            duplicateBlocks++;
            codeBlocks.get(hash).files.push(file);
          } else {
            codeBlocks.set(hash, {
              block,
              files: [file],
            });
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const duplicationRatio =
      totalBlocks > 0 ? (duplicateBlocks / totalBlocks) * 100 : 0;
    const score = Math.max(0, 100 - duplicationRatio * 2);

    return {
      score: Math.round(score),
      details: {
        totalBlocks,
        duplicateBlocks,
        duplicationRatio: Math.round(duplicationRatio * 100) / 100,
        uniqueBlocks: codeBlocks.size,
      },
    };
  }

  extractCodeBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');

    let currentBlock = '';
    let inFunction = false;
    let braceCount = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect function start
      if (trimmedLine.includes('function') || trimmedLine.includes('=>')) {
        if (currentBlock && currentBlock.length > 50) {
          blocks.push(currentBlock);
        }
        currentBlock = line;
        inFunction = true;
        braceCount = 0;
        continue;
      }

      if (inFunction) {
        currentBlock += '\n' + line;

        // Count braces to detect function end
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        if (braceCount === 0 && trimmedLine.includes('}')) {
          if (currentBlock.length > 50) {
            blocks.push(currentBlock);
          }
          currentBlock = '';
          inFunction = false;
        }
      }
    }

    return blocks;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async analyzeTestCoverage(targetPath) {
    // Look for test files and analyze coverage
    const testFiles = await this.getTestFiles(targetPath);
    const sourceFiles = await this.getSourceFiles(targetPath);

    const coverageRatio = testFiles.length / Math.max(sourceFiles.length, 1);
    const score = Math.min(100, coverageRatio * 100);

    return {
      score: Math.round(score),
      details: {
        testFiles: testFiles.length,
        sourceFiles: sourceFiles.length,
        coverageRatio: Math.round(coverageRatio * 100) / 100,
      },
    };
  }

  async analyzeSecurity(targetPath) {
    const files = await this.getSourceFiles(targetPath);
    const securityIssues = [];

    const securityPatterns = [
      {
        pattern: /eval\s*\(/,
        severity: 'high',
        message: 'Use of eval() function',
      },
      {
        pattern: /innerHTML\s*=/,
        severity: 'medium',
        message: 'Direct innerHTML assignment',
      },
      {
        pattern: /document\.write/,
        severity: 'medium',
        message: 'Use of document.write',
      },
      {
        pattern: /localStorage\.setItem/,
        severity: 'low',
        message: 'Local storage usage',
      },
      {
        pattern: /sessionStorage\.setItem/,
        severity: 'low',
        message: 'Session storage usage',
      },
      {
        pattern: /\.sql\s*\+/,
        severity: 'high',
        message: 'Potential SQL injection',
      },
      {
        pattern: /password\s*=\s*['"]\w+['"]/,
        severity: 'high',
        message: 'Hardcoded password',
      },
    ];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');

        for (const { pattern, severity, message } of securityPatterns) {
          if (pattern.test(content)) {
            securityIssues.push({
              file,
              severity,
              message,
              line: this.findLineNumber(content, pattern),
            });
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const highSeverityIssues = securityIssues.filter(
      issue => issue.severity === 'high'
    ).length;
    const mediumSeverityIssues = securityIssues.filter(
      issue => issue.severity === 'medium'
    ).length;
    const lowSeverityIssues = securityIssues.filter(
      issue => issue.severity === 'low'
    ).length;

    const score = Math.max(
      0,
      100 -
        highSeverityIssues * 20 -
        mediumSeverityIssues * 10 -
        lowSeverityIssues * 5
    );

    return {
      score: Math.round(score),
      details: {
        totalIssues: securityIssues.length,
        highSeverity: highSeverityIssues,
        mediumSeverity: mediumSeverityIssues,
        lowSeverity: lowSeverityIssues,
        issues: securityIssues,
      },
    };
  }

  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  async analyzePerformance(targetPath) {
    const files = await this.getSourceFiles(targetPath);
    const performanceIssues = [];

    const performancePatterns = [
      {
        pattern:
          /for\s*\(\s*var\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length\s*;\s*\w+\+\+\)/,
        severity: 'medium',
        message: 'Inefficient for loop',
      },
      {
        pattern: /document\.getElementById.*for\s*\(/,
        severity: 'high',
        message: 'DOM query in loop',
      },
      {
        pattern: /setInterval.*\d+/,
        severity: 'low',
        message: 'setInterval usage',
      },
      {
        pattern: /setTimeout.*\d+/,
        severity: 'low',
        message: 'setTimeout usage',
      },
      {
        pattern: /\.innerHTML\s*=.*\+/,
        severity: 'medium',
        message: 'String concatenation in innerHTML',
      },
    ];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');

        for (const { pattern, severity, message } of performancePatterns) {
          if (pattern.test(content)) {
            performanceIssues.push({
              file,
              severity,
              message,
              line: this.findLineNumber(content, pattern),
            });
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const score = Math.max(0, 100 - performanceIssues.length * 10);

    return {
      score: Math.round(score),
      details: {
        totalIssues: performanceIssues.length,
        issues: performanceIssues,
      },
    };
  }

  async analyzeMaintainability(targetPath) {
    const files = await this.getSourceFiles(targetPath);
    let totalLines = 0;
    let totalFunctions = 0;
    let totalClasses = 0;
    let longFiles = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n').length;
        totalLines += lines;

        if (lines > 300) {
          longFiles++;
        }

        // Count functions and classes
        const functionMatches = content.match(/\bfunction\s+\w+/g) || [];
        const classMatches = content.match(/\bclass\s+\w+/g) || [];

        totalFunctions += functionMatches.length;
        totalClasses += classMatches.length;
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const avgLinesPerFile = files.length > 0 ? totalLines / files.length : 0;
    const avgFunctionsPerFile =
      files.length > 0 ? totalFunctions / files.length : 0;
    const longFileRatio = files.length > 0 ? longFiles / files.length : 0;

    const score = Math.max(0, 100 - avgLinesPerFile / 10 - longFileRatio * 50);

    return {
      score: Math.round(score),
      details: {
        totalFiles: files.length,
        totalLines,
        totalFunctions,
        totalClasses,
        averageLinesPerFile: Math.round(avgLinesPerFile * 100) / 100,
        averageFunctionsPerFile: Math.round(avgFunctionsPerFile * 100) / 100,
        longFiles,
        longFileRatio: Math.round(longFileRatio * 100) / 100,
      },
    };
  }

  async analyzeDependencies(targetPath) {
    try {
      const packageJsonPath = path.join(targetPath, 'package.json');
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf8')
      );

      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      const totalDeps = dependencies.length + devDependencies.length;
      const score = Math.max(0, 100 - totalDeps / 2); // Penalize too many dependencies

      return {
        score: Math.round(score),
        details: {
          dependencies: dependencies.length,
          devDependencies: devDependencies.length,
          totalDependencies: totalDeps,
          dependencyList: dependencies,
          devDependencyList: devDependencies,
        },
      };
    } catch (error) {
      return {
        score: 50, // Neutral score if package.json not found
        details: {
          error: 'package.json not found or invalid',
        },
      };
    }
  }

  async analyzeDocumentation(targetPath) {
    const files = await this.getSourceFiles(targetPath);
    let documentedFiles = 0;
    let totalComments = 0;
    let totalLines = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');
        totalLines += lines.length;

        // Count comment lines
        const commentLines = lines.filter(
          line =>
            line.trim().startsWith('//') ||
            line.trim().startsWith('/*') ||
            line.trim().startsWith('*')
        ).length;

        totalComments += commentLines;

        // Check if file has documentation
        if (
          content.includes('/**') ||
          content.includes('@param') ||
          content.includes('@returns')
        ) {
          documentedFiles++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    const documentationRatio =
      totalLines > 0 ? (totalComments / totalLines) * 100 : 0;
    const fileDocumentationRatio =
      files.length > 0 ? (documentedFiles / files.length) * 100 : 0;
    const score = (documentationRatio + fileDocumentationRatio) / 2;

    return {
      score: Math.round(score),
      details: {
        totalFiles: files.length,
        documentedFiles,
        totalComments,
        totalLines,
        documentationRatio: Math.round(documentationRatio * 100) / 100,
        fileDocumentationRatio: Math.round(fileDocumentationRatio * 100) / 100,
      },
    };
  }

  async getSourceFiles(targetPath) {
    const files = [];

    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(targetPath, entry.name);

        if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          const subFiles = await this.getSourceFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && this.isSourceFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be readable
    }

    return files;
  }

  async getTestFiles(targetPath) {
    const files = [];

    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(targetPath, entry.name);

        if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          const subFiles = await this.getTestFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && this.isTestFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be readable
    }

    return files;
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '.nyc_output',
      'logs',
    ];
    return skipDirs.includes(dirName);
  }

  isSourceFile(fileName) {
    const sourceExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }

  isTestFile(fileName) {
    const testPatterns = [
      '.test.',
      '.spec.',
      '.test-',
      '.spec-',
      'test/',
      'tests/',
      '__tests__/',
    ];
    return testPatterns.some(pattern => fileName.includes(pattern));
  }

  generateSummary(metrics) {
    const summary = {
      overall: 'good',
      strengths: [],
      weaknesses: [],
      criticalIssues: [],
    };

    for (const [metric, data] of Object.entries(metrics)) {
      if (data.score >= 80) {
        summary.strengths.push(`${metric}: ${data.score}%`);
      } else if (data.score < 50) {
        summary.weaknesses.push(`${metric}: ${data.score}%`);
        if (data.score < 30) {
          summary.criticalIssues.push(metric);
        }
      }
    }

    if (summary.criticalIssues.length > 0) {
      summary.overall = 'critical';
    } else if (summary.weaknesses.length > 2) {
      summary.overall = 'needs-improvement';
    } else if (summary.strengths.length > summary.weaknesses.length) {
      summary.overall = 'good';
    } else {
      summary.overall = 'fair';
    }

    return summary;
  }

  identifyIssues(metrics) {
    const issues = [];

    for (const [metric, data] of Object.entries(metrics)) {
      if (data.score < 70) {
        issues.push({
          metric,
          severity: data.score < 40 ? 'high' : 'medium',
          score: data.score,
          message: `${metric} score is below acceptable threshold (${data.score}%)`,
        });
      }
    }

    return issues;
  }

  async generateRecommendations(targetPath, focusAreas) {
    const recommendations = [];

    // General recommendations
    recommendations.push({
      priority: 'high',
      category: 'general',
      title: 'Improve test coverage',
      description:
        'Add more unit and integration tests to increase code reliability',
      action: 'Create test files for components and services',
    });

    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Optimize bundle size',
      description: 'Review and optimize dependencies to reduce bundle size',
      action: 'Audit dependencies and remove unused packages',
    });

    recommendations.push({
      priority: 'medium',
      category: 'maintainability',
      title: 'Improve documentation',
      description:
        'Add JSDoc comments and README files for better maintainability',
      action: 'Document all public APIs and complex functions',
    });

    return recommendations;
  }

  async checkMetric(targetPath, metric, threshold) {
    const result = await this.analyzeMetric(targetPath, metric);

    return {
      metric,
      score: result.score,
      threshold: threshold || 70,
      passed: result.score >= (threshold || 70),
      details: result.details,
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Code Health MCP server running on stdio');
  }
}

const server = new CodeHealthMCPServer();
server.start().catch(console.error);
