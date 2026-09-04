import React from 'react';
import { CanonicalProduct, DestinationMetadata, ValidationResult } from '../../types/marketplace';
import { X, Download, AlertTriangle, CheckCircle, Info, ShieldCheck, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: DestinationMetadata;
  products: CanonicalProduct[];
  validations: { productId: string; productTitle: string; validation: ValidationResult }[];
  onConfirmExport: (allowPartial: boolean) => void;
  isExporting: boolean;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  destination,
  products,
  validations,
  onConfirmExport,
  isExporting,
}) => {
  if (!isOpen) return null;

  const totalProducts = products.length;
  const readyCount = validations.filter((v) => v.validation.ready).length;
  const unreadyCount = totalProducts - readyCount;
  const hasErrors = unreadyCount > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-inter">
      <div className="bg-white dark:bg-[#13251B] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-emerald-900/40 flex items-center justify-between bg-stone-50/70 dark:bg-[#0E1E15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/20 dark:border-emerald-800 flex items-center justify-center text-[#0F5132] dark:text-emerald-400">
              {destination.format === 'xlsx' ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
                {destination.name}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 font-semibold uppercase">
                  {destination.badge}
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">
                Verified Schema: <code className="font-mono">{destination.schemaVersion}</code> (Updated {destination.lastVerifiedDate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-xl hover:bg-stone-200/50 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200 dark:border-emerald-900/40">
              <span className="text-xs text-stone-500 dark:text-emerald-300/70">Selected Products</span>
              <p className="text-xl font-bold font-poppins text-stone-900 dark:text-white">{totalProducts}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Ready for Export
              </span>
              <p className="text-xl font-bold font-poppins text-emerald-800 dark:text-emerald-200">{readyCount}</p>
            </div>
            <div
              className={`p-3.5 rounded-2xl border ${
                unreadyCount > 0
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                  : 'bg-stone-50 dark:bg-emerald-950/40 border-stone-200 dark:border-emerald-900/40'
              }`}
            >
              <span
                className={`text-xs flex items-center gap-1 font-medium ${
                  unreadyCount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-stone-500 dark:text-emerald-300/70'
                }`}
              >
                {unreadyCount > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                Needs Attention
              </span>
              <p
                className={`text-xl font-bold font-poppins ${
                  unreadyCount > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-stone-900 dark:text-white'
                }`}
              >
                {unreadyCount}
              </p>
            </div>
          </div>

          {/* Transparent Marketplace Disclaimer */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-[#0F5132]/20 dark:border-emerald-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0F5132] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 dark:text-emerald-100/90 leading-relaxed">
              <span className="font-bold text-[#0F5132] dark:text-emerald-300 block mb-0.5">
                Marketplace Compliance & Integration Scope:
              </span>
              {destination.disclaimer}
            </div>
          </div>

          {/* Product Items Table Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-poppins text-stone-900 dark:text-white flex items-center justify-between">
              <span>Included Items Preview</span>
              <span className="text-xs font-normal text-stone-500 dark:text-emerald-300/60">
                Horizontally scrollable
              </span>
            </h3>

            <div className="border border-stone-200 dark:border-emerald-900/40 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 dark:bg-emerald-950/80 text-stone-700 dark:text-emerald-200 font-semibold border-b border-stone-200 dark:border-emerald-900/40">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Validation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-emerald-900/30">
                  {products.map((p) => {
                    const validation = validations.find((v) => v.productId === p.id)?.validation;
                    const isReady = validation?.ready ?? true;
                    return (
                      <tr
                        key={p.id}
                        className={
                          !isReady
                            ? 'bg-amber-50/40 dark:bg-amber-950/20'
                            : 'hover:bg-stone-50 dark:hover:bg-emerald-950/30'
                        }
                      >
                        <td className="p-3 whitespace-nowrap">
                          {isReady ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-medium text-stone-900 dark:text-white whitespace-nowrap">
                          {p.sku}
                        </td>
                        <td className="p-3 font-medium text-stone-900 dark:text-white max-w-[200px] truncate">
                          {p.title}
                        </td>
                        <td className="p-3 text-stone-600 dark:text-emerald-200/80 whitespace-nowrap">
                          {p.category}
                        </td>
                        <td className="p-3 font-semibold text-stone-900 dark:text-white whitespace-nowrap">
                          ₹{p.price}
                        </td>
                        <td className="p-3 text-stone-700 dark:text-emerald-200 whitespace-nowrap">
                          {p.stock} units
                        </td>
                        <td className="p-3 text-stone-600 dark:text-emerald-200/70 whitespace-nowrap">
                          {p.weight}
                        </td>
                        <td className="p-3 text-xs">
                          {validation && validation.errors.length > 0 ? (
                            <span className="text-red-600 dark:text-red-400 block font-medium">
                              {validation.errors.map((e) => e.message).join(' ')}
                            </span>
                          ) : validation && validation.warnings.length > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 block font-medium">
                              {validation.warnings.map((w) => w.message).join(' ')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">All fields verified</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload Instructions Walkthrough */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200 dark:border-emerald-900/40 space-y-2">
            <h4 className="text-xs font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" />
              What to do after downloading:
            </h4>
            <ol className="list-decimal list-inside text-xs text-stone-600 dark:text-emerald-200/80 space-y-1">
              {destination.instructions.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-emerald-900/40 bg-stone-50/70 dark:bg-[#0E1E15] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 text-xs font-semibold text-stone-700 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {hasErrors && readyCount > 0 && (
              <button
                onClick={() => onConfirmExport(true)}
                disabled={isExporting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-poppins"
              >
                <Download className="w-4 h-4" />
                Export {readyCount} Ready Items Only
              </button>
            )}

            <button
              onClick={() => onConfirmExport(false)}
              disabled={isExporting || (hasErrors && readyCount === 0)}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer ${
                hasErrors && readyCount === 0
                  ? 'bg-stone-300 text-stone-500 dark:bg-emerald-950 dark:text-emerald-700 cursor-not-allowed'
                  : 'bg-[#0F5132] hover:bg-[#0B3D26] text-white'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Catalog...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate {destination.badge} ({totalProducts} Products)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
