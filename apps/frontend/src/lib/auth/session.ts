/**
 * Session Management Module
 * Simple session utilities for authentication
 */

export interface SessionData {
  userId: string;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

// In-memory session storage (replace with database in production)
const sessions = new Map<string, SessionData>();

/**
 * Create a new session
 */
export function createSession(userId: string): SessionData {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const session: SessionData = {
    userId,
    sessionId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
  };

  sessions.set(sessionId, session);
  return session;
}

/**
 * Get session by ID
 */
export function getSession(sessionId: string): SessionData | null {
  const session = sessions.get(sessionId);

  if (!session || !session.isActive) {
    return null;
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    session.isActive = false;
    return null;
  }

  return session;
}

/**
 * Invalidate session
 */
export function invalidateSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);

  if (session) {
    session.isActive = false;
    return true;
  }

  return false;
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): number {
  const now = new Date();
  let cleaned = 0;

  sessions.forEach((session, sessionId) => {
    if (new Date(session.expiresAt) < now) {
      session.isActive = false;
      cleaned++;
    }
  });

  return cleaned;
}

/**
 * Get active sessions for user
 */
export function getUserSessions(userId: string): SessionData[] {
  const userSessions: SessionData[] = [];

  sessions.forEach(session => {
    if (session.userId === userId && session.isActive) {
      userSessions.push(session);
    }
  });

  return userSessions;
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return (
    Math.random().toString(36).substr(2, 9) +
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 9)
  );
}
