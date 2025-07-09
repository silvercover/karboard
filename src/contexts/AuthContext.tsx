import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { saveUser, loadUser, clearUser, saveUserAvatar, loadUserAvatar, deleteUserAvatar } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  userAvatar: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>, avatarData?: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = loadUser();
    if (savedUser) {
      setUser(savedUser);
      // Load avatar from IndexedDB
      if (savedUser.avatarRef) {
        loadUserAvatar(savedUser.id).then(avatar => {
          setUserAvatar(avatar);
        }).catch(console.error);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - in real app, this would be an actual API call
      const users = JSON.parse(localStorage.getItem('trello-users') || '[]');
      const foundUser = users.find((u: any) => u.email === email);
      
      if (foundUser && foundUser.password === password) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        saveUser(userWithoutPassword);
        
        // Load avatar from IndexedDB
        if (userWithoutPassword.avatarRef) {
          const avatar = await loadUserAvatar(userWithoutPassword.id);
          setUserAvatar(avatar);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('trello-users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        return false;
      }

      const newUser: User & { password: string } = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        createdAt: new Date()
      };

      users.push(newUser);
      localStorage.setItem('trello-users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      saveUser(userWithoutPassword);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserAvatar(null);
    clearUser();
  };

  const updateProfile = async (updates: Partial<User>, avatarData?: string): Promise<void> => {
    if (!user) return;

    try {
      let updatedUser = { ...user, ...updates };

      // Handle avatar update
      if (avatarData) {
        // Save avatar to IndexedDB and get reference
        await saveUserAvatar(user.id, avatarData);
        updatedUser.avatarRef = user.id;
        setUserAvatar(avatarData);
      } else if (updates.avatarRef === undefined && user.avatarRef) {
        // Remove avatar if explicitly set to undefined
        await deleteUserAvatar(user.id);
        updatedUser.avatarRef = undefined;
        setUserAvatar(null);
      }

      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Update in users list (without storing large avatar data)
      const users = JSON.parse(localStorage.getItem('trello-users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, ...updatedUser } : u
      );
      localStorage.setItem('trello-users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userAvatar,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}