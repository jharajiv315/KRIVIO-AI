import React, { useEffect, useState } from 'react';
import { marketplaceApi, productsApi, businessProfileApi } from '../services/api';
import { ChannelRecommendation, Product, BusinessProfile } from '../types';
import {
  Store,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  FileText,
  Download,
  Check,
  XCircle,
  HelpCircle,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const MarketplaceReadiness: React.FC = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Marketplace Readiness & Multi-Platform Syndication
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-full">
              ONDC & E-Commerce
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Evaluate your product catalog compliance across ONDC, Amazon Karigar, Flipkart Samarth, Meesho, and Etsy. Validate barcodes/SKUs, dimensions, and download export-ready data.
          </p>
        </div>

        <button
          onClick={handleExportCatalog}
          disabled={products.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Catalog (JSON)</span>
        </button>
      </div>

      {exportSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Catalog data exported successfully for {currentPlatform.name}! Ready for bulk upload.</span>
        </div>
      )}

      {/* Multi-Platform Scorecard Tab Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-poppins">
              Multi-Platform Compliance Scorecard
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {products.length} Products in Catalog
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
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activePlatformTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.logo}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Platform Scorecard Details */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  {currentPlatform.name}
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                  {currentPlatform.tag}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Evaluation based on your active products, barcode/SKUs, dimensions, and business registration.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Readiness Score</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {platformScore}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                {completedRulesCount}/{currentPlatform.rules.length}
              </div>
            </div>
          </div>

          {/* Rules Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlatform.rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border space-y-1.5 transition-all ${
                  rule.check
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {rule.check ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rule.label}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rule.check
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {rule.check ? 'Compliant' : 'Action Needed'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-6">
                  {rule.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ONDC Fast-Track Milestone Checklist */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg">
              🌐
            </div>
            <div>
              <h3 className="text-base font-bold font-display">
                ONDC (Open Network for Digital Commerce) Fast-Track
              </h3>
              <p className="text-xs text-emerald-300">
                Government-backed network connecting rural craftspeople directly to national buyers
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-800/80 text-emerald-200 rounded-full text-xs font-semibold hidden sm:inline">
            75% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ondOnboardingSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 ${
                step.status === 'done'
                  ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-100'
                  : step.status === 'next'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-100 ring-2 ring-amber-400/50'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Step 0{idx + 1}
                </span>
                {step.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <h4 className="text-xs font-bold">{step.title}</h4>
              <p className="text-[11px] opacity-80 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selling Channels Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Recommended Selling Channels & Gateways
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-2xl flex items-center justify-center shrink-0">
                          {cLogo}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {cName}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{cDesc}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Fit Score</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-display">
                          {cScore}%
                        </span>
                      </div>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Key Channel Benefits
                      </h4>
                      <div className="space-y-1 text-xs">
                        {cBenefits.slice(0, 2).map((b, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="line-clamp-1">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block text-[10px]">
                        Requirements:
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                        {cReqs.join(' • ')}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility & CTA */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {ch.isEligible ?? true ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-4 h-4" /> Eligible
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                          <AlertCircle className="w-4 h-4" /> Needs Listing
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => alert(`Starting application process for ${cName}. Link generated in your notifications.`)}
                      className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Onboard</span>
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
