import { Router } from 'express';
import { healthCheck } from '../utils/connection';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbHealth = await healthCheck();

    const responseTime = Date.now() - startTime;

    const health = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbHealth.status,
          latency: dbHealth.latency ? `${dbHealth.latency}ms` : null,
          error: dbHealth.error || null,
        },
        redis: {
          status: 'unknown', // Will be implemented when Redis is added
        },
      },
      environment: process.env.NODE_ENV,
      version: '1.0.0',
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    logger.info(`Health check: ${health.status} (${responseTime}ms)`);

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await healthCheck();

    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database connection failed',
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);

    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed',
    });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRoutes };
