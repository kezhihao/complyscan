/**
 * ComplyScan Type Definitions - Standard Node.js Version
 * Compatible with Vercel, Railway, Render, and any Node.js hosting
 */

// Environment bindings (standard Node.js)
export interface Env {
  // Database connection (PostgreSQL/SQLite)
  DATABASE_URL?: string;
  // Storage (S3-compatible or local)
  STORAGE_PATH?: string;
  S3_BUCKET?: string;
  S3_REGION?: string;
  S3_ACCESS_KEY?: string;
  S3_SECRET_KEY?: string;
  // Cache (Redis or in-memory)
  REDIS_URL?: string;
  // Environment
  ENVIRONMENT?: string;
  // GitHub OAuth
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  // Stripe
  STRIPE_SECRET_KEY?: string;
  // Session secret
  SESSION_SECRET?: string;
}

// Database interface (abstracted)
export interface Database {
  query(sql: string, params?: any[]): Promise<any[]>;
  exec(sql: string): Promise<void>;
}

// Storage interface (abstracted)
export interface Storage {
  put(key: string, value: ArrayBuffer | string): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// Cache interface (abstracted)
export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Scan request
export interface ScanRequest {
  repositoryUrl: string;
  branch?: string;
  commitSha?: string;
}

// Scan result
export interface ScanResult {
  id: string;
  repositoryUrl: string;
  branch: string;
  commitSha: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  findings: Finding[];
  summary: ScanSummary;
}

// Individual finding
export interface Finding {
  id: string;
  type: 'license' | 'vulnerability' | 'secret';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file: string;
  line?: number;
  dependency?: {
    name: string;
    version: string;
    license?: string;
  };
  cve?: string;
  remediation?: string;
}

// Scan summary
export interface ScanSummary {
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  licenses: {
    compliant: number;
    nonCompliant: number;
    unknown: number;
  };
}

// SARIF format (for GitHub integration)
export interface SARIFReport {
  version: string;
  $schema: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
      };
    };
    results: Array<{
      ruleId: string;
      level: 'error' | 'warning' | 'note';
      message: {
        text: string;
      };
      locations: Array<{
        physicalLocation: {
          artifactLocation: {
            uri: string;
          };
          region?: {
            startLine: number;
            endLine?: number;
          };
        };
      }>;
    }>;
  }>;
}

// User (from GitHub OAuth)
export interface User {
  id: string;
  githubId: number;
  login: string;
  email?: string;
  avatarUrl?: string;
  plan: 'free' | 'pro' | 'team';
  createdAt: string;
}

// License types
export type LicenseType =
  | 'permissive'  // MIT, Apache, BSD - OK
  | 'weak-copyleft'  // LGPL, MPL - OK with conditions
  | 'strong-copyleft'  // GPL, AGPL - Requires disclosure
  | 'proprietary';  // Commercial - Check compatibility

export interface LicenseInfo {
  spdxId: string;
  name: string;
  type: LicenseType;
  risks: string[];
  compatibility: string[];
}
