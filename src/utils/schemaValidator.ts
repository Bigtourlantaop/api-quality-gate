import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export interface ValidationResult {
  valid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

export function loadSchema(version: string, schemaName: string): object {
  const schemaPath = path.join(
    process.cwd(),
    'src/schemas',
    version,
    `${schemaName}.schema.json`
  );
  return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
}

export function validateResponse(
  response: object,
  version: string,
  schemaName: string
): ValidationResult {
  const schema = loadSchema(version, schemaName);
  const validate: ValidateFunction = ajv.compile(schema);
  const valid = validate(response);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors || []).map(err => ({
    field: err.instancePath || err.params?.missingProperty || 'unknown',
    message: err.message || 'validation failed',
  }));

  return { valid: false, errors };
}