import React, { useEffect, useState } from 'react';
import { marketplaceApi, productsApi, businessProfileApi } from '../services/api';
import { ChannelRecommendation, Product, BusinessProfile } from '../types';
import { useI18n } from '../i18n/LanguageContext';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Download,
  Layers,
} from 'lucide-react';

export const MarketplaceReadiness: React.FC = () => {
  const { t, formatNumber } = useI18n();
  const [channels, setChannels] = useState<ChannelRecommendation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePlatformTab, setActivePlatformTab] = useState<string>('ondc');
  const [exportSuccess, setExportSuccess] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [channelRes, prodRes, profileRes] = await Promise.all([
        marketplaceApi.getRecommendations().catch(() => ({ channels: [] })),
        productsApi.getAll().catch(() => ({ products: [] })),
        businessProfileApi.get().catch(() => ({ businessProfile: null as any })),
      ]);
      setChannels(channelRes.channels || []);
      setProducts(prodRes.products || []);
      if (profileRes && profileRes.businessProfile) {
        setBusinessProfile(profileRes.businessProfile);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Platform specific compliance rules
  const platformCriteria: Record<string, { name: string; tag: string; rules: { id: string; label: string; check: boolean; hint: string }[] }> = {
    ondc: {
      name: 'ONDC (Open Network for Digital Commerce)',
      tag: 'Govt. Open Network',
      rules: [
        {
          id: 'ondc_sku',
          label: 'Auto-generated SKU Code per product',
          check: products.length > 0 && products.every((p) => Boolean(p.sku && p.sku.trim())),
          hint: 'Every product in your catalog must have a unique alphanumeric SKU code.',
        },
        {
          id: 'ondc_dim',
          label: 'Product Weights and Physical Dimensions',
          check: products.length > 0 && products.every((p) => Boolean(p.weight && p.dimensions)),
          hint: 'Required for automated courier & delivery partner calculation on ONDC.',
        },
        {
          id: 'ondc_desc',
          label: 'High-Converting Narrative Description (>50 words)',
          check: products.length > 0 && products.every((p) => Boolean(p.description && p.description.length > 50)),
          hint: 'Auto-fill traditional craft stories with AI in the Product Studio.',
        },
        {
          id: 'ondc_reg',
          label: 'Udyam / SHG Registration ID',
          check: Boolean(businessProfile?.businessRegistration || businessProfile?.gstNumber),
          hint: 'Add your free Udyam or SHG ID in the Business Profile tab.',
        },
      ],
    },
    amazon_karigar: {
      name: 'Amazon Karigar / Saheli',
      tag: 'Amazon Prime Network',
      rules: [
        {
          id: 'az_count',
          label: 'Minimum 3 Listed Products in Catalog',
          check: products.length >= 3,
          hint: 'Amazon Karigar storefronts require a minimum showcase of 3 handmade items.',
        },
        {
          id: 'az_photos',
          label: 'High-Resolution Photos with Clean Backgrounds',
          check: products.length > 0 && products.every((p) => p.imageUrls && p.imageUrls.length >= 1),
          hint: 'Audit photo brightness and backdrops in the Image Studio.',
        },
        {
          id: 'az_gst',
          label: 'GST Number or Composite Exemption ID',
          check: Boolean(businessProfile?.gstNumber),
          hint: 'Enter your GSTIN in the Business Profile tab.',
        },
        {
          id: 'az_bank',
          label: 'Linked Direct Payout Bank Account Details',
          check: Boolean(businessProfile?.phoneNumber),
          hint: 'Ensure your owner contact details and WhatsApp are up to date.',
        },
      ],
    },
    flipkart_samarth: {
      name: 'Flipkart Samarth',
      tag: '0% Commission Tier',
      rules: [
        {
          id: 'fk_shg',
          label: 'Artisan / SHG Certificate Proof',
          check: Boolean(businessProfile?.businessRegistration || businessProfile?.businessName),
          hint: 'Registered SHG or artisan certificate allows 0% commission waiver.',
        },
        {
          id: 'fk_stock',
          label: 'Active Inventory Stock Count > 0',
          check: products.length > 0 && products.some((p) => p.stock > 0),
          hint: 'Ensure stock count is accurately specified in your Product Studio.',
        },
        {
          id: 'fk_cat',
          label: 'Traditional Craft Category Tagged',
          check: products.length > 0 && products.every((p) => Boolean(p.category)),
          hint: 'Tag items under Handicrafts, Textiles, or Pottery.',
        },
      ],
    },
    meesho: {
      name: 'Meesho Micro-Seller',
      tag: 'Zero Commission Mass Reach',
      rules: [
        {
          id: 'ms_enrol',
          label: 'PAN / Enrolment ID for Micro-Sellers',
          check: Boolean(businessProfile?.ownerName && businessProfile?.phoneNumber),
          hint: 'Basic owner details and contact numbers are sufficient for onboarding.',
        },
        {
          id: 'ms_price',
          label: 'Competitive Wholesale / Direct Retail Pricing',
          check: products.length > 0 && products.every((p) => p.price > 0),
          hint: 'Price your products fairly using the Voice Mentor margin formula.',
        },
        {
          id: 'ms_img',
          label: 'Clean Smartphone Photos',
          check: products.length > 0,
          hint: 'Clear front-facing smartphone photo of the craft.',
        },
      ],
    },
    etsy: {
      name: 'Etsy Global & India',
      tag: 'International Export',
      rules: [
        {
          id: 'et_story',
          label: 'Artisan Heritage & Craft Tradition Story',
          check: products.length > 0 && products.every((p) => p.description && p.description.length > 60),
          hint: 'Global buyers look for the cultural story behind the handcrafted piece.',
        },
        {
          id: 'et_price',
          label: 'Premium Export-Ready Craft Items (> ₹800)',
          check: products.some((p) => p.price >= 800),
          hint: 'Etsy buyers pay premium rates for authentic folk art and handloom.',
        },
        {
          id: 'et_pack',
          label: 'Safe Courier Packaging Guidelines Defined',
          check: products.every((p) => Boolean(p.weight)),
          hint: 'Weights must be clearly defined for international air shipping.',
        },
      ],
    },
  };

  const currentPlatform = platformCriteria[activePlatformTab] || platformCriteria.ondc;
  const completedRulesCount = currentPlatform.rules.filter((r) => r.check).length;
  const platformScore = Math.round((completedRulesCount / currentPlatform.rules.length) * 100);

  const handleExportCatalog = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      platformStandard: currentPlatform.name,
      businessDetails: {
        businessName: businessProfile?.businessName || 'Rural Artisan Business',
        category: businessProfile?.businessCategory || 'Handicrafts',
        owner: businessProfile?.ownerName || 'Artisan',
        phone: businessProfile?.phoneNumber || '',
        state: businessProfile?.state || 'India',
        gst: businessProfile?.gstNumber || '',
        udyam: businessProfile?.businessRegistration || '',
      },
      products: products.map((p) => ({
        id: p.id,
        sku: p.sku || `SKU-${p.id.slice(-5)}`,
        title: p.title,
        category: p.category,
        priceINR: p.price,
        stock: p.stock,
        weight: p.weight || '0.5 kg',
        dimensions: p.dimensions || '10x10x10 cm',
        description: p.description,
        keywords: p.keywords,
        imageUrls: p.imageUrls,
        status: p.status || 'published',
        complianceReady: p.isMarketplaceReady,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krivio_catalog_${activePlatformTab}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const ondOnboardingSteps = [
    { title: 'Create Udyam / GST Registration', desc: 'Free micro-enterprise registration for artisans and SHGs.', status: businessProfile?.businessRegistration || businessProfile?.gstNumber ? 'done' : 'next' },
    { title: 'Prepare 3 Studio Product Listings', desc: 'Photos with clear lighting and AI-generated craft descriptions.', status: products.length >= 3 ? 'done' : 'next' },
    { title: 'Choose ONDC Seller App', desc: 'Select Mystore, Paytm Seller, or Plotch to host your catalog.', status: 'next' },
    { title: 'Link Bank Account for Direct Payouts', desc: 'Verify IFSC code for immediate customer payments.', status: 'pending' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#13251B] p-5 sm:p-8 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-white font-poppins">
              {t('marketplace.title')}
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-[#0F5132]/20 dark:border-emerald-800 font-poppins">
              ONDC & E-Commerce
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-emerald-300/70 max-w-2xl font-inter">
            {t('marketplace.subtitle')}
          </p>
        </div>

        <button
          onClick={handleExportCatalog}
          disabled={products.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0 disabled:opacity-50 font-poppins cursor-pointer active:scale-98"
        >
          <Download className="w-4 h-4 text-[#D4AF37]" />
          <span>{t('marketplace.exportCatalog')}</span>
        </button>
      </div>

      {exportSuccess && (
        <div className="p-4 bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/20 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-[#0F5132] dark:text-emerald-300 font-medium font-inter">
          <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
          <span>{t('common.success')}! Catalog data exported successfully for {currentPlatform.name}.</span>
        </div>
      )}

      {/* Multi-Platform Scorecard Tab Selector */}
      <div className="bg-white dark:bg-[#13251B] rounded-3xl p-5 sm:p-6 border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-emerald-900/40 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white font-poppins">
              {t('marketplace.title')}
            </h2>
          </div>
          <span className="text-xs text-stone-500 dark:text-emerald-400/80 font-mono">
            {formatNumber(products.length)} {t('dashboard.products')}
          </span>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'ondc', name: 'ONDC Network', logo: '🌐' },
            { id: 'amazon_karigar', name: 'Amazon Karigar', logo: '📦' },
            { id: 'flipkart_samarth', name: 'Flipkart Samarth', logo: '🛍️' },
            { id: 'meesho', name: 'Meesho', logo: '🏷️' },
            { id: 'etsy', name: 'Etsy Export', logo: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlatformTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 font-poppins cursor-pointer ${
                activePlatformTab === tab.id
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300/80 hover:bg-stone-200 dark:hover:bg-[#183023]'
              }`}
            >
              <span>{tab.logo}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Platform Scorecard Details */}
        <div className="bg-[#F8F9F5] dark:bg-[#183023]/60 p-4 sm:p-6 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-6 font-inter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                  {currentPlatform.name}
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 rounded-md border border-[#0F5132]/20 font-poppins">
                  {currentPlatform.tag}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70 mt-1">
                {t('marketplace.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-emerald-400/60 block font-poppins">{t('marketplace.readinessScore')}</span>
                <span className="text-2xl font-black text-[#0F5132] dark:text-[#34D399] font-poppins">
                  {platformScore}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-[#0F5132]/20 border-t-[#0F5132] dark:border-emerald-500/20 dark:border-t-emerald-400 flex items-center justify-center font-bold text-xs text-[#0F5132] dark:text-emerald-300 font-poppins">
                {completedRulesCount}/{currentPlatform.rules.length}
              </div>
            </div>
          </div>

          {/* Rules Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {currentPlatform.rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border space-y-1.5 transition-all ${
                  rule.check
                    ? 'bg-[#0F5132]/5 dark:bg-[#13251B]/80 border-[#0F5132]/20 dark:border-emerald-800/80'
                    : 'bg-white dark:bg-[#13251B] border-stone-200 dark:border-emerald-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {rule.check ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white font-poppins">
                      {rule.label}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-poppins ${
                      rule.check
                        ? 'bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-[#D4AF37]/15 text-[#8B6E10] dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {rule.check ? t('marketplace.checklist') : 'Action Needed'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-emerald-200/80 leading-relaxed pl-6 font-inter">
                  {rule.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ONDC Fast-Track Milestone Checklist */}
      <div className="bg-[#0F5132] text-white p-5 sm:p-8 rounded-3xl border border-[#2E7D32]/50 shadow-lg space-y-5 font-inter">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white font-bold flex items-center justify-center text-lg">
              🌐
            </div>
            <div>
              <h3 className="text-base font-bold font-poppins">
                ONDC (Open Network for Digital Commerce) Fast-Track
              </h3>
              <p className="text-xs text-emerald-200/90 font-inter">
                Government-backed network connecting rural craftspeople directly to national buyers
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#2E7D32]/60 text-white rounded-full text-xs font-semibold hidden sm:inline font-poppins">
            75% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {ondOnboardingSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 ${
                step.status === 'done'
                  ? 'bg-[#0B3D26]/80 border-emerald-400/40 text-emerald-100'
                  : step.status === 'next'
                  ? 'bg-[#183023] border-[#D4AF37] text-white ring-2 ring-[#D4AF37]/50'
                  : 'bg-[#0B3D26]/40 border-emerald-800/40 text-emerald-200/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80 font-poppins">
                  Step 0{idx + 1}
                </span>
                {step.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
                )}
              </div>
              <h4 className="text-xs font-bold font-poppins">{step.title}</h4>
              <p className="text-[11px] opacity-80 leading-relaxed font-inter">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selling Channels Grid */}
      <div className="space-y-4">
        <h2 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider font-poppins">
          {t('marketplace.channelsTitle')}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-stone-200 dark:bg-[#183023] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {channels.map((ch, idx) => {
              const cName = ch.channelName || (ch as any).name || 'Sales Channel';
              const cLogo = ch.logo || '🏪';
              const cDesc = ch.description || 'Direct selling channel for rural enterprise catalog.';
              const cScore = ch.fitScore ?? 92;
              const cBenefits = Array.isArray(ch.benefits) ? ch.benefits : ['Direct customer orders', '0% setup fee'];
              const cReqs = Array.isArray(ch.requirements) ? ch.requirements : ['Active catalog listing', 'Bank account details'];

              return (
                <div
                  key={ch.channelId || `ch_${idx}`}
                  className="bg-white dark:bg-[#13251B] rounded-3xl p-5 sm:p-6 border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs hover:border-[#0F5132] transition-all flex flex-col justify-between space-y-5 font-inter"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#0E2016] text-2xl flex items-center justify-center shrink-0 border border-[#0F5132]/10 dark:border-emerald-900/40">
                          {cLogo}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-1 font-poppins">
                            {cName}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-emerald-300/70 line-clamp-2 mt-0.5">{cDesc}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-emerald-400/60 block font-poppins">{t('marketplace.fitScore')}</span>
                        <span className="text-base font-black text-[#0F5132] dark:text-[#34D399] font-poppins">
                          {cScore}%
                        </span>
                      </div>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-[10px] font-bold uppercase text-stone-400 dark:text-emerald-400/60 tracking-wider font-poppins">
                        Key Channel Benefits
                      </h4>
                      <div className="space-y-1 text-xs">
                        {cBenefits.slice(0, 2).map((b, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-stone-700 dark:text-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] dark:text-[#34D399] shrink-0" />
                            <span className="line-clamp-1">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="p-2.5 bg-[#F8F9F5] dark:bg-[#183023]/60 rounded-xl border border-[#0F5132]/15 dark:border-emerald-800/60 text-[11px] space-y-1">
                      <span className="font-bold text-stone-800 dark:text-emerald-100 block text-[10px] font-poppins">
                        {t('marketplace.requirements')}:
                      </span>
                      <p className="text-stone-600 dark:text-emerald-200/80 line-clamp-2 font-inter">
                        {cReqs.join(' • ')}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility & CTA */}
                  <div className="pt-3 flex items-center justify-between border-t border-stone-100 dark:border-emerald-900/40">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {ch.isEligible ?? true ? (
                        <span className="text-[#0F5132] dark:text-[#34D399] flex items-center gap-1 text-[11px] font-poppins">
                          <ShieldCheck className="w-4 h-4" /> Eligible
                        </span>
                      ) : (
                        <span className="text-[#D4AF37] flex items-center gap-1 text-[11px] font-poppins">
                          <AlertCircle className="w-4 h-4" /> Needs Listing
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => alert(`Starting application process for ${cName}. Link generated in your notifications.`)}
                      className="py-2 px-4 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 font-poppins cursor-pointer active:scale-98"
                    >
                      <span>{t('marketplace.applyNow')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
