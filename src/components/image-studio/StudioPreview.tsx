import React from 'react';
import { RefreshCw, Image as ImageIcon, Wand2, Eye, Columns2 } from 'lucide-react';
import { ImageStudioGeneratedAsset } from '../../services/api';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';

export type ViewMode = 'split' | 'enhanced' | 'original';

export interface StudioPreviewProps {
  originalImage: string | null;
  currentAsset: ImageStudioGeneratedAsset | null;
  isGenerating: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  aspectRatio?: string;
}

export const StudioPreview: React.FC<StudioPreviewProps> = ({
  originalImage,
  currentAsset,
  isGenerating,
  viewMode,
  onViewModeChange,
  aspectRatio = '1:1',
}) => {
  // Determine aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '4:5':
        return 'aspect-4/5 max-h-[580px]';
      case '9:16':
        return 'aspect-9/16 max-h-[620px]';
      case '16:9':
        return 'aspect-16/9 max-h-[460px]';
      case '1:1':
      default:
        return 'aspect-square max-h-[520px]';
    }
  };

  return (
    <div className="space-y-3 font-inter">
      {/* Visualizer Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-200/80 dark:border-emerald-900/40">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-emerald-400/60 font-poppins">
            Studio Canvas
          </span>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white font-poppins">
            {currentAsset ? currentAsset.operationLabel : 'Interactive Studio Preview'}
          </h3>
        </div>

        {/* View Mode Segmented Controls (Visible once an asset is generated) */}
        {currentAsset && (
          <div className="flex bg-stone-100 dark:bg-[#0E2016] p-0.5 rounded-xl border border-stone-200/80 dark:border-emerald-900/50">
            <button
              type="button"
              onClick={() => onViewModeChange('split')}
              className={`px-3 py-1.5 min-h-[36px] text-xs font-bold rounded-lg transition-all cursor-pointer font-poppins flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Before / After</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('enhanced')}
              className={`px-3 py-1.5 min-h-[36px] text-xs font-bold rounded-lg transition-all cursor-pointer font-poppins flex items-center gap-1.5 ${
                viewMode === 'enhanced'
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Enhanced</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('original')}
              className={`px-3 py-1.5 min-h-[36px] text-xs font-bold rounded-lg transition-all cursor-pointer font-poppins flex items-center gap-1.5 ${
                viewMode === 'original'
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Original</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas Display Area */}
      <div
        className={`relative w-full ${getAspectClass()} rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/60 shadow-xs flex items-center justify-center mx-auto transition-all`}
      >
        {/* Subtle, Dignified Loading State */}
        {isGenerating && (
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white space-y-3 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0F5132] flex items-center justify-center shadow-lg border border-[#D4AF37]/40">
              <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold font-poppins tracking-wide">
                Refining product photography...
              </p>
              <p className="text-[11px] text-emerald-200/80 font-inter max-w-xs">
                Preserving authentic craft textures, natural weaves, and true dye tones.
              </p>
            </div>
          </div>
        )}

        {/* View Mode Rendering */}
        {currentAsset ? (
          viewMode === 'split' ? (
            <div className="w-full h-full relative">
              <BeforeAfterSlider
                beforeImage={originalImage || currentAsset.originalImage}
                afterImage={currentAsset.generatedImage}
                beforeLabel="Original Workshop"
                afterLabel="Enhanced Studio"
                aspectRatioClass="w-full h-full"
                className="rounded-none border-0 shadow-none h-full w-full"
              />
            </div>
          ) : viewMode === 'enhanced' ? (
            <img
              src={currentAsset.generatedImage}
              alt="Enhanced Result"
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={originalImage || currentAsset.originalImage}
              alt="Original Craft Photo"
              className="w-full h-full object-contain"
            />
          )
        ) : originalImage ? (
          <div className="relative w-full h-full">
            <img
              src={originalImage}
              alt="Selected Product"
              className="w-full h-full object-contain"
            />
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded font-poppins">
              Uploaded Photo
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400 space-y-2.5 p-8 text-center">
            <ImageIcon className="w-10 h-10 stroke-1 text-stone-300 dark:text-emerald-800" />
            <p className="text-xs font-semibold font-poppins text-stone-600 dark:text-emerald-300">
              Your transformed studio photo will appear here
            </p>
            <p className="text-[11px] text-stone-400 font-inter max-w-xs">
              Select an option on the left and click Transform Photo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
