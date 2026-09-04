import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'dropdown' | 'inline' | 'modal';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  showLabel = true,
  className = '',
}) => {
  const { language, setLanguage, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {languages.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#0F5132] text-white font-bold shadow-sm'
                  : 'bg-stone-100 dark:bg-[#183023] text-stone-700 dark:text-emerald-100 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/40'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className={`text-[10px] opacity-70 ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                ({lang.name})
              </span>
              {isSelected && <Check className="w-3.5 h-3.5 ml-1 text-[#D4AF37]" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select Interface Language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-emerald-100 hover:bg-stone-200/60 dark:hover:bg-emerald-900/40 border border-stone-200 dark:border-emerald-800/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 select-none"
      >
        <Globe className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" />
        <span className="font-poppins">{currentLang.nativeName}</span>
        {showLabel && currentLang.nativeName.toLowerCase() !== currentLang.name.toLowerCase() && (
          <span className="hidden sm:inline text-[10px] text-stone-400 dark:text-emerald-400/60 font-inter">
            ({currentLang.name})
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xl z-50 p-2 space-y-1 font-inter text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-stone-400 dark:text-emerald-400/60 uppercase tracking-wider font-poppins border-b border-stone-100 dark:border-emerald-900/40 mb-1">
            Choose Language / भाषा चुनें
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-emerald-300 font-bold'
                      : 'text-stone-700 dark:text-emerald-100 hover:bg-stone-100 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold font-poppins">{lang.nativeName}</span>
                    <span className="text-[10px] text-stone-400 dark:text-emerald-400/60 font-inter">
                      {lang.name}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0F5132] dark:text-[#34D399]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
