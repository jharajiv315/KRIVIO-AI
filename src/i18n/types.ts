export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'bn' | 'as';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  speechCode: string;
  flagEmoji?: string;
}

export type TranslationDictionary = Record<string, any>;
