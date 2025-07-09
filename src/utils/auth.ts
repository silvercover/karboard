import { User } from '../types';
import { indexedDBManager } from './indexedDB';

const AUTH_KEY = 'trello-auth-user';

export function saveUser(user: User): void {
  try {
    // Save user data without avatar to localStorage
    const { avatarRef, ...userWithoutAvatar } = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutAvatar));
  } catch (error) {
    console.error('Failed to save user:', error);
    throw error;
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

export async function saveUserAvatar(userId: string, dataUrl: string): Promise<void> {
  try {
    await indexedDBManager.saveAvatar(userId, dataUrl);
  } catch (error) {
    console.error('Failed to save user avatar:', error);
    throw error;
  }
}

export async function loadUserAvatar(userId: string): Promise<string | null> {
  try {
    return await indexedDBManager.getAvatar(userId);
  } catch (error) {
    console.error('Failed to load user avatar:', error);
    return null;
  }
}

export async function deleteUserAvatar(userId: string): Promise<void> {
  try {
    await indexedDBManager.deleteAvatar(userId);
  } catch (error) {
    console.error('Failed to delete user avatar:', error);
  }
}