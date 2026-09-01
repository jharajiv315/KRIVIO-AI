import React, { useState } from 'react';
import { GovernmentScheme } from '../types';
import { useI18n } from '../i18n/LanguageContext';
import {
  Landmark,
  Search,
  ExternalLink,
  FileText,
  Filter,
  Award,
  CircleCheck,
} from 'lucide-react';

const SCHEMES_DATA: GovernmentScheme[] = [
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma Scheme',
    department: 'Ministry of Micro, Small & Medium Enterprises (MSME)',
    description: 'Comprehensive support scheme for traditional artisans, craftsmen, weavers, and potters offering skill upgrading, toolkit incentives up to ₹15,000, and collateral-free credit up to ₹3 Lakh at 5% interest.',
    eligibility: 'Artisans and craftsmen working with hands/tools in 18 traditional trades, aged 18+.',
    benefit: 'Toolkit incentive ₹15,000 + Loan up to ₹3,00,000 at 5% subvention + Stipend ₹500/day during training.',
    documentsNeeded: ['Aadhaar Card', 'Bank Passbook', 'Active Mobile Number', 'Ration Card / Skill Certificate'],
    category: 'loan',
    officialUrl: 'https://pmvishwakarma.gov.in',
  },
  {
    id: 'pmegp',
    name: 'Prime Minister’s Employment Generation Programme (PMEGP)',
    department: 'KVIC / Ministry of MSME',
    description: 'Credit-linked subsidy programme aiming to generate self-employment opportunities through establishment of micro-enterprises in non-farm sector.',
    eligibility: 'Individuals above 18 years, SHGs, Institutions registered under Societies Registration Act 1860.',
    benefit: 'Margin money subsidy up to 35% of project cost (max project cost ₹50 Lakhs for manufacturing).',
    documentsNeeded: ['Project Report', 'Aadhaar Card', 'Caste/Category Certificate', 'Educational Certificate'],
    category: 'grant',
    officialUrl: 'https://kviconline.gov.in/pmegpeportal',
  },
  {
    id: 'sfurti',
    name: 'Scheme of Fund for Regeneration of Traditional Industries (SFURTI)',
    department: 'Ministry of MSME & Coir Board',
    description: 'Organizes traditional industries and artisans into clusters to make them competitive and provide long-term sustainability.',
    eligibility: 'Artisan clusters, SHG Federations, NGOs, Field Institutions working with traditional craft clusters.',
    benefit: 'Grant support up to ₹2.5 Crore to ₹5 Crore per cluster for common facility centers, tools, and branding.',
    documentsNeeded: ['Cluster Profile', 'DPR (Detailed Project Report)', 'Society/Trust Registration'],
    category: 'equipment',
    officialUrl: 'https://sfurti.msme.gov.in',
  },
  {
    id: 'mudra-yojana',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    department: 'Department of Financial Services, Ministry of Finance',
    description: 'Provides collateral-free loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises (Shishu, Kishore, and Tarun categories).',
    eligibility: 'Small business owners, artisans, shopkeepers, fruit/vegetable vendors, small agricultural processing units.',
    benefit: 'Shishu: up to ₹50,000 | Kishore: ₹50,000 - ₹5 Lakh | Tarun: ₹5 Lakh - ₹10 Lakh (No collateral required).',
    documentsNeeded: ['Proof of Identity', 'Proof of Residence', 'Business Address Proof', 'Quotations of Machinery/Materials'],
    category: 'loan',
    officialUrl: 'https://www.mudra.org.in',
  },
  {
    id: 'stand-up-india',
    name: 'Stand-Up India Scheme',
    department: 'SIDBI / Ministry of Finance',
    description: 'Facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST borrower and one Woman borrower per bank branch for setting up greenfield enterprises.',
    eligibility: 'SC/ST and/or Woman entrepreneurs above 18 years setting up a new manufacturing/trading/services business.',
    benefit: 'Bank loans from ₹10 Lakh up to ₹1 Crore with composite loan covering 75% of project cost.',
    documentsNeeded: ['Identity Proof', 'Category Certificate (SC/ST)', 'Business License', 'Project Profile'],
    category: 'loan',
    officialUrl: 'https://www.standupmitra.in',
  },
  {
    id: 'nabard-shg-blp',
    name: 'NABARD SHG-Bank Linkage Programme',
    department: 'NABARD & Rural Banks',
    description: 'World’s largest microfinance movement connecting women Self-Help Groups (SHGs) with formal banking channels for micro-loans and livelihood creation.',
    eligibility: 'Registered/Active SHGs of 10-20 women members operating for at least 6 months with savings habit.',
    benefit: 'Collateral-free micro-loans up to ₹10 Lakhs for SHGs at subsidized interest rates.',
    documentsNeeded: ['SHG Resolution Copy', 'SHG Bank Savings Account Details', 'Member Aadhaar Copies', 'Inter-loaning Register'],
    category: 'grant',
    officialUrl: 'https://www.nabard.org',
  },
];

