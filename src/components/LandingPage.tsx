import React, { useState } from 'react';
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
  const { t, currentLanguageConfig, formatCurrency } = useI18n();
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

  return (
    <div className="min-h-screen bg-[#F8F9F5] dark:bg-[#0B1911] text-[#1A1A1A] dark:text-[#E2F1E7] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#0F5132]/10 dark:border-emerald-900/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-[#0F5132]/10 via-[#2E7D32]/5 to-transparent dark:from-emerald-950/40 dark:via-transparent dark:to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Brand Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-emerald-300 text-xs font-semibold border border-[#0F5132]/20 dark:border-emerald-800 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                <span>{t('landing.heroBadge')}</span>
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-semibold text-base rounded-xl shadow-lg shadow-[#0F5132]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Mic className="w-5 h-5 text-[#D4AF37]" />
                  <span>{t('landing.ctaStartFree')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  id="btn-hero-watch-demo"
                  onClick={playDemoAudio}
                  disabled={demoPlaying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-emerald-950/60 hover:bg-stone-50 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-100 font-poppins font-semibold text-sm rounded-xl border border-stone-300 dark:border-emerald-800 transition-all shadow-xs cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 text-[#0F5132] dark:text-emerald-400 ${demoPlaying ? 'animate-bounce' : ''}`} />
                  <span>{demoPlaying ? t('mentor.micListening') : t('mentor.micStart')}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-stone-200/80 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600 dark:text-emerald-200/80">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                  <span>{t('profile.securityVerified')}</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{t('product.marketplaceReady')}</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <HeartHandshake className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400 shrink-0" />
                  <span>{t('common.poweredBy')}</span>
                </div>
              </div>
            </div>

            {/* Right Visual Interactive Teaser Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white dark:bg-[#13251B] rounded-2xl p-6 shadow-xl border border-[#0F5132]/15 dark:border-emerald-800/60 max-w-md mx-auto">
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-emerald-900/40 mb-4">
                  <Logo variant="horizontal" size="xs" showTagline={false} />
                  <span className="text-[10px] font-semibold text-[#0F5132] dark:text-emerald-300 bg-[#0F5132]/10 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                    {t('mentor.title')}
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-4 text-xs font-inter">
                  {/* User Speak */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 text-[#8B6E10] font-bold flex items-center justify-center shrink-0 text-xs">
                      A
                    </div>
                    <div className="bg-stone-100 dark:bg-emerald-900/30 p-3 rounded-2xl rounded-tl-xs text-stone-800 dark:text-emerald-100">
                      <p className="font-semibold text-[11px] text-[#2E7D32] dark:text-emerald-300 mb-0.5">
                        {t('auth.roleArtisan')}
                      </p>
                      "{t('mentor.prompt1')}"
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0F5132] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                      K
                    </div>
                    <div className="bg-[#0F5132]/5 dark:bg-emerald-950/70 p-3 rounded-2xl rounded-tr-xs text-stone-800 dark:text-emerald-100 border border-[#0F5132]/15 dark:border-emerald-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] text-[#0F5132] dark:text-emerald-300">
                          {t('common.brand')}
                        </span>
                        <span className="text-[10px] text-[#0F5132] dark:text-emerald-400 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> {t('mentor.voiceLang')} ({currentLanguageConfig.nativeName})
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        {t('mentor.prompt1')} → {t('landing.featurePricingDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-emerald-900/40">
                  <button
                    onClick={() => setCurrentTab('mentor')}
                    className="w-full py-2.5 px-4 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('dashboard.actionVoiceMentor')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Highlights */}
      <section className="py-16 lg:py-24 bg-white dark:bg-[#0E2016]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-widest font-poppins">
              {t('landing.heroBadge')}
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              {t('landing.featuresTitle')}
            </p>
            <p className="text-sm sm:text-base text-stone-600 dark:text-emerald-200/80 font-inter">
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white">
                {t('landing.featureMentorTitle')}
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter">
                {t('landing.featureMentorDesc')}
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white">
                {t('landing.featurePhotoTitle')}
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter">
                {t('landing.featurePhotoDesc')}
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white">
                {t('landing.featureMarketplaceTitle')}
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter">
                {t('landing.featureMarketplaceDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Studios */}
      <section className="py-16 lg:py-24 border-t border-[#0F5132]/10 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-widest font-poppins">
              {t('landing.howItWorksSubtitle')}
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              {t('landing.howItWorksTitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Studio 1 */}
            <div
              onClick={() => setCurrentTab('mentor')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.voiceMentor')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('landing.featureMentorDesc')}
              </p>
              <span className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {t('mentor.title')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Studio 2 */}
            <div
              onClick={() => setCurrentTab('products')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.productStudio')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('product.subtitle')}
              </p>
              <span className="text-xs font-semibold text-[#8B6E10] dark:text-[#D4AF37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {t('product.wizardBtn')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Studio 3 */}
            <div
              onClick={() => setCurrentTab('images')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.imageStudio')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('imageStudio.subtitle')}
              </p>
              <span className="text-xs font-semibold text-[#2E7D32] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {t('imageStudio.analyzeBtn')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Studio 4 */}
            <div
              onClick={() => setCurrentTab('marketplace')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                {t('nav.marketplace')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                {t('marketplace.subtitle')}
              </p>
              <span className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {t('marketplace.applyNow')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Voices */}
      <section className="py-16 lg:py-24 bg-[#0F5132] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest font-poppins">
              {t('landing.testimonialsTitle')}
            </span>
            <h2 className="text-3xl font-bold font-poppins">
              {t('landing.heroTitle1')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#133C27] p-6 rounded-2xl border border-emerald-700/60 space-y-4">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed italic font-inter">
                "{t('mentor.prompt1')} — {t('mentor.welcomeMessage')}"
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0F5132] font-bold flex items-center justify-center text-xs">
                  SD
                </div>
                <div>
                  <h4 className="text-xs font-bold font-poppins text-white">Sunita Devi</h4>
                  <p className="text-[11px] text-emerald-300">{t('auth.roleArtisan')}, Bihar</p>
                </div>
              </div>
            </div>

            <div className="bg-[#133C27] p-6 rounded-2xl border border-emerald-700/60 space-y-4">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed italic font-inter">
                "{t('mentor.prompt2')}"
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0F5132] font-bold flex items-center justify-center text-xs">
                  RP
                </div>
                <div>
                  <h4 className="text-xs font-bold font-poppins text-white">Ramesh Prajapati</h4>
                  <p className="text-[11px] text-emerald-300">{t('auth.roleSHG')}, Rajasthan</p>
                </div>
              </div>
            </div>

            <div className="bg-[#133C27] p-6 rounded-2xl border border-emerald-700/60 space-y-4">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed italic font-inter">
                "{t('mentor.prompt3')}"
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0F5132] font-bold flex items-center justify-center text-xs">
                  AN
                </div>
                <div>
                  <h4 className="text-xs font-bold font-poppins text-white">Animesh Nandi</h4>
                  <p className="text-[11px] text-emerald-300">{t('auth.roleSHG')}, Assam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-16 lg:py-24 bg-[#F8F9F5] dark:bg-[#0B1911]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              {t('pricing.modalTitle')}
            </h2>
            <p className="text-sm text-stone-600 dark:text-emerald-200/80 font-inter">
              {t('pricing.modalSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-[#13251B] p-6 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-6">
              <div>
                <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">{t('pricing.freePlanTitle')}</h3>
                <p className="text-xs text-stone-500 dark:text-emerald-300/70">{t('pricing.freePlanPrice')}</p>
                <p className="text-2xl font-black font-poppins text-[#0F5132] dark:text-white mt-3">₹0 <span className="text-xs font-normal text-stone-500">/ forever</span></p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.freePlanFeature1')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.freePlanFeature2')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.freePlanFeature3')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.freePlanFeature4')}</li>
              </ul>

              <button
                onClick={handlePrimaryCTA}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-[#0F5132] dark:text-emerald-200 font-poppins font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {t('landing.ctaStartFree')}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#0F5132]/5 dark:bg-emerald-950/40 p-6 rounded-2xl border-2 border-[#0F5132] dark:border-emerald-500 space-y-6 relative shadow-lg">
              <div className="absolute -top-3 right-4 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-poppins">
                {t('common.recommended')}
              </div>
              <div>
                <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">{t('pricing.proPlanTitle')}</h3>
                <p className="text-xs text-[#2E7D32] dark:text-emerald-300">{t('pricing.proPlanFeature3')}</p>
                <p className="text-2xl font-black font-poppins text-[#0F5132] dark:text-white mt-3">₹299 <span className="text-xs font-normal text-stone-500">/ month</span></p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.proPlanFeature1')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.proPlanFeature2')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.proPlanFeature4')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> {t('pricing.proPlanFeature5')}</li>
              </ul>

              <button
                onClick={openPricingModal}
                className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {t('pricing.upgradeBtn')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


