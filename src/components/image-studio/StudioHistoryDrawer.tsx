import React from 'react';
import { History, X, Clock, Trash2, ArrowRight } from 'lucide-react';
import { ImageStudioHistoryItem } from '../../services/api';

export interface StudioHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ImageStudioHistoryItem[];
  onSelectHistoryItem: (item: ImageStudioHistoryItem) => void;
  onDeleteItem?: (id: string) => void;
}

export const StudioHistoryDrawer: React.FC<StudioHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end transition-opacity font-inter">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#13251B] h-full shadow-2xl border-l border-stone-200 dark:border-emerald-900/60 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 dark:border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                Studio History
              </h3>
              <p className="text-xs text-stone-500 dark:text-emerald-400/70 font-inter">
                {history.length} saved transformations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close history drawer"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <History className="w-10 h-10 text-stone-300 dark:text-emerald-900 mx-auto" />
              <p className="text-xs font-semibold text-stone-600 dark:text-emerald-300 font-poppins">
                No past transformations yet
              </p>
              <p className="text-xs text-stone-400 dark:text-emerald-500/60 max-w-xs mx-auto leading-relaxed">
                Images you enhance or create in the studio will appear here automatically for easy re-use.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-stone-50 dark:bg-[#0E2016] rounded-2xl border border-stone-200/80 dark:border-emerald-900/40 hover:border-[#0F5132]/50 dark:hover:border-emerald-500 transition-all flex items-center gap-3 group"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 dark:bg-emerald-950 shrink-0 cursor-pointer"
                >
                  <img
                    src={item.generatedAsset}
                    alt={item.promptSummary || 'Studio Asset'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details */}
                <div
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="flex-1 min-w-0 cursor-pointer space-y-1"
                >
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white font-poppins truncate">
                    {item.promptSummary || item.operationId || 'Enhanced Craft Asset'}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 dark:text-emerald-400/60 font-inter">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{item.aspectRatio || '1:1'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="p-2 text-[#0F5132] dark:text-emerald-400 hover:bg-[#0F5132]/10 rounded-lg cursor-pointer"
                    title="Load in Studio"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {onDeleteItem && (
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
