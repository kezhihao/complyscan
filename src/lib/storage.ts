/**
 * Storage Abstraction Layer
 * Supports local filesystem or S3-compatible storage
 */

import { mkdir, readFile, writeFile, unlink, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface Storage {
  put(key: string, value: Buffer | string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// Local filesystem implementation
export class LocalStorage implements Storage {
  private basePath: string;

  constructor(basePath: string = './data/storage') {
    this.basePath = basePath;
    this.ensureDir();
  }

  private async ensureDir(): Promise<void> {
    if (!existsSync(this.basePath)) {
      await mkdir(this.basePath, { recursive: true });
    }
  }

  private fullPath(key: string): string {
    return path.join(this.basePath, key);
  }

  async put(key: string, value: Buffer | string): Promise<void> {
    const filePath = this.fullPath(key);
    const dir = path.dirname(filePath);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(filePath, value);
  }

  async get(key: string): Promise<Buffer | null> {
    const filePath = this.fullPath(key);

    if (!existsSync(filePath)) {
      return null;
    }

    return await readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.fullPath(key);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const searchPath = prefix ? this.fullPath(prefix) : this.basePath;

    if (!existsSync(searchPath)) {
      return [];
    }

    const files = await readdir(searchPath, { recursive: true });
    return files.map(f => path.relative(this.basePath, path.join(searchPath, f)));
  }
}

// In-memory implementation (for testing/serverless)
export class MemoryStorage implements Storage {
  private store: Map<string, Buffer> = new Map();

  async put(key: string, value: Buffer | string): Promise<void> {
    const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
    this.store.set(key, buffer);
  }

  async get(key: string): Promise<Buffer | null> {
    return this.store.get(key) || null;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.store.keys());
    if (prefix) {
      return keys.filter(k => k.startsWith(prefix));
    }
    return keys;
  }
}

// Factory
export function createStorage(): Storage {
  const storageType = process.env.STORAGE_TYPE || 'memory';

  if (storageType === 'local') {
    return new LocalStorage(process.env.STORAGE_PATH || './data/storage');
  }

  return new MemoryStorage();
}
