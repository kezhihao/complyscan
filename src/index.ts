/**
 * ComplyScan API - Main Entry Point
 * Small team code compliance scanning
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Routes
import healthRouter from './routes/health';
import scanRouter from './routes/scan';
import githubRouter from './routes/github';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['https://github.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-GitHub-Token'],
}));

// Routes
app.route('/', healthRouter);
app.route('/api/scan', scanRouter);
app.route('/api/github', githubRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
