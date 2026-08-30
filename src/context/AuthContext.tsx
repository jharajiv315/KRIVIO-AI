import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';
import { supabase, signInWithGoogleOAuth, signOutSupabase } from '../services/supabase';

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
  register: (data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    businessName?: string;
    location?: string;
    phone?: string;
  }) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  loginWithGoogle: (name?: string, email?: string, avatarUrl?: string, googleId?: string) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
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

  const mapSupabaseUserToKrivioUser = (sbUser: any): User => {
    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || meta.email || 'artisan@krivio.ai';
    const name = meta.full_name || meta.name || meta.user_name || email.split('@')[0] || 'Artisan';
    const avatarUrl = meta.avatar_url || meta.picture || '';

    return {
      id: `usr_${sbUser.id ? sbUser.id.replace(/-/g, '').slice(0, 12) : Date.now()}`,
      name,
      full_name: name,
      email,
      role: (meta.role as any) || 'artisan',
      businessName: meta.business_name || `${name}'s Artisan Enterprise`,
      location: meta.location || 'India',
      phone: meta.phone || sbUser.phone || '',
      phone_number: meta.phone || sbUser.phone || '',
      avatarUrl,
      profile_image: avatarUrl,
      is_verified: true,
      is_active: true,
      subscriptionPlan: 'free',
      createdAt: sbUser.created_at || new Date().toISOString(),
    };
  };

  const refreshUser = async () => {
    try {
      // 1. Check active Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mapped = mapSupabaseUserToKrivioUser(session.user);
        const saved = localStorage.getItem(USER_STORAGE_KEY);
        const merged = saved ? { ...JSON.parse(saved), ...mapped } : mapped;
        const accessToken = session.access_token || localStorage.getItem(TOKEN_KEY) || 'sb_token_' + Date.now();

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem(TOKEN_KEY, accessToken);
        setUser(merged);
        setToken(accessToken);
        return;
      }

      // 2. Check localStorage fallback
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(localStorage.getItem(TOKEN_KEY) || 'client_token');
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Auth refresh error:', err);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(localStorage.getItem(TOKEN_KEY) || 'client_token');
        } catch {
          setUser(null);
          setToken(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen to real-time Supabase Auth state changes (OAuth login, token refresh, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const mapped = mapSupabaseUserToKrivioUser(session.user);
        const accessToken = session.access_token || 'sb_tok_' + Date.now();

        try {
          // Sync with backend API
          await authApi.googleSignIn(mapped.name, mapped.email);
        } catch {
          // Fallback if backend is offline
        }

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mapped));
        localStorage.setItem(TOKEN_KEY, accessToken);
        setUser(mapped);
        setToken(accessToken);
        setIsLoading(false);
        setIsAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string = 'demo123') => {
    try {
      const res = await authApi.login(email, pass);
      if (res.user && res.token) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        localStorage.setItem(TOKEN_KEY, res.token);
        setUser(res.user);
        setToken(res.token);
        closeAuthModal();
        return;
      }
    } catch {
      // Fallback
    }

    const cleanEmail = email.trim().toLowerCase();
    const userData: User = {
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

    const genToken = 'token_' + Date.now();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, genToken);
    setUser(userData);
    setToken(genToken);
    closeAuthModal();
  };

  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    businessName?: string;
    location?: string;
    phone?: string;
  }) => {
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password || 'demo123',
        role: data.role,
        businessName: data.businessName,
        location: data.location,
      });
      if (res.user && res.token) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        localStorage.setItem(TOKEN_KEY, res.token);
        setUser(res.user);
        setToken(res.token);
        closeAuthModal();
        return;
      }
    } catch {
      // Fallback
    }

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

  /**
   * Triggers the official Supabase Google OAuth redirect flow.
   */
  const signInWithGoogle = async (redirectTo?: string) => {
    await signInWithGoogleOAuth(redirectTo);
  };

  /**
   * Direct Google Sign-In with API sync (for one-click and seamless auth).
   */
  const loginWithGoogle = async (
    name = 'Google User',
    email = 'user@gmail.com',
    avatarUrl?: string,
    googleId?: string
  ) => {
    try {
      const res = await authApi.googleSignIn(name, email);
      if (res.user && res.token) {
        const enhancedUser: User = {
          ...res.user,
          avatarUrl: avatarUrl || res.user.avatarUrl,
          profile_image: avatarUrl || res.user.profile_image,
          is_verified: true,
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(enhancedUser));
        localStorage.setItem(TOKEN_KEY, res.token);
        setUser(enhancedUser);
        setToken(res.token);
        closeAuthModal();
        return;
      }
    } catch {
      // Fallback
    }

    const newUser: User = {
      id: googleId ? `usr_g_${googleId.slice(0, 8)}` : 'usr_g_' + Date.now(),
      name,
      full_name: name,
      email,
      role: 'artisan',
      businessName: `${name}'s Artisan Enterprise`,
      location: 'India',
      avatarUrl,
      profile_image: avatarUrl,
      is_verified: true,
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
    signOutSupabase().catch(() => {});
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
        signInWithGoogle,
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
