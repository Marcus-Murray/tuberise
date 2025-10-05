// Re-export Prisma types
export { PrismaClient } from '@prisma/client';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Analytics types
export interface AnalyticsData {
  date: Date;
  views: number;
  subscribers: number;
  videos: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  estimatedRevenue?: number;
}

export interface VideoAnalytics {
  videoId: string;
  title: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  thumbnailUrl: string;
}

// AI Insight types
export interface InsightData {
  type: string;
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  metadata?: Record<string, any>;
}

// Notion types
export interface NotionTemplateData {
  name: string;
  description?: string;
  category: string;
  content: Record<string, any>;
}

// Subscription types
export interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  apiCallsUsed: number;
  apiCallsLimit: number;
}

// Audit types
export interface AuditLogData {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// Error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with ID ${id}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}
