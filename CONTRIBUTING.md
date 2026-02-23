# Contributing to ComplyScan

## Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/complyscan.git
cd complyscan

# Install dependencies
npm install

# Run locally
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

## Project Structure

```
complyscan/
├── src/
│   ├── index.ts          # Main entry point
│   ├── routes/           # API routes
│   ├── scanner/          # Core scanning logic
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── schema.sql            # D1 database schema
├── wrangler.toml         # Cloudflare Workers config
└── package.json
```

## Adding Features

1. Create a feature branch
2. Implement your feature with tests
3. Run `npm test` and `npm run lint`
4. Submit a pull request

## License Scanner

To add a new license to the database, edit `src/scanner/license.ts`:

```typescript
const LICENSE_DATABASE: Record<string, LicenseInfo> = {
  'YOUR-SPDX-ID': {
    spdxId: 'YOUR-SPDX-ID',
    name: 'License Name',
    type: 'permissive' | 'weak-copyleft' | 'strong-copyleft' | 'proprietary',
    risks: ['risk1', 'risk2'],
    compatibility: ['MIT', 'Apache-2.0'],
  },
};
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add tests for new functionality
- Keep functions small and focused
