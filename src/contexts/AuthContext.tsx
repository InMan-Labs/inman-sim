import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

const defaultUser: User = {
  name: 'Admin User',
  email: 'admin@acme-manufacturing.com',
  role: 'Platform Engineer',
  teams: ['Infrastructure', 'SRE', 'Platform'],
  permissions: [
    'Execute Runbooks',
    'Create Runbooks',
    'View Audit Logs',
    'Manage Incidents',
    'Schedule Jobs',
    'Approve Executions',
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setLastActivity(Date.now());
  }, []);

  const updateActivity = useCallback(() => {
    if (isAuthenticated) {
      setLastActivity(Date.now());
    }
  }, [isAuthenticated]);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setUser(defaultUser);
      setLastActivity(Date.now());
      return true;
    }
    return false;
  }, []);

  // Session timeout check
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        logout();
      }
    };

    const interval = setInterval(checkSession, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, logout]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateActivity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
