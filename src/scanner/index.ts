/**
 * ComplyScan Scanner - Main orchestrator
 * Coordinates lockfile parsing, license checking, and SARIF generation
 */

import type { Dependency } from './lockfile';
import { parseLockfile, dependencyToArray } from './lockfile';
import {
  getLicenseInfo,
  checkLicenseCompatibility,
  getLicenseSeverity
} from './license';
import type { Finding, ScanSummary, SARIFReport } from '../types';

export interface ScanOptions {
  repositoryUrl: string;
  branch?: string;
  projectLicense?: string;
  includeDevDependencies?: boolean;
}

export interface ScanResult {
  findings: Finding[];
  summary: ScanSummary;
  sarif?: SARIFReport;
}

/**
 * Main scan function
 */
export async function scanLockfile(
  lockfileContent: string,
  options: ScanOptions
): Promise<ScanResult> {
  // Parse lockfile
  const { dependencies, format } = parseLockfile(lockfileContent);

  if (format === 'unknown') {
    throw new Error('Unable to detect lockfile format');
  }

  // Check each dependency
  const findings: Finding[] = [];
  const depsArray = dependencyToArray(dependencies);

  for (const dep of depsArray) {
    const depFindings = analyzeDependency(dep, options);
    findings.push(...depFindings);
  }

  // Generate summary
  const summary = generateSummary(findings);

  // Generate SARIF report
  const sarif = generateSARIF(findings, options);

  return {
    findings,
    summary,
    sarif,
  };
}

/**
 * Analyze a single dependency for license compliance
 */
function analyzeDependency(
  dep: Dependency,
  options: ScanOptions
): Finding[] {
  const findings: Finding[] = [];

  if (!dep.license) {
    // No license info - could be risky
    findings.push({
      id: crypto.randomUUID(),
      type: 'license',
      severity: 'low',
      title: 'Unknown License',
      description: `Dependency ${dep.name}@${dep.version} has no license information.`,
      file: 'package-lock.json',
      dependency: {
        name: dep.name,
        version: dep.version,
        license: 'UNKNOWN',
      },
      remediation: 'Check the package repository for license information.',
    });
    return findings;
  }

  const licenseInfo = getLicenseInfo(dep.license);

  if (!licenseInfo) {
    // Unknown license
    findings.push({
      id: crypto.randomUUID(),
      type: 'license',
      severity: 'low',
      title: 'Unrecognized License',
      description: `Dependency ${dep.name} uses license "${dep.license}" which is not in our database.`,
      file: 'package-lock.json',
      dependency: {
        name: dep.name,
        version: dep.version,
        license: dep.license,
      },
      remediation: 'Manually review the license terms.',
    });
    return findings;
  }

  // Check compatibility
  const isCompatible = checkLicenseCompatibility(
    dep.license,
    options.projectLicense
  );

  if (!isCompatible) {
    findings.push({
      id: crypto.randomUUID(),
      type: 'license',
      severity: getLicenseSeverity(licenseInfo.type),
      title: 'License Incompatibility Detected',
      description: `Dependency ${dep.name} is licensed under ${licenseInfo.name}, which may be incompatible with your project license.`,
      file: 'package-lock.json',
      dependency: {
        name: dep.name,
        version: dep.version,
        license: dep.license,
      },
      remediation: getRemediation(licenseInfo),
    });
  }

  // Add info finding for GPL/AGPL even if compatible
  if (licenseInfo.type === 'strong-copyleft') {
    findings.push({
      id: crypto.randomUUID(),
      type: 'license',
      severity: licenseInfo.spdxId === 'AGPL-3.0' ? 'critical' : 'high',
      title: `${licenseInfo.spdxId} License Detected`,
      description: `Dependency ${dep.name} uses ${licenseInfo.name}. ${licenseInfo.risks.join('. ')}`,
      file: 'package-lock.json',
      dependency: {
        name: dep.name,
        version: dep.version,
        license: dep.license,
      },
      remediation: getRemediation(licenseInfo),
    });
  }

  return findings;
}

/**
 * Get remediation advice for a license
 */
function getRemediation(licenseInfo: any): string {
  switch (licenseInfo.type) {
    case 'strong-copyleft':
      return `Consider replacing with a permissively-licensed alternative. If you must use this dependency, be prepared to disclose your source code when distributing.`;
    case 'weak-copyleft':
      return `Ensure dynamic linking only. Review the license terms for specific requirements.`;
    default:
      return `Review the license terms and ensure compliance.`;
  }
}

/**
 * Generate scan summary
 */
function generateSummary(findings: Finding[]): ScanSummary {
  const summary: ScanSummary = {
    totalFindings: findings.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    licenses: {
      compliant: 0,
      nonCompliant: 0,
      unknown: 0,
    },
  };

  for (const finding of findings) {
    summary[finding.severity]++;
    if (finding.type === 'license') {
      if (finding.severity === 'critical' || finding.severity === 'high') {
        summary.licenses.nonCompliant++;
      } else if (finding.severity === 'info') {
        summary.licenses.compliant++;
      } else {
        summary.licenses.unknown++;
      }
    }
  }

  return summary;
}

/**
 * Generate SARIF report for GitHub integration
 */
function generateSARIF(findings: Finding[], options: ScanOptions): SARIFReport {
  return {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'ComplyScan',
            version: '0.1.0',
            informationUri: 'https://complyscan.com',
          },
        },
        results: findings.map((finding) => ({
          ruleId: finding.type,
          level: finding.severity === 'critical' || finding.severity === 'high'
            ? 'error'
            : finding.severity === 'medium'
            ? 'warning'
            : 'note',
          message: {
            text: finding.description,
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: finding.file,
                },
                region: finding.line
                  ? {
                      startLine: finding.line,
                    }
                  : undefined,
              },
            },
          ],
        })),
      },
    ],
  };
}
