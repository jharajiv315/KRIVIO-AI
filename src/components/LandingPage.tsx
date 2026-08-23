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
  TrendingUp,
  Volume2,
  Star,
  Users,
  Award,
  Globe,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentTab, openPricingModal }) => {
  const { user, openAuthModal } = useAuth();
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
      const utterance = new SpeechSynthesisUtterance(
        'Namaste! Welcome to KRIVIO AI, your dedicated AI Business Mentor for Rural Entrepreneurs. From local hands to global markets, I help you price your crafts, fix product photography, and sell on ONDC.'
      );
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
                <span>AI Business Mentor for Rural Entrepreneurs</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F5132] dark:text-white leading-[1.12] font-poppins">
                AI Business Mentor for <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F5132] via-[#2E7D32] to-[#D4AF37] dark:from-emerald-300 dark:via-emerald-400 dark:to-[#D4AF37]">
                  Rural Entrepreneurs
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-700 dark:text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-inter leading-relaxed">
                KRIVIO AI empowers artisans, Self-Help Groups (SHGs), weavers, potters, and rural business owners. Speak your questions naturally in regional languages, auto-calculate fair product pricing, generate e-commerce stories, and list your products on ONDC.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  id="btn-hero-start-journey"
                  onClick={handlePrimaryCTA}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-semibold text-base rounded-xl shadow-lg shadow-[#0F5132]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mic className="w-5 h-5 text-[#D4AF37]" />
                  <span>Start Your Business Journey</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  id="btn-hero-watch-demo"
                  onClick={playDemoAudio}
                  disabled={demoPlaying}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-emerald-950/60 hover:bg-stone-50 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-100 font-poppins font-semibold text-sm rounded-xl border border-stone-300 dark:border-emerald-800 transition-all shadow-xs"
                >
                  <Volume2 className={`w-4 h-4 text-[#0F5132] dark:text-emerald-400 ${demoPlaying ? 'animate-bounce' : ''}`} />
                  <span>{demoPlaying ? 'Playing Mentor Audio...' : 'Watch Demo'}</span>
                </button>
              </div>

              {/* Why Users Should Trust KRIVIO AI */}
              <div className="pt-6 border-t border-stone-200/80 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600 dark:text-emerald-200/80">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                  <span>Verified Vernacular Voice AI</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>ONDC & Amazon Karigar Compliant</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <HeartHandshake className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400 shrink-0" />
                  <span>Designed for 100% Privacy & Safety</span>
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
                    Voice Mentor Active
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-4 text-xs font-inter">
                  {/* User Speak */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 text-[#8B6E10] font-bold flex items-center justify-center shrink-0 text-xs">
                      S
                    </div>
                    <div className="bg-stone-100 dark:bg-emerald-900/30 p-3 rounded-2xl rounded-tl-xs text-stone-800 dark:text-emerald-100">
                      <p className="font-semibold text-[11px] text-[#2E7D32] dark:text-emerald-300 mb-0.5">
                        Sunita Devi (Artisan, Bihar)
                      </p>
                      "How do I set the right price for my handmade Madhubani wall hanging so I don't lose money on thread and dye?"
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
                          KRIVIO AI Mentor
                        </span>
                        <span className="text-[10px] text-[#0F5132] dark:text-emerald-400 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Voice Active
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        To calculate fair profit: <br />
                        1. Add raw dye & silk cost (₹450). <br />
                        2. Multiply working hours by fair rate (6 hrs × ₹150 = ₹900). <br />
                        3. Add 20% craft margin. <br />
                        <strong className="text-[#0F5132] dark:text-emerald-300 font-semibold">Suggested price: ₹1,620 - ₹1,850.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-emerald-900/40">
                  <button
                    onClick={() => setCurrentTab('mentor')}
                    className="w-full py-2.5 px-4 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Mic className="w-4 h-4 text-[#D4AF37]" />
                    <span>Talk to Voice Mentor Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is KRIVIO AI, Who it Helps & Why Trust It */}
      <section className="py-16 lg:py-24 bg-white dark:bg-[#0E2016]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-widest font-poppins">
              From Local Hands to Global Markets
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              Built Specifically for Rural Entrepreneurs
            </p>
            <p className="text-sm sm:text-base text-stone-600 dark:text-emerald-200/80 font-inter">
              No technical buzzwords or complex interfaces. Speak in your natural language to get practical advice on pricing, photography, packaging, and digital sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* What is KRIVIO AI */}
            <div className="p-7 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white">
                What KRIVIO AI Is
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter">
                An all-in-one voice-activated AI mentor tailored for non-technical creators. It combines intelligent voice conversation with automated product cataloging, profit margin calculators, and smartphone lighting diagnosis.
              </p>
            </div>

            {/* Who it Helps */}
            <div className="p-7 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white">
                Who It Helps
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter">
                Rural artisans, handloom weavers, terracotta potters, bamboo craftspeople, Women Self-Help Groups (SHGs), organic farmers, and micro-entrepreneurs seeking to sell direct to nationwide consumers.
              </p>
            </div>

            {/* Why Users Trust It */}
            <div className="p-7 rounded-2xl bg-[#F8F9F5] dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0F5132] dark:text-white">
                Why You Can Trust It
              </h3>
              <p className="text-xs text-stone-700 dark:text-emerald-100/80 leading-relaxed font-inter">
                Built on verified craft economics and government compliance benchmarks (ONDC, Government e-Marketplace, Amazon Karigar). Powered by bank-grade security and zero hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Features */}
      <section className="py-16 lg:py-24 border-t border-[#0F5132]/10 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 uppercase tracking-widest font-poppins">
              Complete Digital Toolkit
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
              4 Powerful Studios to Expand Your Reach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div
              onClick={() => setCurrentTab('mentor')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                Voice AI Mentor
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                Ask business questions by speaking in plain language. Get practical guidance on loans, pricing, packaging, and government grants.
              </p>
              <span className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Voice Mentor <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 2 */}
            <div
              onClick={() => setCurrentTab('products')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                AI Product Studio
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                Describe your craft in a few words. Gemini automatically crafts e-commerce titles, story descriptions, and pricing calculations.
              </p>
              <span className="text-xs font-semibold text-[#8B6E10] dark:text-[#D4AF37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Generate Product Story <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 3 */}
            <div
              onClick={() => setCurrentTab('images')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                Smartphone Image Studio
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                Upload smartphone photos. AI analyzes shadows, background cleanliness, and gives instant lighting improvement advice.
              </p>
              <span className="text-xs font-semibold text-[#2E7D32] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Test Photo Quality <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 4 */}
            <div
              onClick={() => setCurrentTab('marketplace')}
              className="group p-6 rounded-2xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/60 hover:border-[#0F5132] transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white mb-2">
                Marketplace Readiness
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-100/80 leading-relaxed mb-4 font-inter">
                Verify if your listings satisfy compliance standards for ONDC, Amazon Saheli, and GeM portals before submitting.
              </p>
              <span className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Check Channel Readiness <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="py-16 lg:py-24 bg-[#0F5132] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest font-poppins">
              Community Voices
            </span>
            <h2 className="text-3xl font-bold font-poppins">
              Empowering Rural Entrepreneurs Across India
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
                "As a Madhubani folk artist in Bihar, I didn't know how to write e-commerce descriptions. KRIVIO Voice AI prepared my product story in 30 seconds!"
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0F5132] font-bold flex items-center justify-center text-xs">
                  SD
                </div>
                <div>
                  <h4 className="text-xs font-bold font-poppins text-white">Sunita Devi</h4>
                  <p className="text-[11px] text-emerald-300">Handloom Artisan, Bihar</p>
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
                "Our Mahila Bachat SHG group uses KRIVIO Voice AI to calculate exact raw material costs for terracotta pottery and apply for MUDRA bank loans."
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0F5132] font-bold flex items-center justify-center text-xs">
                  RP
                </div>
                <div>
                  <h4 className="text-xs font-bold font-poppins text-white">Ramesh Prajapati</h4>
                  <p className="text-[11px] text-emerald-300">Pottery Guild Leader, Rajasthan</p>
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
                "The smartphone image feedback helped us fix dark shadows on our bamboo craft photos. Our catalog got approved for ONDC listing on the first attempt."
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0F5132] font-bold flex items-center justify-center text-xs">
                  AN
                </div>
                <div>
                  <h4 className="text-xs font-bold font-poppins text-white">Animesh Nandi</h4>
                  <p className="text-[11px] text-emerald-300">Bamboo Weaver SHG, Assam</p>
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
              Affordable Plans for Rural Entrepreneurs
            </h2>
            <p className="text-sm text-stone-600 dark:text-emerald-200/80 font-inter">
              Start completely free. Upgrade to Pro for unlimited voice sessions, advanced photo scoring, and 1-click catalog syndication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-[#13251B] p-6 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-6">
              <div>
                <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">Free Starter</h3>
                <p className="text-xs text-stone-500 dark:text-emerald-300/70">Ideal for individual artisans</p>
                <p className="text-2xl font-black font-poppins text-[#0F5132] dark:text-white mt-3">₹0 <span className="text-xs font-normal text-stone-500">/ forever</span></p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> 10 Voice Mentor Queries / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> 5 Product Story Generations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> Basic Smartphone Photo Diagnosis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> ONDC Readiness Checklist</li>
              </ul>

              <button
                onClick={handlePrimaryCTA}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-[#0F5132] dark:text-emerald-200 font-poppins font-semibold text-xs rounded-xl transition-colors"
              >
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#0F5132]/5 dark:bg-emerald-950/40 p-6 rounded-2xl border-2 border-[#0F5132] dark:border-emerald-500 space-y-6 relative shadow-lg">
              <div className="absolute -top-3 right-4 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-poppins">
                Recommended for SHGs
              </div>
              <div>
                <h3 className="text-lg font-bold font-poppins text-[#0F5132] dark:text-white">Pro Mentor</h3>
                <p className="text-xs text-[#2E7D32] dark:text-emerald-300">Unlimited Voice & Multilingual Guidance</p>
                <p className="text-2xl font-black font-poppins text-[#0F5132] dark:text-white mt-3">₹299 <span className="text-xs font-normal text-stone-500">/ month</span></p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 dark:text-emerald-100 font-inter">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> Unlimited Voice AI Mentor Advice</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> Unlimited AI Product Descriptions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> Advanced Lighting & Background Analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" /> Instant Digital Payment Links for Buyers</li>
              </ul>

              <button
                onClick={openPricingModal}
                className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-poppins font-semibold text-xs rounded-xl shadow-md transition-colors"
              >
                Upgrade to Pro (₹299/mo)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

