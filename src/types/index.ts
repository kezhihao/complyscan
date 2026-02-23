/**
 * ComplyScan Type Definitions
 */

// Environment bindings
export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  ENVIRONMENT?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
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
