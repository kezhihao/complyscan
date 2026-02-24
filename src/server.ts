/**
 * ComplyScan API - Standard Node.js Entry Point
 * Runs on Vercel, Railway, Render, or any Node.js host
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types-standard';

// Routes
import healthRouter from './routes/health';
import scanRouter from './routes/scan-standard';
import githubRouter from './routes/github';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['https://github.com', 'http://localhost:3000', 'https://complyscan.vercel.app'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-GitHub-Token'],
}));

// Rate limiting middleware
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
let lastCleanup = Date.now();

const rateLimitMiddleware = async (c: any, next: any) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const limit = 60; // 60 requests per minute

  // Cleanup old entries every minute
  if (now - lastCleanup > windowMs) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
    lastCleanup = now;
  }

  // Get or create entry
  let entry = rateLimitStore.get(ip);
  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(ip, entry);
  }

  // Check limit
  if (entry.count >= limit) {
    return c.json({ error: 'Too Many Requests', message: 'Rate limit exceeded. Try again later.' }, 429);
  }

  entry.count++;
  await next();
};

app.use('*', rateLimitMiddleware);

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

// Start server (only if not running on Vercel/Serverless)
const port = parseInt(process.env.PORT || '3000');

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`ComplyScan API running on port ${port}`);
}

// Export for Vercel/Serverless
export default app;
