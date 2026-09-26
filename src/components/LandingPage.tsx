import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  Package,
  Camera,
  Store,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  Award,
  Globe,
  HeartHandshake,
  Zap,
  FileSpreadsheet,
  Landmark,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { Logo } from './Logo';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentTab, openPricingModal }) => {
  const { user, openAuthModal } = useAuth();
  const { t, currentLanguageConfig } = useI18n();
  const [demoPlaying, setDemoPlaying] = useState(false);

  const handlePrimaryCTA = () => {
    if (user) {
      setCurrentTab('mentor');
    } else {
      openAuthModal();
    }
  };

  const playDemoAudio = () => {
    setDemoPlaying(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const demoText = t('mentor.welcomeMessage') || 'Namaste! Main aapka KRIVIO business mentor hoon. Aapke hastakala utpaad ki sahi keemat aur digital listing mein main aapki madad kar sakta hoon.';
      const utterance = new SpeechSynthesisUtterance(demoText);
      utterance.lang = currentLanguageConfig.speechCode || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setDemoPlaying(false);
      utterance.onerror = () => setDemoPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setDemoPlaying(false), 2500);
    }
  };

  // Truthful platform pillars grounded in actual codebase features
  const platformPillars = [
    {
      icon: Mic,
      title: 'Voice-First Regional Intelligence',
      desc: 'Speak naturally in Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, or English. KRIVIO AI listens, understands craft terminology, and replies by voice.',
      actionTab: 'mentor',
      actionText: 'Try Voice Mentor',
    },
    {
      icon: Package,
      title: 'Input-Driven Product Studio',
      desc: 'Provide your craft name and materials. Gemini AI generates authentic craft stories, standard HSN codes, dimensions, and marketplace keywords.',
      actionTab: 'products',
      actionText: 'Explore Product Studio',
    },
    {
      icon: Camera,
      title: 'Phone Photo Enhancement',
      desc: 'Clean up mobile photos taken in village workshops. Inspect resolution, lighting, and prepare clean product backdrops for e-commerce standards.',
      actionTab: 'images',
      actionText: 'Launch Image Studio',
    },
    {
      icon: FileSpreadsheet,
      title: 'B2B Wholesale Quotations',
      desc: 'Generate professional downloadable PDF quotations with tiered wholesale pricing, GST calculations, and custom buyer payment terms.',
      actionTab: 'marketplace',
      actionText: 'View B2B Quotations',
    },
    {
      icon: Store,
      title: 'ONDC & Marketplace Exports',
      desc: 'Export your catalog formatted directly for Beckn / ONDC protocols, Amazon flat files, Meesho feeds, and Flipkart inventory spreadsheets.',
      actionTab: 'marketplace',
      actionText: 'See Export Formats',
    },
    {
      icon: Landmark,
      title: 'Verified Government Schemes',
      desc: 'Step-by-step guidance on PM Vishwakarma, PMEGP, and SFURTI artisan clusters with zero complex paperwork or agent commissions.',
      actionTab: 'schemes',
      actionText: 'Check Eligibility',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9F5] dark:bg-[#0B1911] text-[#1A1A1A] dark:text-[#E2F1E7] transition-colors font-inter">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#0F5132]/10 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-emerald-300 text-xs font-semibold border border-[#0F5132]/20 dark:border-emerald-800/80">
                <BadgeCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                <span className="font-poppins">{t('landing.heroBadge') || 'Vocal for Local • Digital Business Mentor'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F5132] dark:text-white leading-[1.2] font-poppins">
                {t('landing.heroTitle1')}{' '}
                <span className="text-[#0F5132] dark:text-emerald-400 underline decoration-[#D4AF37] decoration-4 underline-offset-8">
                  {t('landing.heroTitle2')}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-700 dark:text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-inter leading-relaxed">
                {t('landing.heroSubtitle') || 'Empowering rural artisans, weavers, and self-help groups with voice-guided business intelligence. Calculate fair prices, create studio listings, and reach national buyers with zero middlemen.'}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  id="btn-hero-start-journey"
                  onClick={handlePrimaryCTA}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-poppins font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('landing.ctaStartFree') || 'Start Voice Mentor Free'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  id="btn-hero-watch-demo"
                  onClick={playDemoAudio}
                  disabled={demoPlaying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-[#13251B] hover:bg-stone-50 dark:hover:bg-emerald-900/30 text-stone-800 dark:text-emerald-100 font-poppins font-semibold text-xs rounded-xl border border-stone-200 dark:border-emerald-800/60 shadow-2xs transition-all cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 text-[#0F5132] dark:text-emerald-400 ${demoPlaying ? 'animate-pulse text-[#D4AF37]' : ''}`} />
                  <span>{demoPlaying ? t('mentor.micListening') || 'Speaking Sample...' : 'Hear Voice Mentor Sample'}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-emerald-200/80">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">100% Data Privacy</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Award className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">ONDC & GeM Ready</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <HeartHandshake className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">Free Tier for Grassroots SHGs</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Interactive Voice Mentor Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[#13251B] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#0F5132]/15 dark:border-emerald-800/60 max-w-md mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
                  <Logo variant="horizontal" size="xs" showTagline={false} />
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F5132] dark:text-emerald-300 bg-[#0F5132]/10 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full font-poppins">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Live Voice Interface
                  </span>
                </div>

                {/* Practical Sample Exchange */}
                <div className="space-y-3 text-xs font-inter">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 text-[#8B6E10] font-bold flex items-center justify-center shrink-0 text-xs font-poppins">
                      A
                    </div>
                    <div className="bg-[#F8F9F5] dark:bg-[#0E2016] p-3 rounded-2xl rounded-tl-xs text-stone-800 dark:text-emerald-100 border border-stone-100 dark:border-emerald-900/30">
                      <p className="font-semibold text-[10px] text-[#0F5132] dark:text-emerald-300 mb-0.5 font-poppins">
                        Artisan (Varanasi, UP)
                      </p>
                      "How should I price a pure silk Banarasi dupatta with Zari border so I make a fair profit on ONDC?"
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0F5132] text-white font-bold flex items-center justify-center shrink-0 text-xs font-poppins">
                      K
                    </div>
                    <div className="bg-[#0F5132]/5 dark:bg-emerald-950/60 p-3 rounded-2xl rounded-tr-xs text-stone-800 dark:text-emerald-100 border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-[#0F5132] dark:text-emerald-300 font-poppins">
                          KRIVIO AI Mentor
                        </span>
                        <span className="text-[10px] text-[#0F5132] dark:text-emerald-400 font-medium">
                          Hindi / English Voice
                        </span>
                      </div>
                      <p className="leading-relaxed text-xs">
                        "For pure silk with hand-woven Zari, standard raw material cost is ~₹1,200 and weaving labor is ~₹800. Adding 40% artisan margin and platform fee yields a retail price of ₹3,250. This protects your craftsmanship and remains competitive with metro boutiques."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Trigger */}
                <button
                  onClick={() => setCurrentTab('mentor')}
                  className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-poppins font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('dashboard.actionVoiceMentor') || 'Open Voice Mentor'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Real Platform Capabilities */}
      <section className="py-14 lg:py-20 bg-white dark:bg-[#0E2016] border-b border-[#0F5132]/10 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-wider font-poppins">
              Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white font-poppins">
              Everything Needed to Run a Digital Craft Enterprise
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 font-inter">
              No complex software or English fluency required. Designed from the ground up for grassroots producers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentTab(pillar.actionTab)}
                  className="p-6 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 flex flex-col justify-between hover:border-[#0F5132] dark:hover:border-emerald-400 transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-stone-200/60 dark:border-emerald-900/40">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5132] dark:text-emerald-400 group-hover:translate-x-1 transition-transform font-poppins">
                      <span>{pillar.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Honest, Clear Pricing Section */}
      <section className="py-14 lg:py-20 bg-[#F8F9F5] dark:bg-[#0B1911]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-wider font-poppins">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white font-poppins">
              Fair, Transparent Pricing for Every Scale
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 font-inter max-w-lg mx-auto">
              Start free forever. Upgrade to Pro only when you need bulk catalog exports and multi-platform synchronizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto pt-4">
            {/* Free Plan */}
            <div className="bg-white dark:bg-[#13251B] p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-6 flex flex-col justify-between shadow-2xs">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white">
                    {t('pricing.freePlanTitle') || 'Artisan Free'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-300/70 mt-0.5">
                    For individual rural creators and weavers
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold font-poppins text-stone-900 dark:text-white mt-2">
                    ₹0 <span className="text-xs font-normal text-stone-500">/ forever</span>
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Voice Mentor in 10+ Indian Languages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Catalog Creation up to 10 Products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Fair Pricing & Margin Calculator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Government Schemes Eligibility Checker</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handlePrimaryCTA}
                className="w-full py-2.5 bg-[#0F5132]/10 hover:bg-[#0F5132]/20 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-[#0F5132] dark:text-emerald-200 font-poppins font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-[#13251B] p-6 sm:p-7 rounded-2xl border-2 border-[#0F5132] dark:border-emerald-500 space-y-6 relative shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white">
                      {t('pricing.proPlanTitle') || 'SHG & Enterprise Pro'}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D4AF37] text-stone-900 rounded font-poppins">
                      Pro
                    </span>
                  </div>
                  <p className="text-xs text-[#0F5132] dark:text-emerald-300 font-medium mt-0.5">
                    For cooperatives, SHGs, and growing clusters
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold font-poppins text-[#0F5132] dark:text-white mt-2">
                    ₹299 <span className="text-xs font-normal text-stone-500">/ month</span>
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Unlimited Products & Catalog Exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>High-Resolution B2B PDF Quotations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>ONDC Beckn, Amazon, & Meesho Feeds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Priority Voice AI Processing Quotas</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={openPricingModal}
                className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-poppins font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-emerald-300/70 font-inter">
            No credit card needed to begin • 100% artisan data ownership • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};
