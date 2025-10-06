/**
 * GDPR Compliance Module
 * Simple GDPR compliance utilities
 */

export interface GDPRRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  reason?: string;
}

// In-memory GDPR requests (replace with database in production)
const gdprRequests = new Map<string, GDPRRequest[]>();

/**
 * Submit GDPR request
 */
export function submitGDPRRequest(
  userId: string,
  type: GDPRRequest['type'],
  reason?: string
): GDPRRequest {
  const request: GDPRRequest = {
    id: generateId(),
    userId,
    type,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    reason,
  };

  const userRequests = gdprRequests.get(userId) || [];
  userRequests.push(request);
  gdprRequests.set(userId, userRequests);

  return request;
}

/**
 * Get GDPR requests for user
 */
export function getGDPRRequests(userId: string): GDPRRequest[] {
  return gdprRequests.get(userId) || [];
}

/**
 * Update GDPR request status
 */
export function updateGDPRRequestStatus(
  requestId: string,
  status: GDPRRequest['status'],
  reason?: string
): boolean {
  let found = false;

  gdprRequests.forEach(requests => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      request.status = status;
      if (status === 'completed') {
        request.completedAt = new Date().toISOString();
      }
      if (reason) {
        request.reason = reason;
      }
      found = true;
    }
  });

  return found;
}

/**
 * Check if user has pending GDPR requests
 */
export function hasPendingGDPRRequests(userId: string): boolean {
  const requests = gdprRequests.get(userId) || [];
  return requests.some(
    request => request.status === 'pending' || request.status === 'processing'
  );
}

/**
 * Get GDPR compliance status for user
 */
export function getGDPRComplianceStatus(userId: string): {
  compliant: boolean;
  pendingRequests: number;
  lastRequest?: string;
  recommendations: string[];
} {
  const requests = gdprRequests.get(userId) || [];
  const pendingRequests = requests.filter(
    r => r.status === 'pending' || r.status === 'processing'
  ).length;
  const lastRequest = requests.sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  )[0];

  const recommendations = [];
  if (pendingRequests > 0) {
    recommendations.push('Process pending GDPR requests');
  }
  if (!lastRequest) {
    recommendations.push(
      'Consider implementing proactive GDPR compliance measures'
    );
  }

  return {
    compliant: pendingRequests === 0,
    pendingRequests,
    lastRequest: lastRequest?.requestedAt,
    recommendations,
  };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
