#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodeSearchMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'code-search',
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
    // Semantic search
    this.server.setRequestHandler('code-search/semantic', async args => {
      const schema = z.object({
        query: z.string(),
        path: z.string().optional(),
        limit: z.number().default(20),
        context: z.string().optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const results = await this.semanticSearch(
          validated.query,
          targetPath,
          validated.limit,
          validated.context
        );

        return {
          success: true,
          query: validated.query,
          results,
          count: results.length,
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

    // Regex search using ripgrep
    this.server.setRequestHandler('code-search/regex', async args => {
      const schema = z.object({
        pattern: z.string(),
        path: z.string().optional(),
        caseSensitive: z.boolean().default(false),
        wholeWord: z.boolean().default(false),
        fileTypes: z.array(z.string()).optional(),
        excludePatterns: z.array(z.string()).optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const results = await this.regexSearch(targetPath, validated);

        return {
          success: true,
          pattern: validated.pattern,
          results,
          count: results.length,
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

    // Find function definitions
    this.server.setRequestHandler('code-search/find-functions', async args => {
      const schema = z.object({
        functionName: z.string(),
        path: z.string().optional(),
        includeSignatures: z.boolean().default(true),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const results = await this.findFunctionDefinitions(
          validated.functionName,
          targetPath,
          validated.includeSignatures
        );

        return {
          success: true,
          functionName: validated.functionName,
          results,
          count: results.length,
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

    // Find imports and exports
    this.server.setRequestHandler('code-search/find-imports', async args => {
      const schema = z.object({
        module: z.string(),
        path: z.string().optional(),
        importType: z.enum(['import', 'export', 'both']).default('both'),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const results = await this.findImportsExports(
          validated.module,
          targetPath,
          validated.importType
        );

        return {
          success: true,
          module: validated.module,
          results,
          count: results.length,
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

    // Find usages of a symbol
    this.server.setRequestHandler('code-search/find-usages', async args => {
      const schema = z.object({
        symbol: z.string(),
        path: z.string().optional(),
        includeDeclarations: z.boolean().default(true),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const results = await this.findSymbolUsages(
          validated.symbol,
          targetPath,
          validated.includeDeclarations
        );

        return {
          success: true,
          symbol: validated.symbol,
          results,
          count: results.length,
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

    // Search with context
    this.server.setRequestHandler('code-search/context-search', async args => {
      const schema = z.object({
        query: z.string(),
        context: z.string(),
        path: z.string().optional(),
        similarityThreshold: z.number().default(0.7),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path
          ? path.resolve(projectRoot, validated.path)
          : projectRoot;

        const results = await this.contextSearch(
          validated.query,
          validated.context,
          targetPath,
          validated.similarityThreshold
        );

        return {
          success: true,
          query: validated.query,
          context: validated.context,
          results,
          count: results.length,
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

  async semanticSearch(query, targetPath, limit, context) {
    const results = [];

    // Get all source files
    const sourceFiles = await this.getSourceFiles(targetPath);

    // Search for semantically related code
    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const semanticMatches = await this.findSemanticMatches(
          content,
          query,
          context
        );

        for (const match of semanticMatches) {
          if (results.length >= limit) break;

          results.push({
            file: path.relative(targetPath, file),
            line: match.line,
            column: match.column,
            text: match.text,
            context: match.context,
            relevance: match.relevance,
            type: match.type,
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return results.slice(0, limit);
  }

  async findSemanticMatches(content, query, context) {
    const matches = [];
    const lines = content.split('\n');

    // Split query into keywords
    const keywords = query.toLowerCase().split(/\s+/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Calculate semantic relevance
      let relevance = 0;
      let matchedKeywords = 0;

      for (const keyword of keywords) {
        if (lowerLine.includes(keyword)) {
          matchedKeywords++;
          relevance += this.calculateKeywordRelevance(keyword, lowerLine);
        }
      }

      // Check for semantic synonyms
      const synonyms = this.getSynonyms(keywords);
      for (const synonym of synonyms) {
        if (lowerLine.includes(synonym)) {
          relevance += 0.3;
        }
      }

      // Context-based relevance
      if (context) {
        const contextRelevance = this.calculateContextRelevance(line, context);
        relevance += contextRelevance;
      }

      // Normalize relevance
      relevance = relevance / keywords.length;

      if (relevance > 0.3) {
        matches.push({
          line: i + 1,
          column: line.indexOf(keywords[0]) + 1,
          text: line.trim(),
          context: this.getLineContext(lines, i),
          relevance,
          type: this.determineMatchType(line, keywords),
        });
      }
    }

    return matches;
  }

  calculateKeywordRelevance(keyword, line) {
    let relevance = 0.5; // Base relevance

    // Higher relevance for exact matches
    if (
      line.includes(` ${keyword} `) ||
      line.includes(`${keyword}(`) ||
      line.includes(`${keyword}.`)
    ) {
      relevance += 0.3;
    }

    // Higher relevance in comments or strings
    if (
      line.includes('//') ||
      line.includes('*') ||
      line.includes('"') ||
      line.includes("'")
    ) {
      relevance += 0.2;
    }

    // Higher relevance in function names or variable names
    if (line.match(new RegExp(`\\b${keyword}\\b`))) {
      relevance += 0.4;
    }

    return Math.min(relevance, 1.0);
  }

  getSynonyms(keywords) {
    const synonymMap = {
      function: ['method', 'fn', 'func', 'procedure'],
      variable: ['var', 'let', 'const', 'field', 'property'],
      class: ['component', 'module', 'object'],
      import: ['require', 'include', 'from'],
      export: ['return', 'module.exports', 'export default'],
      async: ['await', 'promise', 'then'],
      error: ['exception', 'throw', 'catch'],
      test: ['spec', 'should', 'expect', 'assert'],
      api: ['endpoint', 'route', 'service'],
      database: ['db', 'query', 'sql', 'model'],
    };

    const synonyms = [];
    for (const keyword of keywords) {
      if (synonymMap[keyword]) {
        synonyms.push(...synonymMap[keyword]);
      }
    }

    return synonyms;
  }

  calculateContextRelevance(line, context) {
    const contextKeywords = context.toLowerCase().split(/\s+/);
    let relevance = 0;

    for (const keyword of contextKeywords) {
      if (line.toLowerCase().includes(keyword)) {
        relevance += 0.1;
      }
    }

    return Math.min(relevance, 0.5);
  }

  determineMatchType(line, keywords) {
    if (line.includes('function') || line.includes('=>')) {
      return 'function';
    } else if (line.includes('class') || line.includes('interface')) {
      return 'class';
    } else if (line.includes('import') || line.includes('require')) {
      return 'import';
    } else if (line.includes('export') || line.includes('module.exports')) {
      return 'export';
    } else if (line.includes('//') || line.includes('/*')) {
      return 'comment';
    } else if (line.includes('test') || line.includes('spec')) {
      return 'test';
    } else {
      return 'code';
    }
  }

  getLineContext(lines, lineIndex) {
    const start = Math.max(0, lineIndex - 2);
    const end = Math.min(lines.length, lineIndex + 3);
    return lines.slice(start, end).map((line, index) => ({
      line: start + index + 1,
      content: line,
      isTarget: start + index === lineIndex,
    }));
  }

  async regexSearch(targetPath, options) {
    try {
      // Use ripgrep if available, otherwise fallback to native search
      if (await this.isRipgrepAvailable()) {
        return await this.ripgrepSearch(targetPath, options);
      } else {
        return await this.nativeRegexSearch(targetPath, options);
      }
    } catch (error) {
      return await this.nativeRegexSearch(targetPath, options);
    }
  }

  async isRipgrepAvailable() {
    try {
      execSync('rg --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async ripgrepSearch(targetPath, options) {
    const args = ['rg', '--json', '--line-number', '--column'];

    if (!options.caseSensitive) {
      args.push('--ignore-case');
    }

    if (options.wholeWord) {
      args.push('--word-regexp');
    }

    if (options.fileTypes && options.fileTypes.length > 0) {
      for (const type of options.fileTypes) {
        args.push('--type', type);
      }
    }

    if (options.excludePatterns && options.excludePatterns.length > 0) {
      for (const pattern of options.excludePatterns) {
        args.push('--glob', `!${pattern}`);
      }
    }

    args.push(options.pattern, targetPath);

    try {
      const output = execSync(args.join(' '), { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.trim());
      const results = [];

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.type === 'match') {
            results.push({
              file: path.relative(targetPath, data.data.path.text),
              line: data.data.line_number,
              column: data.data.submatches[0].start + 1,
              text: data.data.lines.text.trim(),
              match: data.data.submatches[0].match.text,
            });
          }
        } catch (parseError) {
          // Skip invalid JSON lines
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Ripgrep search failed: ${error.message}`);
    }
  }

  async nativeRegexSearch(targetPath, options) {
    const results = [];
    const sourceFiles = await this.getSourceFiles(targetPath);

    let pattern;
    try {
      const flags = options.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(options.pattern, flags);
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error.message}`);
    }

    for (const file of sourceFiles) {
      // Check file type filters
      if (options.fileTypes && options.fileTypes.length > 0) {
        const fileExt = path.extname(file).slice(1);
        if (!options.fileTypes.includes(fileExt)) {
          continue;
        }
      }

      // Check exclude patterns
      if (options.excludePatterns) {
        const shouldExclude = options.excludePatterns.some(
          pattern => file.includes(pattern) || new RegExp(pattern).test(file)
        );
        if (shouldExclude) {
          continue;
        }
      }

      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let match;

          while ((match = pattern.exec(line)) !== null) {
            results.push({
              file: path.relative(targetPath, file),
              line: i + 1,
              column: match.index + 1,
              text: line.trim(),
              match: match[0],
            });

            // Prevent infinite loop for global regex
            if (!pattern.global) break;
          }

          // Reset regex lastIndex for next line
          pattern.lastIndex = 0;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return results;
  }

  async findFunctionDefinitions(functionName, targetPath, includeSignatures) {
    const results = [];
    const sourceFiles = await this.getSourceFiles(targetPath);

    const patterns = [
      new RegExp(`function\\s+${this.escapeRegex(functionName)}\\s*\\(`, 'gi'),
      new RegExp(
        `const\\s+${this.escapeRegex(functionName)}\\s*=\\s*\\(`,
        'gi'
      ),
      new RegExp(`let\\s+${this.escapeRegex(functionName)}\\s*=\\s*\\(`, 'gi'),
      new RegExp(`var\\s+${this.escapeRegex(functionName)}\\s*=\\s*\\(`, 'gi'),
      new RegExp(`${this.escapeRegex(functionName)}\\s*:\\s*function`, 'gi'),
      new RegExp(
        `${this.escapeRegex(functionName)}\\s*\\([^)]*\\)\\s*=>`,
        'gi'
      ),
    ];

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          for (const pattern of patterns) {
            const match = pattern.exec(line);
            if (match) {
              const result = {
                file: path.relative(targetPath, file),
                line: i + 1,
                column: match.index + 1,
                text: line.trim(),
                type: 'definition',
              };

              if (includeSignatures) {
                result.signature = this.extractFunctionSignature(content, i);
              }

              results.push(result);
              break;
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return results;
  }

  extractFunctionSignature(content, lineIndex) {
    const lines = content.split('\n');
    const startLine = lines[lineIndex];

    // Try to extract the complete function signature
    let signature = startLine.trim();

    // If the function signature spans multiple lines
    if (signature.includes('(') && !signature.includes(')')) {
      for (
        let i = lineIndex + 1;
        i < Math.min(lineIndex + 5, lines.length);
        i++
      ) {
        signature += ' ' + lines[i].trim();
        if (signature.includes(')')) {
          break;
        }
      }
    }

    return signature;
  }

  async findImportsExports(module, targetPath, importType) {
    const results = [];
    const sourceFiles = await this.getSourceFiles(targetPath);

    const importPatterns = [
      new RegExp(`import.*from\\s+['"]${this.escapeRegex(module)}['"]`, 'gi'),
      new RegExp(`require\\s*\\(\\s*['"]${this.escapeRegex(module)}['"]`, 'gi'),
      new RegExp(`import\\s*['"]${this.escapeRegex(module)}['"]`, 'gi'),
    ];

    const exportPatterns = [
      new RegExp(`export.*from\\s+['"]${this.escapeRegex(module)}['"]`, 'gi'),
      new RegExp(
        `module\\.exports.*=.*require\\s*\\(\\s*['"]${this.escapeRegex(module)}['"]`,
        'gi'
      ),
    ];

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (importType === 'import' || importType === 'both') {
            for (const pattern of importPatterns) {
              const match = pattern.exec(line);
              if (match) {
                results.push({
                  file: path.relative(targetPath, file),
                  line: i + 1,
                  column: match.index + 1,
                  text: line.trim(),
                  type: 'import',
                });
                break;
              }
            }
          }

          if (importType === 'export' || importType === 'both') {
            for (const pattern of exportPatterns) {
              const match = pattern.exec(line);
              if (match) {
                results.push({
                  file: path.relative(targetPath, file),
                  line: i + 1,
                  column: match.index + 1,
                  text: line.trim(),
                  type: 'export',
                });
                break;
              }
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return results;
  }

  async findSymbolUsages(symbol, targetPath, includeDeclarations) {
    const results = [];
    const sourceFiles = await this.getSourceFiles(targetPath);

    // Create regex pattern for symbol usage
    const symbolPattern = new RegExp(`\\b${this.escapeRegex(symbol)}\\b`, 'gi');

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let match;

          while ((match = symbolPattern.exec(line)) !== null) {
            const usageType = this.determineUsageType(
              line,
              symbol,
              match.index
            );

            if (includeDeclarations || usageType !== 'declaration') {
              results.push({
                file: path.relative(targetPath, file),
                line: i + 1,
                column: match.index + 1,
                text: line.trim(),
                type: usageType,
                context: this.getSymbolContext(line, symbol),
              });
            }

            // Prevent infinite loop for global regex
            if (!symbolPattern.global) break;
          }

          // Reset regex lastIndex for next line
          symbolPattern.lastIndex = 0;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return results;
  }

  determineUsageType(line, symbol, index) {
    const beforeSymbol = line.substring(0, index).trim();
    const afterSymbol = line.substring(index + symbol.length).trim();

    // Check for declarations
    if (
      beforeSymbol.match(/\b(var|let|const|function|class|interface|type)\s*$/)
    ) {
      return 'declaration';
    }

    // Check for assignments
    if (afterSymbol.startsWith('=')) {
      return 'assignment';
    }

    // Check for function calls
    if (afterSymbol.startsWith('(')) {
      return 'call';
    }

    // Check for property access
    if (afterSymbol.startsWith('.') || beforeSymbol.endsWith('.')) {
      return 'property';
    }

    // Check for imports/exports
    if (
      line.includes('import') ||
      line.includes('export') ||
      line.includes('require')
    ) {
      return 'import/export';
    }

    return 'usage';
  }

  getSymbolContext(line, symbol) {
    const index = line.toLowerCase().indexOf(symbol.toLowerCase());
    const start = Math.max(0, index - 20);
    const end = Math.min(line.length, index + symbol.length + 20);
    return line.substring(start, end);
  }

  async contextSearch(query, context, targetPath, similarityThreshold) {
    const results = [];
    const sourceFiles = await this.getSourceFiles(targetPath);

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const matches = await this.findContextMatches(
          content,
          query,
          context,
          similarityThreshold
        );

        for (const match of matches) {
          results.push({
            file: path.relative(targetPath, file),
            line: match.line,
            column: match.column,
            text: match.text,
            context: match.context,
            similarity: match.similarity,
            relevance: match.relevance,
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return results;
  }

  async findContextMatches(content, query, context, similarityThreshold) {
    const matches = [];
    const lines = content.split('\n');
    const contextKeywords = context.toLowerCase().split(/\s+/);
    const queryKeywords = query.toLowerCase().split(/\s+/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Calculate context similarity
      let contextSimilarity = 0;
      for (const keyword of contextKeywords) {
        if (lowerLine.includes(keyword)) {
          contextSimilarity += 1.0 / contextKeywords.length;
        }
      }

      // Calculate query similarity
      let querySimilarity = 0;
      for (const keyword of queryKeywords) {
        if (lowerLine.includes(keyword)) {
          querySimilarity += 1.0 / queryKeywords.length;
        }
      }

      // Combined similarity
      const combinedSimilarity = (contextSimilarity + querySimilarity) / 2;

      if (combinedSimilarity >= similarityThreshold) {
        matches.push({
          line: i + 1,
          column: 1,
          text: line.trim(),
          context: this.getLineContext(lines, i),
          similarity: combinedSimilarity,
          relevance: combinedSimilarity,
        });
      }
    }

    return matches;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      '.py',
      '.java',
      '.cpp',
      '.c',
      '.cs',
      '.php',
      '.rb',
      '.go',
      '.rs',
    ];
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Code Search MCP server running on stdio');
  }
}

const server = new CodeSearchMCPServer();
server.start().catch(console.error);
