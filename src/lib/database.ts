/**
 * Database Abstraction Layer
 * Supports SQLite (for development) and PostgreSQL (for production)
 */

import Database from 'better-sqlite3';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface Database {
  query(sql: string, params?: any[]): Promise<any[]>;
  run(sql: string, params?: any[]): Promise<void>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

// SQLite implementation
export class SQLiteDatabase implements Database {
  private db: Database.Database;

  constructor(dbPath: string = './data/database.sqlite') {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!existsSync(dir)) {
      mkdir(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initSchema();
  }

  private initSchema(): void {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        github_id INTEGER UNIQUE NOT NULL,
        login TEXT NOT NULL,
        email TEXT,
        avatar_url TEXT,
        plan TEXT DEFAULT 'free',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Scans table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        repository_url TEXT NOT NULL,
        branch TEXT DEFAULT 'main',
        commit_sha TEXT,
        status TEXT DEFAULT 'pending',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        findings_json TEXT,
        summary_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Findings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS findings (
        id TEXT PRIMARY KEY,
        scan_id TEXT REFERENCES scans(id),
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        file TEXT NOT NULL,
        line INTEGER,
        dependency_name TEXT,
        dependency_version TEXT,
        dependency_license TEXT,
        cve TEXT,
        remediation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
      CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
      CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
      CREATE INDEX IF NOT EXISTS idx_findings_scan_id ON findings(scan_id);
      CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
    `);
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as any[];
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    const stmt = this.db.prepare(sql);
    stmt.run(...params);
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_PATH || process.env.DATABASE_URL || './data/database.sqlite';
    dbInstance = new SQLiteDatabase(dbPath);
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
