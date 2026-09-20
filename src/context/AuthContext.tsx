import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, ExperienceLevel } from '../types';

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrUsername: string, password: string) => AuthResponse;
  register: (name: string, username: string, email: string, password: string, experienceLevel: ExperienceLevel) => AuthResponse;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (emailOrUsername: string, password: string): AuthResponse => {
    // Mock authentication logic
    if (password === 'demo1234' || password.length >= 6) {
      setUser({
        id: 1,
        name: 'Demo User',
        username: emailOrUsername.split('@')[0] || 'demo',
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@cryptoverse.edu`,
        experience_level: 'BEGINNER',
        role: 'STUDENT',
        created_at: new Date().toISOString()
      });
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (name: string, username: string, email: string, password: string, experienceLevel: ExperienceLevel): AuthResponse => {
    // Mock registration logic
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    setUser({
      id: 2,
      name,
      username,
      email,
      experience_level: experienceLevel,
      role: 'STUDENT',
      created_at: new Date().toISOString()
    });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
