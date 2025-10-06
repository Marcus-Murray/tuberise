/**
 * Authentication Module Index
 * Exports all authentication-related functions
 */

export * from './user';
export * from './session';
export * from './permissions';

// Re-export for backward compatibility
export { getCurrentUserId, getCurrentUser, isAuthenticated } from './user';
