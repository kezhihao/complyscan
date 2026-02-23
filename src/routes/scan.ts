/**
 * Scan endpoints
 */

import { Hono } from 'hono';
import type { ScanRequest, ScanResult, Env } from '../types';

const scanRouter = new Hono<{ Bindings: Env }>();

// POST /api/scan - Start a new scan
scanRouter.post('/', async (c) => {
  const body = await c.req.json() as ScanRequest;

  // Validate request
  if (!body.repositoryUrl) {
    return c.json({ error: 'repositoryUrl is required' }, 400);
  }

  // Parse GitHub URL
  const githubMatch = body.repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!githubMatch) {
    return c.json({ error: 'Invalid GitHub repository URL' }, 400);
  }

  const [, owner, repo] = githubMatch;
  const scanId = crypto.randomUUID();

  // Create scan record
  await c.env.DB.prepare(`
    INSERT INTO scans (id, owner, repo, branch, commit_sha, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    scanId,
    owner,
    repo,
    body.branch || 'main',
    body.commitSha || '',
    'pending',
    new Date().toISOString()
  ).run();

  // Return scan result (would trigger async scan in production)
  return c.json<ScanResult>({
    id: scanId,
    repositoryUrl: body.repositoryUrl,
    branch: body.branch || 'main',
    commitSha: body.commitSha || '',
    status: 'pending',
    startedAt: new Date().toISOString(),
    findings: [],
    summary: {
      totalFindings: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      licenses: {
        compliant: 0,
        nonCompliant: 0,
        unknown: 0,
      },
    },
  }, 202);
});

// GET /api/scan/:id - Get scan results
scanRouter.get('/:id', async (c) => {
  const scanId = c.req.param('id');

  const result = await c.env.DB.prepare(`
    SELECT * FROM scans WHERE id = ?
  `).bind(scanId).first();

  if (!result) {
    return c.json({ error: 'Scan not found' }, 404);
  }

  return c.json(result);
});

export default scanRouter;
