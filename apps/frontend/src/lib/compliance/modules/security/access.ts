/**
 * Access Control Module
 * Simple access control utilities
 */

export interface AccessControl {
  userId: string;
  resource: string;
  permissions: string[];
  grantedAt: string;
  expiresAt?: string;
}

// In-memory access control (replace with database in production)
const accessControls = new Map<string, AccessControl[]>();

/**
 * Grant access to a resource
 */
export function grantAccess(
  userId: string,
  resource: string,
  permissions: string[],
  expiresAt?: string
): AccessControl {
  const access: AccessControl = {
    userId,
    resource,
    permissions,
    grantedAt: new Date().toISOString(),
    expiresAt,
  };

  const userAccess = accessControls.get(userId) || [];
  userAccess.push(access);
  accessControls.set(userId, userAccess);

  return access;
}

/**
 * Check if user has access to a resource
 */
export function hasAccess(
  userId: string,
  resource: string,
  permission: string
): boolean {
  const userAccess = accessControls.get(userId) || [];
  const now = new Date().toISOString();

  return userAccess.some(access => {
    // Check resource match
    if (access.resource !== resource) return false;

    // Check expiration
    if (access.expiresAt && access.expiresAt < now) return false;

    // Check permission
    return (
      access.permissions.includes(permission) ||
      access.permissions.includes('*')
    );
  });
}

/**
 * Revoke access to a resource
 */
export function revokeAccess(
  userId: string,
  resource: string,
  permission?: string
): boolean {
  const userAccess = accessControls.get(userId) || [];

  if (permission) {
    // Revoke specific permission
    userAccess.forEach(access => {
      if (access.resource === resource) {
        access.permissions = access.permissions.filter(p => p !== permission);
      }
    });
  } else {
    // Revoke all access to resource
    const filtered = userAccess.filter(access => access.resource !== resource);
    accessControls.set(userId, filtered);
  }

  return true;
}

/**
 * Get all access controls for a user
 */
export function getUserAccess(userId: string): AccessControl[] {
  const userAccess = accessControls.get(userId) || [];
  const now = new Date().toISOString();

  // Filter out expired access
  return userAccess.filter(
    access => !access.expiresAt || access.expiresAt > now
  );
}

/**
 * Check if access is expired
 */
export function isAccessExpired(access: AccessControl): boolean {
  if (!access.expiresAt) return false;
  return new Date(access.expiresAt) < new Date();
}
