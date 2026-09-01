import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SupportedLanguage, LanguageOption } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './config';
import { translations } from './locales';

interface LanguageContextType {
  language: SupportedLanguage;
  currentLanguageConfig: LanguageOption;
  languages: LanguageOption[];
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (value: string | Date | number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get nested value by dot notation ('nav.dashboard' -> 'Dashboard')
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        return stored as SupportedLanguage;
      }
    } catch {}
    return DEFAULT_LANGUAGE;
  });

  // Keep html lang attribute in sync and listen for cross-component language sync events
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const newLang = customEvent.detail;
      if (newLang && SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) {
        setLanguageState(newLang as SupportedLanguage);
      }
    };
    window.addEventListener('krivio_language_sync', handleSync);
    return () => window.removeEventListener('krivio_language_sync', handleSync);
  }, []);

  const currentLanguageConfig = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const setLanguage = useCallback(async (newLang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;

    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {}

    // Persist to backend if token is available
    const token = localStorage.getItem('krivio_auth_token');
    if (token) {
      try {
        const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        await fetch(`${apiBase}/api/users/language`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: newLang }),
        });
      } catch (err) {
        console.warn('Background language sync note:', err);
      }
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // 1. Try active language dictionary
      let text = getNestedValue(translations[language], key);

      // 2. Fallback to English dictionary if not found in active language
      if (text === undefined && language !== DEFAULT_LANGUAGE) {
        text = getNestedValue(translations[DEFAULT_LANGUAGE], key);
      }

      // 3. Fallback to key itself if not found anywhere
      if (text === undefined) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation key for '${key}' in locale '${language}'`);
        }
        text = key.split('.').pop() || key;
      }

      // Interpolate parameters {name}, {count}, etc.
      if (params && typeof text === 'string') {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = (text as string).replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return text;
    },
    [language]
  );

  const formatNumber = useCallback(
    (value: number): string => {
      try {
        const localeCode = currentLanguageConfig.speechCode || 'en-IN';
        return new Intl.NumberFormat(localeCode).format(value);
      } catch {
        return value.toLocaleString('en-IN');
      }
    },
    [currentLanguageConfig]
  );

  const formatCurrency = useCallback(
    (value: number, currency: string = 'INR'): string => {
      try {
        const localeCode = currentLanguageConfig.speechCode || 'en-IN';
        if (currency === 'INR' || currency === '₹') {
          const formattedNumber = new Intl.NumberFormat(localeCode).format(value);
          return `₹${formattedNumber}`;
        }
        return new Intl.NumberFormat(localeCode, {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        return `₹${value.toLocaleString('en-IN')}`;
      }
    },
    [currentLanguageConfig]
  );

  const formatDate = useCallback(
    (value: string | Date | number): string => {
      try {
        const dateObj = new Date(value);
        const localeCode = currentLanguageConfig.speechCode || 'en-IN';
        return new Intl.DateTimeFormat(localeCode, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(dateObj);
      } catch {
        return String(value);
      }
    },
    [currentLanguageConfig]
  );

  const value = useMemo(
    () => ({
      language,
      currentLanguageConfig,
      languages: SUPPORTED_LANGUAGES,
      setLanguage,
      t,
      formatNumber,
      formatCurrency,
      formatDate,
    }),
    [language, currentLanguageConfig, setLanguage, t, formatNumber, formatCurrency, formatDate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useI18n = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
};

// Convenient alias
export const useTranslation = useI18n;
