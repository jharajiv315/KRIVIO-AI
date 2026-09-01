import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authApi, setStoredToken, removeStoredToken, getStoredToken } from '../services/api';
import { supabase, signInWithGoogleOAuth, signOutSupabase } from '../services/supabase';

const USER_STORAGE_KEY = 'krivio_user_profile';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const syncAndSaveUser = async (sbUser: any, accessToken: string) => {
    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || meta.email;
    const name = meta.full_name || meta.name || meta.user_name || (email ? email.split('@')[0] : 'Artisan');
    const avatarUrl = meta.avatar_url || meta.picture || '';
    const phone = meta.phone || sbUser.phone || '';
    const role = meta.role || 'artisan';

    try {
      // Sync identity with backend FastAPI / PostgreSQL
      setStoredToken(accessToken);
      const res = await authApi.syncSupabaseUser({
        supabase_user_id: sbUser.id,
        email,
        full_name: name,
        profile_image: avatarUrl,
        phone_number: phone,
        role,
      });

      if (res.user.preferred_language || res.user.preferredLanguage) {
        const userLang = res.user.preferred_language || res.user.preferredLanguage;
        localStorage.setItem('krivio_preferred_language', userLang);
        window.dispatchEvent(new CustomEvent('krivio_language_sync', { detail: userLang }));
      }
      setStoredToken(res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setUser(res.user);
      setToken(res.token);
      return;
    } catch (err) {
      console.warn('Backend identity sync notice:', err);
    }

    // Fallback: construct verified user model directly from Supabase session
    const verifiedUser: User = {
      id: sbUser.id,
      name,
      full_name: name,
      email,
      role: role as any,
      businessName: meta.business_name || `${name}'s Enterprise`,
      location: meta.location || 'India',
      phone,
      phone_number: phone,
      avatarUrl,
      profile_image: avatarUrl,
      is_verified: true,
      is_active: true,
      preferred_language: 'en',
      preferredLanguage: 'en',
      subscriptionPlan: 'free',
      createdAt: sbUser.created_at || new Date().toISOString(),
    };

    setStoredToken(accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(verifiedUser));
    setUser(verifiedUser);
    setToken(accessToken);
  };

  const refreshUser = async () => {
    try {
      // 1. Check active Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session?.access_token) {
        await syncAndSaveUser(session.user, session.access_token);
        return;
      }

      // 2. Check local JWT token against backend /api/auth/me
      const currentToken = getStoredToken();
      if (currentToken) {
        try {
          const res = await authApi.getMe();
          if (res.user) {
            if (res.user.preferred_language || res.user.preferredLanguage) {
              const userLang = res.user.preferred_language || res.user.preferredLanguage;
              localStorage.setItem('krivio_preferred_language', userLang);
              window.dispatchEvent(new CustomEvent('krivio_language_sync', { detail: userLang }));
            }
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
            setUser(res.user);
            setToken(currentToken);
            return;
          }
        } catch {}
      }

      // 3. Fallback: localStorage
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser && currentToken) {
        setUser(JSON.parse(savedUser));
        setToken(currentToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Auth refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen to real-time Supabase Auth state changes (Google Sign-In, Token Refresh, Sign-out)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && session?.access_token) {
        await syncAndSaveUser(session.user, session.access_token);
        setIsLoading(false);
        setIsAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(USER_STORAGE_KEY);
        removeStoredToken();
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    if (res.user && res.token) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setStoredToken(res.token);
      setUser(res.user);
      setToken(res.token);
      closeAuthModal();
    }
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
    const res = await authApi.register({
      name: data.name,
      email: data.email,
      password: data.password || 'krivio_pass_2026',
      role: data.role,
      businessName: data.businessName,
      location: data.location,
    });
    if (res.user && res.token) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setStoredToken(res.token);
      setUser(res.user);
      setToken(res.token);
      closeAuthModal();
    }
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
   * Direct Google Sign-In with API sync.
   */
  const loginWithGoogle = async (
    name = 'Google User',
    email = 'user@gmail.com',
    avatarUrl?: string,
    googleId?: string
  ) => {
    const res = await authApi.googleSignIn(name, email, googleId, avatarUrl);
    if (res.user && res.token) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setStoredToken(res.token);
      setUser(res.user);
      setToken(res.token);
      closeAuthModal();
    }
  };

  const logout = () => {
    signOutSupabase().catch(() => {});
    localStorage.removeItem(USER_STORAGE_KEY);
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
