import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import * as path from 'path';

const { like, string, integer } = MatchersV3;

export const userConsumerPact = new PactV3({
  consumer: 'Frontend',
  provider: 'UserAPI',
  dir: path.join(process.cwd(), 'pacts'),
  logLevel: 'error',
});

export const expectedUser = {
  id: integer(1),
  name: string('Leanne Graham'),
  username: string('Bret'),
  email: string('Sincere@april.biz'),
};

export async function getUserFromAPI(userId: number): Promise<any> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
  return response.json();
}