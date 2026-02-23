# ComplyScan User Guide

## Quick Start

### Option 1: GitHub Actions (Recommended)

1. Create `.github/workflows/complyscan.yml` in your repository:

```yaml
name: ComplyScan
on: [pull_request, push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx complyscan scan
```

2. Push to trigger your first scan

### Option 2: CLI

```bash
npx complyscan scan
```

### Option 3: API

```bash
curl -X POST https://api.complyscan.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"repositoryUrl": "https://github.com/owner/repo"}'
```

## Understanding Results

### Severity Levels

| Level | Meaning | Action Required |
|-------|---------|-----------------|
| **Critical** | AGPL license detected | Yes - SaaS disclosure required |
| **High** | GPL license detected | Yes - Source disclosure required |
| **Medium** | LGPL/MPL license | Review - Static linking risks |
| **Low** | Proprietary/Unknown | Check compatibility |
| **Info** | Permissive license | No action needed |

### License Types

#### Permissive (✅ Safe)
- MIT, Apache-2.0, BSD, ISC
- Can use in any project without restrictions

#### Weak Copyleft (⚠️ Review)
- LGPL, MPL, EPL
- OK for dynamic linking, requires care for static linking

#### Strong Copyleft (🚨 Risky)
- GPL, AGPL
- Entire project may need to use the same license
- Source code disclosure required

## Configuration

### complyscan.json (Optional)

Create in your repo root:

```json
{
  "projectLicense": "MIT",
  "ignore": [
    "devDependencies",
    "GPL-3.0"
  ],
  "failOn": "high"
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectLicense` | string | `"MIT"` | Your project's license |
| `ignore` | array | `[]` | Licenses to ignore |
| `includeDev` | boolean | `false` | Scan dev dependencies |
| `failOn` | string | `"high"` | Fail CI on this severity or higher |

## GitHub Integration

### Webhook Setup

1. Go to your repo Settings → Webhooks
2. Add webhook: `https://api.complyscan.com/api/github/webhook`
3. Select content types: Pushes, Pull requests
4. Secret: Use your webhook secret (from ComplyScan dashboard)

### PR Comments

ComplyScan will comment on PRs with scan results:

```
🔍 ComplyScan Results

✅ 156 dependencies scanned
⚠️ 2 issues found

• GPL-3.0 license detected in gpl-library
  → File: package-lock.json
  → Severity: High
  → Consider replacing with a permissively-licensed alternative

[View Full Report](https://complyscan.com/scan/abc-123)
```

## Best Practices

1. **Run on every PR** - Catch issues before they're merged
2. **Fix high-severity issues** - GPL/AGPL can have legal implications
3. **Review medium issues** - Understand LGPL/MPL requirements
4. **Document exceptions** - Use `complyscan.json` for approved exceptions

## Troubleshooting

### Scan failed
- Check that the repo is public or you've provided a GitHub token
- Verify the lockfile exists (package-lock.json, yarn.lock, or pnpm-lock.yaml)

### False positives
- Add exceptions to `complyscan.json`
- Report false positives at github.com/complyscan/complyscan/issues

### CI takes too long
- Use caching for dependencies
- Consider running ComplyScan only on PRs, not every push

## Pricing

| Plan | Price | Scans/month | Features |
|------|-------|-------------|----------|
| Free | $0 | 50 | Basic scanning |
| Pro | $79/month | 500 | Priority, PDF reports |
| Team | $149/month | Unlimited | Dashboard, SSO |

## Support

- Docs: docs.complyscan.com
- Issues: github.com/complyscan/complyscan/issues
- Email: support@complyscan.com
