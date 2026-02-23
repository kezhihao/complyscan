/**
 * Health check endpoint
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const healthRouter = new Hono<{ Bindings: Env }>();

healthRouter.get('/', (c) => {
  return c.json({
    status: 'healthy',
    service: 'complyscan-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/ready', async (c) => {
  // Check database connection
  try {
    await c.env.DB.prepare('SELECT 1').first();
    return c.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    return c.json({ status: 'not_ready', database: 'disconnected' }, 503);
  }
});

export default healthRouter;
