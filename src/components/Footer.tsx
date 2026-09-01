import React from 'react';
import { Heart, ShieldCheck, Globe, HelpCircle } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext';
import { Logo } from './Logo';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t, languages, setLanguage, language } = useI18n();

  return (
    <footer className="bg-[#0B1911] text-emerald-100/80 pt-12 pb-8 border-t border-emerald-900/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand Info & Logo */}
          <div className="space-y-4 md:col-span-1">
            <div className="cursor-pointer" onClick={() => setCurrentTab('landing')}>
              <Logo variant="horizontal" size="sm" showTagline={true} isDarkBg={true} />
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed font-inter">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('storefront.verifiedArtisan')}</span>
            </div>
          </div>

          {/* Col 2: Core Platform Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-poppins">
              {t('dashboard.quickActions')}
            </h4>
            <ul className="space-y-2 text-xs font-inter">
              <li>
                <button onClick={() => setCurrentTab('mentor')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  {t('nav.voiceMentor')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('products')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  {t('nav.productStudio')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('images')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  {t('nav.imageStudio')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('marketplace')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  {t('nav.marketplace')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('schemes')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  {t('nav.schemes')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Languages & Regions */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-poppins">
              {t('common.language')}
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-emerald-200/70 font-inter">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors text-left cursor-pointer ${
                      language === lang.code ? 'text-[#D4AF37] font-bold' : ''
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{lang.nativeName}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: SHG & Government Initiatives */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-poppins">
              {t('schemes.title')}
            </h4>
            <p className="text-xs text-emerald-200/70 leading-relaxed mb-3 font-inter">
              {t('schemes.subtitle')}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] bg-[#13251B] p-2.5 rounded-lg border border-emerald-800/60 font-inter">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{t('mentor.prompt2')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/60 font-inter">
          <p>© {new Date().getFullYear()} KRIVIO AI. {t('common.poweredBy')}</p>
          <div className="flex items-center gap-1 text-emerald-200/80">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
            <span>for India's Rural Artisans</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

