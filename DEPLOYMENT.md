# ComplyScan Deployment Guide

## Prerequisites

1. Cloudflare account (free tier works)
2. GitHub account
3. Node.js 20+
4. Wrangler CLI

## Initial Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create complyscan-db
# Save the database ID from output

# Create R2 bucket
wrangler r2 bucket create complyscan-storage

# Create KV namespace
wrangler kv namespace create complyscan-cache
# Save the namespace ID from output
```

### 3. Update wrangler.toml

Add the IDs from step 2:

```toml
[[d1_databases]]
binding = "DB"
database_name = "complyscan-db"
database_id = "YOUR_D1_DATABASE_ID"  # Replace with actual ID

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "complyscan-storage"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID"  # Replace with actual ID
```

### 4. Run Database Schema

```bash
wrangler d1 execute complyscan-db --file=schema.sql
```

### 5. Set Secrets

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put STRIPE_SECRET_KEY  # Optional, for payments
```

### 6. Deploy

```bash
npm run deploy
```

## Deploying GitHub Action (For Users)

Users can add ComplyScan to their repos by creating `.github/workflows/complyscan.yml`:

```yaml
name: ComplyScan
on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx complyscan scan
```

## Production Checklist

- [ ] D1 database created and schema applied
- [ ] R2 bucket created
- [ ] KV namespace created
- [ ] GitHub OAuth app created
- [ ] Secrets configured (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled
- [ ] Error tracking set up (Sentry, etc.)

## Custom Domain (Optional)

```bash
# Add custom domain to Worker
wrangler domains add api.complyscan.com

# Configure DNS at your provider:
# CNAME api.complyscan.com -> complyscan-api.your-subdomain.workers.dev
```

## Monitoring

View logs in real-time:

```bash
wrangler tail
```

View analytics at:
https://dash.cloudflare.com/[account-id]/workers/view/complyscan-api

## Rollback

```bash
# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback [version]
```

## Troubleshooting

### Worker not responding
```bash
wrangler tail  # Check logs
wrangler deploy --dry-run  # Test build locally
```

### Database errors
```bash
wrangler d1 execute complyscan-db --command="SELECT * FROM users"
```

### Rate limiting
Check KV limits and adjust rate limit settings in code.
