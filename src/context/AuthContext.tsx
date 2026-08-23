import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

const USER_STORAGE_KEY = 'krivio_user_profile';
const TOKEN_KEY = 'krivio_auth_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass?: string) => Promise<void>;
  register: (data: { name: string; email: string; password?: string; role?: string; businessName?: string; location?: string; phone?: string }) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  loginWithGoogle: (name?: string, email?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const refreshUser = async () => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(localStorage.getItem(TOKEN_KEY) || 'client_token');
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, _pass?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    let userData: User;

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        userData = {
          ...parsed,
          email: cleanEmail,
          name: parsed.name || cleanEmail.split('@')[0],
        };
      } catch {
        userData = {
          id: 'usr_' + Date.now(),
          name: cleanEmail.split('@')[0],
          full_name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'artisan',
          businessName: `${cleanEmail.split('@')[0]}'s Business`,
          location: 'India',
          subscriptionPlan: 'free',
          createdAt: new Date().toISOString(),
        };
      }
    } else {
      userData = {
        id: 'usr_' + Date.now(),
        name: cleanEmail.split('@')[0],
        full_name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'artisan',
        businessName: `${cleanEmail.split('@')[0]}'s Business`,
        location: 'India',
        subscriptionPlan: 'free',
        createdAt: new Date().toISOString(),
      };
    }

    const genToken = 'token_' + Date.now();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, genToken);
    setUser(userData);
    setToken(genToken);
    closeAuthModal();
  };

  const register = async (data: { name: string; email: string; password?: string; role?: string; businessName?: string; location?: string; phone?: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: data.name,
      full_name: data.name,
      email: cleanEmail,
      role: (data.role as any) || 'artisan',
      businessName: data.businessName || `${data.name}'s Enterprise`,
      location: data.location || 'India',
      phone: data.phone || '',
      phone_number: data.phone || '',
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
    };

    const genToken = 'token_' + Date.now();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_KEY, genToken);
    setUser(newUser);
    setToken(genToken);
    closeAuthModal();
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  const loginWithGoogle = async (name = 'Google User', email = 'user@gmail.com') => {
    const newUser: User = {
      id: 'usr_g_' + Date.now(),
      name,
      full_name: name,
      email,
      role: 'artisan',
      businessName: `${name}'s Enterprise`,
      location: 'India',
      subscriptionPlan: 'free',
      createdAt: new Date().toISOString(),
    };

    const genToken = 'token_g_' + Date.now();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_KEY, genToken);
    setUser(newUser);
    setToken(genToken);
    closeAuthModal();
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
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
        updateUser,
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
