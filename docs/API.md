# ComplyScan API Documentation

## Base URL

```
https://api.complyscan.com
```

## Authentication

ComplyScan uses GitHub OAuth for authentication. Include your access token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

#### GET /

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "complyscan-api",
  "version": "0.1.0",
  "timestamp": "2026-02-24T00:00:00.000Z"
}
```

#### GET /ready

Readiness check with database connection.

**Response:**
```json
{
  "status": "ready",
  "database": "connected"
}
```

### Scanning

#### POST /api/scan

Start a new scan.

**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/owner/repo",
  "branch": "main",
  "commitSha": "abc123"
}
```

**Response (202):**
```json
{
  "id": "scan-uuid",
  "repositoryUrl": "https://github.com/owner/repo",
  "branch": "main",
  "commitSha": "abc123",
  "status": "pending",
  "startedAt": "2026-02-24T00:00:00.000Z",
  "findings": [],
  "summary": {
    "totalFindings": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "info": 0,
    "licenses": {
      "compliant": 0,
      "nonCompliant": 0,
      "unknown": 0
    }
  }
}
```

#### GET /api/scan/:id

Get scan results.

**Response (200):**
```json
{
  "id": "scan-uuid",
  "status": "completed",
  "findings": [
    {
      "id": "finding-uuid",
      "type": "license",
      "severity": "high",
      "title": "GPL-3.0 License Detected",
      "description": "Dependency uses GPL-3.0 license...",
      "file": "package-lock.json",
      "dependency": {
        "name": "some-package",
        "version": "1.0.0",
        "license": "GPL-3.0"
      },
      "remediation": "Consider replacing with a permissively-licensed alternative."
    }
  ],
  "summary": { ... }
}
```

### GitHub Integration

#### POST /api/github/webhook

GitHub webhook handler.

**Headers:**
- `X-Hub-Signature-256`: Webhook signature

**Request Body:** GitHub webhook payload

**Response (200):**
```json
{
  "status": "scan_queued"
}
```

#### GET /api/github/login

Initiate GitHub OAuth flow.

**Response (200):**
```json
{
  "authUrl": "https://github.com/login/oauth/authorize?client_id=..."
}
```

#### GET /api/github/callback

OAuth callback handler.

**Query Parameters:**
- `code`: Authorization code
- `state`: State parameter

**Response (200):**
```json
{
  "user": {
    "id": 123456,
    "login": "username",
    "avatar_url": "https://..."
  },
  "token": "gho_..."
}
```

## SARIF Format

Scans produce SARIF 2.1.0 format for GitHub integration:

```json
{
  "version": "2.1.0",
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "ComplyScan",
          "version": "0.1.0"
        }
      },
      "results": [...]
    }
  ]
}
```

## Rate Limits

- Free: 50 scans/month
- Pro: 500 scans/month
- Team: Unlimited

## Errors

All errors return JSON:

```json
{
  "error": "Error message",
  "details": {}
}
```

HTTP Status Codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 429: Rate Limit Exceeded
- 500: Internal Server Error
