/**
 * GitHub integration endpoints
 * OAuth, Webhooks, GitHub Actions support
 */

import { Hono } from 'hono';
import { verifySignature } from '../lib/github';

const githubRouter = new Hono<{ Bindings: Env }>();

// POST /api/github/webhook - GitHub webhook handler
githubRouter.post('/webhook', async (c) => {
  const signature = c.req.header('X-Hub-Signature-256');
  const body = await c.req.text();

  // Verify webhook signature
  if (!signature || !verifySignature(body, signature, c.env.GITHUB_CLIENT_SECRET || '')) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload = JSON.parse(body);

  // Handle push events (trigger scan)
  if (payload.ref_type === 'branch' || payload.ref) {
    // Trigger async scan
    // In production: queue scan job
    return c.json({ status: 'scan_queued' });
  }

  return c.json({ status: 'received' });
});

// GET /api/github/login - Initiate OAuth flow
githubRouter.get('/login', (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const redirectUri = `${new URL(c.req.url).origin}/api/github/callback`;
  const scope = 'read:org, repo, user:email';

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId || '');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);

  return c.json({ authUrl: authUrl.toString() });
});

// GET /api/github/callback - OAuth callback
githubRouter.get('/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code) {
    return c.json({ error: 'Authorization code required' }, 400);
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
      state,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return c.json({ error: tokenData.error_description }, 400);
  }

  // Get user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'User-Agent': 'ComplyScan',
    },
  });

  const githubUser = await userResponse.json();

  // Store user in database (or create/update)
  // In production: hash token, store securely

  return c.json({
    user: {
      id: githubUser.id,
      login: githubUser.login,
      avatar_url: githubUser.avatar_url,
    },
    token: tokenData.access_token, // In production: return session token, not raw GitHub token
  });
});

export default githubRouter;
