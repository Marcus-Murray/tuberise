#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs/promises';

class MCPServerTester {
  constructor() {
    this.servers = [
      'test-ai-validation-mcp.js',
      'test-code-health-mcp.js',
      'test-code-mapper-mcp.js',
      'test-code-search-mcp.js',
      'test-session-analyzer-mcp.js',
      'test-typescript-react-agent-mcp.js',
    ];
    this.results = {};
  }

  async testServer(serverFile) {
    console.log(`\n🧪 Testing ${serverFile}...`);

    return new Promise(resolve => {
      const serverProcess = spawn('node', [`mcp-servers/${serverFile}`], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      serverProcess.stdout.on('data', data => {
        output += data.toString();
      });

      serverProcess.stderr.on('data', data => {
        errorOutput += data.toString();
      });

      // Give the server time to start
      setTimeout(() => {
        // Send a simple test message
        const testMessage = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {},
        };

        serverProcess.stdin.write(JSON.stringify(testMessage) + '\n');

        // Wait for response
        setTimeout(() => {
          serverProcess.kill();

          const success =
            errorOutput.includes('running on stdio') &&
            !errorOutput.includes('Error');
          this.results[serverFile] = {
            success,
            output: output.trim(),
            error: errorOutput.trim(),
            timestamp: new Date().toISOString(),
          };

          if (success) {
            console.log(`✅ ${serverFile} - PASSED`);
          } else {
            console.log(`❌ ${serverFile} - FAILED`);
            console.log(`   Error: ${errorOutput}`);
          }

          resolve(success);
        }, 1000);
      }, 500);
    });
  }

  async testAllServers() {
    console.log('🚀 Starting MCP Server Tests...\n');

    const testPromises = this.servers.map(server => this.testServer(server));
    const results = await Promise.all(testPromises);

    const passed = results.filter(Boolean).length;
    const total = results.length;

    console.log('\n📊 Test Results Summary:');
    console.log(`   Passed: ${passed}/${total}`);
    console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (passed === total) {
      console.log('\n🎉 All MCP servers are working correctly!');
    } else {
      console.log('\n⚠️  Some MCP servers failed. Check the details above.');
    }

    // Save detailed results
    await fs.writeFile(
      'reports/mcp-test-results.json',
      JSON.stringify(this.results, null, 2)
    );

    console.log('\n📄 Detailed results saved to reports/mcp-test-results.json');

    return passed === total;
  }
}

// Run the tests
const tester = new MCPServerTester();
tester
  .testAllServers()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });

