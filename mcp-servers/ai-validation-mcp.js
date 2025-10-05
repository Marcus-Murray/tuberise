#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/dist/esm/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIValidationMCPServer {
  constructor() {
    this.server = new McpServer({
      name: 'ai-validation',
      version: '1.0.0',
    });

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // AI JSON Test Runner
    this.server.setRequestHandler('ai-validation/run-json-test', async args => {
      const schema = z.object({
        testSuite: z.string(),
        prompt: z.string(),
        expectedOutput: z.string().optional(),
        validationRules: z.array(z.string()).optional(),
      });
      const validated = schema.parse(args);

      try {
        // Parse and validate JSON test suite
        const testData = JSON.parse(validated.testSuite);

        // Run AI prompt engineering validation
        const validationResults = await this.runPromptValidation(
          validated.prompt,
          testData
        );

        // Apply custom validation rules
        if (validated.validationRules) {
          validationResults.customRules = await this.applyValidationRules(
            testData,
            validated.validationRules
          );
        }

        // Check against expected output if provided
        if (validated.expectedOutput) {
          validationResults.expectedMatch = this.compareOutputs(
            testData,
            validated.expectedOutput
          );
        }

        return {
          success: true,
          results: validationResults,
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

    // Prompt Engineering Assistant
    this.server.setRequestHandler(
      'ai-validation/optimize-prompt',
      async args => {
        const schema = z.object({
          originalPrompt: z.string(),
          context: z.string().optional(),
          targetModel: z.string().optional(),
          optimizationGoals: z.array(z.string()).optional(),
        });
        const validated = schema.parse(args);

        try {
          const optimizedPrompt = await this.optimizePrompt(
            validated.originalPrompt,
            validated.context,
            validated.targetModel,
            validated.optimizationGoals
          );

          return {
            success: true,
            originalPrompt: validated.originalPrompt,
            optimizedPrompt,
            improvements: this.analyzePromptImprovements(
              validated.originalPrompt,
              optimizedPrompt
            ),
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          };
        }
      }
    );

    // AI Output Validator
    this.server.setRequestHandler(
      'ai-validation/validate-output',
      async args => {
        const schema = z.object({
          aiOutput: z.string(),
          validationCriteria: z.array(z.string()),
          schema: z.string().optional(),
        });
        const validated = schema.parse(args);

        try {
          const validationResults = await this.validateAIOutput(
            validated.aiOutput,
            validated.validationCriteria,
            validated.schema
          );

          return {
            success: true,
            results: validationResults,
            score: this.calculateValidationScore(validationResults),
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          };
        }
      }
    );

    // Test Suite Generator
    this.server.setRequestHandler(
      'ai-validation/generate-test-suite',
      async args => {
        const schema = z.object({
          component: z.string(),
          testType: z.enum(['unit', 'integration', 'e2e', 'performance']),
          requirements: z.array(z.string()).optional(),
        });
        const validated = schema.parse(args);

        try {
          const testSuite = await this.generateTestSuite(
            validated.component,
            validated.testType,
            validated.requirements
          );

          return {
            success: true,
            testSuite,
            testCount: testSuite.tests?.length || 0,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          };
        }
      }
    );
  }

  async runPromptValidation(prompt, testData) {
    // Analyze prompt structure and effectiveness
    const analysis = {
      clarity: this.analyzePromptClarity(prompt),
      specificity: this.analyzePromptSpecificity(prompt),
      context: this.analyzePromptContext(prompt),
      examples: this.analyzePromptExamples(prompt),
    };

    // Test prompt against sample data
    const testResults = await this.testPromptAgainstData(prompt, testData);

    return {
      analysis,
      testResults,
      recommendations: this.generatePromptRecommendations(analysis),
    };
  }

  analyzePromptClarity(prompt) {
    const clarityScore = {
      score: 0,
      issues: [],
    };

    // Check for clear instructions
    if (prompt.includes('please') || prompt.includes('you should')) {
      clarityScore.score += 20;
    }

    // Check for specific actions
    if (prompt.match(/\b(generate|create|analyze|test|validate)\b/i)) {
      clarityScore.score += 20;
    }

    // Check for formatting requirements
    if (prompt.includes('format') || prompt.includes('structure')) {
      clarityScore.score += 15;
    }

    // Check for examples
    if (prompt.includes('example') || prompt.includes('sample')) {
      clarityScore.score += 15;
    }

    // Check for context
    if (prompt.length > 100) {
      clarityScore.score += 10;
    }

    // Check for ambiguity
    if (
      prompt.includes('maybe') ||
      prompt.includes('might') ||
      prompt.includes('could')
    ) {
      clarityScore.issues.push('Contains ambiguous language');
    }

    if (prompt.length < 50) {
      clarityScore.issues.push('Prompt may be too brief');
    }

    clarityScore.score = Math.min(clarityScore.score, 100);
    return clarityScore;
  }

  analyzePromptSpecificity(prompt) {
    const specificityScore = {
      score: 0,
      issues: [],
    };

    // Check for specific requirements
    const specificTerms = ['exactly', 'precisely', 'specifically', 'detailed'];
    specificTerms.forEach(term => {
      if (prompt.toLowerCase().includes(term)) {
        specificityScore.score += 15;
      }
    });

    // Check for constraints
    if (prompt.includes('must') || prompt.includes('required')) {
      specificityScore.score += 20;
    }

    // Check for measurable outcomes
    if (
      prompt.match(/\d+/) ||
      prompt.includes('number') ||
      prompt.includes('count')
    ) {
      specificityScore.score += 15;
    }

    // Check for output format
    if (
      prompt.includes('JSON') ||
      prompt.includes('XML') ||
      prompt.includes('format')
    ) {
      specificityScore.score += 15;
    }

    // Check for domain-specific terms
    const domainTerms = ['API', 'database', 'function', 'class', 'method'];
    domainTerms.forEach(term => {
      if (prompt.includes(term)) {
        specificityScore.score += 10;
      }
    });

    specificityScore.score = Math.min(specificityScore.score, 100);
    return specificityScore;
  }

  analyzePromptContext(prompt) {
    const contextScore = {
      score: 0,
      issues: [],
    };

    // Check for background information
    if (prompt.includes('context') || prompt.includes('background')) {
      contextScore.score += 25;
    }

    // Check for problem statement
    if (
      prompt.includes('problem') ||
      prompt.includes('issue') ||
      prompt.includes('challenge')
    ) {
      contextScore.score += 20;
    }

    // Check for goal definition
    if (
      prompt.includes('goal') ||
      prompt.includes('objective') ||
      prompt.includes('purpose')
    ) {
      contextScore.score += 20;
    }

    // Check for constraints
    if (
      prompt.includes('constraint') ||
      prompt.includes('limitation') ||
      prompt.includes('restriction')
    ) {
      contextScore.score += 15;
    }

    // Check for assumptions
    if (prompt.includes('assume') || prompt.includes('given')) {
      contextScore.score += 10;
    }

    // Check for scope
    if (
      prompt.includes('scope') ||
      prompt.includes('range') ||
      prompt.includes('boundary')
    ) {
      contextScore.score += 10;
    }

    contextScore.score = Math.min(contextScore.score, 100);
    return contextScore;
  }

  analyzePromptExamples(prompt) {
    const examplesScore = {
      score: 0,
      issues: [],
    };

    // Check for example indicators
    if (
      prompt.includes('example') ||
      prompt.includes('sample') ||
      prompt.includes('instance')
    ) {
      examplesScore.score += 30;
    }

    // Check for input/output examples
    if (prompt.includes('input:') && prompt.includes('output:')) {
      examplesScore.score += 25;
    }

    // Check for code examples
    if (prompt.includes('```') || prompt.includes('code')) {
      examplesScore.score += 20;
    }

    // Check for multiple examples
    const exampleCount = (prompt.match(/example/gi) || []).length;
    if (exampleCount > 1) {
      examplesScore.score += 15;
    }

    // Check for edge case examples
    if (prompt.includes('edge case') || prompt.includes('corner case')) {
      examplesScore.score += 10;
    }

    examplesScore.score = Math.min(examplesScore.score, 100);
    return examplesScore;
  }

  async testPromptAgainstData(prompt, testData) {
    // Simulate testing prompt against various data scenarios
    const testResults = {
      successRate: 0,
      errorRate: 0,
      averageResponseTime: 0,
      qualityScore: 0,
    };

    // Mock test execution
    const tests = Array.isArray(testData) ? testData : [testData];
    let successfulTests = 0;
    let totalTests = tests.length;

    tests.forEach((test, index) => {
      // Simulate test execution
      const success = Math.random() > 0.2; // 80% success rate simulation
      if (success) successfulTests++;
    });

    testResults.successRate = (successfulTests / totalTests) * 100;
    testResults.errorRate = 100 - testResults.successRate;
    testResults.averageResponseTime = Math.random() * 2000 + 500; // 500-2500ms
    testResults.qualityScore =
      testResults.successRate * 0.8 + Math.random() * 20;

    return testResults;
  }

  generatePromptRecommendations(analysis) {
    const recommendations = [];

    if (analysis.clarity.score < 70) {
      recommendations.push({
        type: 'clarity',
        priority: 'high',
        suggestion:
          'Improve prompt clarity by adding specific instructions and removing ambiguous language',
      });
    }

    if (analysis.specificity.score < 70) {
      recommendations.push({
        type: 'specificity',
        priority: 'high',
        suggestion: 'Add more specific requirements and measurable outcomes',
      });
    }

    if (analysis.context.score < 60) {
      recommendations.push({
        type: 'context',
        priority: 'medium',
        suggestion:
          'Provide more background information and context for better understanding',
      });
    }

    if (analysis.examples.score < 50) {
      recommendations.push({
        type: 'examples',
        priority: 'medium',
        suggestion: 'Include more examples and sample outputs to guide the AI',
      });
    }

    return recommendations;
  }

  async optimizePrompt(
    originalPrompt,
    context,
    targetModel,
    optimizationGoals
  ) {
    let optimizedPrompt = originalPrompt;

    // Apply optimization strategies based on goals
    if (optimizationGoals?.includes('clarity')) {
      optimizedPrompt = this.improveClarity(optimizedPrompt);
    }

    if (optimizationGoals?.includes('specificity')) {
      optimizedPrompt = this.improveSpecificity(optimizedPrompt);
    }

    if (optimizationGoals?.includes('context')) {
      optimizedPrompt = this.improveContext(optimizedPrompt, context);
    }

    if (optimizationGoals?.includes('examples')) {
      optimizedPrompt = this.addExamples(optimizedPrompt);
    }

    if (optimizationGoals?.includes('structure')) {
      optimizedPrompt = this.improveStructure(optimizedPrompt);
    }

    // Model-specific optimizations
    if (targetModel) {
      optimizedPrompt = this.applyModelOptimizations(
        optimizedPrompt,
        targetModel
      );
    }

    return optimizedPrompt;
  }

  improveClarity(prompt) {
    // Add clear action verbs
    if (!prompt.match(/\b(please|kindly|you should|you must)\b/i)) {
      prompt = `Please ${prompt.toLowerCase()}`;
    }

    // Add formatting instructions
    if (!prompt.includes('format') && !prompt.includes('structure')) {
      prompt +=
        '\n\nPlease provide your response in a clear, structured format.';
    }

    return prompt;
  }

  improveSpecificity(prompt) {
    // Add specific requirements
    if (!prompt.includes('must') && !prompt.includes('required')) {
      prompt +=
        '\n\nRequirements:\n- Be specific and detailed\n- Include relevant examples\n- Provide measurable outcomes';
    }

    return prompt;
  }

  improveContext(prompt, context) {
    if (context) {
      prompt = `Context: ${context}\n\n${prompt}`;
    }
    return prompt;
  }

  addExamples(prompt) {
    if (!prompt.includes('example') && !prompt.includes('sample')) {
      prompt += '\n\nPlease provide examples to illustrate your points.';
    }
    return prompt;
  }

  improveStructure(prompt) {
    // Add structure markers
    if (!prompt.includes('\n\n')) {
      prompt = prompt.replace(/\. /g, '.\n\n');
    }
    return prompt;
  }

  applyModelOptimizations(prompt, model) {
    // Model-specific optimizations
    const modelOptimizations = {
      'gpt-4': 'Use clear, structured prompts with specific examples.',
      claude: 'Focus on detailed reasoning and step-by-step analysis.',
      mistral: 'Keep prompts concise and action-oriented.',
    };

    const optimization = modelOptimizations[model.toLowerCase()];
    if (optimization) {
      prompt += `\n\nNote: ${optimization}`;
    }

    return prompt;
  }

  analyzePromptImprovements(original, optimized) {
    return {
      lengthChange: optimized.length - original.length,
      clarityImprovement: this.measureImprovement(
        original,
        optimized,
        'clarity'
      ),
      specificityImprovement: this.measureImprovement(
        original,
        optimized,
        'specificity'
      ),
      structureImprovement: this.measureImprovement(
        original,
        optimized,
        'structure'
      ),
    };
  }

  measureImprovement(original, optimized, metric) {
    const originalScore = this.getMetricScore(original, metric);
    const optimizedScore = this.getMetricScore(optimized, metric);
    return optimizedScore - originalScore;
  }

  getMetricScore(prompt, metric) {
    switch (metric) {
      case 'clarity':
        return this.analyzePromptClarity(prompt).score;
      case 'specificity':
        return this.analyzePromptSpecificity(prompt).score;
      case 'structure':
        return prompt.includes('\n\n') ? 80 : 40;
      default:
        return 0;
    }
  }

  async validateAIOutput(output, criteria, schema) {
    const results = {
      passed: 0,
      failed: 0,
      total: criteria.length,
      details: [],
    };

    for (const criterion of criteria) {
      const result = await this.validateCriterion(output, criterion, schema);
      results.details.push(result);

      if (result.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }

    return results;
  }

  async validateCriterion(output, criterion, schema) {
    // Simulate criterion validation
    const result = {
      criterion,
      passed: Math.random() > 0.3, // 70% pass rate simulation
      message: '',
      score: 0,
    };

    if (result.passed) {
      result.message = `Criterion "${criterion}" passed successfully`;
      result.score = 100;
    } else {
      result.message = `Criterion "${criterion}" failed validation`;
      result.score = Math.random() * 60; // 0-60 score for failed tests
    }

    return result;
  }

  calculateValidationScore(results) {
    if (results.total === 0) return 0;
    return (results.passed / results.total) * 100;
  }

  async generateTestSuite(component, testType, requirements) {
    const testSuite = {
      component,
      testType,
      tests: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        requirements: requirements || [],
      },
    };

    // Generate tests based on type
    switch (testType) {
      case 'unit':
        testSuite.tests = this.generateUnitTests(component, requirements);
        break;
      case 'integration':
        testSuite.tests = this.generateIntegrationTests(
          component,
          requirements
        );
        break;
      case 'e2e':
        testSuite.tests = this.generateE2ETests(component, requirements);
        break;
      case 'performance':
        testSuite.tests = this.generatePerformanceTests(
          component,
          requirements
        );
        break;
    }

    return testSuite;
  }

  generateUnitTests(component, requirements) {
    return [
      {
        name: `${component} should render without errors`,
        type: 'render',
        description: 'Verify component renders successfully',
      },
      {
        name: `${component} should handle props correctly`,
        type: 'props',
        description: 'Verify component handles all props as expected',
      },
      {
        name: `${component} should handle edge cases`,
        type: 'edge-case',
        description: 'Verify component handles edge cases gracefully',
      },
    ];
  }

  generateIntegrationTests(component, requirements) {
    return [
      {
        name: `${component} should integrate with parent components`,
        type: 'integration',
        description:
          'Verify component works correctly within parent components',
      },
      {
        name: `${component} should handle state changes`,
        type: 'state',
        description: 'Verify component responds to state changes correctly',
      },
    ];
  }

  generateE2ETests(component, requirements) {
    return [
      {
        name: `${component} should work end-to-end`,
        type: 'e2e',
        description: 'Verify component works in full user workflow',
      },
      {
        name: `${component} should handle user interactions`,
        type: 'interaction',
        description: 'Verify component handles user interactions correctly',
      },
    ];
  }

  generatePerformanceTests(component, requirements) {
    return [
      {
        name: `${component} should render within performance budget`,
        type: 'performance',
        description: 'Verify component renders within acceptable time limits',
      },
      {
        name: `${component} should not cause memory leaks`,
        type: 'memory',
        description: 'Verify component does not cause memory leaks',
      },
    ];
  }

  async applyValidationRules(testData, rules) {
    const results = [];

    for (const rule of rules) {
      const result = await this.applyRule(testData, rule);
      results.push(result);
    }

    return results;
  }

  async applyRule(data, rule) {
    // Simulate rule application
    return {
      rule,
      passed: Math.random() > 0.2, // 80% pass rate
      message: `Rule "${rule}" ${Math.random() > 0.2 ? 'passed' : 'failed'}`,
      timestamp: new Date().toISOString(),
    };
  }

  compareOutputs(actual, expected) {
    // Simple comparison logic
    try {
      const actualParsed =
        typeof actual === 'string' ? JSON.parse(actual) : actual;
      const expectedParsed =
        typeof expected === 'string' ? JSON.parse(expected) : expected;

      return {
        match: JSON.stringify(actualParsed) === JSON.stringify(expectedParsed),
        similarity: this.calculateSimilarity(actualParsed, expectedParsed),
      };
    } catch (error) {
      return {
        match: false,
        similarity: 0,
        error: error.message,
      };
    }
  }

  calculateSimilarity(actual, expected) {
    // Simple similarity calculation
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);

    if (actualStr === expectedStr) return 100;

    // Calculate character-level similarity
    let matches = 0;
    const maxLength = Math.max(actualStr.length, expectedStr.length);

    for (let i = 0; i < maxLength; i++) {
      if (actualStr[i] === expectedStr[i]) {
        matches++;
      }
    }

    return (matches / maxLength) * 100;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AI Validation MCP server running on stdio');
  }
}

const server = new AIValidationMCPServer();
server.start().catch(console.error);
