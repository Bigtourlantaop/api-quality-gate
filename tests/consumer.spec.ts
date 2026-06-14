import { test, expect } from '@playwright/test';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import * as path from 'path';

const { like, string, integer } = MatchersV3;

const provider = new PactV3({
  consumer: 'Frontend',
  provider: 'UserAPI',
  dir: path.join(process.cwd(), 'pacts'),
  logLevel: 'error',
});

test('Consumer contract — GET user by ID', async () => {
  await provider
    .given('User with ID 1 exists')
    .uponReceiving('a request for user 1')
    .withRequest({
      method: 'GET',
      path: '/users/1',
    })
    .willRespondWith({
      status: 200,
      body: {
        id: integer(1),
        name: string('Leanne Graham'),
        username: string('Bret'),
        email: string('Sincere@april.biz'),
      },
    })
    .executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/users/1`);
      const user = await response.json();

      console.log('\n🤝 Consumer contract test:');
      console.log(`URL: ${mockServer.url}/users/1`);
      console.log(`Response: ${JSON.stringify(user)}`);

      expect(response.status).toBe(200);
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();

      console.log('✅ Contract generated successfully!');
    });
});

test('Consumer contract — GET all users', async () => {
  await provider
    .given('Users exist')
    .uponReceiving('a request for all users')
    .withRequest({
      method: 'GET',
      path: '/users',
    })
    .willRespondWith({
      status: 200,
      body: MatchersV3.eachLike({
        id: integer(1),
        name: string('Leanne Graham'),
        username: string('Bret'),
        email: string('Sincere@april.biz'),
      }),
    })
    .executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/users`);
      const users = await response.json();

      console.log('\n🤝 Consumer contract test — all users:');
      console.log(`Found ${users.length} users`);

      expect(response.status).toBe(200);
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(users[0].name).toBeDefined();

      console.log('✅ Contract generated successfully!');
    });
});