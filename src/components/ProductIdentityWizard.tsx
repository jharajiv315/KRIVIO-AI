import React, { useState, useCallback, useEffect, useRef } from 'react';
import { productsApi, imagesApi, businessProfileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import {
  Upload, Camera, ChevronRight, ChevronLeft, Sparkles, RefreshCw,
  CheckCircle2, AlertCircle, Save, X, Tag, Star, Wand2, Package,
  Globe, Lightbulb, ShieldCheck, Info,
} from 'lucide-react';

interface BrandSuggestion {
  name: string;
  meaning: string;
  whyItFits: string;
  personality: string;
  tagline: string;
}

interface ProductIdentityData {
  productTitle: string;
  shortDescription: string;
  detailedDescription: string;
  keyFeatures: string[];
  materials: string;
  craftMethod?: string;
  idealFor: string;
  productStory: string;
  careInstructions?: string;
  suggestedTags: string[];
  suggestedKeywords: string[];
  suggestedPrice: number;
  category: string;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;
type ListingMode = 'marketplace' | 'instagram' | 'whatsapp' | 'catalogue' | 'short';

const LISTING_MODES: { id: ListingMode; label: string; emoji: string }[] = [
  { id: 'marketplace', label: 'Marketplace', emoji: '🛒' },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
  { id: 'catalogue', label: 'Catalogue', emoji: '📄' },
  { id: 'short', label: 'Short', emoji: '⚡' },
];

const BRAND_PERSONALITIES = ['Traditional', 'Modern', 'Premium', 'Natural', 'Handmade', 'Cultural', 'Minimal', 'Friendly'];

const StepBar: React.FC<{ current: WizardStep; total: number }> = ({ current, total }) => {
  const { t } = useI18n();
  const labels = [
    t('wizard.step1'),
    t('wizard.step2'),
    t('wizard.step3'),
    t('wizard.step4'),
    t('wizard.step5'),
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-emerald-400/80 font-poppins">
        <span>Step {current} of {total}</span>
        <span className="text-[#0F5132] dark:text-[#34D399] font-bold">{labels[current - 1]}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i + 1 <= current ? 'bg-[#0F5132] dark:bg-emerald-400' : 'bg-stone-200 dark:bg-[#183023]'}`} />
        ))}
      </div>
    </div>
  );
};

const EditableText: React.FC<{
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  label?: string;
  placeholder?: string;
}> = ({ value, onChange, multiline, label, placeholder }) => {
  const base = 'w-full px-3.5 py-2.5 text-xs bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-stone-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#0F5132] font-inter';
  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] font-bold text-stone-500 dark:text-emerald-400/80 uppercase tracking-wider font-poppins">{label}</label>}
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={`${base} resize-none leading-relaxed`} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={base} />
      }
    </div>
  );
};

interface ProductIdentityWizardProps {
  initialImage?: string | null;
  initialDetectedSubject?: string;
  onSaved?: () => void;
  onCancel?: () => void;
}

export const ProductIdentityWizard: React.FC<ProductIdentityWizardProps> = ({
  initialImage,
  initialDetectedSubject,
  onSaved,
}) => {
  const { user, openAuthModal } = useAuth();
  const { t, formatCurrency, currentLanguageConfig, supportedLanguages } = useI18n();
  const [step, setStep] = useState<WizardStep>(initialImage ? 2 : 1);

  // Step 1
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [detectedSubject, setDetectedSubject] = useState(initialDetectedSubject || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [productName, setProductName] = useState('');
  const [hasBrand, setHasBrand] = useState<boolean | null>(null);
  const [materials, setMaterials] = useState('');
  const [whatMakesSpecial, setWhatMakesSpecial] = useState('');
  const [region, setRegion] = useState('');
  const [targetAudience] = useState('Craft lovers, home decor buyers, gift shoppers');
  const [priceRange, setPriceRange] = useState('');
  const [language, setLanguage] = useState(currentLanguageConfig.name);
  const [listingMode, setListingMode] = useState<ListingMode>('marketplace');

  // Step 3
  const [existingBrandName, setExistingBrandName] = useState('');
  const [brandPersonalities, setBrandPersonalities] = useState<string[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandSuggestion | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [brandError, setBrandError] = useState('');
  const [finalBrandName, setFinalBrandName] = useState('');

  // Step 4
  const [identity, setIdentity] = useState<ProductIdentityData | null>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(false);
  const [identityError, setIdentityError] = useState('');

  // Step 5
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLanguage(currentLanguageConfig.name);
  }, [currentLanguageConfig]);

  useEffect(() => {
    businessProfileApi.get().then((res) => {
      const bp = res.businessProfile;
      if (!bp) return;
      if (bp.state && bp.district) setRegion(`${bp.district}, ${bp.state}`);
      else if (bp.state) setRegion(bp.state);
      if (bp.businessName) setExistingBrandName(bp.businessName);
    }).catch(() => {});
  }, []);

  const processFile = useCallback((file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) { setUploadError('Please upload a valid image file (JPG, PNG, WEBP).'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('Image is too large. Please choose a file under 10MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      imagesApi.analyze(base64).then((res) => setDetectedSubject(res.analysis.detectedSubject || '')).catch(() => {}).finally(() => setAnalyzingImage(false));
      setAnalyzingImage(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const handleGenerateBrand = async () => {
    setLoadingBrand(true); setBrandError(''); setBrandSuggestions([]);
    try {
      const res = await productsApi.suggestBrand({
        craftType: detectedSubject || productName || 'Handcrafted artisan product',
        region, personality: brandPersonalities.join(', '), language,
      });
      setBrandSuggestions(res.suggestions || []);
    } catch { setBrandError(t('errors.general')); }
    finally { setLoadingBrand(false); }
  };

  const handleGenerateIdentity = async (mode?: ListingMode, lang?: string) => {
    setLoadingIdentity(true); setIdentityError('');
    try {
      const brand = hasBrand ? existingBrandName : (selectedBrand?.name || finalBrandName || '');
      const res = await productsApi.generateIdentity({
        imageBase64: uploadedImage || undefined,
        productName, detectedSubject, brandName: brand, materials,
        whatMakesSpecial, region, targetAudience, priceRange,
        language: lang || language, listingMode: mode || listingMode,
      });
      setIdentity(res.data);
    } catch { setIdentityError(t('errors.general')); }
    finally { setLoadingIdentity(false); }
  };

  const handleSaveProduct = async () => {
    if (!user) { openAuthModal(); return; }
    if (!identity) return;
    setSaving(true); setSaveError('');
    try {
      const brand = hasBrand ? existingBrandName : (selectedBrand?.name || finalBrandName || '');
      const fullTitle = brand ? `${brand} — ${identity.productTitle}` : identity.productTitle;
      await productsApi.create({
        title: fullTitle.slice(0, 150),
        description: identity.detailedDescription,
        category: identity.category,
        price: identity.suggestedPrice,
        stock: 10,
        sku: `SKU-PIW-${Date.now().toString().slice(-6)}`,
        keywords: [...(identity.suggestedTags || []), ...(identity.suggestedKeywords || [])].slice(0, 10),
        imageUrls: uploadedImage ? [uploadedImage] : [],
        status: 'draft',
      });
      setSaveSuccess(true);
      setTimeout(() => onSaved?.(), 2500);
    } catch (err: any) { setSaveError(err.message || t('errors.general')); }
    finally { setSaving(false); }
  };

  const goNext = () => {
    if (step === 1 && !uploadedImage) { setUploadError('Please upload a product photo first.'); return; }
    if (step === 3) handleGenerateIdentity();
    setStep((s) => Math.min(s + 1, 5) as WizardStep);
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1) as WizardStep);
  const canProceedStep2 = hasBrand !== null;
  const canProceedStep3 = hasBrand
    ? existingBrandName.trim().length > 0
    : (selectedBrand !== null || finalBrandName.trim().length > 0);

  const btnPrimary = 'inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer active:scale-98';
  const btnBack = 'inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-stone-600 dark:text-emerald-200 hover:text-stone-900 dark:hover:text-white transition-colors font-poppins cursor-pointer';
  const inputBase = 'w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter';
  const card = 'bg-white dark:bg-[#13251B] rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs p-4 sm:p-6 space-y-5 font-inter';

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-[#13251B] p-4 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60">
        <StepBar current={step} total={5} />
      </div>

      {/* STEP 1: Upload */}
      {step === 1 && (
        <div className={card}>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1 font-poppins">
              <Camera className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" /> Upload Your Product Photo
            </h2>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70">
              Take a clear photo of your product. We will analyse it and help you create a complete listing.
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !uploadedImage && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[220px] flex flex-col items-center justify-center overflow-hidden ${
              isDragging ? 'border-[#0F5132] bg-[#0F5132]/5 dark:bg-[#183023]/60'
              : uploadedImage ? 'border-[#0F5132] dark:border-emerald-600 cursor-default'
              : 'border-[#0F5132]/30 dark:border-emerald-800/60 hover:border-[#0F5132] bg-[#F8F9F5] dark:bg-[#0E2016]'
            }`}
          >
            {uploadedImage ? (
              <>
                <img src={uploadedImage} alt="Product" className="w-full max-h-64 object-contain" />
                {analyzingImage && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#D4AF37]" />
                    <p className="text-xs font-semibold font-poppins">Understanding your product...</p>
                  </div>
                )}
                {!analyzingImage && detectedSubject && (
                  <div className="absolute bottom-3 left-3 right-3 bg-[#0F5132]/90 backdrop-blur-xs text-emerald-100 text-[11px] font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-poppins">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    Detected: {detectedSubject}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950/60 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#0F5132] dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700 dark:text-emerald-100 font-poppins">Drag and drop your photo here</p>
                  <p className="text-xs text-stone-400 mt-0.5 font-inter">or click to browse from your device</p>
                </div>
                <p className="text-[10px] text-stone-400 font-inter">JPG, PNG, WEBP supported · Max 10MB</p>
              </div>
            )}
          </div>

          {uploadedImage && (
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 text-xs font-semibold bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-700 dark:text-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-poppins cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Replace Photo
              </button>
              <button onClick={() => { setUploadedImage(null); setDetectedSubject(''); }} className="py-2 px-4 text-xs font-semibold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={goNext} disabled={!uploadedImage || analyzingImage} className={btnPrimary}>
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Questions */}
      {step === 2 && (
        <div className="bg-white dark:bg-[#13251B] rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs p-5 sm:p-6 space-y-6 font-inter">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1 font-poppins">
              <Lightbulb className="w-5 h-5 text-[#D4AF37]" /> Tell Us About Your Product
            </h2>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70">
              A few quick questions. We will use your answers to create the perfect listing.
              {detectedSubject && <span className="ml-1 text-[#0F5132] dark:text-emerald-400 font-medium">We detected: <strong>{detectedSubject}</strong></span>}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">What is your product called? <span className="font-normal text-stone-400">(optional)</span></label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={detectedSubject || 'e.g. Madhubani Handpainted Silk Stole'} className={inputBase} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">Do you already have a brand name?</label>
              <div className="grid grid-cols-2 gap-3">
                {([true, false] as const).map((val) => (
                  <button key={String(val)} onClick={() => setHasBrand(val)}
                    className={`py-3 rounded-xl border text-xs font-semibold transition-all font-poppins cursor-pointer ${hasBrand === val ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-xs' : 'bg-[#F8F9F5] dark:bg-[#0E2016] text-stone-700 dark:text-emerald-200 border-[#0F5132]/15 dark:border-emerald-900/40 hover:border-[#0F5132]'}`}>
                    {val ? 'Yes, I have one' : 'Help me choose one'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">What material is it made from?</label>
              <input type="text" value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="e.g. Handloom cotton, Natural clay, Bamboo" className={inputBase} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">What makes this product special?</label>
              <textarea rows={2} value={whatMakesSpecial} onChange={(e) => setWhatMakesSpecial(e.target.value)} placeholder="e.g. Hand-painted using natural dyes, family tradition for 3 generations" className={`${inputBase} resize-none`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">Where is it made?</label>
                <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Madhubani, Bihar" className={inputBase} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">Price range</label>
                <input type="text" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} placeholder="e.g. Rs.500 to Rs.1500" className={inputBase} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 flex items-center gap-1.5 font-poppins"><Globe className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" /> {t('common.language')}</label>
              <div className="flex gap-2 flex-wrap">
                {supportedLanguages.map((lang) => (
                  <button key={lang.code} onClick={() => setLanguage(lang.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all font-poppins cursor-pointer ${language === lang.name ? 'bg-[#0F5132] text-white border-[#0F5132]' : 'bg-[#F8F9F5] dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300/80 border-[#0F5132]/15 dark:border-emerald-900/40 hover:border-[#0F5132]'}`}>
                    {lang.flag} {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={goPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> {t('wizard.back')}</button>
            <button onClick={goNext} disabled={!canProceedStep2} className={btnPrimary}>{t('wizard.next')} <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* STEP 3: Brand */}
      {step === 3 && (
        <div className={card}>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1 font-poppins">
              <Star className="w-5 h-5 text-[#D4AF37]" />
              {hasBrand ? 'Your Brand' : 'Choose a Brand Name'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70">
              {hasBrand ? 'Confirm or update your brand name below.' : 'We will suggest names. Pick one, edit it, or enter your own.'}
            </p>
          </div>

          {hasBrand && (
            <div className="space-y-3">
              <EditableText label="Your Brand Name" value={existingBrandName} onChange={setExistingBrandName} placeholder="e.g. Devi Handlooms" />
              <div className="p-3 bg-[#0F5132]/5 dark:bg-[#183023]/70 border border-[#0F5132]/20 dark:border-emerald-700/50 rounded-xl flex items-center gap-2 text-xs text-[#0F5132] dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Your existing brand will be used for this listing.
              </div>
            </div>
          )}

          {!hasBrand && (
            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">What feeling should your brand communicate? <span className="font-normal text-stone-400">(choose any)</span></label>
                <div className="flex flex-wrap gap-2">
                  {BRAND_PERSONALITIES.map((p) => (
                    <button key={p} onClick={() => setBrandPersonalities((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all font-poppins cursor-pointer ${brandPersonalities.includes(p) ? 'bg-[#0F5132] text-white border-[#0F5132]' : 'bg-[#F8F9F5] dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300/80 border-[#0F5132]/15 dark:border-emerald-900/40 hover:border-[#0F5132]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerateBrand} disabled={loadingBrand}
                className="w-full py-3 bg-[#0F5132] hover:bg-[#0B3D26] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer active:scale-98">
                {loadingBrand ? <><RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" /> Finding ideas for your brand...</> : <><Wand2 className="w-4 h-4 text-[#D4AF37]" /> Generate Brand Name Ideas</>}
              </button>

              {brandError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {brandError}
                </div>
              )}

              {brandSuggestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-poppins">Pick a name you like</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {brandSuggestions.map((s, i) => (
                      <button key={i} onClick={() => { setSelectedBrand(s); setFinalBrandName(s.name); }}
                        className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 cursor-pointer ${selectedBrand?.name === s.name ? 'border-[#0F5132] bg-[#0F5132]/5 dark:bg-[#183023]/70 ring-2 ring-[#0F5132]/30' : 'border-[#0F5132]/15 dark:border-emerald-900/40 hover:border-[#0F5132] bg-white dark:bg-[#13251B]'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-stone-900 dark:text-white font-poppins">{s.name}</span>
                          {selectedBrand?.name === s.name && <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />}
                        </div>
                        <p className="text-[10px] text-stone-500 dark:text-emerald-300/70 italic">{s.meaning}</p>
                        <p className="text-[11px] text-stone-600 dark:text-emerald-200/90 leading-relaxed">{s.whyItFits}</p>
                        <span className="px-2 py-0.5 bg-stone-100 dark:bg-[#183023] text-[10px] font-semibold text-stone-600 dark:text-emerald-300 rounded-md inline-block font-poppins">{s.personality}</span>
                        {s.tagline && <p className="text-[10px] text-[#0F5132] dark:text-[#34D399] font-medium font-poppins">"{s.tagline}"</p>}
                      </button>
                    ))}
                  </div>
                  {selectedBrand && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-poppins">Customise selected name</label>
                      <input type="text" value={finalBrandName} onChange={(e) => setFinalBrandName(e.target.value)} className={`${inputBase} font-semibold font-poppins`} />
                    </div>
                  )}
                  <div className="p-3 bg-[#D4AF37]/10 dark:bg-[#183023]/70 border border-[#D4AF37]/30 dark:border-amber-700/50 rounded-xl flex items-start gap-2 text-[11px] text-stone-800 dark:text-emerald-100">
                    <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>Before using this name commercially, please verify trademark and domain availability independently.</span>
                  </div>
                  <button onClick={handleGenerateBrand} disabled={loadingBrand}
                    className="w-full py-2 bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-700 dark:text-emerald-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 font-poppins cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate ideas
                  </button>
                </div>
              )}

              {!brandSuggestions.length && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-poppins">Or enter your own brand name</label>
                  <input type="text" value={finalBrandName} onChange={(e) => setFinalBrandName(e.target.value)} placeholder="Enter a brand name you would like to use" className={inputBase} />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={goPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> {t('wizard.back')}</button>
            <button onClick={goNext} disabled={!canProceedStep3} className={btnPrimary}>
              {t('wizard.next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Description */}
      {step === 4 && (
        <div className="space-y-4">
          {/* Mode + Language */}
          <div className="bg-white dark:bg-[#13251B] p-3.5 sm:p-4 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 font-inter">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {LISTING_MODES.map((m) => (
                  <button key={m.id} onClick={() => { setListingMode(m.id); if (identity) handleGenerateIdentity(m.id); }} disabled={loadingIdentity}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1 shrink-0 transition-all font-poppins cursor-pointer ${listingMode === m.id ? 'bg-[#0F5132] text-white shadow-xs' : 'bg-stone-100 dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300/80 hover:bg-stone-200'}`}>
                    <span>{m.emoji}</span><span>{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
                {supportedLanguages.map((lang) => (
                  <button key={lang.code} onClick={() => { setLanguage(lang.name); if (identity) handleGenerateIdentity(undefined, lang.name); }} disabled={loadingIdentity}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all font-poppins cursor-pointer ${language === lang.name ? 'bg-[#0F5132] text-white' : 'bg-stone-100 dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300/80 hover:bg-stone-200'}`}>
                    {lang.flag} {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadingIdentity && (
            <div className="bg-white dark:bg-[#13251B] rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 p-8 sm:p-12 flex flex-col items-center gap-4 text-center font-inter">
              <div className="w-14 h-14 rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950/60 flex items-center justify-center">
                <Wand2 className="w-7 h-7 text-[#0F5132] dark:text-emerald-400 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-stone-800 dark:text-white font-poppins">Writing your product story...</p>
              <p className="text-xs text-stone-400 font-inter">Creating title, description, features, and tags</p>
            </div>
          )}

          {identityError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" /> <span className="flex-1">{identityError}</span>
              <button onClick={() => handleGenerateIdentity()} className="px-3 py-1 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 rounded-lg font-semibold transition-colors cursor-pointer font-poppins">Try Again</button>
            </div>
          )}

          {identity && !loadingIdentity && (
            <div className={card}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-stone-500 dark:text-emerald-400/80 uppercase tracking-wider font-poppins">Generated — All fields editable</span>
                </div>
                <button onClick={() => handleGenerateIdentity()} className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-600 dark:text-emerald-200 text-[11px] font-semibold rounded-xl transition-colors font-poppins cursor-pointer">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {uploadedImage && <img src={uploadedImage} alt="Product" className="w-20 h-20 object-cover rounded-xl border border-[#0F5132]/20 dark:border-emerald-800/60 shrink-0" />}
                <div className="flex-1 space-y-3 w-full">
                  <EditableText label="Brand Name" value={hasBrand ? existingBrandName : (selectedBrand?.name || finalBrandName)} onChange={(v) => hasBrand ? setExistingBrandName(v) : setFinalBrandName(v)} placeholder="Brand name" />
                  <EditableText label="Product Title" value={identity.productTitle} onChange={(v) => setIdentity({ ...identity, productTitle: v })} placeholder="Product title" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 dark:text-emerald-400/80 uppercase tracking-wider font-poppins">Price (₹)</label>
                  <input type="number" value={identity.suggestedPrice} onChange={(e) => setIdentity({ ...identity, suggestedPrice: Number(e.target.value) })} className="w-full px-3.5 py-2 text-xs bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-stone-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#0F5132] font-inter" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 dark:text-emerald-400/80 uppercase tracking-wider font-poppins">Category</label>
                  <input type="text" value={identity.category} onChange={(e) => setIdentity({ ...identity, category: e.target.value })} className="w-full px-3.5 py-2 text-xs bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-stone-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#0F5132] font-inter" />
                </div>
              </div>

              <EditableText label="Short Description" value={identity.shortDescription} onChange={(v) => setIdentity({ ...identity, shortDescription: v })} multiline placeholder="Short description..." />
              <EditableText label="Detailed Description" value={identity.detailedDescription} onChange={(v) => setIdentity({ ...identity, detailedDescription: v })} multiline placeholder="Detailed description..." />
              <EditableText label="Product Story" value={identity.productStory} onChange={(v) => setIdentity({ ...identity, productStory: v })} multiline placeholder="Product story..." />

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 dark:text-emerald-400/80 uppercase tracking-wider font-poppins">Key Features</label>
                <div className="space-y-2">
                  {identity.keyFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] dark:text-[#34D399] shrink-0" />
                      <input type="text" value={f} onChange={(e) => { const u = [...identity.keyFeatures]; u[i] = e.target.value; setIdentity({ ...identity, keyFeatures: u }); }} className="flex-1 px-3 py-1.5 text-xs bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-stone-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#0F5132] font-inter" />
                      <button onClick={() => setIdentity({ ...identity, keyFeatures: identity.keyFeatures.filter((_, idx) => idx !== i) })} className="text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => setIdentity({ ...identity, keyFeatures: [...identity.keyFeatures, ''] })} className="text-[11px] text-[#0F5132] dark:text-[#34D399] hover:underline font-semibold font-poppins cursor-pointer">+ Add feature</button>
                </div>
              </div>

              <EditableText label="Materials Used" value={identity.materials} onChange={(v) => setIdentity({ ...identity, materials: v })} placeholder="Materials..." />
              <EditableText label="Ideal For" value={identity.idealFor} onChange={(v) => setIdentity({ ...identity, idealFor: v })} placeholder="Who is this for..." />
              {identity.careInstructions && <EditableText label="Care Instructions" value={identity.careInstructions} onChange={(v) => setIdentity({ ...identity, careInstructions: v })} multiline placeholder="Care instructions..." />}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 dark:text-emerald-400/80 uppercase tracking-wider flex items-center gap-1.5 font-poppins"><Tag className="w-3 h-3 text-[#0F5132] dark:text-emerald-400" /> Tags and Keywords</label>
                <div className="flex flex-wrap gap-1.5">
                  {[...identity.suggestedTags, ...identity.suggestedKeywords].filter((v, i, a) => a.indexOf(v) === i).map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-stone-100 dark:bg-[#183023] text-stone-700 dark:text-emerald-200 text-[11px] font-medium rounded-lg font-inter">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loadingIdentity && (
            <div className="flex justify-between">
              <button onClick={goPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep(5)} disabled={!identity} className={btnPrimary}>
                Review and Save <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Review & Save */}
      {step === 5 && identity && (
        <div className="space-y-4">
          <div className={card}>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1 font-poppins">
                <Package className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" /> Review Your Product
              </h2>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">Everything looks good? Save it to your product catalog.</p>
            </div>

            <div className="bg-[#F8F9F5] dark:bg-[#183023]/60 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {uploadedImage && <img src={uploadedImage} alt="Product" className="w-24 h-24 object-cover rounded-2xl border border-[#0F5132]/20 dark:border-emerald-800/60 shrink-0" />}
                <div className="flex-1 space-y-2">
                  <div><span className="text-[10px] font-bold text-stone-400 uppercase font-poppins">Brand</span>
                    <p className="text-sm font-bold text-[#0F5132] dark:text-[#34D399] font-poppins">{hasBrand ? existingBrandName : (selectedBrand?.name || finalBrandName || '—')}</p></div>
                  <div><span className="text-[10px] font-bold text-stone-400 uppercase font-poppins">Product</span>
                    <p className="text-sm font-bold text-stone-900 dark:text-white font-poppins">{identity.productTitle}</p></div>
                  <div><span className="text-[10px] font-bold text-stone-400 uppercase font-poppins">Price</span>
                    <p className="text-base font-black text-stone-900 dark:text-white font-poppins">₹{identity.suggestedPrice.toLocaleString('en-IN')}</p></div>
                </div>
              </div>

              <div className="space-y-2 border-t border-stone-200 dark:border-emerald-900/40 pt-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase font-poppins">Short Description</p>
                <p className="text-xs text-stone-700 dark:text-emerald-200/90 leading-relaxed font-inter">{identity.shortDescription}</p>
              </div>

              <div className="space-y-2 border-t border-stone-200 dark:border-emerald-900/40 pt-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase font-poppins">Key Features</p>
                <ul className="space-y-1">
                  {identity.keyFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-stone-700 dark:text-emerald-200/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] dark:text-[#34D399] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-stone-200 dark:border-emerald-900/40 pt-3">
                {identity.suggestedTags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#0F5132]/10 dark:bg-emerald-950/60 text-[#0F5132] dark:text-emerald-300 text-[10px] font-semibold rounded-md font-poppins">#{tag}</span>
                ))}
              </div>
            </div>

            {!user && (
              <div className="p-4 bg-[#D4AF37]/10 dark:bg-[#183023]/70 border border-[#D4AF37]/30 dark:border-amber-700/50 rounded-2xl flex items-start gap-3 text-xs text-stone-800 dark:text-emerald-100">
                <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold font-poppins">Sign in to save your product</p>
                  <p className="mt-0.5 text-stone-600 dark:text-emerald-300 font-inter">Create a free account or sign in to save this listing to your catalog.</p>
                  <button onClick={openAuthModal} className="mt-2 px-4 py-2 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold rounded-xl transition-colors font-poppins cursor-pointer">Sign In / Create Account</button>
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="p-4 bg-[#0F5132]/10 dark:bg-emerald-950/40 border border-[#0F5132]/20 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-[#0F5132] dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#0F5132] dark:text-[#34D399] shrink-0" />
                <div>
                  <p className="font-bold font-poppins">Product saved successfully!</p>
                  <p className="font-normal mt-0.5 font-inter">You can find it in My Products (saved as draft for your review).</p>
                </div>
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-emerald-400/60 font-inter">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" />
              <span>Your product information is securely saved to your account only.</span>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={goPrev} className={btnBack}><ChevronLeft className="w-4 h-4" /> Back and Edit</button>
            <button onClick={handleSaveProduct} disabled={saving || saveSuccess || !user}
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#0F5132] hover:bg-[#0B3D26] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-98 font-poppins cursor-pointer">
              {saving ? <><RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" /> Saving...</>
               : saveSuccess ? <><CheckCircle2 className="w-4 h-4 text-[#34D399]" /> Saved!</>
               : <><Save className="w-4 h-4 text-[#D4AF37]" /> Save to My Products</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

