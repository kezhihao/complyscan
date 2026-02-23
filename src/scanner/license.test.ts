/**
 * License checker tests
 */

import { describe, it, expect } from 'vitest';
import {
  getLicenseInfo,
  checkLicenseCompatibility,
  getLicenseSeverity,
  getAllLicenses,
} from './license';

describe('license checker', () => {
  describe('getLicenseInfo', () => {
    it('should return MIT license info', () => {
      const info = getLicenseInfo('MIT');
      expect(info?.spdxId).toBe('MIT');
      expect(info?.type).toBe('permissive');
      expect(info?.risks).toHaveLength(0);
    });

    it('should return GPL-3.0 license info', () => {
      const info = getLicenseInfo('GPL-3.0');
      expect(info?.spdxId).toBe('GPL-3.0');
      expect(info?.type).toBe('strong-copyleft');
      expect(info?.risks.length).toBeGreaterThan(0);
    });

    it('should return undefined for unknown license', () => {
      const info = getLicenseInfo('FAKE-LICENSE');
      expect(info).toBeUndefined();
    });
  });

  describe('checkLicenseCompatibility', () => {
    it('should allow MIT dependency in MIT project', () => {
      const compatible = checkLicenseCompatibility('MIT', 'MIT');
      expect(compatible).toBe(true);
    });

    it('should reject GPL dependency in MIT project', () => {
      const compatible = checkLicenseCompatibility('GPL-3.0', 'MIT');
      expect(compatible).toBe(false);
    });

    it('should allow MIT dependency in GPL project', () => {
      const compatible = checkLicenseCompatibility('MIT', 'GPL-3.0');
      expect(compatible).toBe(true);
    });

    it('should allow LGPL in MIT project (weak copyleft)', () => {
      const compatible = checkLicenseCompatibility('LGPL-3.0', 'MIT');
      expect(compatible).toBe(true);
    });
  });

  describe('getLicenseSeverity', () => {
    it('should return info for permissive licenses', () => {
      expect(getLicenseSeverity('permissive')).toBe('info');
    });

    it('should return medium for weak copyleft', () => {
      expect(getLicenseSeverity('weak-copyleft')).toBe('medium');
    });

    it('should return high for strong copyleft', () => {
      expect(getLicenseSeverity('strong-copyleft')).toBe('high');
    });
  });

  describe('getAllLicenses', () => {
    it('should return all known licenses', () => {
      const licenses = getAllLicenses();
      expect(licenses.length).toBeGreaterThan(20);
      expect(licenses.some(l => l.spdxId === 'MIT')).toBe(true);
      expect(licenses.some(l => l.spdxId === 'GPL-3.0')).toBe(true);
    });
  });
});
