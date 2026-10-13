import React, { useState } from 'react';
import { Camera, Palette, History, HelpCircle, CheckCircle2, X } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

export interface StudioHeaderProps {
  activeTab: 'studio' | 'diagnosis';
  onTabChange: (tab: 'studio' | 'diagnosis') => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  activeTab,
  onTabChange,
  historyCount,
  onOpenHistory,
}) => {
  const { t } = useI18n();
  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-emerald-900/40">
        {/* Title & Editorial Description */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white font-poppins">
            Image Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 font-inter">
            Make your product photos ready for catalogues, marketplaces, and marketing.
          </p>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Studio vs Diagnosis Tabs */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-[#0E2016] rounded-xl border border-stone-200/70 dark:border-emerald-900/50">
            <button
              id="mode-tab-create-image"
              onClick={() => onTabChange('studio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all font-poppins cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Create Image</span>
            </button>
            <button
              id="mode-tab-check-photo"
              onClick={() => onTabChange('diagnosis')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all font-poppins cursor-pointer ${
                activeTab === 'diagnosis'
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Check Photo Quality</span>
            </button>
          </div>

          {/* Studio History Trigger Button */}
          <button
            onClick={onOpenHistory}
            className="px-3 py-2 min-h-[36px] bg-white dark:bg-[#13251B] hover:bg-stone-50 dark:hover:bg-[#183023] text-stone-700 dark:text-emerald-200 text-xs font-semibold rounded-xl border border-stone-200 dark:border-emerald-900/60 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer font-poppins"
            title="View generated studio history"
          >
            <History className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 font-bold text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          {/* Photography Tips Help Popover Trigger */}
          <button
            onClick={() => setShowGuideModal(true)}
            aria-label="Photography Tips and Guidelines"
            className="p-2 min-h-[36px] min-w-[36px] bg-white dark:bg-[#13251B] hover:bg-stone-50 dark:hover:bg-[#183023] text-stone-500 dark:text-emerald-400/80 rounded-xl border border-stone-200 dark:border-emerald-900/60 shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photography Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#13251B] p-6 rounded-2xl border border-stone-200 dark:border-emerald-900/60 max-w-lg w-full space-y-4 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                <span>Tips for Smartphone Craft Photography</span>
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-stone-600 dark:text-emerald-200/90 leading-relaxed font-inter">
              <div className="p-3 bg-[#F8F9F5] dark:bg-[#0E2016] rounded-xl space-y-1">
                <p className="font-bold text-stone-900 dark:text-white font-poppins">1. Use Natural Daylight</p>
                <p>Place your craft near an open window during morning or late afternoon. Avoid harsh camera flash.</p>
              </div>
              <div className="p-3 bg-[#F8F9F5] dark:bg-[#0E2016] rounded-xl space-y-1">
                <p className="font-bold text-stone-900 dark:text-white font-poppins">2. Frame Centrally</p>
                <p>Keep your product in the center with 20% margin around all sides. The studio will frame it cleanly.</p>
              </div>
              <div className="p-3 bg-[#F8F9F5] dark:bg-[#0E2016] rounded-xl space-y-1">
                <p className="font-bold text-stone-900 dark:text-white font-poppins">3. Neutral Background</p>
                <p>A plain sheet or wall helps the AI preserve every fine thread, weave, and carving detail.</p>
              </div>
            </div>
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-[#0F5132] text-white font-semibold text-xs rounded-xl cursor-pointer font-poppins hover:bg-[#0B3D26] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
