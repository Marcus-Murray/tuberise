/**
 * Shared Types for Compliance Modules
 * Simple, self-contained type definitions
 */

// Common response types
export interface ComplianceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// API Compliance Types
export interface APILimitStatus {
  allowed: boolean;
  quotaRemaining?: number;
  rateLimitRemaining?: number;
  resetTime?: string;
  message: string;
}

// Bias Detection Types
export interface BiasResult {
  hasBias: boolean;
  type?: 'gender' | 'racial' | 'age' | 'religious' | 'political';
  severity?: 'low' | 'medium' | 'high';
  confidence?: number;
  details?: string;
}

// Security Validation Types
export interface ValidationResult {
  valid: boolean;
  violations: string[];
  sanitized?: string;
}

// Consent Management Types
export interface ConsentRecord {
  userId: string;
  consentType: 'essential' | 'analytics' | 'marketing' | 'personalization';
  granted: boolean;
  timestamp: string;
  version: string;
}

// Data Export Types
export interface DataExportRequest {
  userId: string;
  format: 'json' | 'csv' | 'xml';
  dataTypes: string[];
  timestamp: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  key: string;
}

// AI Transparency Types
export interface AITransparencyInfo {
  isAI: boolean;
  modelName?: string;
  confidence?: number;
  humanOversight: boolean;
  explanation?: string;
}
