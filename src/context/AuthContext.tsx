import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authApi, getStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string; businessName?: string; location?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const refreshUser = async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await authApi.getMe();
      if (res && res.user) {
        setUser(res.user);
        setToken(storedToken);
      } else {
        removeStoredToken();
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid, clearing authentication state');
      removeStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    closeAuthModal();
  };

  const register = async (data: { name: string; email: string; password: string; role?: string; businessName?: string; location?: string }) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setToken(res.token);
    closeAuthModal();
  };

  const loginWithGoogle = async () => {
    const res = await authApi.googleSignIn();
    setUser(res.user);
    setToken(res.token);
    closeAuthModal();
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
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
