/**
 * User Authentication Module
 * Simple, self-contained user authentication utilities
 */

import { auth } from '@clerk/nextjs/server';

export interface UserData {
  id: string;
  email?: string;
  name?: string;
  imageUrl?: string;
  createdAt?: string;
}

/**
 * Get the current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current authenticated user with basic data
 */
export async function getCurrentUser(): Promise<UserData | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Return basic user data structure
  return {
    id: userId,
    // Additional user data can be fetched from database here
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Authentication required');
  }

  return userId;
}
