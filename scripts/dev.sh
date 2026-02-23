#!/bin/bash
# Local development script

set -e

echo "🚀 Starting ComplyScan local development..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .dev.vars exists (local environment variables)
if [ ! -f ".dev.vars" ]; then
    echo "📝 Creating .dev.vars template..."
    cat > .dev.vars << 'EOF'
# Cloudflare Workers development environment variables
# Copy this file to .dev.vars and fill in your values

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
ENVIRONMENT=development
EOF
    echo "⚠️  Please edit .dev.vars with your credentials"
fi

# Start development server
echo "🌐 Starting dev server on http://localhost:8787"
wrangler dev
