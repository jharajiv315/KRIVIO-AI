import React, { useState, useRef, useEffect } from 'react';
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
  Calculator,
  TrendingUp,
  Coins,
  Palette,
  Wand2,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { voiceApi } from '../services/api';
import { Logo } from './Logo';
import { BeforeAfterSlider } from './common/BeforeAfterSlider';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentTab, openPricingModal }) => {
  const { user, openAuthModal } = useAuth();
  const { t, currentLanguageConfig } = useI18n();
  const [demoPlaying, setDemoPlaying] = useState(false);
  const demoAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (demoAudioRef.current) {
        demoAudioRef.current.pause();
        demoAudioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Hero interactive showcase state
  const [heroTab, setHeroTab] = useState<'studio' | 'mentor'>('studio');
  const [craftPreset, setCraftPreset] = useState<'pottery' | 'textile'>('pottery');

  // Interactive craft pricing calculator state
  const [calcMaterial, setCalcMaterial] = useState<number>(850);
  const [calcHours, setCalcHours] = useState<number>(14);
  const [calcWage, setCalcWage] = useState<number>(120);

  const calcLabor = calcHours * calcWage;
  const calcCogs = calcMaterial + calcLabor;
  const calcWholesale = Math.round(calcCogs * 1.3);
  const calcRetail = Math.round(calcCogs * 1.65);
  const middlemanOffer = Math.round(calcCogs * 0.68);
  const artisanGain = calcRetail - middlemanOffer;

  const craftClusters = [
    { city: 'Varanasi', state: 'Uttar Pradesh', craft: 'Pure Katan Silk Handloom', gi: 'GI Tag' },
    { city: 'Channapatna', state: 'Karnataka', craft: 'Lacquerware Wooden Toys', gi: 'GI Tag' },
    { city: 'Kutch', state: 'Gujarat', craft: 'Ajrakh Natural Dye Block Print', gi: 'GI Tag' },
    { city: 'Jaipur', state: 'Rajasthan', craft: 'Cobalt Blue Glazed Pottery', gi: 'GI Tag' },
    { city: 'Srinagar', state: 'Kashmir', craft: 'Hand-spun Pashmina & Sozni', gi: 'GI Tag' },
    { city: 'Madhubani', state: 'Bihar', craft: 'Mithila Folk Painting', gi: 'GI Tag' },
    { city: 'Bastar', state: 'Chhattisgarh', craft: 'Dhokra Lost-Wax Bell Metal', gi: 'GI Tag' },
    { city: 'Pochampally', state: 'Telangana', craft: 'Double Ikat Handloom', gi: 'GI Tag' },
    { city: 'Tanjore', state: 'Tamil Nadu', craft: '22k Gold Foil Sacred Art', gi: 'GI Tag' },
  ];

  const handlePrimaryCTA = () => {
    if (user) {
      setCurrentTab('products');
    } else {
      openAuthModal();
    }
  };

  const handleVoiceMentorCTA = () => {
    if (user) {
      setCurrentTab('mentor');
    } else {
      openAuthModal();
    }
  };

  const fallbackDemoSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguageConfig.speechCode || 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setDemoPlaying(false);
      utterance.onerror = () => setDemoPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setDemoPlaying(false), 2500);
    }
  };

  const playDemoAudio = () => {
    if (demoPlaying) {
      if (demoAudioRef.current) {
        demoAudioRef.current.pause();
        demoAudioRef.current.currentTime = 0;
        demoAudioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setDemoPlaying(false);
      return;
    }

    setDemoPlaying(true);

    const getRegionalDemoText = () => {
      const code = currentLanguageConfig.code as string;
      if (code === 'hi') {
        return 'नमस्ते! मैं आपका कृवियो बिज़नेस मेंटर हूँ। आपके हस्तशिल्प उत्पाद की सही कीमत और ऑनलाइन बिक्री में मैं आपकी पूरी मदद करूँगा।';
      }
      if (code === 'mr') {
        return 'नमस्कार! मी तुमचा कृवियो व्यवसाय मार्गदर्शक आहे. आपल्या हस्तकला उत्पादनाची योग्य किंमत आणि ऑनलाइन विक्रीसाठी मी मदत करू शकतो.';
      }
      if (code === 'ta') {
        return 'வணக்கம்! நான் உங்கள் கிரிவியோ வணிக வழிகாட்டி. உங்கள் கைவினைப் பொருட்களின் நியாயமான விலை மற்றும் ஆன்லைன் விற்பனைக்கு நான் உதவுவேன்.';
      }
      if (code === 'te') {
        return 'నమస్కారం! నేను మీ క్రివియో వ్యాపార గురువుని. మీ చేతివృత్తుల ఉత్పత్తుల ధర మరియు ఆన్‌లైన్ అమ్మకాలలో నేను మీకు సహాయం చేస్తాను.';
      }
      if (code === 'bn') {
        return 'নমস্কার! আমি আপনার ক্রিভিও বিজনেস মেন্টর। আপনার হস্তশিল্প পণ্যের সঠিক দাম ও অনলাইন বিক্রিতে আমি সাহায্য করব।';
      }
      if (code === 'gu') {
        return 'નમસ્તે! હું તમારો ક્રિવિયો બિઝનેસ મેન્ટર છું. તમારા હસ્તકલા ઉત્પાદનોની સાચી કિંમત અને ઓનલાઇન વેચાણમાં મદદ કરીશ.';
      }
      if (code === 'as') {
        return 'নমস্কাৰ! মই আপোনাৰ ক্ৰিভিঅ’ ব্যৱসায় মেণ্টৰ। হস্তশিল্পৰ সঠিক মূল্য আৰু ডিজিটেল বিক্ৰীৰ বাবে সহায় কৰিম।';
      }
      return 'Namaste! I am your KRIVIO business mentor. I can help you calculate fair craft pricing, optimize photos, and sell on ONDC and marketplaces.';
    };

    const demoText = getRegionalDemoText();

    try {
      const ttsUrl = voiceApi.getTtsAudioUrl(demoText, currentLanguageConfig.code);
      const audio = new Audio(ttsUrl);
      demoAudioRef.current = audio;

      audio.onended = () => {
        setDemoPlaying(false);
        demoAudioRef.current = null;
      };

      audio.onerror = () => {
        fallbackDemoSpeech(demoText);
      };

      audio.play().catch(() => {
        fallbackDemoSpeech(demoText);
      });
    } catch {
      fallbackDemoSpeech(demoText);
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
      desc: 'Provide your craft name and materials. KRIVIO AI generates authentic craft stories, standard HSN codes, dimensions, and marketplace keywords.',
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
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0F5132] dark:text-white leading-[1.15] font-editorial">
                Empowering India's Artisans with{' '}
                <span className="italic text-[#0F5132] dark:text-emerald-300 underline decoration-[#D4AF37] decoration-4 underline-offset-8">
                  Voice-Guided Commerce
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-poppins font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer hover-shimmer relative overflow-hidden"
                >
                  <Package className="w-4 h-4 text-[#D4AF37]" />
                  <span>Prepare Your First Product</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  id="btn-hero-try-mentor"
                  onClick={handleVoiceMentorCTA}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-[#13251B] hover:bg-stone-50 dark:hover:bg-emerald-900/30 text-stone-800 dark:text-emerald-100 font-poppins font-semibold text-xs rounded-xl border border-stone-200 dark:border-emerald-800/60 shadow-2xs transition-all cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                  <span>Try Voice AI Mentor</span>
                </button>

                <button
                  id="btn-hero-watch-demo"
                  onClick={playDemoAudio}
                  disabled={demoPlaying}
                  title="Hear Voice Mentor Sample Audio"
                  aria-label="Hear Voice Mentor Sample Audio"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-3.5 bg-stone-100 dark:bg-emerald-950/60 hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-700 dark:text-emerald-200 font-poppins font-medium text-xs rounded-xl transition-all cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 text-[#0F5132] dark:text-emerald-400 ${demoPlaying ? 'animate-pulse text-[#D4AF37]' : ''}`} />
                  <span>{demoPlaying ? 'Speaking Sample...' : 'Hear Audio'}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-emerald-200/80">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">Artisan Data Ownership</span>
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

            {/* Right Visual: Interactive Craft Showcase & Studio Preview */}
            <div className="lg:col-span-5">
              <div className="krivio-card-specular bg-white dark:bg-[#13251B] rounded-3xl p-4 sm:p-5 shadow-xl border border-[#0F5132]/15 dark:border-emerald-800/60 max-w-md mx-auto space-y-4">
                {/* Dual Mode Switcher Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
                  <div className="flex items-center p-1 bg-stone-100 dark:bg-[#0E2016] rounded-xl border border-stone-200/60 dark:border-emerald-900/40">
                    <button
                      onClick={() => setHeroTab('studio')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-poppins transition-all cursor-pointer ${
                        heroTab === 'studio'
                          ? 'bg-[#0F5132] text-white shadow-xs'
                          : 'text-stone-600 dark:text-emerald-200 hover:text-stone-900'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Studio Quality</span>
                    </button>
                    <button
                      onClick={() => setHeroTab('mentor')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-poppins transition-all cursor-pointer ${
                        heroTab === 'mentor'
                          ? 'bg-[#0F5132] text-white shadow-xs'
                          : 'text-stone-600 dark:text-emerald-200 hover:text-stone-900'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Voice Mentor</span>
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F5132] dark:text-emerald-300 bg-[#0F5132]/10 dark:bg-emerald-950 px-2.5 py-1 rounded-full font-poppins">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive
                  </span>
                </div>

                {heroTab === 'studio' ? (
                  <div className="space-y-3">
                    {/* Preset Switcher */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-stone-500 dark:text-emerald-300/70 font-poppins">
                        Drag handle to wipe:
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setCraftPreset('pottery')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold font-poppins transition-all cursor-pointer ${
                            craftPreset === 'pottery'
                              ? 'bg-[#0F5132]/15 text-[#0F5132] dark:bg-emerald-900/60 dark:text-emerald-200 border border-[#0F5132]/30'
                              : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-emerald-950'
                          }`}
                        >
                          Pottery
                        </button>
                        <button
                          onClick={() => setCraftPreset('textile')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold font-poppins transition-all cursor-pointer ${
                            craftPreset === 'textile'
                              ? 'bg-[#0F5132]/15 text-[#0F5132] dark:bg-emerald-900/60 dark:text-emerald-200 border border-[#0F5132]/30'
                              : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-emerald-950'
                          }`}
                        >
                          Handloom Saree
                        </button>
                      </div>
                    </div>

                    {/* Interactive 60fps Wipe Slider */}
                    <BeforeAfterSlider
                      beforeImage={
                        craftPreset === 'pottery'
                          ? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
                          : 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80'
                      }
                      afterImage={
                        craftPreset === 'pottery'
                          ? 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
                          : 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
                      }
                      beforeLabel="Workshop Phone Photo"
                      afterLabel="Amazon/ONDC Studio Standard"
                      aspectRatioClass="aspect-4/3"
                    />

                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#0E2016] border border-stone-200/60 dark:border-emerald-900/40 text-[11px] text-stone-600 dark:text-emerald-200/80 font-inter flex items-center justify-between">
                      <span>✓ Studio lighting normalization</span>
                      <span className="font-semibold text-[#0F5132] dark:text-emerald-300">Amazon & ONDC Ready</span>
                    </div>

                    <button
                      onClick={() => setCurrentTab('images')}
                      className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-poppins font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover-shimmer shadow-xs transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Launch Image Studio on Your Photos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                          <p className="leading-relaxed text-xs break-words">
                            "For pure silk with hand-woven Zari, standard raw material cost is ~₹1,200 and weaving labor is ~₹800. Adding 40% artisan margin and platform fee yields a retail price of ₹3,250. This protects your craftsmanship and remains competitive with metro boutiques."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Primary Trigger */}
                    <button
                      onClick={() => setCurrentTab('mentor')}
                      className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-poppins font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover-shimmer shadow-xs transition-all cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('dashboard.actionVoiceMentor') || 'Open Voice Mentor'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Craft Clusters Infinite Marquee */}
      <div className="relative py-3.5 bg-stone-100/90 dark:bg-[#08150D] border-b border-[#0F5132]/10 dark:border-emerald-900/40 overflow-hidden select-none">
        <div className="animate-marquee items-center gap-5 text-xs font-poppins">
          {[...craftClusters, ...craftClusters].map((cluster, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 shadow-2xs whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="font-bold text-[#0F5132] dark:text-emerald-300">{cluster.city}, {cluster.state}</span>
              <span className="text-stone-300 dark:text-emerald-500/40">•</span>
              <span className="text-stone-700 dark:text-emerald-100/90 text-[11px]">{cluster.craft}</span>
              <span className="text-[9px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded">
                {cluster.gi}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Real Platform Capabilities */}
      <section id="product" className="py-14 lg:py-20 bg-white dark:bg-[#0E2016] border-b border-[#0F5132]/10 dark:border-emerald-900/30 scroll-mt-20">
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-14 lg:py-20 bg-[#F8F9F5] dark:bg-[#0B1911] border-b border-[#0F5132]/10 dark:border-emerald-900/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-wider font-poppins">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white font-poppins">
              From Local Hands to Global Markets in 3 Steps
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 font-inter">
              Voice-first simplicity tailored for artisans, weavers, and self-help groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#13251B] p-6 sm:p-7 rounded-2xl border border-stone-200/80 dark:border-emerald-800/60 shadow-2xs space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#0F5132] text-white flex items-center justify-center font-bold text-base font-poppins shadow-xs">
                  01
                </div>
                <h3 className="text-lg font-bold font-poppins text-stone-900 dark:text-white">
                  Speak in Your Native Language
                </h3>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                  Describe your craft, materials, and creation time by voice in Hindi, Marathi, Tamil, Bengali, or 6 other Indian languages, or upload workshop phone photos.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-emerald-900/40 text-[11px] font-semibold text-[#0F5132] dark:text-emerald-300 font-poppins flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" />
                <span>Voice-guided with optional typing</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#13251B] p-6 sm:p-7 rounded-2xl border border-stone-200/80 dark:border-emerald-800/60 shadow-2xs space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#0F5132] text-white flex items-center justify-center font-bold text-base font-poppins shadow-xs">
                  02
                </div>
                <h3 className="text-lg font-bold font-poppins text-stone-900 dark:text-white">
                  AI Calculates Fair Prices & Story
                </h3>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                  KRIVIO AI calculates your estimated Cost of Goods Sold (COGS), guides fair artisan wages, suggests HSN classifications, and writes an authentic craft story for buyers.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-emerald-900/40 text-[11px] font-semibold text-[#0F5132] dark:text-emerald-300 font-poppins flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Arithmetic margin protection</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#13251B] p-6 sm:p-7 rounded-2xl border border-stone-200/80 dark:border-emerald-800/60 shadow-2xs space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#0F5132] text-white flex items-center justify-center font-bold text-base font-poppins shadow-xs">
                  03
                </div>
                <h3 className="text-lg font-bold font-poppins text-stone-900 dark:text-white">
                  Sell on ONDC, Amazon & WhatsApp
                </h3>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                  Export ready catalog feeds directly to ONDC Beckn networks and Amazon Karigar, or receive direct customer inquiries on your WhatsApp with 0% middleman deduction.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-emerald-900/40 text-[11px] font-semibold text-[#0F5132] dark:text-emerald-300 font-poppins flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Direct customer connection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Fair Pricing & Margin Protection Calculator */}
      <section id="calculator" className="py-14 lg:py-20 bg-stone-50/70 dark:bg-[#07130C] border-b border-[#0F5132]/10 dark:border-emerald-900/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-poppins flex items-center justify-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Transparent Economics
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal font-editorial text-stone-900 dark:text-white">
              Fair Artisan Pricing & Margin Calculator
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 font-inter">
              Calculate genuine material and labor costs. See how direct digital selling protects your margins compared to traditional middleman exploitation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Input Panel */}
            <div className="lg:col-span-7 bg-white dark:bg-[#13251B] p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-emerald-800/60 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-emerald-900/40">
                <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#D4AF37]" />
                  <span>Input Crafting Realities</span>
                </h3>
                <span className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 font-inter bg-[#0F5132]/10 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                  Live Calculator
                </span>
              </div>

              {/* Slider 1: Material Cost */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-poppins">
                  <label htmlFor="calc-material-slider" className="font-semibold text-stone-700 dark:text-emerald-200">
                    Raw Material Cost (Clay, Silk, Brass, Dyes)
                  </label>
                  <span className="font-bold text-[#0F5132] dark:text-emerald-400 tabular-nums text-sm">
                    ₹{calcMaterial.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  id="calc-material-slider"
                  type="range"
                  min="200"
                  max="4000"
                  step="50"
                  value={calcMaterial}
                  onChange={(e) => setCalcMaterial(Number(e.target.value))}
                  aria-label="Raw Material Cost in Rupees"
                  className="w-full accent-[#0F5132] dark:accent-[#34D399] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-inter">
                  <span>₹200 (Earthenware / Jute)</span>
                  <span>₹4,000 (Pure Silk / Silver Zari)</span>
                </div>
              </div>

              {/* Slider 2: Crafting Hours */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-poppins">
                  <label htmlFor="calc-hours-slider" className="font-semibold text-stone-700 dark:text-emerald-200">
                    Dedicated Crafting Time
                  </label>
                  <span className="font-bold text-[#0F5132] dark:text-emerald-400 tabular-nums text-sm">
                    {calcHours} Hours
                  </span>
                </div>
                <input
                  id="calc-hours-slider"
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={calcHours}
                  onChange={(e) => setCalcHours(Number(e.target.value))}
                  aria-label="Dedicated Crafting Time in Hours"
                  className="w-full accent-[#0F5132] dark:accent-[#34D399] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-inter">
                  <span>2 hrs (Quick Item)</span>
                  <span>40 hrs (Masterpiece Weave)</span>
                </div>
              </div>

              {/* Slider 3: Hourly Wage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-poppins">
                  <label htmlFor="calc-wage-slider" className="font-semibold text-stone-700 dark:text-emerald-200">
                    Artisan Fair Hourly Wage
                  </label>
                  <span className="font-bold text-[#0F5132] dark:text-emerald-400 tabular-nums text-sm">
                    ₹{calcWage}/hr
                  </span>
                </div>
                <input
                  id="calc-wage-slider"
                  type="range"
                  min="60"
                  max="250"
                  step="10"
                  value={calcWage}
                  onChange={(e) => setCalcWage(Number(e.target.value))}
                  aria-label="Artisan Fair Hourly Wage in Rupees per hour"
                  className="w-full accent-[#0F5132] dark:accent-[#34D399] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-inter">
                  <span>₹60/hr (Base wage)</span>
                  <span>₹250/hr (Master Craftsman)</span>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="lg:col-span-5 krivio-card-specular bg-white dark:bg-[#13251B] p-6 sm:p-7 rounded-3xl border border-stone-200 dark:border-emerald-800/60 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-poppins">
                  Value Breakdown
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Zero Middleman Loss
                </span>
              </div>

              <div className="space-y-2.5 font-inter text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-emerald-900/30">
                  <span className="text-stone-500 dark:text-emerald-300/70">Raw Material:</span>
                  <span className="font-semibold text-stone-800 dark:text-white tabular-nums">₹{calcMaterial.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-emerald-900/30">
                  <span className="text-stone-500 dark:text-emerald-300/70">Fair Artisan Labor ({calcHours}h × ₹{calcWage}):</span>
                  <span className="font-semibold text-stone-800 dark:text-white tabular-nums">₹{calcLabor.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-emerald-900/30 font-bold">
                  <span className="text-stone-700 dark:text-emerald-200">Total True COGS:</span>
                  <span className="text-stone-900 dark:text-white tabular-nums">₹{calcCogs.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-emerald-900/30">
                  <span className="text-stone-500 dark:text-emerald-300/70">Recommended B2B Wholesale:</span>
                  <span className="font-semibold text-stone-800 dark:text-white tabular-nums">₹{calcWholesale.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Comparison Box */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 dark:text-stone-400">Traditional Trader Payout:</span>
                  <span className="font-bold text-red-600 dark:text-red-400 line-through tabular-nums">~₹{middlemanOffer.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-poppins font-bold pt-1 border-t border-stone-200/60 dark:border-emerald-900/40">
                  <span className="text-[#0F5132] dark:text-emerald-400">Direct Retail / ONDC Price:</span>
                  <span className="text-xl text-[#0F5132] dark:text-emerald-300 tabular-nums font-black">₹{calcRetail.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-center">
                  <p className="text-xs font-bold text-[#0F5132] dark:text-emerald-300 font-poppins flex items-center justify-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Artisan Gains +₹{artisanGain.toLocaleString('en-IN')} More Per Piece
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-emerald-400/80 font-inter">
                    100% retained by your workshop on ONDC / Direct channels
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('products')}
                className="w-full py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-poppins font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover-shimmer shadow-md transition-all cursor-pointer"
              >
                <span>Price & List Your Craft with KRIVIO</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* For Artisans Section */}
      <section id="for-artisans" className="py-14 lg:py-20 bg-white dark:bg-[#0E2016] border-b border-[#0F5132]/10 dark:border-emerald-900/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-wider font-poppins">
                For Artisans & SHGs
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-poppins text-stone-900 dark:text-white leading-tight">
                Built For Grassroots Makers, Not Tech Experts
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                Traditional artisans have spent generations perfecting their crafts. KRIVIO AI takes care of the digital commerce complexity so you keep 100% of your earnings.
              </p>
              <div className="pt-2">
                <button
                  onClick={handlePrimaryCTA}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold font-poppins rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <span>Start Your Artisan Journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-poppins text-stone-900 dark:text-white">
                  10+ Regional Languages
                </h4>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                  Speaks your dialect natively. Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, and Assamese fully supported.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-poppins text-stone-900 dark:text-white">
                  Fair Pricing Formulas
                </h4>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                  Never get exploited by city middlemen. Calculate hourly labor and wholesale markups so your craft remains profitable.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-poppins text-stone-900 dark:text-white">
                  Government Subsidies
                </h4>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                  Direct eligibility guides for PM Vishwakarma (₹15,000 tool grants & 5% interest loans), PMEGP, and SFURTI clusters.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold font-poppins text-stone-900 dark:text-white">
                  Complete Data Ownership
                </h4>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                  Your craft motifs, customer data, and catalog records are owned solely by your artisan account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest, Clear Pricing Section */}
      <section id="pricing" className="py-14 lg:py-20 bg-[#F8F9F5] dark:bg-[#0B1911] scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-wider font-poppins">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white font-poppins">
              Clear Pricing for Every Scale of Enterprise
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 font-inter max-w-lg mx-auto">
              Prepaid 30-day access with clear allowances and predictable manual renewal. No hidden recurring charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left max-w-4xl mx-auto pt-4">
            {/* Free Plan */}
            <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white">
                    Artisan Free
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-300/70 mt-0.5">
                    For individual creators beginning their journey
                  </p>
                  <p className="text-2xl font-bold font-poppins text-stone-900 dark:text-white mt-2">
                    ₹0 <span className="text-xs font-normal text-stone-400">/ 30-day cycle</span>
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Up to 5 stored products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>10 AI text & mentor requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Studio composition canvas tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Basic catalogue export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Quotation trial (2 quotes)</span>
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
            <div className="bg-[#0F5132] text-white p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37] space-y-5 relative shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold font-poppins text-white">
                      Artisan Pro
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D4AF37] text-stone-900 rounded font-poppins uppercase">
                      Pass
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                    For artisans selling and cataloging regularly
                  </p>
                  <p className="text-2xl font-bold font-poppins text-[#D4AF37] mt-2">
                    ₹299 <span className="text-xs font-normal text-emerald-100/70 font-inter">/ 30-day pass</span>
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-emerald-100/90 font-inter">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Prepare up to 100 products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>75 AI text & mentor requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>5 paid AI image generations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>B2B Quotations & PDF invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Destination exports (ONDC, Amazon)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={openPricingModal}
                className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#C29F2B] text-stone-950 font-poppins font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Choose Artisan Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SHG Growth Plan */}
            <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white">
                    SHG Growth
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-300/70 mt-0.5">
                    For collectives managing products together
                  </p>
                  <p className="text-2xl font-bold font-poppins text-stone-900 dark:text-white mt-2">
                    ₹999 <span className="text-xs font-normal text-stone-400">/ proposed pass</span>
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Up to 3 authorized member seats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>300 organization-owned products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>250 shared AI text requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>20 shared AI image generations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                    <span>Assisted collective onboarding</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={openPricingModal}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-stone-800 dark:text-emerald-200 font-poppins font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Enquire Group Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-emerald-300/70 font-inter">
            No credit card needed to begin • 100% artisan data ownership • All paid passes renew manually
          </p>
        </div>
      </section>
    </div>
  );
};
