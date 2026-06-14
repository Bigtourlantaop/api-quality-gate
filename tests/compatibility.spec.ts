import { test, expect } from '@playwright/test';
import { trackSchemaEvolution } from '../src/evolution/tracker';
import { saveChangelog } from '../src/evolution/changelog';
import { validateResponse } from '../src/utils/schemaValidator';
import { runQualityGate, printGateResult } from '../src/gate/qualityGate';
import { saveJSONReport, saveHTMLReport } from '../src/utils/reporter';

test('Detect breaking changes between v1 and v2', async () => {
  console.log('\n🔍 Tracking schema evolution v1 → v2...');

  const evolutionReport = trackSchemaEvolution('v1', 'v2', 'user');

  console.log(`\n📊 Evolution Report:`);
  console.log(`Total changes: ${evolutionReport.totalChanges}`);
  console.log(`Breaking changes: ${evolutionReport.breakingChanges}`);
  console.log(`Non-breaking changes: ${evolutionReport.nonBreakingChanges}`);
  console.log(`Can deploy: ${evolutionReport.canDeploy}`);

  evolutionReport.changes.forEach(change => {
    const icon = change.isBreaking ? '❌' : '✅';
    console.log(`${icon} [${change.changeType}] ${change.field}: ${change.reason}`);
  });

  // ต้องเจอ breaking changes เพราะ v2 เปลี่ยน name → fullName และ email → emailAddress
  expect(evolutionReport.breakingChanges).toBeGreaterThan(0);
  expect(evolutionReport.canDeploy).toBe(false);

  // Save changelog
  saveChangelog(evolutionReport);
  console.log('\n✅ Breaking changes detected correctly!');
});

test('Quality gate blocks deployment when breaking changes exist', async ({ request }) => {
  // ดึง real API response
  const response = await request.get('https://jsonplaceholder.typicode.com/users/1');
  const user = await response.json();

  // Validate กับทั้ง 2 versions
  const v1Validation = validateResponse(user, 'v1', 'user');
  const v2Validation = validateResponse(user, 'v2', 'user');

  console.log(`\n📋 V1 Schema Validation: ${v1Validation.valid ? '✅ Pass' : '❌ Fail'}`);
  console.log(`📋 V2 Schema Validation: ${v2Validation.valid ? '✅ Pass' : '❌ Fail'}`);

  // Track evolution
  const evolutionReport = trackSchemaEvolution('v1', 'v2', 'user');

  // Run quality gate
  const gateResult = runQualityGate(evolutionReport, [v1Validation, v2Validation]);
  printGateResult(gateResult);

  // Save reports
  const fullReport = {
    timestamp: new Date().toISOString(),
    gateResult,
    evolutionReport,
  };

  saveJSONReport(fullReport);
  saveHTMLReport(fullReport);

  // Quality gate ควร block เพราะมี breaking changes
  expect(gateResult.canDeploy).toBe(false);
  expect(gateResult.checks.some(c => !c.passed)).toBe(true);

  console.log('\n✅ Quality gate working correctly!');
});

test('Quality gate allows deployment when no breaking changes', async ({ request }) => {
  // ดึง real API response
  const response = await request.get('https://jsonplaceholder.typicode.com/users/1');
  const user = await response.json();

  // Validate กับ v1 เท่านั้น
  const v1Validation = validateResponse(user, 'v1', 'user');

  // จำลอง evolution ที่ไม่มี breaking changes
  // โดยใช้ v1 เปรียบกับ v1 เอง
  const evolutionReport = trackSchemaEvolution('v1', 'v1', 'user');

  const gateResult = runQualityGate(evolutionReport, [v1Validation]);
  printGateResult(gateResult);

  // ควรผ่านเพราะไม่มี breaking changes
  expect(gateResult.canDeploy).toBe(true);
  console.log('\n✅ Quality gate allows safe deployment!');
});