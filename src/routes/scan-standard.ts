/**
 * Scan endpoints - Standard Node.js version
 */

import { Hono } from 'hono';
import type { ScanRequest, ScanResult } from '../types-standard';
import { getDatabase } from '../lib/database';

const scanRouter = new Hono();

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

  try {
    const db = getDatabase();

    // Create scan record
    await db.run(`
      INSERT INTO scans (id, repository_url, branch, commit_sha, status, started_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      scanId,
      body.repositoryUrl,
      body.branch || 'main',
      body.commitSha || '',
      'pending',
      new Date().toISOString()
    ]);

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
  } catch (err) {
    console.error('Scan creation error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/scan/:id - Get scan results
scanRouter.get('/:id', async (c) => {
  const scanId = c.req.param('id');

  try {
    const db = getDatabase();
    const result = await db.query(`
      SELECT * FROM scans WHERE id = ?
    `, [scanId]);

    if (!result || result.length === 0) {
      return c.json({ error: 'Scan not found' }, 404);
    }

    return c.json(result[0]);
  } catch (err) {
    console.error('Scan fetch error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default scanRouter;
