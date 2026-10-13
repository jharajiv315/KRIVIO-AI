import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, Ratio, Calendar, Building2 } from 'lucide-react';
import { BusinessProfile } from '../../types';

export interface AdvancedControlsProps {
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  selectedCategory: string;
  selectedFestival: string;
  onFestivalChange: (fest: string) => void;
  useBranding: boolean;
  onUseBrandingChange: (enabled: boolean) => void;
  businessProfile: BusinessProfile | null;
}

const RATIO_OPTIONS = [
  { id: '1:1', label: '1:1 Square', desc: 'Catalog & E-commerce' },
  { id: '4:5', label: '4:5 Portrait', desc: 'Instagram & Saree Display' },
  { id: '9:16', label: '9:16 Vertical', desc: 'WhatsApp & Instagram Story' },
  { id: '16:9', label: '16:9 Wide', desc: 'Banner & Header' },
];

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  aspectRatio,
  onAspectRatioChange,
  selectedCategory,
  selectedFestival,
  onFestivalChange,
  useBranding,
  onUseBrandingChange,
  businessProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-stone-200/80 dark:border-emerald-900/40 rounded-2xl overflow-hidden font-inter bg-white/50 dark:bg-[#13251B]/40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-stone-700 dark:text-emerald-200 hover:bg-stone-50 dark:hover:bg-[#183023] transition-colors cursor-pointer font-poppins"
      >
        <span className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" />
          <span>Output Size & Brand Options</span>
        </span>
        <div className="flex items-center gap-2 text-stone-400">
          <span className="text-[11px] font-normal text-stone-500 dark:text-emerald-400/70">{aspectRatio}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 space-y-4 border-t border-stone-200/60 dark:border-emerald-900/30 text-xs">
          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/80 font-poppins flex items-center gap-1.5">
              <Ratio className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Canvas Aspect Ratio</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RATIO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onAspectRatioChange(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    aspectRatio === opt.id
                      ? 'bg-[#0F5132]/10 dark:bg-emerald-950/70 border-[#0F5132] text-[#0F5132] dark:text-emerald-300 font-bold'
                      : 'bg-stone-50 dark:bg-[#0E2016] border-stone-200/80 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200 hover:border-stone-400'
                  }`}
                >
                  <div className="text-xs font-poppins">{opt.label}</div>
                  <div className="text-[10px] text-stone-400 dark:text-emerald-400/60 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Festival Occasion Dropdown if in festive category */}
          {selectedCategory === 'seasonal_cultural' && (
            <div className="space-y-1.5 pt-1 border-t border-stone-100 dark:border-emerald-900/30">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/80 font-poppins flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Festival / Occasion Ambience</span>
              </label>
              <select
                value={selectedFestival}
                onChange={(e) => onFestivalChange(e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white font-poppins cursor-pointer"
              >
                <option value="Diwali">Diwali (Festival of Lights)</option>
                <option value="Holi">Holi (Colors of Spring)</option>
                <option value="Navratri">Navratri & Durga Puja</option>
                <option value="Eid">Eid Mubarak</option>
                <option value="Christmas">Winter & Christmas</option>
                <option value="Wedding">Royal Wedding Gifting</option>
                <option value="Harvest Fair">Regional Harvest & Mela</option>
              </select>
            </div>
          )}

          {/* Brand Identity Integration Toggle */}
          {businessProfile && (
            <div className="pt-2 border-t border-stone-100 dark:border-emerald-900/30">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBranding}
                  onChange={(e) => onUseBrandingChange(e.target.checked)}
                  className="mt-0.5 accent-[#0F5132] rounded cursor-pointer w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-800 dark:text-white flex items-center gap-1.5 font-poppins">
                    <Building2 className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" />
                    <span>Include Brand Identity</span>
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 leading-relaxed font-inter">
                    Harmonize marketing backgrounds with "{businessProfile.businessName}" and highlight your {businessProfile.craftType || 'handmade'} heritage.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
