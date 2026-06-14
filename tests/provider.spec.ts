import { test, expect } from '@playwright/test';
import { fetchUser, fetchAllUsers, validateUserShape } from '../src/contracts/provider/userProvider';

test('Provider — GET user by ID matches contract', async () => {
  console.log('\n🔍 Provider verification: GET /users/1');

  const user = await fetchUser(1);

  console.log(`Response: ${JSON.stringify(user, null, 2).substring(0, 200)}`);

  // Verify ว่า provider ตอบตรงกับ contract
  expect(user.id).toBeDefined();
  expect(typeof user.id).toBe('number');
  expect(user.name).toBeDefined();
  expect(typeof user.name).toBe('string');
  expect(user.username).toBeDefined();
  expect(typeof user.username).toBe('string');
  expect(user.email).toBeDefined();
  expect(typeof user.email).toBe('string');

  // Validate shape
  const isValid = validateUserShape(user);
  expect(isValid).toBe(true);

  console.log('✅ Provider response matches contract!');
});

test('Provider — GET all users matches contract', async () => {
  console.log('\n🔍 Provider verification: GET /users');

  const users = await fetchAllUsers();

  console.log(`Found ${users.length} users`);

  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeGreaterThan(0);

  // Validate ทุก user ตรงกับ contract
  let allValid = true;
  users.forEach((user, index) => {
    const isValid = validateUserShape(user);
    if (!isValid) {
      console.log(`❌ User ${index + 1} failed validation`);
      allValid = false;
    }
  });

  expect(allValid).toBe(true);
  console.log(`✅ All ${users.length} users match contract!`);
});

test('Provider — Breaking change simulation', async () => {
  console.log('\n🔍 Simulating breaking change...');

  const user = await fetchUser(1);

  // จำลอง v2 response ที่เปลี่ยน field names
  const v2Response = {
    id: user.id,
    fullName: user.name,        // เปลี่ยนจาก name
    username: user.username,
    emailAddress: user.email,   // เปลี่ยนจาก email
    role: 'user',
  };

  console.log('Original v1 response has: name, email');
  console.log('Simulated v2 response has: fullName, emailAddress');

  // v2 response ไม่ผ่าน v1 contract
  const hasOriginalFields = 
    'name' in v2Response && 
    'email' in v2Response;

  expect(hasOriginalFields).toBe(false);
  console.log('✅ Breaking change detected — v2 breaks v1 contract!');
});