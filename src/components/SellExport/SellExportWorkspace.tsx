import React, { useState } from 'react';
import { MarketplaceExportView } from './MarketplaceExportView';
import { B2BQuotationView } from './B2BQuotationView';
import { ExportHistoryView } from './ExportHistoryView';
import { Store, FileText, History, Sparkles, Globe } from 'lucide-react';

interface SellExportWorkspaceProps {
  onNavigateToProducts?: () => void;
  initialTab?: 'marketplace' | 'quotation' | 'history';
}

export const SellExportWorkspace: React.FC<SellExportWorkspaceProps> = ({
  onNavigateToProducts = () => {},
  initialTab = 'marketplace',
}) => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'quotation' | 'history'>(initialTab);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Top Banner with Official KRIVIO Tagline */}
      <div className="bg-gradient-to-r from-[#0F5132] via-[#143B28] to-[#0A1A11] text-white p-6 sm:p-8 rounded-3xl border border-[#0F5132]/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#1A1A1A] rounded-full font-poppins">
              Multi-Channel Output
            </span>
            <span className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1 font-poppins">
              <Globe className="w-3.5 h-3.5" /> "From Local Hands to Global Markets."
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins text-white">
            Sell & Export Toolkit
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Maintain one trusted product record in KRIVIO. Prepare tailored listing spreadsheets for Amazon, Meesho, Flipkart, and ONDC, or generate wholesale B2B quotations for corporate buyers and retail boutiques.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-emerald-900/40 pb-3">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-poppins transition-all cursor-pointer ${
            activeTab === 'marketplace'
              ? 'bg-[#0F5132] text-white shadow-md'
              : 'text-stone-600 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-950/60'
          }`}
        >
          <Store className="w-4 h-4" />
          Marketplace Export
        </button>

        <button
          onClick={() => setActiveTab('quotation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-poppins transition-all cursor-pointer ${
            activeTab === 'quotation'
              ? 'bg-[#0F5132] text-white shadow-md'
              : 'text-stone-600 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-950/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          B2B Wholesale Quotations
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-poppins transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#0F5132] text-white shadow-md'
              : 'text-stone-600 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-950/60'
          }`}
        >
          <History className="w-4 h-4" />
          Export Audit History
        </button>
      </div>

      {/* View Content */}
      {activeTab === 'marketplace' && (
        <MarketplaceExportView onNavigateToProducts={onNavigateToProducts} />
      )}

      {activeTab === 'quotation' && (
        <B2BQuotationView onNavigateToProducts={onNavigateToProducts} />
      )}

      {activeTab === 'history' && <ExportHistoryView />}
    </div>
  );
};
