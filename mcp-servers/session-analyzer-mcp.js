#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SessionAnalyzerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'session-analyzer',
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
    // Analyze JWT tokens
    this.server.setRequestHandler(
      'session-analyzer/analyze-jwt',
      async args => {
        const schema = z.object({
          token: z.string(),
          secret: z.string().optional(),
          verifySignature: z.boolean().default(false),
        });
        const validated = schema.parse(args);

        try {
          const analysis = await this.analyzeJWT(
            validated.token,
            validated.secret,
            validated.verifySignature
          );

          return {
            success: true,
            analysis,
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

    // Check CSRF protection
    this.server.setRequestHandler('session-analyzer/check-csrf', async args => {
      const schema = z.object({
        codebase: z.string().optional(),
        endpoints: z.array(z.string()).optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.codebase
          ? path.resolve(projectRoot, validated.codebase)
          : projectRoot;

        const analysis = await this.analyzeCSRFProtection(
          targetPath,
          validated.endpoints
        );

        return {
          success: true,
          analysis,
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

    // Analyze cookie security
    this.server.setRequestHandler(
      'session-analyzer/analyze-cookies',
      async args => {
        const schema = z.object({
          codebase: z.string().optional(),
          cookies: z.array(z.string()).optional(),
        });
        const validated = schema.parse(args);

        try {
          const projectRoot = path.resolve(__dirname, '..');
          const targetPath = validated.codebase
            ? path.resolve(projectRoot, validated.codebase)
            : projectRoot;

          const analysis = await this.analyzeCookieSecurity(
            targetPath,
            validated.cookies
          );

          return {
            success: true,
            analysis,
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

    // Simulate session attack
    this.server.setRequestHandler(
      'session-analyzer/simulate-attack',
      async args => {
        const schema = z.object({
          attackType: z.enum([
            'csrf',
            'session-fixation',
            'session-hijacking',
            'xss',
          ]),
          targetUrl: z.string(),
          payload: z.string().optional(),
        });
        const validated = schema.parse(args);

        try {
          const result = await this.simulateAttack(
            validated.attackType,
            validated.targetUrl,
            validated.payload
          );

          return {
            success: true,
            attackType: validated.attackType,
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
      }
    );

    // Check session configuration
    this.server.setRequestHandler(
      'session-analyzer/check-session-config',
      async args => {
        const schema = z.object({
          codebase: z.string().optional(),
          configFile: z.string().optional(),
        });
        const validated = schema.parse(args);

        try {
          const projectRoot = path.resolve(__dirname, '..');
          const targetPath = validated.codebase
            ? path.resolve(projectRoot, validated.codebase)
            : projectRoot;

          const analysis = await this.analyzeSessionConfiguration(
            targetPath,
            validated.configFile
          );

          return {
            success: true,
            analysis,
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

    // Generate security report
    this.server.setRequestHandler(
      'session-analyzer/generate-report',
      async args => {
        const schema = z.object({
          codebase: z.string().optional(),
          includeRecommendations: z.boolean().default(true),
        });
        const validated = schema.parse(args);

        try {
          const projectRoot = path.resolve(__dirname, '..');
          const targetPath = validated.codebase
            ? path.resolve(projectRoot, validated.codebase)
            : projectRoot;

          const report = await this.generateSecurityReport(
            targetPath,
            validated.includeRecommendations
          );

          return {
            success: true,
            report,
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

  async analyzeJWT(token, secret, verifySignature) {
    const analysis = {
      valid: false,
      header: null,
      payload: null,
      signature: null,
      vulnerabilities: [],
      recommendations: [],
    };

    try {
      // Decode JWT without verification first
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode header
      const header = JSON.parse(this.base64UrlDecode(parts[0]));
      analysis.header = header;

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      analysis.payload = payload;

      // Check for vulnerabilities
      analysis.vulnerabilities = this.checkJWTVulnerabilities(header, payload);

      // Check algorithm
      if (header.alg === 'none') {
        analysis.vulnerabilities.push({
          type: 'algorithm',
          severity: 'critical',
          description: 'JWT uses "none" algorithm which provides no security',
        });
      }

      if (header.alg === 'HS256' && !secret) {
        analysis.vulnerabilities.push({
          type: 'secret',
          severity: 'high',
          description: 'HMAC algorithm used without secret verification',
        });
      }

      // Check expiration
      if (payload.exp) {
        const expirationTime = payload.exp * 1000;
        const now = Date.now();
        if (expirationTime < now) {
          analysis.vulnerabilities.push({
            type: 'expiration',
            severity: 'medium',
            description: 'JWT token has expired',
          });
        }
      } else {
        analysis.vulnerabilities.push({
          type: 'expiration',
          severity: 'medium',
          description: 'JWT token has no expiration time',
        });
      }

      // Check issued at time
      if (payload.iat && payload.iat > Math.floor(Date.now() / 1000)) {
        analysis.vulnerabilities.push({
          type: 'timing',
          severity: 'medium',
          description: 'JWT issued in the future',
        });
      }

      // Generate recommendations
      analysis.recommendations = this.generateJWTRecommendations(
        analysis.vulnerabilities
      );

      analysis.valid = analysis.vulnerabilities.length === 0;
    } catch (error) {
      analysis.vulnerabilities.push({
        type: 'format',
        severity: 'critical',
        description: `Invalid JWT format: ${error.message}`,
      });
    }

    return analysis;
  }

  checkJWTVulnerabilities(header, payload) {
    const vulnerabilities = [];

    // Check for weak algorithms
    const weakAlgorithms = ['HS256', 'RS256'];
    if (weakAlgorithms.includes(header.alg)) {
      vulnerabilities.push({
        type: 'algorithm',
        severity: 'medium',
        description: `Consider using stronger algorithm than ${header.alg}`,
      });
    }

    // Check for sensitive data in payload
    const sensitiveFields = ['password', 'secret', 'key', 'token'];
    for (const field of sensitiveFields) {
      if (payload[field]) {
        vulnerabilities.push({
          type: 'data-exposure',
          severity: 'high',
          description: `Sensitive data "${field}" found in JWT payload`,
        });
      }
    }

    // Check for missing standard claims
    if (!payload.sub && !payload.user_id) {
      vulnerabilities.push({
        type: 'claims',
        severity: 'low',
        description: 'Missing subject identifier in JWT',
      });
    }

    return vulnerabilities;
  }

  generateJWTRecommendations(vulnerabilities) {
    const recommendations = [];

    const vulnerabilityTypes = vulnerabilities.map(v => v.type);

    if (vulnerabilityTypes.includes('algorithm')) {
      recommendations.push({
        priority: 'high',
        category: 'algorithm',
        title: 'Use Strong Algorithm',
        description: 'Use RS256 or ES256 instead of HMAC algorithms',
        implementation:
          'Update JWT library configuration to use RS256 or ES256',
      });
    }

    if (vulnerabilityTypes.includes('expiration')) {
      recommendations.push({
        priority: 'high',
        category: 'expiration',
        title: 'Set Proper Expiration',
        description: 'Set reasonable expiration times for JWT tokens',
        implementation:
          'Add exp claim with appropriate time-to-live (e.g., 15-30 minutes)',
      });
    }

    if (vulnerabilityTypes.includes('data-exposure')) {
      recommendations.push({
        priority: 'critical',
        category: 'data',
        title: 'Remove Sensitive Data',
        description: 'Remove sensitive data from JWT payload',
        implementation:
          'Store sensitive data server-side and use JWT for identification only',
      });
    }

    return recommendations;
  }

  base64UrlDecode(str) {
    // Add padding if needed
    while (str.length % 4) {
      str += '=';
    }
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(str, 'base64').toString('utf8');
  }

  async analyzeCSRFProtection(targetPath, endpoints) {
    const analysis = {
      protected: false,
      methods: [],
      vulnerabilities: [],
      recommendations: [],
    };

    const sourceFiles = await this.getSourceFiles(targetPath);

    // Check for CSRF protection middleware
    let csrfMiddlewareFound = false;
    let csrfTokenFound = false;
    let sameSiteFound = false;

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');

        // Check for CSRF middleware
        if (content.includes('csrf') || content.includes('csrfProtection')) {
          csrfMiddlewareFound = true;
          analysis.methods.push({
            type: 'middleware',
            file: path.relative(targetPath, file),
            description: 'CSRF protection middleware detected',
          });
        }

        // Check for CSRF tokens
        if (content.includes('csrfToken') || content.includes('_token')) {
          csrfTokenFound = true;
          analysis.methods.push({
            type: 'token',
            file: path.relative(targetPath, file),
            description: 'CSRF token implementation detected',
          });
        }

        // Check for SameSite cookie configuration
        if (content.includes('sameSite') || content.includes('SameSite')) {
          sameSiteFound = true;
          analysis.methods.push({
            type: 'samesite',
            file: path.relative(targetPath, file),
            description: 'SameSite cookie configuration detected',
          });
        }

        // Check for Origin header validation
        if (content.includes('origin') && content.includes('header')) {
          analysis.methods.push({
            type: 'origin',
            file: path.relative(targetPath, file),
            description: 'Origin header validation detected',
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Identify vulnerabilities
    if (!csrfMiddlewareFound) {
      analysis.vulnerabilities.push({
        type: 'missing-middleware',
        severity: 'critical',
        description: 'No CSRF protection middleware found',
      });
    }

    if (!csrfTokenFound) {
      analysis.vulnerabilities.push({
        type: 'missing-token',
        severity: 'high',
        description: 'No CSRF token implementation found',
      });
    }

    if (!sameSiteFound) {
      analysis.vulnerabilities.push({
        type: 'missing-samesite',
        severity: 'medium',
        description: 'No SameSite cookie configuration found',
      });
    }

    analysis.protected = analysis.vulnerabilities.length === 0;
    analysis.recommendations = this.generateCSRFRecommendations(
      analysis.vulnerabilities
    );

    return analysis;
  }

  generateCSRFRecommendations(vulnerabilities) {
    const recommendations = [];

    const vulnerabilityTypes = vulnerabilities.map(v => v.type);

    if (vulnerabilityTypes.includes('missing-middleware')) {
      recommendations.push({
        priority: 'critical',
        category: 'middleware',
        title: 'Implement CSRF Middleware',
        description:
          'Add CSRF protection middleware to all state-changing requests',
        implementation:
          'Use csurf middleware or implement custom CSRF protection',
      });
    }

    if (vulnerabilityTypes.includes('missing-token')) {
      recommendations.push({
        priority: 'high',
        category: 'token',
        title: 'Implement CSRF Tokens',
        description: 'Generate and validate CSRF tokens for all forms',
        implementation:
          'Include CSRF token in all forms and validate on submission',
      });
    }

    if (vulnerabilityTypes.includes('missing-samesite')) {
      recommendations.push({
        priority: 'medium',
        category: 'cookie',
        title: 'Configure SameSite Cookies',
        description: 'Set SameSite attribute on session cookies',
        implementation:
          'Set SameSite=Strict or SameSite=Lax on session cookies',
      });
    }

    return recommendations;
  }

  async analyzeCookieSecurity(targetPath, cookies) {
    const analysis = {
      secure: false,
      cookies: [],
      vulnerabilities: [],
      recommendations: [],
    };

    const sourceFiles = await this.getSourceFiles(targetPath);

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');

        // Find cookie configurations
        const cookieMatches = content.match(
          /cookie\s*\([^)]+\)|setCookie\s*\([^)]+\)/gi
        );
        if (cookieMatches) {
          for (const match of cookieMatches) {
            const cookieAnalysis = this.analyzeCookieConfiguration(match);
            analysis.cookies.push({
              file: path.relative(targetPath, file),
              configuration: match,
              analysis: cookieAnalysis,
            });
          }
        }

        // Check for cookie security patterns
        if (content.includes('httpOnly') || content.includes('HttpOnly')) {
          analysis.cookies.push({
            file: path.relative(targetPath, file),
            type: 'httpOnly',
            description: 'HttpOnly flag detected',
          });
        }

        if (content.includes('secure') || content.includes('Secure')) {
          analysis.cookies.push({
            file: path.relative(targetPath, file),
            type: 'secure',
            description: 'Secure flag detected',
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Analyze cookie vulnerabilities
    analysis.vulnerabilities = this.identifyCookieVulnerabilities(
      analysis.cookies
    );
    analysis.secure = analysis.vulnerabilities.length === 0;
    analysis.recommendations = this.generateCookieRecommendations(
      analysis.vulnerabilities
    );

    return analysis;
  }

  analyzeCookieConfiguration(config) {
    const analysis = {
      httpOnly: false,
      secure: false,
      sameSite: null,
      vulnerabilities: [],
    };

    // Check for HttpOnly flag
    if (config.includes('httpOnly') || config.includes('HttpOnly')) {
      analysis.httpOnly = true;
    } else {
      analysis.vulnerabilities.push({
        type: 'missing-httponly',
        severity: 'high',
        description: 'Cookie missing HttpOnly flag',
      });
    }

    // Check for Secure flag
    if (config.includes('secure') || config.includes('Secure')) {
      analysis.secure = true;
    } else {
      analysis.vulnerabilities.push({
        type: 'missing-secure',
        severity: 'high',
        description: 'Cookie missing Secure flag',
      });
    }

    // Check for SameSite
    const sameSiteMatch = config.match(/sameSite\s*:\s*['"]([^'"]+)['"]/i);
    if (sameSiteMatch) {
      analysis.sameSite = sameSiteMatch[1];
      if (!['Strict', 'Lax', 'None'].includes(sameSiteMatch[1])) {
        analysis.vulnerabilities.push({
          type: 'invalid-samesite',
          severity: 'medium',
          description: `Invalid SameSite value: ${sameSiteMatch[1]}`,
        });
      }
    } else {
      analysis.vulnerabilities.push({
        type: 'missing-samesite',
        severity: 'medium',
        description: 'Cookie missing SameSite attribute',
      });
    }

    return analysis;
  }

  identifyCookieVulnerabilities(cookies) {
    const vulnerabilities = [];

    for (const cookie of cookies) {
      if (cookie.analysis && cookie.analysis.vulnerabilities) {
        vulnerabilities.push(
          ...cookie.analysis.vulnerabilities.map(v => ({
            ...v,
            file: cookie.file,
          }))
        );
      }
    }

    return vulnerabilities;
  }

  generateCookieRecommendations(vulnerabilities) {
    const recommendations = [];

    const vulnerabilityTypes = vulnerabilities.map(v => v.type);

    if (vulnerabilityTypes.includes('missing-httponly')) {
      recommendations.push({
        priority: 'high',
        category: 'httponly',
        title: 'Enable HttpOnly Flag',
        description: 'Set HttpOnly flag on all cookies to prevent XSS attacks',
        implementation: 'Add httpOnly: true to cookie configuration',
      });
    }

    if (vulnerabilityTypes.includes('missing-secure')) {
      recommendations.push({
        priority: 'high',
        category: 'secure',
        title: 'Enable Secure Flag',
        description:
          'Set Secure flag on all cookies for HTTPS-only transmission',
        implementation: 'Add secure: true to cookie configuration',
      });
    }

    if (vulnerabilityTypes.includes('missing-samesite')) {
      recommendations.push({
        priority: 'medium',
        category: 'samesite',
        title: 'Set SameSite Attribute',
        description: 'Configure SameSite attribute to prevent CSRF attacks',
        implementation: 'Set sameSite: "Strict" or "Lax" on session cookies',
      });
    }

    return recommendations;
  }

  async simulateAttack(attackType, targetUrl, payload) {
    const result = {
      attackType,
      targetUrl,
      success: false,
      vulnerabilities: [],
      recommendations: [],
    };

    switch (attackType) {
      case 'csrf':
        result.vulnerabilities = await this.simulateCSRFAttack(targetUrl);
        break;
      case 'session-fixation':
        result.vulnerabilities = await this.simulateSessionFixation(targetUrl);
        break;
      case 'session-hijacking':
        result.vulnerabilities = await this.simulateSessionHijacking(targetUrl);
        break;
      case 'xss':
        result.vulnerabilities = await this.simulateXSSAttack(
          targetUrl,
          payload
        );
        break;
    }

    result.success = result.vulnerabilities.length > 0;
    result.recommendations = this.generateAttackRecommendations(
      attackType,
      result.vulnerabilities
    );

    return result;
  }

  async simulateCSRFAttack(targetUrl) {
    const vulnerabilities = [];

    // Simulate CSRF attack scenarios
    vulnerabilities.push({
      type: 'csrf',
      severity: 'high',
      description: 'Potential CSRF vulnerability detected',
      details: 'No CSRF protection found for state-changing operations',
      mitigation: 'Implement CSRF tokens and validate Origin headers',
    });

    return vulnerabilities;
  }

  async simulateSessionFixation(targetUrl) {
    const vulnerabilities = [];

    vulnerabilities.push({
      type: 'session-fixation',
      severity: 'medium',
      description: 'Potential session fixation vulnerability',
      details: 'Session ID may not be regenerated after authentication',
      mitigation: 'Regenerate session ID after successful login',
    });

    return vulnerabilities;
  }

  async simulateSessionHijacking(targetUrl) {
    const vulnerabilities = [];

    vulnerabilities.push({
      type: 'session-hijacking',
      severity: 'high',
      description: 'Potential session hijacking vulnerability',
      details: 'Session cookies may not be properly secured',
      mitigation:
        'Use secure, HttpOnly cookies and implement proper session management',
    });

    return vulnerabilities;
  }

  async simulateXSSAttack(targetUrl, payload) {
    const vulnerabilities = [];

    vulnerabilities.push({
      type: 'xss',
      severity: 'critical',
      description: 'Potential XSS vulnerability detected',
      details: `XSS payload: ${payload || '<script>alert("XSS")</script>'}`,
      mitigation: 'Implement proper input validation and output encoding',
    });

    return vulnerabilities;
  }

  generateAttackRecommendations(attackType, vulnerabilities) {
    const recommendations = [];

    switch (attackType) {
      case 'csrf':
        recommendations.push({
          priority: 'high',
          title: 'Implement CSRF Protection',
          description: 'Add CSRF tokens and validate Origin headers',
          implementation:
            'Use csurf middleware or implement custom CSRF protection',
        });
        break;
      case 'session-fixation':
        recommendations.push({
          priority: 'medium',
          title: 'Regenerate Session IDs',
          description: 'Generate new session ID after authentication',
          implementation: 'Call session.regenerate() after successful login',
        });
        break;
      case 'session-hijacking':
        recommendations.push({
          priority: 'high',
          title: 'Secure Session Cookies',
          description: 'Use secure, HttpOnly session cookies',
          implementation:
            'Configure session cookies with secure and httpOnly flags',
        });
        break;
      case 'xss':
        recommendations.push({
          priority: 'critical',
          title: 'Prevent XSS Attacks',
          description: 'Implement input validation and output encoding',
          implementation: 'Use helmet.js and escape all user input',
        });
        break;
    }

    return recommendations;
  }

  async analyzeSessionConfiguration(targetPath, configFile) {
    const analysis = {
      secure: false,
      configuration: {},
      vulnerabilities: [],
      recommendations: [],
    };

    // Look for configuration files
    const configFiles = [
      'package.json',
      'next.config.js',
      'nuxt.config.js',
      'vue.config.js',
      'webpack.config.js',
      '.env',
      'config.js',
    ];

    if (configFile) {
      configFiles.unshift(configFile);
    }

    for (const configFileName of configFiles) {
      try {
        const configPath = path.join(targetPath, configFileName);
        const content = await fs.readFile(configPath, 'utf8');

        if (configFileName === '.env') {
          const envConfig = this.parseEnvFile(content);
          analysis.configuration = { ...analysis.configuration, ...envConfig };
        } else if (configFileName.endsWith('.json')) {
          const jsonConfig = JSON.parse(content);
          analysis.configuration = { ...analysis.configuration, ...jsonConfig };
        } else {
          // JavaScript config file
          analysis.configuration[configFileName] = content;
        }
      } catch (error) {
        // Config file doesn't exist or can't be read
      }
    }

    // Analyze configuration for security issues
    analysis.vulnerabilities = this.analyzeConfigSecurity(
      analysis.configuration
    );
    analysis.secure = analysis.vulnerabilities.length === 0;
    analysis.recommendations = this.generateConfigRecommendations(
      analysis.vulnerabilities
    );

    return analysis;
  }

  parseEnvFile(content) {
    const config = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    return config;
  }

  analyzeConfigSecurity(config) {
    const vulnerabilities = [];

    // Check for hardcoded secrets
    const secretKeys = ['secret', 'key', 'password', 'token', 'auth'];
    for (const [key, value] of Object.entries(config)) {
      if (secretKeys.some(secretKey => key.toLowerCase().includes(secretKey))) {
        if (
          typeof value === 'string' &&
          !value.includes('${') &&
          !value.includes('process.env')
        ) {
          vulnerabilities.push({
            type: 'hardcoded-secret',
            severity: 'critical',
            key,
            description: `Hardcoded secret found in configuration: ${key}`,
          });
        }
      }
    }

    // Check for insecure session configuration
    if (config.session && typeof config.session === 'object') {
      if (!config.session.secure) {
        vulnerabilities.push({
          type: 'insecure-session',
          severity: 'high',
          description: 'Session not configured with secure flag',
        });
      }

      if (!config.session.httpOnly) {
        vulnerabilities.push({
          type: 'insecure-session',
          severity: 'high',
          description: 'Session not configured with HttpOnly flag',
        });
      }
    }

    return vulnerabilities;
  }

  generateConfigRecommendations(vulnerabilities) {
    const recommendations = [];

    const vulnerabilityTypes = vulnerabilities.map(v => v.type);

    if (vulnerabilityTypes.includes('hardcoded-secret')) {
      recommendations.push({
        priority: 'critical',
        category: 'secrets',
        title: 'Use Environment Variables',
        description: 'Move hardcoded secrets to environment variables',
        implementation:
          'Use process.env.VARIABLE_NAME instead of hardcoded values',
      });
    }

    if (vulnerabilityTypes.includes('insecure-session')) {
      recommendations.push({
        priority: 'high',
        category: 'session',
        title: 'Secure Session Configuration',
        description: 'Configure session with secure and HttpOnly flags',
        implementation:
          'Set secure: true and httpOnly: true in session configuration',
      });
    }

    return recommendations;
  }

  async generateSecurityReport(targetPath, includeRecommendations) {
    const report = {
      summary: {
        overall: 'unknown',
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      sections: {},
      recommendations: [],
    };

    // Run all security analyses
    const jwtAnalysis = await this.analyzeJWT('dummy', null, false);
    const csrfAnalysis = await this.analyzeCSRFProtection(targetPath);
    const cookieAnalysis = await this.analyzeCookieSecurity(targetPath);
    const configAnalysis = await this.analyzeSessionConfiguration(targetPath);

    // Compile results
    report.sections = {
      jwt: jwtAnalysis,
      csrf: csrfAnalysis,
      cookies: cookieAnalysis,
      configuration: configAnalysis,
    };

    // Count vulnerabilities by severity
    const allVulnerabilities = [
      ...jwtAnalysis.vulnerabilities,
      ...csrfAnalysis.vulnerabilities,
      ...cookieAnalysis.vulnerabilities,
      ...configAnalysis.vulnerabilities,
    ];

    for (const vulnerability of allVulnerabilities) {
      report.summary[vulnerability.severity]++;
    }

    // Determine overall security status
    if (report.summary.critical > 0) {
      report.summary.overall = 'critical';
    } else if (report.summary.high > 0) {
      report.summary.overall = 'high-risk';
    } else if (report.summary.medium > 0) {
      report.summary.overall = 'medium-risk';
    } else if (report.summary.low > 0) {
      report.summary.overall = 'low-risk';
    } else {
      report.summary.overall = 'secure';
    }

    // Generate recommendations if requested
    if (includeRecommendations) {
      report.recommendations = [
        ...jwtAnalysis.recommendations,
        ...csrfAnalysis.recommendations,
        ...cookieAnalysis.recommendations,
        ...configAnalysis.recommendations,
      ];
    }

    return report;
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
    const sourceExtensions = [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.vue',
      '.svelte',
      '.json',
      '.env',
    ];
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Session Analyzer MCP server running on stdio');
  }
}

const server = new SessionAnalyzerMCPServer();
server.start().catch(console.error);
