/**
 * Notion API Compliance Module
 * Simple Notion API compliance utilities
 */

import type { APILimitStatus } from '../../types';

// Notion API limits
const NOTION_RATE_LIMIT = 3; // Requests per second

// In-memory tracking (replace with database in production)
const rateUsage = new Map<string, { count: number; resetTime: number }>();

/**
 * Check Notion API compliance
 */
export function checkNotionCompliance(
  userId: string,
  operation: string
): APILimitStatus {
  const now = Date.now();
  const rateKey = `notion_rate_${userId}`;

  const rateStatus = checkRateLimit(rateKey, NOTION_RATE_LIMIT, now);

  return {
    allowed: rateStatus.allowed,
    rateLimitRemaining: rateStatus.remaining,
    message: rateStatus.allowed ? 'API call allowed' : 'Rate limit exceeded',
  };
}

/**
 * Check rate limit
 */
function checkRateLimit(
  key: string,
  limit: number,
  now: number
): { allowed: boolean; remaining: number } {
  const usage = rateUsage.get(key);
  const resetTime = now + 1000; // 1 second

  if (!usage || now > usage.resetTime) {
    // Reset rate limit
    rateUsage.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: limit - 1,
    };
  }

  if (usage.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  usage.count++;
  return {
    allowed: true,
    remaining: limit - usage.count,
  };
}

/**
 * Get Notion API usage statistics
 */
export function getNotionUsageStats(userId: string) {
  const rateKey = `notion_rate_${userId}`;
  const usage = rateUsage.get(rateKey);

  return {
    rateLimitUsed: usage?.count || 0,
    rateLimitLimit: NOTION_RATE_LIMIT,
  };
}

/**
 * Validate Notion workspace access
 */
export function validateWorkspaceAccess(
  userId: string,
  workspaceId: string
): boolean {
  // Simple validation - in production, check actual permissions
  return userId && workspaceId ? true : false;
}
