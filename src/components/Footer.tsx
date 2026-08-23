import React from 'react';
import { Heart, ShieldCheck, Globe, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
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
              Voice-first AI business mentor empowering rural artisans, SHGs, potters, weavers, and small farmers across India to thrive in global markets.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Rural AI Partner</span>
            </div>
          </div>

          {/* Col 2: Core Platform Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-poppins">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs font-inter">
              <li>
                <button onClick={() => setCurrentTab('mentor')} className="hover:text-[#D4AF37] transition-colors">
                  Voice AI Business Mentor
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('products')} className="hover:text-[#D4AF37] transition-colors">
                  AI Product Studio & Details Generator
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('images')} className="hover:text-[#D4AF37] transition-colors">
                  Smartphone Photo Studio & Lighting Feedback
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('marketplace')} className="hover:text-[#D4AF37] transition-colors">
                  ONDC & E-Commerce Readiness
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Languages & Regions */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-poppins">
              Supported Regional Voices
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-emerald-200/70 font-inter">
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> English</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> हिंदी (Hindi)</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> தமிழ் (Tamil)</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> తెలుగు (Telugu)</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> বাংলা (Bengali)</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> मराठी (Marathi)</li>
            </ul>
          </div>

          {/* Col 4: SHG & Government Initiatives */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-poppins">
              Government & Partner Schemes
            </h4>
            <p className="text-xs text-emerald-200/70 leading-relaxed mb-3 font-inter">
              Built in alignment with ONDC, NABARD, PM Vishwakarma Yojana, and National Rural Livelihoods Mission (NRLM).
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] bg-[#13251B] p-2.5 rounded-lg border border-emerald-800/60 font-inter">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Need help applying for MUDRA micro-loans? Ask the Voice Mentor!</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/60 font-inter">
          <p>© {new Date().getFullYear()} KRIVIO AI. All rights reserved. From Local Hands to Global Markets.</p>
          <div className="flex items-center gap-1 text-emerald-200/80">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
            <span>for India's Rural Entrepreneurs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

