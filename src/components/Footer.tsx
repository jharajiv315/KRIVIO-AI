import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Globe,
  HelpCircle,
  FileText,
  Lock,
  Mail,
  X,
  Award,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext';
import { Logo } from './Logo';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t, languages, setLanguage, language } = useI18n();
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#0B1911] text-emerald-100/80 pt-16 pb-10 border-t border-emerald-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="cursor-pointer" onClick={() => setCurrentTab('landing')}>
              <Logo variant="horizontal" size="sm" showTagline={true} isDarkBg={true} />
            </div>
            <p className="text-xs text-emerald-200/75 leading-relaxed font-inter max-w-sm">
              Empowering India's rural artisans, weavers, SHGs, and grassroots makers with voice-first AI business intelligence. Bridging heritage craftsmanship with modern digital commerce across Bharat.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[11px] font-semibold text-[#D4AF37]">
                <Award className="w-3.5 h-3.5" />
                <span>ONDC & GeM Ready</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[11px] font-semibold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted & Private</span>
              </span>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-stone-400 dark:text-emerald-400/70 uppercase tracking-wider mb-2.5 font-poppins">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/?text=Explore%20KRIVIO%20AI%20-%20Empowering%20Artisans"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Community"
                  className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-[#0F5132] border border-emerald-800/60 text-emerald-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-[#0F5132] border border-emerald-800/60 text-emerald-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-[#0F5132] border border-emerald-800/60 text-emerald-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-[#0F5132] border border-emerald-800/60 text-emerald-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-[#0F5132] border border-emerald-800/60 text-emerald-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Core Studios */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-poppins">
              {t('dashboard.quickActions')}
            </h4>
            <ul className="space-y-2.5 text-xs font-inter">
              <li>
                <button onClick={() => setCurrentTab('mentor')} className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left">
                  {t('nav.voiceMentor')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('products')} className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left">
                  {t('nav.productStudio')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('images')} className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left">
                  {t('nav.imageStudio')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('marketplace')} className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left">
                  {t('nav.marketplace')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('schemes')} className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left">
                  {t('nav.schemes')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('community')} className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left">
                  {t('nav.community')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Indian Regional Languages */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-poppins">
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
                    <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{lang.nativeName}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Trust, Legal & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-poppins">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs font-inter mb-4">
              <li>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalModal('terms')}
                  className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@krivio.ai?subject=Inquiry%20from%20KRIVIO%20AI"
                  className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Support & Feedback</span>
                </a>
              </li>
            </ul>

            <div className="bg-[#13251B] p-3 rounded-xl border border-emerald-800/60 font-inter text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Artisan First Promise</span>
              </div>
              <p className="text-emerald-200/70 text-[10px] leading-normal">
                100% data ownership remains with the artisan. No predatory middleman margins.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70 font-inter">
          <p>© {new Date().getFullYear()} KRIVIO AI. Vocal for Local & Digital India.</p>
          <div className="flex items-center gap-1.5 text-emerald-200/90">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
            <span>for Bharat's Grassroots Creators</span>
          </div>
        </div>
      </div>

      {/* Legal Content Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13251B] text-stone-900 dark:text-[#E2F1E7] rounded-2xl max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto border border-emerald-800/70 shadow-2xl relative">
            <button
              onClick={() => setLegalModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-900/40 text-stone-500 dark:text-emerald-300 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {legalModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-emerald-900/60">
                  <Lock className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
                  <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">
                    KRIVIO AI Privacy Policy
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-emerald-100/90 font-inter">
                  <p>
                    At KRIVIO AI, we believe rural artisans and self-help groups (SHGs) deserve absolute digital safety and trust. We do not sell, rent, or exploit your personal business details or voice recordings.
                  </p>
                  <h4 className="font-bold font-poppins text-stone-900 dark:text-white text-sm pt-1">
                    1. Voice and Speech Data
                  </h4>
                  <p>
                    Voice queries processed through the Voice Mentor use secure audio streaming for real-time natural language comprehension. Audio files are not permanently stored without explicit consent.
                  </p>
                  <h4 className="font-bold font-poppins text-stone-900 dark:text-white text-sm pt-1">
                    2. Product Imagery and Catalogs
                  </h4>
                  <p>
                    Images uploaded to Image Studio and descriptions crafted in Product Studio remain your intellectual property. They are only exported to marketplaces (ONDC, Amazon, Meesho, Etsy) when you trigger an export.
                  </p>
                  <h4 className="font-bold font-poppins text-stone-900 dark:text-white text-sm pt-1">
                    3. Contact & Inquiries
                  </h4>
                  <p>
                    For privacy inquiries or data requests, write directly to our grievance desk at <span className="text-[#0F5132] dark:text-emerald-400 font-semibold">privacy@krivio.ai</span>.
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-200 dark:border-emerald-900/60 flex justify-end">
                  <button
                    onClick={() => setLegalModal(null)}
                    className="px-4 py-2 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-xl font-poppins text-xs font-semibold"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            )}

            {legalModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-emerald-900/60">
                  <FileText className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
                  <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">
                    Terms of Service
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-emerald-100/90 font-inter">
                  <p>
                    Welcome to KRIVIO AI. By utilizing our AI Business Mentor, Product Studio, and Image Studio services, you agree to these fair usage guidelines.
                  </p>
                  <h4 className="font-bold font-poppins text-stone-900 dark:text-white text-sm pt-1">
                    1. Mentoring Advisory Nature
                  </h4>
                  <p>
                    Recommendations provided by our AI Mentor regarding pricing, marketplace positioning, and government subsidies are intended for informational guidance. Final commercial decisions remain at the entrepreneur's discretion.
                  </p>
                  <h4 className="font-bold font-poppins text-stone-900 dark:text-white text-sm pt-1">
                    2. Authentic Craftsmanship
                  </h4>
                  <p>
                    KRIVIO AI is tailored to celebrate authentic Indian artisans, weavers, and rural producers. Users commit to listing genuine products and transparent descriptions for buyer trust.
                  </p>
                  <h4 className="font-bold font-poppins text-stone-900 dark:text-white text-sm pt-1">
                    3. Service Availability
                  </h4>
                  <p>
                    We continually optimize KRIVIO AI for rural network conditions (2G/3G/4G) with low-bandwidth voice models and offline-ready workflows.
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-200 dark:border-emerald-900/60 flex justify-end">
                  <button
                    onClick={() => setLegalModal(null)}
                    className="px-4 py-2 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-xl font-poppins text-xs font-semibold"
                  >
                    Accept & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

