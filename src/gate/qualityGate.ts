import { EvolutionReport } from '../evolution/tracker';
import { ValidationResult } from '../utils/schemaValidator';

export interface GateResult {
  canDeploy: boolean;
  reason: string;
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
  timestamp: string;
}

export function runQualityGate(
  evolutionReport: EvolutionReport,
  validationResults: ValidationResult[]
): GateResult {
  const checks = [];

  // Check 1 — Breaking changes
  const hasBreakingChanges = evolutionReport.breakingChanges > 0;
  checks.push({
    name: 'Breaking Change Check',
    passed: !hasBreakingChanges,
    message: hasBreakingChanges
      ? `❌ Found ${evolutionReport.breakingChanges} breaking changes`
      : '✅ No breaking changes detected',
  });

  // Check 2 — Schema validation
  const failedValidations = validationResults.filter(v => !v.valid);
  checks.push({
    name: 'Schema Validation Check',
    passed: failedValidations.length === 0,
    message: failedValidations.length === 0
      ? '✅ All responses match schema'
      : `❌ ${failedValidations.length} responses failed schema validation`,
  });

  // Check 3 — Contract compatibility
  checks.push({
    name: 'Contract Compatibility Check',
    passed: evolutionReport.canDeploy,
    message: evolutionReport.canDeploy
      ? '✅ API is backward compatible'
      : '❌ API breaks backward compatibility',
  });

  const canDeploy = checks.every(c => c.passed);

  return {
    canDeploy,
    reason: canDeploy
      ? '✅ All checks passed — Safe to deploy'
      : '❌ Deployment blocked — Fix breaking changes first',
    checks,
    timestamp: new Date().toISOString(),
  };
}

export function printGateResult(result: GateResult): void {
  console.log('\n========================================');
  console.log('🚦 QUALITY GATE RESULT');
  console.log('========================================');
  result.checks.forEach(check => {
    console.log(`\n${check.name}: ${check.message}`);
  });
  console.log('\n----------------------------------------');
  console.log(result.reason);
  console.log('========================================\n');
}