# ComplyScan Architecture

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub    │────▶│  Webhook     │────▶│   Worker    │
│  Repository │     │  Handler     │     │   Scanner   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                  │
                                                  ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │────▶│  API Routes  │────▶│     D1      │
│  Dashboard  │     │  (Hono)      │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Components

### Cloudflare Workers (API Runtime)
- **Framework**: Hono
- **Purpose**: Handle HTTP requests, OAuth, webhooks
- **Cost**: $0 (free tier: 100k requests/day)

### D1 Database (SQLite)
- **Tables**: users, scans, findings, installations, webhooks
- **Purpose**: Persistent data storage
- **Cost**: $0.75/month (for 100 users)

### R2 Storage (Object Storage)
- **Purpose**: Store scan reports, exports
- **Cost**: $0 (free tier: 10GB)

### KV Cache (Key-Value)
- **Purpose**: Rate limiting, session data
- **Cost**: $0.50/month (for 100 users)

## Data Flow

### Scan Flow

```
1. User triggers scan (GitHub Action / API)
   │
2. Worker validates request
   │
3. Fetch repository files via GitHub API
   │
4. Parse lockfile (npm/yarn/pnpm)
   │
5. Extract dependencies → Check licenses
   │
6. Generate findings → Store in D1
   │
7. Return SARIF format → GitHub displays results
```

### OAuth Flow

```
1. User clicks "Login with GitHub"
   │
2. Redirect to github.com/login/oauth/authorize
   │
3. User approves → GitHub redirects back with code
   │
4. Worker exchanges code for access token
   │
5. Fetch user info → Create/update user record
   │
6. Return session token to user
```

## Security Model

### Authentication
- GitHub OAuth (user:read:org, repo, user:email scopes)
- Session tokens stored in D1 with expiration

### Authorization
- Rate limiting by user plan (free: 50/month, pro: 500/month)
- Repository access validated via GitHub API

### Data Protection
- Scan results isolated by user_id
- Webhook signatures verified (HMAC-SHA256)
- Secrets stored in Cloudflare Workers Secrets

## Scalability

### Current Capacity (Single Worker)
- 100k requests/day
- 10ms average response time
- 100 concurrent requests

### Scaling Strategy
1. **Horizontal**: Deploy to multiple Cloudflare zones
2. **Caching**: KV cache for frequent scans
3. **Queue**: Durable Objects for async processing

## Monitoring

### Metrics
- Scan success rate
- Average scan duration
- API response time
- Error rate by endpoint

### Logging
- Structured JSON logs via `logger()` middleware
- Exported to Cloudflare Analytics

## Cost Model (100 Users)

| Component | Usage | Cost |
|-----------|-------|------|
| Workers | 100k req/day | $0 |
| D1 | 5M reads/month | $0.75 |
| R2 | 10GB storage | $0 |
| KV | 1M reads/month | $0.50 |
| **Total** | | **$1.25 + Stripe fees** |

## Deployment

```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Create D1 database
wrangler d1 create complyscan-db
wrangler d1 execute complyscan-db --file=schema.sql

# Create R2 bucket
wrangler r2 bucket create complyscan-storage

# Create KV namespace
wrangler kv namespace create complyscan-cache
```

## Development

```bash
# Local development
npm run dev

# Run tests
npm test

# Type check
npx tsc --noEmit
```
