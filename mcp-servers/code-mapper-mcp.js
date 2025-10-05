#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodeMapperMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'code-mapper',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.dependencyGraph = new Map();
    this.circularDependencies = [];
    this.orphanedFiles = [];
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Generate dependency map
    this.server.setRequestHandler('code-mapper/generate-map', async (args) => {
      const schema = z.object({
        path: z.string().optional(),
        includeTypes: z.array(z.string()).optional(),
        outputFormat: z.enum(['json', 'graph', 'text']).default('json'),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path ? path.resolve(projectRoot, validated.path) : projectRoot;
        
        const dependencyMap = await this.generateDependencyMap(targetPath, validated.includeTypes);
        
        return {
          success: true,
          map: dependencyMap,
          format: validated.outputFormat,
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

    // Find circular dependencies
    this.server.setRequestHandler('code-mapper/find-circular', async (args) => {
      const schema = z.object({
        path: z.string().optional(),
        maxDepth: z.number().default(10),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path ? path.resolve(projectRoot, validated.path) : projectRoot;
        
        const circularDeps = await this.findCircularDependencies(targetPath, validated.maxDepth);
        
        return {
          success: true,
          circularDependencies: circularDeps,
          count: circularDeps.length,
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

    // Find orphaned files
    this.server.setRequestHandler('code-mapper/find-orphaned', async (args) => {
      const schema = z.object({
        path: z.string().optional(),
        excludePatterns: z.array(z.string()).optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path ? path.resolve(projectRoot, validated.path) : projectRoot;
        
        const orphanedFiles = await this.findOrphanedFiles(targetPath, validated.excludePatterns);
        
        return {
          success: true,
          orphanedFiles,
          count: orphanedFiles.length,
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

    // Generate visualization
    this.server.setRequestHandler('code-mapper/visualize', async (args) => {
      const schema = z.object({
        path: z.string().optional(),
        format: z.enum(['mermaid', 'dot', 'json']).default('mermaid'),
        focusNode: z.string().optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path ? path.resolve(projectRoot, validated.path) : projectRoot;
        
        const visualization = await this.generateVisualization(
          targetPath, 
          validated.format, 
          validated.focusNode
        );
        
        return {
          success: true,
          visualization,
          format: validated.format,
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

    // Analyze module structure
    this.server.setRequestHandler('code-mapper/analyze-structure', async (args) => {
      const schema = z.object({
        path: z.string().optional(),
        analyzeTypes: z.array(z.string()).optional(),
      });
      const validated = schema.parse(args);

      try {
        const projectRoot = path.resolve(__dirname, '..');
        const targetPath = validated.path ? path.resolve(projectRoot, validated.path) : projectRoot;
        
        const structure = await this.analyzeModuleStructure(targetPath, validated.analyzeTypes);
        
        return {
          success: true,
          structure,
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

  async generateDependencyMap(targetPath, includeTypes) {
    const map = {
      nodes: [],
      edges: [],
      statistics: {},
    };

    // Get all source files
    const sourceFiles = await this.getSourceFiles(targetPath);
    
    // Process each file to extract dependencies
    for (const file of sourceFiles) {
      const dependencies = await this.extractDependencies(file);
      const node = this.createNode(file, dependencies);
      
      map.nodes.push(node);
      
      // Create edges for dependencies
      for (const dep of dependencies) {
        const edge = this.createEdge(file, dep);
        map.edges.push(edge);
      }
    }

    // Generate statistics
    map.statistics = this.generateStatistics(map);

    return map;
  }

  async extractDependencies(filePath) {
    const dependencies = [];
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract import statements
      const importPatterns = [
        /import\s+.*\s+from\s+['"]([^'"]+)['"]/g,
        /import\s+['"]([^'"]+)['"]/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      ];

      for (const pattern of importPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1];
          
          // Resolve relative imports
          const resolvedPath = this.resolveImportPath(filePath, importPath);
          if (resolvedPath) {
            dependencies.push({
              original: importPath,
              resolved: resolvedPath,
              type: this.getImportType(importPath),
            });
          }
        }
      }

      // Extract dynamic imports
      const dynamicImportPattern = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      let match;
      while ((match = dynamicImportPattern.exec(content)) !== null) {
        const importPath = match[1];
        const resolvedPath = this.resolveImportPath(filePath, importPath);
        if (resolvedPath) {
          dependencies.push({
            original: importPath,
            resolved: resolvedPath,
            type: 'dynamic',
          });
        }
      }

    } catch (error) {
      // File might not be readable
    }

    return dependencies;
  }

  resolveImportPath(filePath, importPath) {
    // Skip external packages
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return null;
    }

    const fileDir = path.dirname(filePath);
    let resolvedPath = path.resolve(fileDir, importPath);

    // Try different extensions
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];
    
    for (const ext of extensions) {
      const pathWithExt = resolvedPath + ext;
      try {
        if (fs.access(pathWithExt)) {
          return pathWithExt;
        }
      } catch (error) {
        // File doesn't exist with this extension
      }
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, 'index' + ext);
      try {
        if (fs.access(indexPath)) {
          return indexPath;
        }
      } catch (error) {
        // Index file doesn't exist
      }
    }

    return resolvedPath;
  }

  getImportType(importPath) {
    if (importPath.startsWith('.')) {
      return 'relative';
    } else if (importPath.startsWith('/')) {
      return 'absolute';
    } else {
      return 'external';
    }
  }

  createNode(filePath, dependencies) {
    const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
    
    return {
      id: relativePath,
      path: filePath,
      name: path.basename(filePath),
      type: this.getFileType(filePath),
      dependencies: dependencies.length,
      dependents: 0, // Will be calculated later
      size: this.getFileSize(filePath),
      complexity: this.calculateComplexity(filePath),
    };
  }

  createEdge(sourceFile, dependency) {
    const sourceRelative = path.relative(path.resolve(__dirname, '..'), sourceFile);
    const targetRelative = path.relative(path.resolve(__dirname, '..'), dependency.resolved);
    
    return {
      source: sourceRelative,
      target: targetRelative,
      type: dependency.type,
      originalImport: dependency.original,
    };
  }

  getFileType(filePath) {
    const ext = path.extname(filePath);
    const typeMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'react',
      '.tsx': 'react-typescript',
      '.vue': 'vue',
      '.svelte': 'svelte',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.md': 'markdown',
    };
    
    return typeMap[ext] || 'unknown';
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  async calculateComplexity(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let complexity = 1;

      // Count control flow statements
      const patterns = [
        /\bif\s*\(/g,
        /\belse\s+if\s*\(/g,
        /\bfor\s*\(/g,
        /\bwhile\s*\(/g,
        /\bswitch\s*\(/g,
        /\bcase\s+/g,
        /\bcatch\s*\(/g,
        /\b&&/g,
        /\b\|\|/g,
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          complexity += matches.length;
        }
      }

      return complexity;
    } catch (error) {
      return 0;
    }
  }

  generateStatistics(map) {
    const stats = {
      totalNodes: map.nodes.length,
      totalEdges: map.edges.length,
      nodeTypes: {},
      edgeTypes: {},
      averageDependencies: 0,
      maxDependencies: 0,
      minDependencies: Infinity,
    };

    // Count node types
    for (const node of map.nodes) {
      stats.nodeTypes[node.type] = (stats.nodeTypes[node.type] || 0) + 1;
    }

    // Count edge types
    for (const edge of map.edges) {
      stats.edgeTypes[edge.type] = (stats.edgeTypes[edge.type] || 0) + 1;
    }

    // Calculate dependency statistics
    const dependencies = map.nodes.map(node => node.dependencies);
    if (dependencies.length > 0) {
      stats.averageDependencies = dependencies.reduce((a, b) => a + b, 0) / dependencies.length;
      stats.maxDependencies = Math.max(...dependencies);
      stats.minDependencies = Math.min(...dependencies);
    }

    return stats;
  }

  async findCircularDependencies(targetPath, maxDepth) {
    const circularDeps = [];
    const visited = new Set();
    const recursionStack = new Set();

    const sourceFiles = await this.getSourceFiles(targetPath);
    
    for (const file of sourceFiles) {
      if (!visited.has(file)) {
        const cycles = this.findCyclesFromFile(file, visited, recursionStack, maxDepth);
        circularDeps.push(...cycles);
      }
    }

    return circularDeps;
  }

  findCyclesFromFile(file, visited, recursionStack, maxDepth, currentDepth = 0) {
    if (currentDepth > maxDepth) {
      return [];
    }

    if (recursionStack.has(file)) {
      // Found a cycle
      return [{
        cycle: Array.from(recursionStack).concat([file]),
        length: recursionStack.size + 1,
      }];
    }

    if (visited.has(file)) {
      return [];
    }

    visited.add(file);
    recursionStack.add(file);

    const cycles = [];
    const dependencies = this.getDependenciesForFile(file);
    
    for (const dep of dependencies) {
      const depCycles = this.findCyclesFromFile(
        dep.resolved, 
        visited, 
        recursionStack, 
        maxDepth, 
        currentDepth + 1
      );
      cycles.push(...depCycles);
    }

    recursionStack.delete(file);
    return cycles;
  }

  async getDependenciesForFile(filePath) {
    return await this.extractDependencies(filePath);
  }

  async findOrphanedFiles(targetPath, excludePatterns = []) {
    const orphanedFiles = [];
    const allFiles = await this.getSourceFiles(targetPath);
    const referencedFiles = new Set();

    // First, collect all referenced files
    for (const file of allFiles) {
      const dependencies = await this.extractDependencies(file);
      for (const dep of dependencies) {
        if (dep.resolved) {
          referencedFiles.add(dep.resolved);
        }
      }
    }

    // Find files that are not referenced
    for (const file of allFiles) {
      const isExcluded = excludePatterns.some(pattern => 
        file.includes(pattern) || new RegExp(pattern).test(file)
      );

      if (!isExcluded && !referencedFiles.has(file)) {
        // Check if it's an entry point (main files, test files, etc.)
        if (!this.isEntryPoint(file)) {
          orphanedFiles.push({
            path: file,
            relativePath: path.relative(path.resolve(__dirname, '..'), file),
            type: this.getFileType(file),
            reason: 'Not imported by any other file',
          });
        }
      }
    }

    return orphanedFiles;
  }

  isEntryPoint(filePath) {
    const fileName = path.basename(filePath);
    const entryPatterns = [
      /^index\./,
      /^main\./,
      /^app\./,
      /^server\./,
      /\.test\./,
      /\.spec\./,
      /\.config\./,
    ];

    return entryPatterns.some(pattern => pattern.test(fileName));
  }

  async generateVisualization(targetPath, format, focusNode) {
    const dependencyMap = await this.generateDependencyMap(targetPath);
    
    switch (format) {
      case 'mermaid':
        return this.generateMermaidDiagram(dependencyMap, focusNode);
      case 'dot':
        return this.generateDotGraph(dependencyMap, focusNode);
      case 'json':
        return dependencyMap;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  generateMermaidDiagram(map, focusNode) {
    let diagram = 'graph TD\n';
    
    // Add nodes
    for (const node of map.nodes) {
      const nodeId = this.sanitizeNodeId(node.id);
      const nodeLabel = path.basename(node.id);
      
      if (focusNode && node.id.includes(focusNode)) {
        diagram += `  ${nodeId}["${nodeLabel}"]:::focus\n`;
      } else {
        diagram += `  ${nodeId}["${nodeLabel}"]\n`;
      }
    }
    
    // Add edges
    for (const edge of map.edges) {
      const sourceId = this.sanitizeNodeId(edge.source);
      const targetId = this.sanitizeNodeId(edge.target);
      diagram += `  ${sourceId} --> ${targetId}\n`;
    }
    
    // Add styling
    diagram += '\n  classDef focus fill:#ff9999,stroke:#333,stroke-width:3px\n';
    
    return diagram;
  }

  generateDotGraph(map, focusNode) {
    let dot = 'digraph Dependencies {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';
    
    // Add nodes
    for (const node of map.nodes) {
      const nodeId = this.sanitizeNodeId(node.id);
      const nodeLabel = path.basename(node.id);
      
      if (focusNode && node.id.includes(focusNode)) {
        dot += `  ${nodeId} [label="${nodeLabel}", style=filled, fillcolor=red];\n`;
      } else {
        dot += `  ${nodeId} [label="${nodeLabel}"];\n`;
      }
    }
    
    dot += '\n';
    
    // Add edges
    for (const edge of map.edges) {
      const sourceId = this.sanitizeNodeId(edge.source);
      const targetId = this.sanitizeNodeId(edge.target);
      dot += `  ${sourceId} -> ${targetId};\n`;
    }
    
    dot += '}\n';
    
    return dot;
  }

  sanitizeNodeId(nodeId) {
    return nodeId.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  async analyzeModuleStructure(targetPath, analyzeTypes) {
    const structure = {
      modules: [],
      layers: [],
      patterns: [],
      recommendations: [],
    };

    const sourceFiles = await this.getSourceFiles(targetPath);
    
    // Group files by directory structure
    const modules = new Map();
    
    for (const file of sourceFiles) {
      const relativePath = path.relative(targetPath, file);
      const parts = relativePath.split(path.sep);
      const moduleName = parts[0] || 'root';
      
      if (!modules.has(moduleName)) {
        modules.set(moduleName, []);
      }
      modules.get(moduleName).push(file);
    }

    // Analyze each module
    for (const [moduleName, files] of modules) {
      const moduleAnalysis = await this.analyzeModule(moduleName, files);
      structure.modules.push(moduleAnalysis);
    }

    // Detect architectural patterns
    structure.patterns = this.detectPatterns(structure.modules);
    
    // Generate recommendations
    structure.recommendations = this.generateStructureRecommendations(structure);

    return structure;
  }

  async analyzeModule(moduleName, files) {
    const analysis = {
      name: moduleName,
      files: files.length,
      types: {},
      dependencies: new Set(),
      dependents: new Set(),
      complexity: 0,
      cohesion: 0,
      coupling: 0,
    };

    for (const file of files) {
      const fileType = this.getFileType(file);
      analysis.types[fileType] = (analysis.types[fileType] || 0) + 1;
      
      const fileComplexity = await this.calculateComplexity(file);
      analysis.complexity += fileComplexity;
      
      const dependencies = await this.extractDependencies(file);
      for (const dep of dependencies) {
        analysis.dependencies.add(dep.resolved);
      }
    }

    analysis.complexity = analysis.complexity / files.length;
    analysis.cohesion = this.calculateCohesion(files);
    analysis.coupling = analysis.dependencies.size;

    return analysis;
  }

  async calculateCohesion(files) {
    // Simple cohesion calculation based on shared imports
    const sharedImports = new Map();
    
    for (const file of files) {
      const dependencies = await this.extractDependencies(file);
      for (const dep of dependencies) {
        if (!dep.resolved.startsWith('node_modules')) {
          sharedImports.set(dep.resolved, (sharedImports.get(dep.resolved) || 0) + 1);
        }
      }
    }

    const totalShared = Array.from(sharedImports.values())
      .filter(count => count > 1)
      .reduce((sum, count) => sum + count, 0);

    return totalShared / files.length;
  }

  detectPatterns(modules) {
    const patterns = [];

    // Detect layered architecture
    const layerNames = ['controller', 'service', 'model', 'view', 'component'];
    const layeredModules = modules.filter(module => 
      layerNames.some(layer => module.name.toLowerCase().includes(layer))
    );

    if (layeredModules.length > 0) {
      patterns.push({
        type: 'layered-architecture',
        confidence: 0.8,
        modules: layeredModules.map(m => m.name),
        description: 'Detected layered architecture pattern',
      });
    }

    // Detect feature-based organization
    const featureModules = modules.filter(module => 
      module.name.includes('feature') || 
      module.name.includes('domain') ||
      module.files > 5
    );

    if (featureModules.length > 0) {
      patterns.push({
        type: 'feature-based',
        confidence: 0.7,
        modules: featureModules.map(m => m.name),
        description: 'Detected feature-based organization',
      });
    }

    return patterns;
  }

  generateStructureRecommendations(structure) {
    const recommendations = [];

    // Check for high coupling
    const highCouplingModules = structure.modules.filter(m => m.coupling > 10);
    if (highCouplingModules.length > 0) {
      recommendations.push({
        type: 'coupling',
        priority: 'high',
        modules: highCouplingModules.map(m => m.name),
        suggestion: 'Consider reducing dependencies between modules',
      });
    }

    // Check for low cohesion
    const lowCohesionModules = structure.modules.filter(m => m.cohesion < 0.3);
    if (lowCohesionModules.length > 0) {
      recommendations.push({
        type: 'cohesion',
        priority: 'medium',
        modules: lowCohesionModules.map(m => m.name),
        suggestion: 'Consider reorganizing modules to improve cohesion',
      });
    }

    return recommendations;
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
    const sourceExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Code Mapper MCP server running on stdio');
  }
}

const server = new CodeMapperMCPServer();
server.start().catch(console.error);
