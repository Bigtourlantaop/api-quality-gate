import * as fs from 'fs';
import * as path from 'path';
import { GateResult } from '../gate/qualityGate';
import { EvolutionReport } from '../evolution/tracker';

export interface FullReport {
  timestamp: string;
  gateResult: GateResult;
  evolutionReport: EvolutionReport;
}

export function saveJSONReport(report: FullReport): void {
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const filename = `report-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(reportsDir, filename),
    JSON.stringify(report, null, 2)
  );
  console.log(`\n📊 JSON Report saved: reports/${filename}`);
}

export function saveHTMLReport(report: FullReport): void {
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const statusColor = report.gateResult.canDeploy ? '#22c55e' : '#ef4444';
  const statusText = report.gateResult.canDeploy ? '✅ SAFE TO DEPLOY' : '❌ BLOCKED';

  const checksHTML = report.gateResult.checks.map(check => `
    <div class="check ${check.passed ? 'passed' : 'failed'}">
      <span class="check-name">${check.name}</span>
      <span class="check-message">${check.message}</span>
    </div>
  `).join('');

  const changesHTML = report.evolutionReport.changes.map(change => `
    <tr class="${change.isBreaking ? 'breaking' : 'safe'}">
      <td>${change.field}</td>
      <td>${change.changeType}</td>
      <td>${change.isBreaking ? '❌ Breaking' : '✅ Safe'}</td>
      <td>${change.reason}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>API Quality Gate Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin: 1.5rem 0 1rem; color: #94a3b8; }
    .status { 
      display: inline-block; padding: 0.5rem 1.5rem; 
      border-radius: 9999px; font-size: 1.25rem; font-weight: bold;
      background: ${statusColor}22; color: ${statusColor}; 
      border: 1px solid ${statusColor}; margin-bottom: 2rem;
    }
    .card { background: #1e293b; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; }
    .check { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #334155; }
    .check:last-child { border-bottom: none; }
    .check.passed .check-name { color: #22c55e; }
    .check.failed .check-name { color: #ef4444; }
    .check-name { font-weight: bold; }
    .check-message { color: #94a3b8; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem; background: #334155; color: #94a3b8; }
    td { padding: 0.75rem; border-bottom: 1px solid #334155; }
    tr.breaking td { color: #ef4444; }
    tr.safe td { color: #22c55e; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat { background: #1e293b; border-radius: 0.75rem; padding: 1rem; text-align: center; }
    .stat-number { font-size: 2rem; font-weight: bold; }
    .stat-label { color: #94a3b8; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>🚦 API Quality Gate Report</h1>
  <p style="color:#94a3b8; margin-bottom:1rem">${new Date(report.timestamp).toLocaleString()}</p>
  <div class="status">${statusText}</div>

  <div class="summary">
    <div class="stat">
      <div class="stat-number" style="color:#f59e0b">${report.evolutionReport.totalChanges}</div>
      <div class="stat-label">Total Changes</div>
    </div>
    <div class="stat">
      <div class="stat-number" style="color:#ef4444">${report.evolutionReport.breakingChanges}</div>
      <div class="stat-label">Breaking Changes</div>
    </div>
    <div class="stat">
      <div class="stat-number" style="color:#22c55e">${report.evolutionReport.nonBreakingChanges}</div>
      <div class="stat-label">Non-Breaking Changes</div>
    </div>
  </div>

  <h2>Quality Gate Checks</h2>
  <div class="card">${checksHTML}</div>

  <h2>Schema Changes (${report.evolutionReport.fromVersion} → ${report.evolutionReport.toVersion})</h2>
  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Field</th>
          <th>Change Type</th>
          <th>Impact</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>${changesHTML}</tbody>
    </table>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(reportsDir, 'dashboard.html'), html);
  console.log(`\n🎨 HTML Dashboard saved: reports/dashboard.html`);
}