/**
 * AI Human Oversight Module
 * Simple human oversight tracking
 */

export interface OversightRecord {
  id: string;
  contentId: string;
  aiGenerated: boolean;
  reviewedBy: string;
  reviewedAt: string;
  approved: boolean;
  feedback?: string;
  confidence?: number;
}

// In-memory oversight records (replace with database in production)
const oversightRecords = new Map<string, OversightRecord[]>();

/**
 * Record human oversight of AI content
 */
export function recordOversight(
  contentId: string,
  aiGenerated: boolean,
  reviewedBy: string,
  approved: boolean,
  feedback?: string,
  confidence?: number
): OversightRecord {
  const record: OversightRecord = {
    id: generateId(),
    contentId,
    aiGenerated,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
    approved,
    feedback,
    confidence,
  };

  const records = oversightRecords.get(contentId) || [];
  records.push(record);
  oversightRecords.set(contentId, records);

  return record;
}

/**
 * Get oversight records for content
 */
export function getOversightRecords(contentId: string): OversightRecord[] {
  return oversightRecords.get(contentId) || [];
}

/**
 * Check if content has been reviewed
 */
export function hasBeenReviewed(contentId: string): boolean {
  const records = oversightRecords.get(contentId) || [];
  return records.length > 0;
}

/**
 * Check if content is approved
 */
export function isApproved(contentId: string): boolean {
  const records = oversightRecords.get(contentId) || [];
  const latestRecord = records.sort(
    (a, b) =>
      new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
  )[0];

  return latestRecord?.approved || false;
}

/**
 * Get oversight statistics
 */
export function getOversightStats(): {
  totalReviewed: number;
  approved: number;
  rejected: number;
  pendingReview: number;
} {
  let totalReviewed = 0;
  let approved = 0;
  let rejected = 0;
  let pendingReview = 0;

  oversightRecords.forEach(records => {
    totalReviewed += records.length;

    const latestRecord = records.sort(
      (a, b) =>
        new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
    )[0];

    if (latestRecord) {
      if (latestRecord.approved) {
        approved++;
      } else {
        rejected++;
      }
    } else {
      pendingReview++;
    }
  });

  return {
    totalReviewed,
    approved,
    rejected,
    pendingReview,
  };
}

/**
 * Flag content for review
 */
export function flagForReview(
  contentId: string,
  reason: string,
  flaggedBy: string
): void {
  // Simple flagging - in production, integrate with review queue
  console.log(
    `Content ${contentId} flagged for review: ${reason} (flagged by: ${flaggedBy})`
  );
}

/**
 * Generate oversight report
 */
export function generateOversightReport(): {
  summary: string;
  statistics: ReturnType<typeof getOversightStats>;
  recommendations: string[];
} {
  const stats = getOversightStats();

  const summary = `Oversight Report: ${stats.totalReviewed} items reviewed, ${stats.approved} approved, ${stats.rejected} rejected`;

  const recommendations = [];

  if (stats.rejected > stats.approved) {
    recommendations.push('High rejection rate - review AI model performance');
  }

  if (stats.pendingReview > 0) {
    recommendations.push(
      'Items pending review - consider increasing oversight capacity'
    );
  }

  return {
    summary,
    statistics: stats,
    recommendations,
  };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
