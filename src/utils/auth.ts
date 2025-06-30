import { User } from '../types';

const AUTH_KEY = 'trello-auth-user';

export function saveUser(user: User): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

export function loadUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      return {
        ...user,
        createdAt: new Date(user.createdAt)
      };
    }
  } catch (error) {
    console.error('Failed to load user:', error);
  }
  return null;
}

export function clearUser(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error('Failed to clear user:', error);
  }
}