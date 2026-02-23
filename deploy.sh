#!/bin/bash
# Deploy ComplyScan to Cloudflare Workers

set -e

echo "🚀 Deploying ComplyScan..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler not found. Installing..."
    npm install -g wrangler
fi

# Create D1 database if not exists
echo "📁 Setting up D1 database..."
wrangler d1 create complyscan-db 2>/dev/null || echo "D1 database already exists"

# Create R2 bucket if not exists
echo "📦 Setting up R2 storage..."
wrangler r2 bucket create complyscan-storage 2>/dev/null || echo "R2 bucket already exists"

# Create KV namespace if not exists
echo "🔑 Setting up KV cache..."
wrangler kv namespace create complyscan-cache 2>/dev/null || echo "KV namespace already exists"

# Deploy
echo "🌍 Deploying to Cloudflare Workers..."
wrangler deploy

echo "✅ Deploy complete!"
