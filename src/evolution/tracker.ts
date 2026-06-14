import * as fs from 'fs';
import * as path from 'path';

export interface SchemaChange {
  field: string;
  changeType: 'added' | 'removed' | 'modified';
  isBreaking: boolean;
  oldValue?: string;
  newValue?: string;
  reason: string;
}

export interface EvolutionReport {
  fromVersion: string;
  toVersion: string;
  timestamp: string;
  totalChanges: number;
  breakingChanges: number;
  nonBreakingChanges: number;
  changes: SchemaChange[];
  canDeploy: boolean;
}

function getRequiredFields(schema: any): string[] {
  return schema.required || [];
}

function getProperties(schema: any): Record<string, any> {
  return schema.properties || {};
}

export function trackSchemaEvolution(
  fromVersion: string,
  toVersion: string,
  schemaName: string
): EvolutionReport {
  const fromPath = path.join(process.cwd(), 'src/schemas', fromVersion, `${schemaName}.schema.json`);
  const toPath = path.join(process.cwd(), 'src/schemas', toVersion, `${schemaName}.schema.json`);

  const fromSchema = JSON.parse(fs.readFileSync(fromPath, 'utf-8'));
  const toSchema = JSON.parse(fs.readFileSync(toPath, 'utf-8'));

  const fromProps = getProperties(fromSchema);
  const toProps = getProperties(toSchema);
  const fromRequired = getRequiredFields(fromSchema);
  const toRequired = getRequiredFields(toSchema);

  const changes: SchemaChange[] = [];

  // เช็ค field ที่ถูกลบออก (breaking)
  for (const field of Object.keys(fromProps)) {
    if (!toProps[field]) {
      changes.push({
        field,
        changeType: 'removed',
        isBreaking: true,
        oldValue: fromProps[field].type,
        reason: `Field "${field}" was removed — existing clients will break`,
      });
    }
  }

  // เช็ค field ที่เพิ่มเข้ามา
  for (const field of Object.keys(toProps)) {
    if (!fromProps[field]) {
      const isBreaking = toRequired.includes(field);
      changes.push({
        field,
        changeType: 'added',
        isBreaking,
        newValue: toProps[field].type,
        reason: isBreaking
          ? `Field "${field}" was added as required — existing clients will break`
          : `Field "${field}" was added as optional — non-breaking`,
      });
    }
  }

  // เช็ค field ที่เปลี่ยน type
  for (const field of Object.keys(fromProps)) {
    if (toProps[field] && fromProps[field].type !== toProps[field].type) {
      changes.push({
        field,
        changeType: 'modified',
        isBreaking: true,
        oldValue: fromProps[field].type,
        newValue: toProps[field].type,
        reason: `Field "${field}" type changed from ${fromProps[field].type} to ${toProps[field].type}`,
      });
    }
  }

  const breakingChanges = changes.filter(c => c.isBreaking).length;

  return {
    fromVersion,
    toVersion,
    timestamp: new Date().toISOString(),
    totalChanges: changes.length,
    breakingChanges,
    nonBreakingChanges: changes.length - breakingChanges,
    changes,
    canDeploy: breakingChanges === 0,
  };
}