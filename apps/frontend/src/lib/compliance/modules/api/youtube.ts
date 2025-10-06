/**
 * YouTube API Compliance Module
 * Simple YouTube API compliance utilities
 */

import type { APILimitStatus } from '../../types';

// YouTube API limits
const YOUTUBE_QUOTA_LIMIT = 10000; // Daily quota
const YOUTUBE_RATE_LIMIT = 100; // Requests per 100 seconds

// In-memory tracking (replace with database in production)
const quotaUsage = new Map<string, { used: number; resetTime: number }>();
const rateUsage = new Map<string, { count: number; resetTime: number }>();

/**
 * Check YouTube API compliance
 */
export function checkYouTubeCompliance(
  userId: string,
  operation: string,
  quotaCost: number = 1
): APILimitStatus {
  const now = Date.now();

  // Check daily quota
  const quotaKey = `youtube_quota_${userId}`;
  const quotaStatus = checkQuota(quotaKey, YOUTUBE_QUOTA_LIMIT, quotaCost, now);

  // Check rate limit
  const rateKey = `youtube_rate_${userId}`;
  const rateStatus = checkRateLimit(rateKey, YOUTUBE_RATE_LIMIT, now);

  const allowed = quotaStatus.allowed && rateStatus.allowed;

  return {
    allowed,
    quotaRemaining: quotaStatus.remaining,
    rateLimitRemaining: rateStatus.remaining,
    resetTime: quotaStatus.resetTime,
    message: allowed ? 'API call allowed' : 'API limit exceeded',
  };
}

/**
 * Check quota usage
 */
function checkQuota(
  key: string,
  limit: number,
  cost: number,
  now: number
): { allowed: boolean; remaining: number; resetTime: string } {
  const usage = quotaUsage.get(key);
  const resetTime = now + 24 * 60 * 60 * 1000; // 24 hours

  if (!usage || now > usage.resetTime) {
    // Reset quota
    quotaUsage.set(key, { used: cost, resetTime });
    return {
      allowed: true,
      remaining: limit - cost,
      resetTime: new Date(resetTime).toISOString(),
    };
  }

  if (usage.used + cost > limit) {
    return {
      allowed: false,
      remaining: limit - usage.used,
      resetTime: new Date(usage.resetTime).toISOString(),
    };
  }

  usage.used += cost;
  return {
    allowed: true,
    remaining: limit - usage.used,
    resetTime: new Date(usage.resetTime).toISOString(),
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
  const resetTime = now + 100 * 1000; // 100 seconds

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
 * Get YouTube API usage statistics
 */
export function getYouTubeUsageStats(userId: string) {
  const quotaKey = `youtube_quota_${userId}`;
  const rateKey = `youtube_rate_${userId}`;

  const quotaUsage_data = quotaUsage.get(quotaKey);
  const rateUsage_data = rateUsage.get(rateKey);

  return {
    dailyQuotaUsed: quotaUsage_data?.used || 0,
    dailyQuotaLimit: YOUTUBE_QUOTA_LIMIT,
    rateLimitUsed: rateUsage_data?.count || 0,
    rateLimitLimit: YOUTUBE_RATE_LIMIT,
  };
}
