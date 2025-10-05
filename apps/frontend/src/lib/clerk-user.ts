import { auth } from '@clerk/nextjs/server';

/**
 * Get the current authenticated user from Clerk
 * @returns User ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current authenticated user with additional data
 * @returns User data if authenticated, null otherwise
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Return basic user data - you can extend this to fetch from your database
  return {
    id: userId,
    // Add other user data as needed
  };
}

/**
 * Check if user is authenticated
 * @returns boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}
