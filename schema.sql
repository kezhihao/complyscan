-- ComplyScan D1 Database Schema
-- Cloudflare D1 (SQLite) compatible

-- Users table (GitHub OAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_id INTEGER UNIQUE NOT NULL,
  login TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free', -- free, pro, team
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  commit_sha TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT,
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_repo ON scans(owner, repo);

-- Findings table (individual scan results)
CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  type TEXT NOT NULL, -- license, vulnerability, secret
  severity TEXT NOT NULL, -- critical, high, medium, low, info
  title TEXT NOT NULL,
  description TEXT,
  file TEXT,
  line INTEGER,
  dependency_name TEXT,
  dependency_version TEXT,
  dependency_license TEXT,
  remediation TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE INDEX idx_findings_scan_id ON findings(scan_id);
CREATE INDEX idx_findings_type_severity ON findings(type, severity);

-- Scan summary table (for quick dashboard queries)
CREATE TABLE IF NOT EXISTS scan_summaries (
  scan_id TEXT PRIMARY KEY,
  total_findings INTEGER DEFAULT 0,
  critical INTEGER DEFAULT 0,
  high INTEGER DEFAULT 0,
  medium INTEGER DEFAULT 0,
  low INTEGER DEFAULT 0,
  info INTEGER DEFAULT 0,
  licenses_compliant INTEGER DEFAULT 0,
  licenses_non_compliant INTEGER DEFAULT 0,
  licenses_unknown INTEGER DEFAULT 0,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- GitHub installations (for GitHub App)
CREATE TABLE IF NOT EXISTS github_installations (
  id TEXT PRIMARY KEY,
  github_installation_id INTEGER UNIQUE NOT NULL,
  account_id INTEGER NOT NULL,
  account_login TEXT NOT NULL,
  account_type TEXT NOT NULL, -- user, organization
  user_id TEXT,
  access_token TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_github_installations_installation_id ON github_installations(github_installation_id);

-- Webhook events log
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  installation_id TEXT,
  event_type TEXT NOT NULL,
  delivery_id TEXT NOT NULL,
  payload TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (installation_id) REFERENCES github_installations(id) ON DELETE SET NULL
);

CREATE INDEX idx_webhook_events_delivery_id ON webhook_events(delivery_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- Rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY, -- user_id or ip_address
  count INTEGER DEFAULT 0,
  window_start TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- Sessions (for web auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
