/**
 * Security Validation Module
 * Simple input validation and sanitization
 */

import type { ValidationResult } from '../../types';

/**
 * Validate and sanitize user input
 */
export function validateInput(input: string): ValidationResult {
  const violations: string[] = [];
  let sanitized = input;

  // Check for XSS attempts
  if (containsXSS(input)) {
    violations.push('Potential XSS vulnerability detected');
    sanitized = sanitizeXSS(input);
  }

  // Check for script injection
  if (containsScriptInjection(input)) {
    violations.push('Potential script injection detected');
    sanitized = sanitizeScriptInjection(input);
  }

  // Check for SQL injection (basic)
  if (containsSQLInjection(input)) {
    violations.push('Potential SQL injection detected');
    sanitized = sanitizeSQLInjection(input);
  }

  // Check length
  if (input.length > 5000) {
    violations.push('Input too long (max 5000 characters)');
  }

  return {
    valid: violations.length === 0,
    violations,
    sanitized: violations.length > 0 ? sanitized : input,
  };
}

/**
 * Check for XSS patterns
 */
function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize XSS
 */
function sanitizeXSS(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '');
}

/**
 * Check for script injection
 */
function containsScriptInjection(input: string): boolean {
  const scriptPatterns = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
  ];

  return scriptPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize script injection
 */
function sanitizeScriptInjection(input: string): string {
  return input
    .replace(/eval\s*\(/gi, '')
    .replace(/Function\s*\(/gi, '')
    .replace(/setTimeout\s*\(/gi, '')
    .replace(/setInterval\s*\(/gi, '');
}

/**
 * Check for SQL injection (basic)
 */
function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /('|(\\')|(;)|(\\;)|(--)|(\\*)|(\\|)|(\\&)|(\\$)|(\\%)|(\\#)|(\\@))/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize SQL injection
 */
function sanitizeSQLInjection(input: string): string {
  return input
    .replace(
      /('|(\\')|(;)|(\\;)|(--)|(\\*)|(\\|)|(\\&)|(\\$)|(\\%)|(\\#)|(\\@))/gi,
      ''
    )
    .replace(/union\s+select/gi, '')
    .replace(/drop\s+table/gi, '')
    .replace(/delete\s+from/gi, '')
    .replace(/insert\s+into/gi, '')
    .replace(/update\s+set/gi, '');
}
