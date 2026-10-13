import React from 'react';
import { Package, X } from 'lucide-react';
import { Product } from '../../types';
import { useI18n } from '../../i18n/LanguageContext';

export interface SaveToProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductId: string;
  onSelectProductId: (id: string) => void;
  onConfirmSave: () => void;
  isSaving: boolean;
}

export const SaveToProductModal: React.FC<SaveToProductModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductId,
  onSelectProductId,
  onConfirmSave,
  isSaving,
}) => {
  const { formatCurrency } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-inter">
      <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-emerald-900/60 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
          <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
            <span>Save to Product Catalog</span>
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600 dark:text-emerald-200/80 font-inter leading-relaxed">
          Attach this enhanced studio image directly to an existing product in your inventory as the primary marketplace photo.
        </p>

        {products.length === 0 ? (
          <div className="p-4 bg-stone-50 dark:bg-[#0E2016] rounded-2xl text-xs text-stone-500 text-center space-y-2">
            <p>No products in your catalog yet.</p>
            <p className="font-semibold text-[#0F5132] dark:text-emerald-400">
              Create a product first in Product Studio.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">
              Select Product:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => onSelectProductId(e.target.value)}
              className="w-full p-3 bg-stone-50 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white font-poppins cursor-pointer min-h-[44px]"
            >
              <option value="">-- Choose a product from your catalog --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatCurrency(p.price)})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 min-h-[44px] bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] text-stone-700 dark:text-emerald-200 text-xs font-semibold rounded-xl cursor-pointer font-poppins transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmSave}
            disabled={!selectedProductId || isSaving}
            className="flex-1 py-3 min-h-[44px] bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer font-poppins disabled:opacity-40 transition-all"
          >
            {isSaving ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
