/**
 * Permissions Module
 * Simple permission management for authenticated users
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserPermission {
  userId: string;
  permissionId: string;
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

// Predefined permissions
export const PERMISSIONS = {
  // YouTube permissions
  YOUTUBE_READ: 'youtube:read',
  YOUTUBE_WRITE: 'youtube:write',
  YOUTUBE_ANALYTICS: 'youtube:analytics',

  // Notion permissions
  NOTION_READ: 'notion:read',
  NOTION_WRITE: 'notion:write',
  NOTION_PAGES: 'notion:pages',

  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ANALYTICS: 'admin:analytics',
} as const;

// In-memory permission storage (replace with database in production)
const userPermissions = new Map<string, UserPermission[]>();

/**
 * Grant permission to user
 */
export function grantPermission(
  userId: string,
  permissionId: string,
  grantedBy: string,
  expiresAt?: string
): UserPermission {
  const permission: UserPermission = {
    userId,
    permissionId,
    grantedAt: new Date().toISOString(),
    grantedBy,
    expiresAt,
  };

  const permissions = userPermissions.get(userId) || [];
  permissions.push(permission);
  userPermissions.set(userId, permissions);

  return permission;
}

/**
 * Check if user has permission
 */
export function hasPermission(userId: string, permissionId: string): boolean {
  const permissions = userPermissions.get(userId) || [];
  const now = new Date().toISOString();

  return permissions.some(permission => {
    // Check permission match
    if (permission.permissionId !== permissionId) return false;

    // Check expiration
    if (permission.expiresAt && permission.expiresAt < now) return false;

    return true;
  });
}

/**
 * Revoke permission from user
 */
export function revokePermission(
  userId: string,
  permissionId: string
): boolean {
  const permissions = userPermissions.get(userId) || [];
  const filtered = permissions.filter(p => p.permissionId !== permissionId);

  userPermissions.set(userId, filtered);
  return filtered.length !== permissions.length;
}

/**
 * Get all permissions for user
 */
export function getUserPermissions(userId: string): UserPermission[] {
  const permissions = userPermissions.get(userId) || [];
  const now = new Date().toISOString();

  // Filter out expired permissions
  return permissions.filter(
    permission => !permission.expiresAt || permission.expiresAt > now
  );
}

/**
 * Check multiple permissions
 */
export function hasAnyPermission(
  userId: string,
  permissionIds: string[]
): boolean {
  return permissionIds.some(permissionId =>
    hasPermission(userId, permissionId)
  );
}

/**
 * Check all permissions
 */
export function hasAllPermissions(
  userId: string,
  permissionIds: string[]
): boolean {
  return permissionIds.every(permissionId =>
    hasPermission(userId, permissionId)
  );
}
