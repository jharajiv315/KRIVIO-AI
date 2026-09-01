import { SupportedLanguage, TranslationDictionary } from '../types';
import en from './en/common.json';
import hi from './hi/common.json';
import mr from './mr/common.json';
import gu from './gu/common.json';
import ta from './ta/common.json';
import bn from './bn/common.json';
import as from './as/common.json';

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  hi,
  mr,
  gu,
  ta,
  bn,
  as,
};

export { en, hi, mr, gu, ta, bn, as };
