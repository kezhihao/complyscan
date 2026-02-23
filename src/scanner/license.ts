/**
 * License compliance checker
 * SPDX license database and risk assessment
 */

import type { LicenseInfo, LicenseType } from '../types';

/**
 * SPDX License Database - Key licenses and their classifications
 */
const LICENSE_DATABASE: Record<string, LicenseInfo> = {
  // Permissive (Generally OK)
  'MIT': {
    spdxId: 'MIT',
    name: 'MIT License',
    type: 'permissive',
    risks: [],
    compatibility: ['all'],
  },
  'Apache-2.0': {
    spdxId: 'Apache-2.0',
    name: 'Apache License 2.0',
    type: 'permissive',
    risks: [],
    compatibility: ['all'],
  },
  'BSD-2-Clause': {
    spdxId: 'BSD-2-Clause',
    name: 'BSD 2-Clause "Simplified" License',
    type: 'permissive',
    risks: [],
    compatibility: ['all'],
  },
  'BSD-3-Clause': {
    spdxId: 'BSD-3-Clause',
    name: 'BSD 3-Clause "New" or "Revised" License',
    type: 'permissive',
    risks: [],
    compatibility: ['all'],
  },
  'ISC': {
    spdxId: 'ISC',
    name: 'ISC License',
    type: 'permissive',
    risks: [],
    compatibility: ['all'],
  },
  '0BSD': {
    spdxId: '0BSD',
    name: 'BSD Zero Clause License',
    type: 'permissive',
    risks: [],
    compatibility: ['all'],
  },
  'CC0-1.0': {
    spdxId: 'CC0-1.0',
    name: 'Creative Commons Zero v1.0 Universal',
    type: 'permissive',
    risks: [],
    compatibility: ['all'],
  },
  'Unlicense': {
    spdxId: 'Unlicense',
    name: 'The Unlicense',
    type: 'permissive',
    risks: ['unclear legal status in some jurisdictions'],
    compatibility: ['all'],
  },

  // Weak Copyleft (OK with conditions - dynamic linking safe)
  'LGPL-2.1': {
    spdxId: 'LGPL-2.1',
    name: 'GNU Lesser General Public License v2.1',
    type: 'weak-copyleft',
    risks: ['static linking requires source disclosure'],
    compatibility: ['MIT', 'Apache-2.0', 'BSD', 'LGPL', 'GPL'],
  },
  'LGPL-3.0': {
    spdcId: 'LGPL-3.0',
    name: 'GNU Lesser General Public License v3.0',
    type: 'weak-copyleft',
    risks: ['static linking requires source disclosure'],
    compatibility: ['MIT', 'Apache-2.0', 'BSD', 'LGPL', 'GPL'],
  },
  'MPL-2.0': {
    spdxId: 'MPL-2.0',
    name: 'Mozilla Public License 2.0',
    type: 'weak-copyleft',
    risks: ['file-level copyleft - modifications to MPL files must stay MPL'],
    compatibility: ['MIT', 'Apache-2.0', 'BSD', 'LGPL', 'GPL'],
  },
  'EPL-1.0': {
    spdxId: 'EPL-1.0',
    name: 'Eclipse Public License 1.0',
    type: 'weak-copyleft',
    risks: ['file-level copyleft'],
    compatibility: ['MIT', 'Apache-2.0', 'BSD', 'LGPL', 'GPL'],
  },
  'EPL-2.0': {
    spdxId: 'EPL-2.0',
    name: 'Eclipse Public License 2.0',
    type: 'weak-copyleft',
    risks: ['file-level copyleft'],
    compatibility: ['MIT', 'Apache-2.0', 'BSD', 'LGPL', 'GPL'],
  },

  // Strong Copyleft (High Risk - Requires source disclosure)
  'GPL-2.0': {
    spdxId: 'GPL-2.0',
    name: 'GNU General Public License v2.0',
    type: 'strong-copyleft',
    risks: [
      'entire project becomes GPL when distributed',
      'source code must be disclosed',
      'copies must include license and source',
    ],
    compatibility: ['GPL'],
  },
  'GPL-3.0': {
    spdxId: 'GPL-3.0',
    name: 'GNU General Public License v3.0',
    type: 'strong-copyleft',
    risks: [
      'entire project becomes GPL when distributed',
      'source code must be disclosed',
      'copies must include license and source',
      'anti-Tivoization provisions (for embedded devices)',
    ],
    compatibility: ['GPL'],
  },
  'AGPL-3.0': {
    spdxId: 'AGPL-3.0',
    name: 'GNU Affero General Public License v3.0',
    type: 'strong-copyleft',
    risks: [
      'strongest copyleft - network use triggers source disclosure',
      'SaaS/web services must provide source',
      'entire project becomes AGPL when distributed',
    ],
    compatibility: ['AGPL', 'GPL'],
  },
  'GPL-2.0-only': {
    spdxId: 'GPL-2.0-only',
    name: 'GNU General Public License v2.0 only',
    type: 'strong-copyleft',
    risks: ['entire project becomes GPL when distributed'],
    compatibility: ['GPL'],
  },
  'GPL-3.0-only': {
    spdxId: 'GPL-3.0-only',
    name: 'GNU General Public License v3.0 only',
    type: 'strong-copyleft',
    risks: ['entire project becomes GPL when distributed'],
    compatibility: ['GPL'],
  },
  'AGPL-3.0-only': {
    spdxId: 'AGPL-3.0-only',
    name: 'GNU Affero General Public License v3.0 only',
    type: 'strong-copyleft',
    risks: ['SaaS/web services must provide source'],
    compatibility: ['AGPL', 'GPL'],
  },

  // Proprietary (Check compatibility)
  'Proprietary': {
    spdxId: 'Proprietary',
    name: 'Proprietary License',
    type: 'proprietary',
    risks: ['restrictions may apply', 'check for commercial use limits'],
    compatibility: ['MIT', 'Apache-2.0', 'BSD'], // Can be used with permissive
  },
};

/**
 * Get license info by SPDX ID
 */
export function getLicenseInfo(spdxId: string): LicenseInfo | undefined {
  return LICENSE_DATABASE[spdxId];
}

/**
 * Check if a license is compliant with a project license
 */
export function checkLicenseCompatibility(
  depLicense: string,
  projectLicense: string = 'MIT'
): boolean {
  const depInfo = getLicenseInfo(depLicense);
  const projectInfo = getLicenseInfo(projectLicense);

  if (!depInfo || !projectInfo) {
    return false; // Unknown license - assume non-compliant
  }

  // Permissive licenses are compatible with everything
  if (depInfo.type === 'permissive') {
    return true;
  }

  // Strong copyleft requires same license
  if (depInfo.type === 'strong-copyleft') {
    return projectInfo.type === 'strong-copyleft' &&
           projectInfo.spdxId.startsWith(depInfo.spdxId.split('-')[0]);
  }

  // Weak copyleft is OK with permissive and same copyleft
  if (depInfo.type === 'weak-copyleft') {
    return projectInfo.type === 'permissive' ||
           projectInfo.type === 'weak-copyleft';
  }

  return false;
}

/**
 * Get severity level for a license type
 */
export function getLicenseSeverity(licenseType: LicenseType): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  switch (licenseType) {
    case 'strong-copyleft':
      return 'high'; // AGPL would be critical, GPL high
    case 'weak-copyleft':
      return 'medium';
    case 'proprietary':
      return 'low';
    case 'permissive':
      return 'info';
    default:
      return 'low';
  }
}

/**
 * Get all known licenses
 */
export function getAllLicenses(): LicenseInfo[] {
  return Object.values(LICENSE_DATABASE);
}
