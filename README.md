# ComplyScan

> Small team code compliance scanning - 1/3 the price of Snyk

ComplyScan helps 5-20 person development teams identify license compliance risks and security vulnerabilities in their dependencies. Focus on what matters - we'll handle the compliance paperwork.

## 🎯 Features

- **License Risk Scanning** - Detect GPL/AGPL and other copyleft licenses
- **GitHub Actions Integration** - Automatic scanning on every PR
- **SARIF Format** - Native GitHub integration with alerts
- **Zero False Positives** - Conservative scanning approach
- **Fast** - Scans complete in seconds

## 🚀 Quick Start

### GitHub Actions Integration

```yaml
# .github/workflows/complyscan.yml
name: ComplyScan
on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: complyscan/action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### CLI Usage

```bash
npx complyscan scan
```

## 📊 Pricing

| Plan | Price | Scans/month | Features |
|------|-------|-------------|----------|
| Free | $0 | 50 | Basic license scanning |
| Pro | $79/month | 500 | Priority scanning, PDF reports |
| Team | $149/month | Unlimited | Team dashboard, SSO |

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Run tests
npm test

# Deploy to Cloudflare Workers
npm run deploy
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [Auto Company](https://auto.company)
