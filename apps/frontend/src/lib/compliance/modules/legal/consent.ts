/**
 * Consent Management Module
 * Simple, self-contained consent management
 */

import type { ConsentRecord } from '../../types';

// In-memory consent storage (replace with database in production)
const consentStorage = new Map<string, ConsentRecord[]>();

/**
 * Record user consent for data processing
 */
export function recordConsent(
  userId: string,
  consentType: ConsentRecord['consentType'],
  granted: boolean
): ConsentRecord {
  const consent: ConsentRecord = {
    userId,
    consentType,
    granted,
    timestamp: new Date().toISOString(),
    version: '1.0',
  };

  // Store consent
  const userConsents = consentStorage.get(userId) || [];
  userConsents.push(consent);
  consentStorage.set(userId, userConsents);

  return consent;
}

/**
 * Check if user has granted specific consent
 */
export function hasConsent(
  userId: string,
  consentType: ConsentRecord['consentType']
): boolean {
  const userConsents = consentStorage.get(userId) || [];
  const latestConsent = userConsents
    .filter(c => c.consentType === consentType)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

  return latestConsent?.granted || false;
}

/**
 * Get all consents for a user
 */
export function getUserConsents(userId: string): ConsentRecord[] {
  return consentStorage.get(userId) || [];
}

/**
 * Withdraw consent
 */
export function withdrawConsent(
  userId: string,
  consentType: ConsentRecord['consentType']
): ConsentRecord {
  return recordConsent(userId, consentType, false);
}
