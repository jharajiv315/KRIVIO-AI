import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  Package,
  Camera,
  Store,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Volume2,
  Star,
  Users,
  Award,
  Globe,
  HeartHandshake,
  Quote,
  TrendingUp,
  Zap,
  ChevronRight,
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
      const demoText = t('mentor.welcomeMessage');
      const utterance = new SpeechSynthesisUtterance(demoText);
      utterance.lang = currentLanguageConfig.speechCode || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setDemoPlaying(false);
      utterance.onerror = () => setDemoPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setDemoPlaying(false), 3000);
    }
  };

  // 3 Realistic Grassroots Success Stories
  const successStories = [
    {
      initials: 'SD',
      name: 'Sunita Devi',
      role: `${t('auth.roleArtisan')}, Bihar`,
      craft: 'Madhubani Handpainted Sarees',
      metric: '+300% Income Growth',
      metricDesc: 'Direct ONDC & Meesho Orders',
      quote:
        'KRIVIO AI spoke with me in simple Hindi and Maithili. It showed me how to price my sarees at ₹3,400 instead of ₹900 to town middlemen, and created digital catalog photos directly from my phone camera.',
      location: 'Madhubani, Bihar',
    },
    {
      initials: 'RP',
      name: 'Ramesh Prajapati',
      role: `${t('auth.roleSHG')}, Rajasthan`,
      craft: 'Terracotta Cookware & Pottery',
      metric: '₹1.85 Lakhs',
      metricDesc: 'First Quarter Digital Sales',
      quote:
        'Our 16-member self-help group had zero digital experience. The Voice Mentor guided us step-by-step through PM Vishwakarma scheme registration and generated Amazon listings with zero English needed.',
      location: 'Alwar, Rajasthan',
    },
    {
      initials: 'LB',
      name: 'Lakshmi Borah',
      role: `${t('auth.roleArtisan')}, Assam`,
      craft: 'Organic Eri Silk Handloom',
      metric: '8 States Reached',
      metricDesc: 'Eliminated 3 Layer Middlemen',
      quote:
        'The Image Studio took photos from my ₹7,000 Android phone and turned them into studio-lit commercial banners. High-end boutique buyers in Delhi and Bangalore now buy directly from my village loom.',
      location: 'Sualkuchi, Assam',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9F5] dark:bg-[#0B1911] text-[#1A1A1A] dark:text-[#E2F1E7] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#0F5132]/10 dark:border-emerald-900/30">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-[#0F5132]/12 via-[#2E7D32]/8 to-[#D4AF37]/5 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-24 right-10 w-72 h-72 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/5 blur-3xl pointer-events-none animate-glow -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Brand Tagline Badge with Shimmer */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950/90 text-[#0F5132] dark:text-emerald-300 text-xs font-semibold border border-[#0F5132]/20 dark:border-emerald-800 shadow-xs shimmer-badge">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="font-poppins">{t('landing.heroBadge')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F5132] dark:text-white leading-[1.15] font-poppins">
                {t('landing.heroTitle1')} <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F5132] via-[#2E7D32] to-[#D4AF37] dark:from-emerald-300 dark:via-emerald-400 dark:to-[#D4AF37]">
                  {t('landing.heroTitle2')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-700 dark:text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-inter leading-relaxed">
                {t('landing.heroSubtitle')}
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  id="btn-hero-start-journey"
                  onClick={handlePrimaryCTA}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#0F5132] to-[#176640] hover:from-[#0B3D26] hover:to-[#0F5132] text-white font-poppins font-semibold text-base rounded-xl shadow-lg shadow-[#0F5132]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
                >
                  <Mic className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  <span>{t('landing.ctaStartFree')}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="btn-hero-watch-demo"
                  onClick={playDemoAudio}
                  disabled={demoPlaying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-white dark:bg-emerald-950/60 hover:bg-stone-50 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-100 font-poppins font-semibold text-sm rounded-xl border border-stone-300 dark:border-emerald-800 transition-all shadow-xs hover:border-[#0F5132]/40 dark:hover:border-emerald-700 cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 text-[#0F5132] dark:text-emerald-400 ${demoPlaying ? 'animate-bounce text-[#D4AF37]' : ''}`} />
                  <span>{demoPlaying ? t('mentor.micListening') : t('mentor.micStart')}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-stone-200/80 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600 dark:text-emerald-200/80">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">{t('profile.securityVerified')}</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="font-medium">{t('product.marketplaceReady')}</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <HeartHandshake className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">100% Free for SHGs</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Interactive Teaser Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="relative bg-white dark:bg-[#13251B] rounded-2xl p-6 shadow-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 max-w-md mx-auto krivio-card-interactive">
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-emerald-900/40 mb-4">
                  <Logo variant="horizontal" size="xs" showTagline={false} />
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F5132] dark:text-emerald-300 bg-[#0F5132]/10 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {t('mentor.title')}
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-4 text-xs font-inter">
                  {/* User Speak */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#8B6E10] font-bold flex items-center justify-center shrink-0 text-xs ring-2 ring-[#D4AF37]/30">
                      A
                    </div>
                    <div className="bg-stone-100 dark:bg-emerald-900/40 p-3 rounded-2xl rounded-tl-xs text-stone-800 dark:text-emerald-100 shadow-xs">
                      <p className="font-semibold text-[11px] text-[#2E7D32] dark:text-emerald-300 mb-0.5 font-poppins">
                        {t('auth.roleArtisan')} (Madhubani)
                      </p>
                      "{t('mentor.prompt1')}"
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0F5132] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-md ring-2 ring-[#0F5132]/30">
                      K
                    </div>
                    <div className="bg-[#0F5132]/5 dark:bg-emerald-950/70 p-3.5 rounded-2xl rounded-tr-xs text-stone-800 dark:text-emerald-100 border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[11px] text-[#0F5132] dark:text-emerald-300 font-poppins">
                          KRIVIO AI Mentor
                        </span>
                        <span className="text-[10px] text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 font-medium bg-[#0F5132]/10 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                          <Volume2 className="w-3 h-3" /> {currentLanguageConfig.nativeName}
                        </span>
                      </div>
                      <p className="leading-relaxed text-xs">
                        "For authentic handpainted Madhubani silk, pricing at ₹2,800–₹3,200 yields 45% net margin on ONDC. I've drafted high-search keywords and photoshoot suggestions!"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-emerald-900/40">
                  <button
                    onClick={() => setCurrentTab('mentor')}
                    className="w-full py-3 px-4 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('dashboard.actionVoiceMentor')}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Highlights */}
      <section className="py-16 lg:py-24 bg-white dark:bg-[#0E2016] border-b border-[#0F5132]/10 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 text-xs font-bold uppercase tracking-wider font-poppins">
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              Tailored for Bharat
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              {t('landing.featuresTitle')}
            </p>
            <p className="text-sm sm:text-base text-stone-600 dark:text-emerald-200/80 font-inter">
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              onClick={() => setCurrentTab('mentor')}
              className="krivio-card-interactive p-8 rounded-2xl relative overflow-hidden cursor-pointer group"
            >
              <div className="absolute top-4 right-6 text-3xl font-black text-[#0F5132]/10 dark:text-emerald-400/10 font-poppins select-none">
                01
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('landing.featureMentorTitle')}
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter mb-4">
                {t('landing.featureMentorDesc')}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0F5132] dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                Explore Voice Mentor <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 2 */}
            <div
              onClick={() => setCurrentTab('images')}
              className="krivio-card-interactive p-8 rounded-2xl relative overflow-hidden cursor-pointer group"
            >
              <div className="absolute top-4 right-6 text-3xl font-black text-[#D4AF37]/20 dark:text-[#D4AF37]/15 font-poppins select-none">
                02
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('landing.featurePhotoTitle')}
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter mb-4">
                {t('landing.featurePhotoDesc')}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8B6E10] dark:text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                Launch Image Studio <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 3 */}
            <div
              onClick={() => setCurrentTab('marketplace')}
              className="krivio-card-interactive p-8 rounded-2xl relative overflow-hidden cursor-pointer group"
            >
              <div className="absolute top-4 right-6 text-3xl font-black text-[#2E7D32]/10 dark:text-emerald-400/10 font-poppins select-none">
                03
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('landing.featureMarketplaceTitle')}
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter mb-4">
                {t('landing.featureMarketplaceDesc')}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                View Marketplaces <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Studios Section with Ambient Background Tint */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-[#F8F9F5] via-stone-100/50 to-[#F8F9F5] dark:from-[#0B1911] dark:via-[#0E2217] dark:to-[#0B1911] border-b border-[#0F5132]/10 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 text-xs font-bold uppercase tracking-wider font-poppins">
              Complete Platform Ecosystem
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              {t('landing.howItWorksTitle')}
            </p>
            <p className="text-sm sm:text-base text-stone-600 dark:text-emerald-200/80 font-inter">
              Integrated business tools engineered specifically for voice and regional Indian contexts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Studio 1 */}
            <div
              onClick={() => setCurrentTab('mentor')}
              className="krivio-card-interactive group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5132] dark:text-emerald-400 bg-[#0F5132]/10 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md font-poppins">
                  Studio 01
                </span>
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.voiceMentor')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('landing.featureMentorDesc')}
              </p>
              <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                {t('mentor.title')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Studio 2 */}
            <div
              onClick={() => setCurrentTab('products')}
              className="krivio-card-interactive group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B6E10] dark:text-[#D4AF37] bg-[#D4AF37]/15 dark:bg-[#D4AF37]/20 px-2 py-0.5 rounded-md font-poppins">
                  Studio 02
                </span>
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.productStudio')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('product.subtitle')}
              </p>
              <span className="text-xs font-bold text-[#8B6E10] dark:text-[#D4AF37] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                {t('product.wizardBtn')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Studio 3 */}
            <div
              onClick={() => setCurrentTab('images')}
              className="krivio-card-interactive group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] dark:text-emerald-400 bg-[#2E7D32]/15 dark:bg-[#2E7D32]/20 px-2 py-0.5 rounded-md font-poppins">
                  Studio 03
                </span>
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.imageStudio')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('imageStudio.subtitle')}
              </p>
              <span className="text-xs font-bold text-[#2E7D32] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                {t('imageStudio.analyzeBtn')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Studio 4 */}
            <div
              onClick={() => setCurrentTab('marketplace')}
              className="krivio-card-interactive group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5132] dark:text-emerald-400 bg-[#0F5132]/10 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md font-poppins">
                  Studio 04
                </span>
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.marketplace')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('marketplace.subtitle')}
              </p>
              <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                {t('marketplace.applyNow')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Voices — Realistic Grassroots Success Stories */}
      <section className="py-16 lg:py-24 bg-[#0F5132] text-white relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider font-poppins border border-[#D4AF37]/30">
              <Award className="w-3.5 h-3.5" />
              Grassroots Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-poppins tracking-tight">
              Real Artisans, Real Growth Across India
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-inter">
              See how rural makers, weavers, and self-help groups are reaching national buyers with voice-first AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, idx) => (
              <div
                key={idx}
                className="bg-[#133C27]/90 backdrop-blur-xs p-7 rounded-2xl border border-emerald-600/40 space-y-5 flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all hover:shadow-xl group"
              >
                <div className="space-y-4">
                  {/* Top Row: Stars + Metric Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F3E5AB] text-[10px] font-bold font-poppins">
                      <TrendingUp className="w-3 h-3 text-[#D4AF37]" />
                      {story.metric}
                    </span>
                  </div>

                  {/* Quote text */}
                  <p className="text-xs text-emerald-50 leading-relaxed italic font-inter">
                    "{story.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-emerald-700/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0F5132] font-black flex items-center justify-center text-xs ring-2 ring-white/30 shrink-0 shadow-md">
                    {story.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold font-poppins text-white truncate">
                      {story.name}
                    </h4>
                    <p className="text-[11px] text-[#D4AF37] font-medium truncate">
                      {story.craft}
                    </p>
                    <p className="text-[10px] text-emerald-300/80 truncate">
                      {story.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-16 lg:py-24 bg-[#F8F9F5] dark:bg-[#0B1911]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 text-xs font-bold uppercase tracking-wider font-poppins">
              Fair & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              {t('pricing.modalTitle')}
            </h2>
            <p className="text-sm text-stone-600 dark:text-emerald-200/80 font-inter max-w-xl mx-auto">
              {t('pricing.modalSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="krivio-card-interactive bg-white dark:bg-[#13251B] p-7 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">
                    {t('pricing.freePlanTitle')}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-300/70 mt-0.5">
                    {t('pricing.freePlanPrice')}
                  </p>
                  <p className="text-3xl font-black font-poppins text-[#0F5132] dark:text-white mt-3">
                    ₹0 <span className="text-xs font-normal text-stone-500">/ forever free</span>
                  </p>
                </div>

                <ul className="space-y-3 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.freePlanFeature1')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.freePlanFeature2')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.freePlanFeature3')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.freePlanFeature4')}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handlePrimaryCTA}
                className="w-full py-3 bg-[#0F5132]/10 hover:bg-[#0F5132]/20 dark:bg-emerald-950 dark:hover:bg-emerald-900 border border-[#0F5132]/30 dark:border-emerald-700 text-[#0F5132] dark:text-emerald-200 font-poppins font-bold text-xs rounded-xl transition-all hover:shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{t('landing.ctaStartFree')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pro Plan */}
            <div className="krivio-card-interactive bg-white dark:bg-[#13251B] p-7 rounded-2xl border-2 border-[#0F5132] dark:border-emerald-500 space-y-6 relative shadow-xl flex flex-col justify-between">
              <div className="absolute -top-3.5 right-5 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full font-poppins shadow-xs">
                {t('common.recommended')}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">
                    {t('pricing.proPlanTitle')}
                  </h3>
                  <p className="text-xs text-[#2E7D32] dark:text-emerald-300 font-medium mt-0.5">
                    Ideal for scaling SHGs and weavers
                  </p>
                  <p className="text-3xl font-black font-poppins text-[#0F5132] dark:text-white mt-3">
                    ₹299 <span className="text-xs font-normal text-stone-500">/ month</span>
                  </p>
                </div>

                <ul className="space-y-3 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.proPlanFeature1')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.proPlanFeature2')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.proPlanFeature4')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>{t('pricing.proPlanFeature5')}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={openPricingModal}
                className="w-full py-3 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('pricing.upgradeBtn')}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-emerald-300/60 font-inter pt-2">
            No credit card required for free tier • Cancel anytime • 100% data ownership
          </p>
        </div>
      </section>
    </div>
  );
};


