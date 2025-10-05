#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TypeScriptReactAgentMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'typescript-react-agent',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.memoryBank = new Map();
    this.projectContext = {};
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Store project information in memory
    this.server.setRequestHandler('ts-react-agent/store-memory', async args => {
      const schema = z.object({
        key: z.string(),
        value: z.any(),
        category: z
          .enum(['project', 'component', 'pattern', 'issue', 'solution'])
          .default('project'),
        metadata: z.object({}).optional(),
      });
      const validated = schema.parse(args);

      try {
        this.storeInMemory(
          validated.key,
          validated.value,
          validated.category,
          validated.metadata
        );

        return {
          success: true,
          message: `Stored ${validated.key} in ${validated.category} memory bank`,
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

    // Retrieve information from memory
    this.server.setRequestHandler(
      'ts-react-agent/retrieve-memory',
      async args => {
        const schema = z.object({
          key: z.string().optional(),
          category: z
            .enum(['project', 'component', 'pattern', 'issue', 'solution'])
            .optional(),
          search: z.string().optional(),
        });
        const validated = schema.parse(args);

        try {
          const results = this.retrieveFromMemory(
            validated.key,
            validated.category,
            validated.search
          );

          return {
            success: true,
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
      }
    );

    // Analyze TypeScript project structure
    this.server.setRequestHandler(
      'ts-react-agent/analyze-project',
      async args => {
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

          const analysis = await this.analyzeTypeScriptProject(
            targetPath,
            validated.includeMetrics
          );

          // Store analysis in memory
          this.storeInMemory('project-analysis', analysis, 'project', {
            path: targetPath,
            timestamp: new Date().toISOString(),
          });

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

    // Generate React component suggestions
    this.server.setRequestHandler(
      'ts-react-agent/suggest-components',
      async args => {
        const schema = z.object({
          requirements: z.string(),
          context: z.string().optional(),
          componentType: z
            .enum(['functional', 'class', 'hook', 'context'])
            .default('functional'),
        });
        const validated = schema.parse(args);

        try {
          const suggestions = await this.generateComponentSuggestions(
            validated.requirements,
            validated.context,
            validated.componentType
          );

          // Store suggestions in memory
          this.storeInMemory(
            `component-suggestions-${Date.now()}`,
            suggestions,
            'component',
            {
              requirements: validated.requirements,
              componentType: validated.componentType,
            }
          );

          return {
            success: true,
            suggestions,
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

    // Optimize TypeScript code
    this.server.setRequestHandler(
      'ts-react-agent/optimize-code',
      async args => {
        const schema = z.object({
          code: z.string(),
          optimizationType: z
            .enum(['performance', 'readability', 'type-safety', 'patterns'])
            .default('performance'),
          context: z.string().optional(),
        });
        const validated = schema.parse(args);

        try {
          const optimization = await this.optimizeTypeScriptCode(
            validated.code,
            validated.optimizationType,
            validated.context
          );

          // Store optimization in memory
          this.storeInMemory(
            `optimization-${Date.now()}`,
            optimization,
            'solution',
            {
              optimizationType: validated.optimizationType,
              originalCode: validated.code,
            }
          );

          return {
            success: true,
            optimization,
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

    // Detect and suggest patterns
    this.server.setRequestHandler(
      'ts-react-agent/detect-patterns',
      async args => {
        const schema = z.object({
          path: z.string().optional(),
          patternTypes: z.array(z.string()).optional(),
        });
        const validated = schema.parse(args);

        try {
          const projectRoot = path.resolve(__dirname, '..');
          const targetPath = validated.path
            ? path.resolve(projectRoot, validated.path)
            : projectRoot;

          const patterns = await this.detectCodePatterns(
            targetPath,
            validated.patternTypes
          );

          // Store patterns in memory
          this.storeInMemory('detected-patterns', patterns, 'pattern', {
            path: targetPath,
            timestamp: new Date().toISOString(),
          });

          return {
            success: true,
            patterns,
            count: patterns.length,
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

    // Generate project recommendations
    this.server.setRequestHandler(
      'ts-react-agent/generate-recommendations',
      async args => {
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

          const recommendations = await this.generateProjectRecommendations(
            targetPath,
            validated.focusAreas
          );

          // Store recommendations in memory
          this.storeInMemory(
            'project-recommendations',
            recommendations,
            'solution',
            {
              path: targetPath,
              focusAreas: validated.focusAreas,
            }
          );

          return {
            success: true,
            recommendations,
            count: recommendations.length,
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

    // Memory bank management
    this.server.setRequestHandler(
      'ts-react-agent/manage-memory',
      async args => {
        const schema = z.object({
          action: z.enum(['clear', 'export', 'import', 'stats']),
          data: z.any().optional(),
        });
        const validated = schema.parse(args);

        try {
          let result;
          switch (validated.action) {
            case 'clear':
              result = this.clearMemory();
              break;
            case 'export':
              result = this.exportMemory();
              break;
            case 'import':
              result = this.importMemory(validated.data);
              break;
            case 'stats':
              result = this.getMemoryStats();
              break;
          }

          return {
            success: true,
            action: validated.action,
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
  }

  storeInMemory(key, value, category, metadata = {}) {
    const memoryEntry = {
      key,
      value,
      category,
      metadata: {
        ...metadata,
        storedAt: new Date().toISOString(),
        accessCount: 0,
      },
    };

    this.memoryBank.set(key, memoryEntry);

    // Also store by category for easier retrieval
    if (!this.memoryBank.has(`_category_${category}`)) {
      this.memoryBank.set(`_category_${category}`, []);
    }

    const categoryEntries = this.memoryBank.get(`_category_${category}`);
    categoryEntries.push(key);
    this.memoryBank.set(`_category_${category}`, categoryEntries);
  }

  retrieveFromMemory(key, category, search) {
    const results = [];

    if (key) {
      // Retrieve specific key
      const entry = this.memoryBank.get(key);
      if (entry) {
        entry.metadata.accessCount++;
        results.push(entry);
      }
    } else if (category) {
      // Retrieve all entries from category
      const categoryKeys = this.memoryBank.get(`_category_${category}`) || [];
      for (const categoryKey of categoryKeys) {
        const entry = this.memoryBank.get(categoryKey);
        if (entry) {
          entry.metadata.accessCount++;
          results.push(entry);
        }
      }
    } else if (search) {
      // Search across all entries
      const searchLower = search.toLowerCase();
      for (const [entryKey, entry] of this.memoryBank) {
        if (entryKey.startsWith('_category_')) continue;

        const searchableText = JSON.stringify(entry).toLowerCase();
        if (searchableText.includes(searchLower)) {
          entry.metadata.accessCount++;
          results.push(entry);
        }
      }
    } else {
      // Return all entries (excluding category indexes)
      for (const [entryKey, entry] of this.memoryBank) {
        if (!entryKey.startsWith('_category_')) {
          results.push(entry);
        }
      }
    }

    return results;
  }

  async analyzeTypeScriptProject(targetPath, includeMetrics) {
    const analysis = {
      project: {
        name: path.basename(targetPath),
        path: targetPath,
        type: 'unknown',
        framework: 'unknown',
      },
      files: {
        typescript: 0,
        javascript: 0,
        react: 0,
        test: 0,
        config: 0,
      },
      structure: {
        components: [],
        hooks: [],
        services: [],
        types: [],
        utils: [],
      },
      dependencies: {
        production: [],
        development: [],
        react: [],
        typescript: [],
      },
      metrics: {
        complexity: 0,
        coverage: 0,
        typeCoverage: 0,
        performance: 'unknown',
      },
      issues: [],
      recommendations: [],
    };

    // Analyze package.json
    try {
      const packageJsonPath = path.join(targetPath, 'package.json');
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf8')
      );

      analysis.project.name = packageJson.name || analysis.project.name;
      analysis.dependencies.production = Object.keys(
        packageJson.dependencies || {}
      );
      analysis.dependencies.development = Object.keys(
        packageJson.devDependencies || {}
      );

      // Detect framework
      if (analysis.dependencies.production.includes('next')) {
        analysis.project.framework = 'Next.js';
      } else if (analysis.dependencies.production.includes('gatsby')) {
        analysis.project.framework = 'Gatsby';
      } else if (analysis.dependencies.production.includes('nuxt')) {
        analysis.project.framework = 'Nuxt.js';
      } else if (analysis.dependencies.production.includes('react')) {
        analysis.project.framework = 'React';
      }

      // Detect TypeScript usage
      if (
        analysis.dependencies.production.includes('typescript') ||
        analysis.dependencies.development.includes('typescript')
      ) {
        analysis.project.type = 'TypeScript';
      } else if (analysis.dependencies.production.includes('@types/react')) {
        analysis.project.type = 'TypeScript';
      }

      // Analyze React dependencies
      analysis.dependencies.react = analysis.dependencies.production.filter(
        dep =>
          dep.includes('react') || dep.includes('redux') || dep.includes('mobx')
      );

      // Analyze TypeScript dependencies
      analysis.dependencies.typescript = analysis.dependencies.production
        .concat(analysis.dependencies.development)
        .filter(dep => dep.includes('typescript') || dep.includes('@types/'));
    } catch (error) {
      analysis.issues.push({
        type: 'configuration',
        severity: 'medium',
        message: 'Could not analyze package.json',
      });
    }

    // Analyze file structure
    const sourceFiles = await this.getSourceFiles(targetPath);

    for (const file of sourceFiles) {
      const relativePath = path.relative(targetPath, file);
      const fileName = path.basename(file);
      const ext = path.extname(file);

      // Count file types
      if (ext === '.ts' || ext === '.tsx') {
        analysis.files.typescript++;
      } else if (ext === '.js' || ext === '.jsx') {
        analysis.files.javascript++;
      }

      if (ext === '.tsx' || ext === '.jsx') {
        analysis.files.react++;
      }

      if (fileName.includes('.test.') || fileName.includes('.spec.')) {
        analysis.files.test++;
      }

      if (fileName.includes('config') || fileName.includes('Config')) {
        analysis.files.config++;
      }

      // Categorize files
      const category = this.categorizeFile(relativePath, fileName);
      if (category && analysis.structure[category]) {
        analysis.structure[category].push(relativePath);
      }
    }

    // Calculate metrics
    analysis.metrics = await this.calculateProjectMetrics(targetPath, analysis);

    // Generate recommendations
    analysis.recommendations = this.generateProjectRecommendations(
      targetPath,
      includeMetrics
    );

    return analysis;
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
    const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }

  categorizeFile(relativePath, fileName) {
    const lowerPath = relativePath.toLowerCase();
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('component') || lowerName.includes('component')) {
      return 'components';
    } else if (lowerName.includes('hook') || lowerPath.includes('hooks/')) {
      return 'hooks';
    } else if (
      lowerName.includes('service') ||
      lowerPath.includes('services/')
    ) {
      return 'services';
    } else if (
      lowerName.includes('type') ||
      lowerName.includes('interface') ||
      lowerPath.includes('types/')
    ) {
      return 'types';
    } else if (lowerName.includes('util') || lowerPath.includes('utils/')) {
      return 'utils';
    }

    return null;
  }

  async calculateProjectMetrics(targetPath, analysis) {
    const metrics = {
      complexity: 0,
      coverage: 0,
      typeCoverage: 0,
      performance: 'unknown',
    };

    // Calculate complexity (simplified)
    const sourceFiles = await this.getSourceFiles(targetPath);
    let totalComplexity = 0;
    let fileCount = 0;

    for (const file of sourceFiles) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const complexity = this.calculateFileComplexity(content);
          totalComplexity += complexity;
          fileCount++;
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    metrics.complexity = fileCount > 0 ? totalComplexity / fileCount : 0;

    // Estimate test coverage
    const testFiles = sourceFiles.filter(
      file => file.includes('.test.') || file.includes('.spec.')
    );
    metrics.coverage =
      sourceFiles.length > 0
        ? (testFiles.length / sourceFiles.length) * 100
        : 0;

    // Estimate type coverage
    const tsFiles = sourceFiles.filter(
      file => file.endsWith('.ts') || file.endsWith('.tsx')
    );
    metrics.typeCoverage =
      sourceFiles.length > 0 ? (tsFiles.length / sourceFiles.length) * 100 : 0;

    return metrics;
  }

  calculateFileComplexity(content) {
    let complexity = 1;

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
  }

  async generateComponentSuggestions(requirements, context, componentType) {
    const suggestions = [];

    // Parse requirements
    const reqLower = requirements.toLowerCase();

    // Generate suggestions based on requirements
    if (reqLower.includes('form')) {
      suggestions.push({
        type: 'FormComponent',
        description: 'A form component with validation',
        code: this.generateFormComponent(componentType),
        features: ['validation', 'error handling', 'submit handling'],
      });
    }

    if (reqLower.includes('list') || reqLower.includes('table')) {
      suggestions.push({
        type: 'ListComponent',
        description: 'A list/table component with sorting and filtering',
        code: this.generateListComponent(componentType),
        features: ['sorting', 'filtering', 'pagination'],
      });
    }

    if (reqLower.includes('modal') || reqLower.includes('dialog')) {
      suggestions.push({
        type: 'ModalComponent',
        description: 'A modal dialog component',
        code: this.generateModalComponent(componentType),
        features: ['overlay', 'close handling', 'accessibility'],
      });
    }

    if (reqLower.includes('button')) {
      suggestions.push({
        type: 'ButtonComponent',
        description: 'A reusable button component',
        code: this.generateButtonComponent(componentType),
        features: ['variants', 'loading state', 'disabled state'],
      });
    }

    // Add generic suggestions
    suggestions.push({
      type: 'GenericComponent',
      description: 'A generic component template',
      code: this.generateGenericComponent(componentType),
      features: ['props', 'state', 'lifecycle'],
    });

    return suggestions;
  }

  generateFormComponent(componentType) {
    if (componentType === 'functional') {
      return `import React, { useState } from 'react';

interface FormData {
  // Define your form fields here
}

interface FormComponentProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

export const FormComponent: React.FC<FormComponentProps> = ({
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<FormData>({
    // Initialize with default values
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const validateForm = (data: FormData): Partial<FormData> => {
    const errors: Partial<FormData> = {};

    // Add validation logic here

    return errors;
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Add form fields here */}
      <button type="submit">Submit</button>
    </form>
  );
};`;
    }

    // Add other component types as needed
    return '// Component code generation not implemented for this type';
  }

  generateListComponent(componentType) {
    return `import React, { useState, useMemo } from 'react';

interface ListItem {
  id: string;
  // Define your list item structure
}

interface ListComponentProps {
  items: ListItem[];
  onItemClick?: (item: ListItem) => void;
  sortable?: boolean;
  filterable?: boolean;
}

export const ListComponent: React.FC<ListComponentProps> = ({
  items,
  onItemClick,
  sortable = false,
  filterable = false,
}) => {
  const [sortField, setSortField] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Apply filter
    if (filterable && filterText) {
      result = result.filter(item =>
        // Add your filter logic here
        true
      );
    }

    // Apply sort
    if (sortable && sortField) {
      result.sort((a, b) => {
        // Add your sort logic here
        return 0;
      });
    }

    return result;
  }, [items, filterText, sortField, filterable, sortable]);

  return (
    <div>
      {filterable && (
        <input
          type="text"
          placeholder="Filter items..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      )}

      <ul>
        {filteredAndSortedItems.map((item) => (
          <li
            key={item.id}
            onClick={() => onItemClick?.(item)}
            style={{ cursor: onItemClick ? 'pointer' : 'default' }}
          >
            {/* Render your list item content here */}
          </li>
        ))}
      </ul>
    </div>
  );
};`;
  }

  generateModalComponent(componentType) {
    return `import React, { useEffect } from 'react';

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const ModalComponent: React.FC<ModalComponentProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h2>{title}</h2>}
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};`;
  }

  generateButtonComponent(componentType) {
    return `import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonComponentProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const ButtonComponent: React.FC<ButtonComponentProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
}) => {
  const baseClasses = 'btn';
  const variantClasses = \`btn-\${variant}\`;
  const sizeClasses = \`btn-\${size}\`;

  const classes = [baseClasses, variantClasses, sizeClasses].join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};`;
  }

  generateGenericComponent(componentType) {
    return `import React, { useState, useEffect } from 'react';

interface GenericComponentProps {
  // Define your props here
}

export const GenericComponent: React.FC<GenericComponentProps> = ({
  // Destructure your props here
}) => {
  const [state, setState] = useState<{
    // Define your state structure here
  }>({
    // Initialize state
  });

  useEffect(() => {
    // Add side effects here
  }, []);

  return (
    <div>
      {/* Add your component JSX here */}
    </div>
  );
};`;
  }

  async optimizeTypeScriptCode(code, optimizationType, context) {
    const optimization = {
      originalCode: code,
      optimizedCode: code,
      improvements: [],
      suggestions: [],
      metrics: {
        linesOfCode: code.split('\n').length,
        complexity: 0,
        typeSafety: 0,
      },
    };

    switch (optimizationType) {
      case 'performance':
        optimization.improvements = this.optimizeForPerformance(code);
        break;
      case 'readability':
        optimization.improvements = this.optimizeForReadability(code);
        break;
      case 'type-safety':
        optimization.improvements = this.optimizeForTypeSafety(code);
        break;
      case 'patterns':
        optimization.improvements = this.optimizeForPatterns(code);
        break;
    }

    // Calculate metrics
    optimization.metrics.complexity = this.calculateFileComplexity(code);
    optimization.metrics.typeSafety = this.calculateTypeSafety(code);

    return optimization;
  }

  optimizeForPerformance(code) {
    const improvements = [];

    // Check for performance anti-patterns
    if (code.includes('.map(') && code.includes('key={index}')) {
      improvements.push({
        type: 'performance',
        severity: 'medium',
        message: 'Consider using stable keys instead of array index',
        suggestion:
          'Use unique identifiers as keys for better React performance',
      });
    }

    if (code.includes('useEffect') && !code.includes('useCallback')) {
      improvements.push({
        type: 'performance',
        severity: 'low',
        message:
          'Consider using useCallback for functions passed to child components',
        suggestion:
          'Wrap functions with useCallback to prevent unnecessary re-renders',
      });
    }

    if (code.includes('useState') && code.includes('useEffect')) {
      improvements.push({
        type: 'performance',
        severity: 'medium',
        message: 'Consider using useReducer for complex state management',
        suggestion:
          'Use useReducer when state logic is complex or involves multiple sub-values',
      });
    }

    return improvements;
  }

  optimizeForReadability(code) {
    const improvements = [];

    // Check for readability issues
    if (code.length > 500) {
      improvements.push({
        type: 'readability',
        severity: 'medium',
        message: 'Consider breaking down large components into smaller ones',
        suggestion: 'Extract logic into custom hooks or separate components',
      });
    }

    if (code.includes('any')) {
      improvements.push({
        type: 'readability',
        severity: 'high',
        message: 'Avoid using "any" type',
        suggestion: 'Define proper TypeScript types for better code clarity',
      });
    }

    if (!code.includes('interface') && code.includes('props')) {
      improvements.push({
        type: 'readability',
        severity: 'medium',
        message: 'Define interfaces for component props',
        suggestion:
          'Create TypeScript interfaces for better prop documentation',
      });
    }

    return improvements;
  }

  optimizeForTypeSafety(code) {
    const improvements = [];

    // Check for type safety issues
    if (code.includes('as any')) {
      improvements.push({
        type: 'type-safety',
        severity: 'high',
        message: 'Remove "as any" type assertions',
        suggestion: 'Use proper type guards or define correct types',
      });
    }

    if (code.includes('!') && !code.includes('//')) {
      improvements.push({
        type: 'type-safety',
        severity: 'medium',
        message: 'Avoid non-null assertion operator',
        suggestion: 'Use optional chaining or proper null checks',
      });
    }

    if (code.includes('Object.keys') && !code.includes('as const')) {
      improvements.push({
        type: 'type-safety',
        severity: 'low',
        message: 'Consider using "as const" for better type inference',
        suggestion: 'Add "as const" to object literals for literal types',
      });
    }

    return improvements;
  }

  optimizeForPatterns(code) {
    const improvements = [];

    // Check for React patterns
    if (code.includes('class') && code.includes('extends React.Component')) {
      improvements.push({
        type: 'patterns',
        severity: 'medium',
        message: 'Consider converting class component to functional component',
        suggestion:
          'Use React hooks instead of class components for better performance',
      });
    }

    if (
      code.includes('componentDidMount') ||
      code.includes('componentDidUpdate')
    ) {
      improvements.push({
        type: 'patterns',
        severity: 'medium',
        message: 'Convert lifecycle methods to useEffect',
        suggestion: 'Use useEffect hook instead of class lifecycle methods',
      });
    }

    return improvements;
  }

  calculateTypeSafety(code) {
    let score = 0;
    const lines = code.split('\n');

    for (const line of lines) {
      if (line.includes(':')) score += 2; // Type annotations
      if (line.includes('interface') || line.includes('type')) score += 3; // Type definitions
      if (line.includes('any')) score -= 5; // Any usage
      if (line.includes('as any')) score -= 10; // Type assertions
    }

    return Math.max(0, score);
  }

  async detectCodePatterns(targetPath, patternTypes) {
    const patterns = [];
    const sourceFiles = await this.getSourceFiles(targetPath);

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const filePatterns = this.analyzeCodePatterns(content, file);
        patterns.push(...filePatterns);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return patterns;
  }

  analyzeCodePatterns(content, filePath) {
    const patterns = [];

    // Detect React patterns
    if (content.includes('useState') && content.includes('useEffect')) {
      patterns.push({
        type: 'react-hooks',
        file: path.relative(path.resolve(__dirname, '..'), filePath),
        description: 'Uses React hooks pattern',
        confidence: 0.9,
      });
    }

    if (content.includes('useContext')) {
      patterns.push({
        type: 'react-context',
        file: path.relative(path.resolve(__dirname, '..'), filePath),
        description: 'Uses React Context pattern',
        confidence: 0.8,
      });
    }

    if (content.includes('useReducer')) {
      patterns.push({
        type: 'react-reducer',
        file: path.relative(path.resolve(__dirname, '..'), filePath),
        description: 'Uses useReducer pattern for state management',
        confidence: 0.9,
      });
    }

    // Detect TypeScript patterns
    if (content.includes('interface') && content.includes('extends')) {
      patterns.push({
        type: 'typescript-inheritance',
        file: path.relative(path.resolve(__dirname, '..'), filePath),
        description: 'Uses TypeScript interface inheritance',
        confidence: 0.8,
      });
    }

    if (content.includes('type') && content.includes('|')) {
      patterns.push({
        type: 'typescript-union',
        file: path.relative(path.resolve(__dirname, '..'), filePath),
        description: 'Uses TypeScript union types',
        confidence: 0.9,
      });
    }

    if (content.includes('Generic') && content.includes('<')) {
      patterns.push({
        type: 'typescript-generics',
        file: path.relative(path.resolve(__dirname, '..'), filePath),
        description: 'Uses TypeScript generics',
        confidence: 0.8,
      });
    }

    return patterns;
  }

  generateProjectRecommendations(targetPath, focusAreas) {
    const recommendations = [];

    // General recommendations
    recommendations.push({
      priority: 'high',
      category: 'structure',
      title: 'Organize Project Structure',
      description:
        'Ensure consistent folder structure for components, hooks, and utilities',
      implementation:
        'Create standardized directories: components/, hooks/, utils/, types/',
    });

    recommendations.push({
      priority: 'medium',
      category: 'typescript',
      title: 'Improve Type Safety',
      description: 'Add proper TypeScript types throughout the project',
      implementation:
        'Define interfaces for all props, state, and API responses',
    });

    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Optimize Bundle Size',
      description: 'Reduce bundle size by code splitting and lazy loading',
      implementation:
        'Use React.lazy() and dynamic imports for route-based code splitting',
    });

    return recommendations;
  }

  clearMemory() {
    const count = this.memoryBank.size;
    this.memoryBank.clear();
    return { clearedEntries: count };
  }

  exportMemory() {
    const exportData = {};
    for (const [key, entry] of this.memoryBank) {
      if (!key.startsWith('_category_')) {
        exportData[key] = entry;
      }
    }
    return exportData;
  }

  importMemory(data) {
    let importedCount = 0;
    for (const [key, entry] of Object.entries(data)) {
      this.memoryBank.set(key, entry);
      importedCount++;
    }
    return { importedEntries: importedCount };
  }

  getMemoryStats() {
    const stats = {
      totalEntries: 0,
      byCategory: {},
      mostAccessed: [],
    };

    for (const [key, entry] of this.memoryBank) {
      if (!key.startsWith('_category_')) {
        stats.totalEntries++;

        // Count by category
        const category = entry.category;
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // Track most accessed
        if (entry.metadata.accessCount > 0) {
          stats.mostAccessed.push({
            key,
            category,
            accessCount: entry.metadata.accessCount,
          });
        }
      }
    }

    // Sort by access count
    stats.mostAccessed.sort((a, b) => b.accessCount - a.accessCount);
    stats.mostAccessed = stats.mostAccessed.slice(0, 10);

    return stats;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TypeScript React Agent MCP server running on stdio');
  }
}

const server = new TypeScriptReactAgentMCPServer();
server.start().catch(console.error);
