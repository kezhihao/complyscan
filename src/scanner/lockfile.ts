/**
 * Lockfile parser - Extract dependencies from package-lock.json, yarn.lock, pnpm-lock.yaml
 */

export interface Dependency {
  name: string;
  version: string;
  resolved?: string;
  integrity?: string;
  license?: string;
}

export interface LockfileParseResult {
  dependencies: Map<string, Dependency>;
  format: 'npm' | 'yarn' | 'pnpm' | 'unknown';
}

/**
 * Parse package-lock.json (npm)
 */
export function parseNpmLockfile(content: string): Map<string, Dependency> {
  const lockfile = JSON.parse(content);
  const dependencies = new Map<string, Dependency>();

  if (lockfile.packages) {
    // npm v7+ format
    for (const [path, pkg] of Object.entries(lockfile.packages)) {
      if (path === '') continue; // Skip root package
      const name = path.startsWith('node_modules/')
        ? path.slice('node_modules/'.length)
        : path;
      const p = pkg as any;
      dependencies.set(name, {
        name,
        version: p.version,
        resolved: p.resolved,
        integrity: p.integrity,
        license: p.license,
      });
    }
  } else if (lockfile.dependencies) {
    // npm v6 format
    for (const [name, dep] of Object.entries(lockfile.dependencies)) {
      const d = dep as any;
      dependencies.set(name, {
        name,
        version: d.version,
        resolved: d.resolved,
        integrity: d.integrity,
      });
    }
  }

  return dependencies;
}

/**
 * Parse yarn.lock
 */
export function parseYarnLockfile(content: string): Map<string, Dependency> {
  const dependencies = new Map<string, Dependency>();
  const lines = content.split('\n');

  let currentName: string | null = null;
  let currentVersion: string | null = null;
  let currentResolved: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Entry header: "package-name@version:"
    if (/^[a-z0-9@_\-/.]+@/.test(trimmed) && trimmed.endsWith(':')) {
      if (currentName && currentVersion) {
        const [name, version] = trimmed.slice(0, -1).split('@');
        dependencies.set(name, {
          name,
          version,
          resolved: currentResolved || undefined,
        });
      }
      const header = trimmed.slice(0, -1);
      const atIndex = header.lastIndexOf('@');
      currentName = header.slice(0, atIndex);
      currentVersion = header.slice(atIndex + 1);
    }
    // Version line
    else if (trimmed.startsWith('version:')) {
      currentVersion = trimmed.slice('version:'.length).trim().replace(/^"/, '').replace(/"$/, '');
    }
    // Resolved line
    else if (trimmed.startsWith('resolved:')) {
      currentResolved = trimmed.slice('resolved:'.length).trim().replace(/^"/, '').replace(/"$/, '');
    }
    // Empty line - save current entry
    else if (trimmed === '' && currentName && currentVersion) {
      dependencies.set(currentName, {
        name: currentName,
        version: currentVersion,
        resolved: currentResolved || undefined,
      });
      currentName = null;
      currentVersion = null;
      currentResolved = null;
    }
  }

  return dependencies;
}

/**
 * Parse pnpm-lock.yaml
 */
export function parsePnpmLockfile(content: string): Map<string, Dependency> {
  const dependencies = new Map<string, Dependency>();

  // Simple YAML parser for pnpm-lock.yaml
  const lines = content.split('\n');
  let inPackages = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'packages:') {
      inPackages = true;
      continue;
    }

    if (inPackages && trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      // Package entry: /package-name@version:
      const match = trimmed.match(/^\/([^@]+)@([^:]+):/);
      if (match) {
        const [, name, version] = match;
        dependencies.set(name, { name, version });
      }
    }
  }

  return dependencies;
}

/**
 * Auto-detect and parse lockfile format
 */
export function parseLockfile(content: string): LockfileParseResult {
  // Try npm (JSON)
  if (content.trim().startsWith('{')) {
    try {
      const dependencies = parseNpmLockfile(content);
      if (dependencies.size > 0) {
        return { dependencies, format: 'npm' };
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Try yarn (has specific markers)
  if (content.includes('# yarn lockfile') ||
      content.includes('unpruned:') ||
      /"@[^"]+\n\s+version:/.test(content)) {
    try {
      const dependencies = parseYarnLockfile(content);
      if (dependencies.size > 0) {
        return { dependencies, format: 'yarn' };
      }
    } catch {
      // Continue
    }
  }

  // Try pnpm (has specific markers)
  if (content.includes('lockfileVersion:') && content.includes('packages:')) {
    try {
      const dependencies = parsePnpmLockfile(content);
      if (dependencies.size > 0) {
        return { dependencies, format: 'pnpm' };
      }
    } catch {
      // Continue
    }
  }

  return { dependencies: new Map(), format: 'unknown' };
}

/**
 * Convert dependency map to array
 */
export function dependencyToArray(deps: Map<string, Dependency>): Dependency[] {
  return Array.from(deps.values());
}