export const GovernmentSchemes: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  const filteredSchemes = SCHEMES_DATA.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || scheme.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Banner */}
      <div className="bg-[#0F5132] text-white p-5 sm:p-8 rounded-3xl shadow-xl border border-[#2E7D32]/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37] text-stone-950 text-[11px] font-bold uppercase tracking-wider rounded-full font-poppins">
            <Landmark className="w-3.5 h-3.5" /> Direct Government Assistance
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold font-poppins">
            {t('schemes.title')}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-inter">
            {t('schemes.subtitle')}
          </p>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white dark:bg-[#13251B] p-4 sm:p-5 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between font-inter">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 dark:text-emerald-400/60 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-stone-400 dark:text-emerald-400/60 shrink-0" />
          {[
            { id: 'all', label: t('common.all') },
            { id: 'loan', label: 'Micro Loans' },
            { id: 'grant', label: 'Subsidies & Grants' },
            { id: 'equipment', label: 'Toolkits & Equipment' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all font-poppins cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300/80 hover:bg-stone-200 dark:hover:bg-[#183023]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs hover:border-[#0F5132] transition-all flex flex-col justify-between space-y-5 font-inter"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-emerald-300 text-[10px] font-bold rounded-md uppercase tracking-wider font-poppins">
                  {scheme.category.toUpperCase()}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-emerald-400/60 font-mono">Verified Scheme</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                  {scheme.name}
                </h3>
                <p className="text-[11px] font-medium text-[#0F5132] dark:text-[#34D399] mt-0.5 font-inter">
                  {scheme.department}
                </p>
              </div>

              <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed line-clamp-3 font-inter">
                {scheme.description}
              </p>

              <div className="bg-[#F8F9F5] dark:bg-[#183023]/60 p-3.5 rounded-xl border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-1.5 text-xs font-inter">
                <div className="font-semibold text-stone-800 dark:text-white flex items-center gap-1.5 font-poppins">
                  <Award className="w-3.5 h-3.5 text-[#D4AF37]" /> Benefit Highlight
                </div>
                <p className="text-[11px] text-stone-600 dark:text-emerald-200/90 font-medium leading-relaxed font-inter">
                  {scheme.benefit}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedScheme(scheme)}
                className="flex-1 py-2.5 bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-200 font-bold text-xs rounded-xl transition-all font-poppins cursor-pointer active:scale-98"
              >
                View Checklist
              </button>
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all font-poppins cursor-pointer active:scale-98"
              >
                <span>{t('schemes.applyNow')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#13251B] max-w-xl w-full rounded-3xl p-5 sm:p-8 border border-[#0F5132]/20 dark:border-emerald-800/80 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-inter">
            <div className="flex items-start justify-between border-b border-stone-100 dark:border-emerald-900/40 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 text-[10px] font-bold rounded-md uppercase font-poppins">
                  {selectedScheme.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-poppins mt-1">
                  {selectedScheme.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-emerald-300/70">{selectedScheme.department}</p>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                aria-label={t('common.close')}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-600 dark:text-emerald-200/90 font-inter">
              <div>
                <h4 className="font-bold text-stone-900 dark:text-white mb-1 font-poppins">Description</h4>
                <p className="leading-relaxed">{selectedScheme.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-white mb-1 font-poppins">{t('schemes.eligibility')}</h4>
                <p className="p-3 bg-[#D4AF37]/10 dark:bg-[#183023]/70 border border-[#D4AF37]/30 dark:border-amber-700/50 rounded-xl text-stone-800 dark:text-emerald-100 leading-relaxed font-medium">
                  {selectedScheme.eligibility}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-white mb-1.5 flex items-center gap-1.5 font-poppins">
                  <FileText className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> {t('schemes.documents')}
                </h4>
                <ul className="space-y-2">
                  {selectedScheme.documentsNeeded.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-stone-700 dark:text-emerald-200">
                      <CircleCheck className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-emerald-900/40 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-5 py-2.5 bg-stone-100 dark:bg-[#183023] text-stone-700 dark:text-emerald-200 text-xs font-bold rounded-xl font-poppins cursor-pointer"
              >
                {t('common.close')}
              </button>
              <a
                href={selectedScheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md font-poppins cursor-pointer"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

