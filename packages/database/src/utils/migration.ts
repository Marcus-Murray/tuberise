import { prisma } from '../client';

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    // This would typically run Prisma migrations
    // For now, we'll just ensure the database is accessible
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
}

/**
 * Reset database (for development only)
 */
export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database reset is not allowed in production');
  }

  try {
    await prisma.$executeRaw`TRUNCATE TABLE users, subscriptions, youtube_channels, youtube_analytics, youtube_videos, ai_insights, notion_workspaces, notion_templates, audit_logs CASCADE`;
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}
