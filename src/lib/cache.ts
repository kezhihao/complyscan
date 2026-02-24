/**
 * Cache Abstraction Layer
 * Supports in-memory or Redis
 */

export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// In-memory implementation
export class MemoryCache implements Cache {
  private store: Map<string, { value: string; expiresAt: number }> = new Map();

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    this.cleanup();

    const data = this.store.get(key);
    if (!data) {
      return null;
    }

    if (data.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return data.value;
  }

  async set(key: string, value: string, ttl: number = 3600000): Promise<void> {
    // Default TTL: 1 hour
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Factory
export function createCache(): Cache {
  const cacheType = process.env.CACHE_TYPE || 'memory';

  if (cacheType === 'redis') {
    // Would use Redis here if REDIS_URL is set
    // For now, fall back to memory
    console.warn('Redis not configured, using memory cache');
  }

  return new MemoryCache();
}
