import React from 'react';
import { X, AlertCircle, ArrowRight, Zap, Package, Clock, ShieldCheck } from 'lucide-react';
import { QuotaErrorDetails } from '../server/billing/entitlement_service';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorDetails: QuotaErrorDetails | null;
  onUpgradeClick: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  isOpen,
  onClose,
  errorDetails,
  onUpgradeClick,
}) => {
  if (!isOpen || !errorDetails) return null;

  const isProduct = errorDetails.resourceType === 'product';
  const isImage = errorDetails.resourceType === 'ai_image';
  const isQuotation = errorDetails.resourceType === 'quotation';
  const isText = errorDetails.resourceType === 'ai_text';

  const title = isProduct
    ? 'Product Limit Reached'
    : isImage
    ? 'Monthly AI Image Allowance Reached'
    : isQuotation
    ? 'Quotation Trial Limit Reached'
    : 'Monthly AI Assistance Allowance Reached';

  const resetFormatted = errorDetails.resetDate
    ? new Date(errorDetails.resetDate).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="limit-modal-title"
        className="bg-white dark:bg-[#13251B] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-emerald-800/60 relative space-y-6 font-inter"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-stone-400 dark:text-emerald-400/60 hover:text-stone-700 dark:hover:text-emerald-100 hover:bg-stone-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center shrink-0">
            {isProduct ? (
              <Package className="w-6 h-6" />
            ) : isImage || isText ? (
              <Zap className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400">
              Allowance Notice
            </span>
            <h2 id="limit-modal-title" className="text-lg font-bold text-stone-900 dark:text-white font-poppins">
              {title}
            </h2>
          </div>
        </div>

        <div className="p-4 bg-stone-50 dark:bg-[#0E2016] rounded-2xl border border-stone-200 dark:border-emerald-900/40 text-xs text-stone-600 dark:text-emerald-200/90 space-y-2">
          <p className="leading-relaxed">{errorDetails.error}</p>
          {resetFormatted && (
            <div className="flex items-center gap-2 pt-1 text-stone-500 dark:text-emerald-300/70 text-[11px]">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Next cycle allowance reset: {resetFormatted}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs text-stone-500 dark:text-emerald-300/70">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>All your existing products and created data remain safe, accessible, and editable at all times.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {errorDetails.upgradeAvailable ? (
            <button
              onClick={() => {
                onClose();
                onUpgradeClick();
              }}
              className="flex-1 py-3 px-4 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all font-poppins cursor-pointer"
            >
              <span>View Artisan Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="py-3 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-stone-700 dark:text-emerald-200 font-medium text-xs rounded-xl transition-all cursor-pointer text-center"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
