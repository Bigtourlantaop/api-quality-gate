import * as fs from 'fs';
import * as path from 'path';
import { EvolutionReport } from './tracker';

export function generateChangelog(report: EvolutionReport): string {
  const lines: string[] = [];

  lines.push(`# API Changelog`);
  lines.push(`## ${report.fromVersion} → ${report.toVersion}`);
  lines.push(`**Date:** ${new Date(report.timestamp).toLocaleDateString()}`);
  lines.push(`**Can Deploy:** ${report.canDeploy ? '✅ Yes' : '❌ No — Breaking changes detected'}`);
  lines.push('');
  lines.push(`### Summary`);
  lines.push(`- Total changes: ${report.totalChanges}`);
  lines.push(`- Breaking changes: ${report.breakingChanges}`);
  lines.push(`- Non-breaking changes: ${report.nonBreakingChanges}`);
  lines.push('');

  if (report.breakingChanges > 0) {
    lines.push(`### ⚠️ Breaking Changes`);
    report.changes
      .filter(c => c.isBreaking)
      .forEach(c => {
        lines.push(`- **[${c.changeType.toUpperCase()}]** \`${c.field}\` — ${c.reason}`);
        if (c.oldValue) lines.push(`  - Before: \`${c.oldValue}\``);
        if (c.newValue) lines.push(`  - After: \`${c.newValue}\``);
      });
    lines.push('');
  }

  if (report.nonBreakingChanges > 0) {
    lines.push(`### ✅ Non-Breaking Changes`);
    report.changes
      .filter(c => !c.isBreaking)
      .forEach(c => {
        lines.push(`- **[${c.changeType.toUpperCase()}]** \`${c.field}\` — ${c.reason}`);
      });
    lines.push('');
  }

  return lines.join('\n');
}

export function saveChangelog(report: EvolutionReport): void {
  const changelog = generateChangelog(report);
  const reportsDir = path.join(process.cwd(), 'reports');

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `changelog-${report.fromVersion}-to-${report.toVersion}.md`;
  fs.writeFileSync(path.join(reportsDir, filename), changelog);
  console.log(`\n📝 Changelog saved: reports/${filename}`);
}