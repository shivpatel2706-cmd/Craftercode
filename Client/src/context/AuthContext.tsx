import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';
import { authService } from '../services/authService';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginAs: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getCurrentUser());

  useEffect(() => {
    if (user) {
      storage.setCurrentUser(user);
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    const res = await authService.login(email, password);
    setUser(res.user);
  };

  const loginAs = async (role: UserRole) => {
    const res = await authService.loginAs(role);
    setUser(res.user);
  };

  const switchRole = (role: UserRole) => {
    const users = storage.getUsers();
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setUser(targetUser);
      storage.setCurrentUser(targetUser);
      localStorage.setItem('metroverify_token', `mock-token-${role}`);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        loginAs,
        switchRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
