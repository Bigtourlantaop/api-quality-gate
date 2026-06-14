import { test, expect } from '@playwright/test';
import { validateResponse } from '../src/utils/schemaValidator';

test('JSONPlaceholder user response matches v1 schema', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users/1');
  const user = await response.json();

  console.log('\n📋 Testing real API response against v1 schema...');
  console.log('Response:', JSON.stringify(user, null, 2).substring(0, 200));

  const result = validateResponse(user, 'v1', 'user');

  console.log(`\n✅ Valid: ${result.valid}`);
  if (!result.valid) {
    result.errors.forEach(e => console.log(`❌ ${e.field}: ${e.message}`));
  }

  expect(result.valid).toBe(true);
});

test('Mock v2 response fails v1 schema — breaking change detected', async () => {
  // จำลอง API v2 response ที่เปลี่ยน field names
  const mockV2Response = {
    id: 1,
    fullName: 'Leanne Graham',
    username: 'Bret',
    emailAddress: 'Sincere@april.biz',
    role: 'admin',
  };

  console.log('\n📋 Testing mock v2 response against v1 schema...');

  const result = validateResponse(mockV2Response, 'v1', 'user');

  console.log(`\nValid against v1: ${result.valid}`);
  result.errors.forEach(e => console.log(`❌ ${e.field}: ${e.message}`));

  // ควร fail เพราะ v2 ไม่มี "name" และ "email" ที่ v1 ต้องการ
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  console.log('\n✅ Breaking change detected correctly!');
});

test('Mock v2 response matches v2 schema', async () => {
  const mockV2Response = {
    id: 1,
    fullName: 'Leanne Graham',
    username: 'Bret',
    emailAddress: 'Sincere@april.biz',
    role: 'admin',
  };

  console.log('\n📋 Testing mock v2 response against v2 schema...');

  const result = validateResponse(mockV2Response, 'v2', 'user');

  console.log(`\nValid against v2: ${result.valid}`);
  if (!result.valid) {
    result.errors.forEach(e => console.log(`❌ ${e.field}: ${e.message}`));
  }

  expect(result.valid).toBe(true);
  console.log('✅ V2 response matches v2 schema!');
});