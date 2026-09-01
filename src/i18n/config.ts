import { LanguageOption, SupportedLanguage } from './types';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    speechCode: 'en-IN',
    flagEmoji: '🌐',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    speechCode: 'hi-IN',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    speechCode: 'mr-IN',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    speechCode: 'gu-IN',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    speechCode: 'ta-IN',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    speechCode: 'bn-IN',
    flagEmoji: '🇮🇳',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Bengali-Assamese',
    speechCode: 'as-IN',
    flagEmoji: '🇮🇳',
  },
];

export const LANGUAGE_STORAGE_KEY = 'krivio_preferred_language';
