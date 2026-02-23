/**
 * Lockfile parser tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseLockfile,
  parseNpmLockfile,
  parseYarnLockfile,
  parsePnpmLockfile,
  dependencyToArray,
} from './lockfile';

describe('lockfile parser', () => {
  describe('parseNpmLockfile', () => {
    it('should parse npm v7+ format', () => {
      const content = JSON.stringify({
        lockfileVersion: 2,
        packages: {
          'node_modules/lodash': {
            version: '4.17.21',
            resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
            integrity: 'sha512-...',
          },
        },
      });

      const deps = parseNpmLockfile(content);
      expect(deps.get('lodash')?.version).toBe('4.17.21');
    });

    it('should parse npm v6 format', () => {
      const content = JSON.stringify({
        lockfileVersion: 1,
        dependencies: {
          lodash: {
            version: '4.17.21',
          },
        },
      });

      const deps = parseNpmLockfile(content);
      expect(deps.get('lodash')?.version).toBe('4.17.21');
    });
  });

  describe('parseYarnLockfile', () => {
    it('should parse yarn.lock format', () => {
      const content = `
# yarn lockfile v1
"@babel/code-frame@^7.0.0":
  version "7.12.11"
  resolved "https://registry.yarnpkg.com/@babel/code-frame/-/code-frame-7.12.11.tgz"
  integrity sha512-Zt1yodBx1UcyiePMSkWnU4vP4R8f/D6G4r9aA=
  dependencies:
    "@babel/highlight" "^7.10.4"
`;

      const deps = parseYarnLockfile(content);
      expect(deps.has('@babel/code-frame')).toBe(true);
    });
  });

  describe('parsePnpmLockfile', () => {
    it('should parse pnpm-lock.yaml format', () => {
      const content = `
lockfileVersion: '6.0'
packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-..., registry: https://registry.npmjs.org/}
    name: lodash
    version: 4.17.21
`;

      const deps = parsePnpmLockfile(content);
      expect(deps.get('lodash')?.version).toBe('4.17.21');
    });
  });

  describe('parseLockfile auto-detect', () => {
    it('should detect npm format', () => {
      const content = JSON.stringify({
        lockfileVersion: 2,
        packages: {},
      });
      const result = parseLockfile(content);
      expect(result.format).toBe('npm');
    });

    it('should detect unknown format', () => {
      const result = parseLockfile('not a valid lockfile');
      expect(result.format).toBe('unknown');
    });
  });
});
