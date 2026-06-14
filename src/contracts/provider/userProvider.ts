export interface UserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
}

export async function fetchUser(userId: number): Promise<UserResponse> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${userId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user ${userId}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAllUsers(): Promise<UserResponse[]> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

export function validateUserShape(user: any): boolean {
  return (
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string'
  );
}