import React, { useState } from 'react';
import { Package, Download, RefreshCw, ChevronRight, Wand2, ArrowRight } from 'lucide-react';
import { ImageStudioGeneratedAsset } from '../../services/api';

export interface ResultActionsProps {
  currentAsset: ImageStudioGeneratedAsset;
  isGenerating: boolean;
  onOpenSaveModal: () => void;
  onRegenerate: () => void;
  onNavigateToWizard?: (image: string) => void;
  onApplyFollowUpEdit: (instruction: string) => void;
}

export const ResultActions: React.FC<ResultActionsProps> = ({
  currentAsset,
  isGenerating,
  onOpenSaveModal,
  onRegenerate,
  onNavigateToWizard,
  onApplyFollowUpEdit,
}) => {
  const [customEditInput, setCustomEditInput] = useState('');

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (customEditInput.trim()) {
      onApplyFollowUpEdit(customEditInput.trim());
      setCustomEditInput('');
    }
  };

  return (
    <div className="space-y-4 pt-2 font-inter">
      {/* Primary & Secondary Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-50 dark:bg-[#0E2016] rounded-2xl border border-stone-200/80 dark:border-emerald-900/50">
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Save Action */}
          <button
            type="button"
            onClick={onOpenSaveModal}
            className="px-4 py-2.5 min-h-[40px] bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-poppins active:scale-98"
          >
            <Package className="w-4 h-4 text-[#D4AF37]" />
            <span>Save to Product</span>
          </button>

          {/* Download Action */}
          <a
            href={currentAsset.generatedImage}
            download={`krivio-craft-${Date.now()}.png`}
            className="px-3.5 py-2.5 min-h-[40px] bg-white dark:bg-[#13251B] hover:bg-stone-100 dark:hover:bg-emerald-950 text-stone-800 dark:text-emerald-100 text-xs font-semibold rounded-xl border border-stone-200 dark:border-emerald-900/60 shadow-2xs flex items-center justify-center gap-1.5 transition-all font-poppins"
          >
            <Download className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
            <span>Download</span>
          </a>

          {/* Regenerate Action */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-3.5 py-2.5 min-h-[40px] bg-white dark:bg-[#13251B] hover:bg-stone-100 dark:hover:bg-emerald-950 text-stone-800 dark:text-emerald-100 text-xs font-semibold rounded-xl border border-stone-200 dark:border-emerald-900/60 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-poppins disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Link to Full Listing Creation */}
        {onNavigateToWizard && (
          <button
            type="button"
            onClick={() => onNavigateToWizard(currentAsset.generatedImage)}
            className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 hover:underline flex items-center gap-1 font-poppins cursor-pointer py-1"
          >
            <span>Create Full Product Listing</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Conversational Iterative Refinements */}
      <div className="p-4 bg-white dark:bg-[#13251B] rounded-2xl border border-stone-200/80 dark:border-emerald-900/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 dark:text-white font-poppins flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Want to adjust this result?</span>
          </span>
          <span className="text-[11px] text-stone-400 dark:text-emerald-400/60 font-inter">
            Refines current image
          </span>
        </div>

        {/* Suggestion Chips */}
        {currentAsset.suggestedFollowUps && currentAsset.suggestedFollowUps.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {currentAsset.suggestedFollowUps.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onApplyFollowUpEdit(suggestion)}
                disabled={isGenerating}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] dark:hover:bg-emerald-950 text-stone-700 dark:text-emerald-200 rounded-full text-xs font-medium border border-stone-200/90 dark:border-emerald-900/40 transition-colors cursor-pointer"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Freeform Follow-Up Form */}
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={customEditInput}
            onChange={(e) => setCustomEditInput(e.target.value)}
            placeholder="e.g. Add soft morning daylight, place on teakwood table..."
            className="flex-1 p-2.5 bg-stone-50 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter min-h-[40px]"
          />
          <button
            type="submit"
            disabled={!customEditInput.trim() || isGenerating}
            className="px-4 py-2.5 min-h-[40px] bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer font-poppins disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <span>Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
