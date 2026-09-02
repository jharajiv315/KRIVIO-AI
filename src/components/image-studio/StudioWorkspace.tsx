import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Sun,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Download,
  Share2,
  ArrowRight,
  Sliders,
  History,
  Trash2,
  Plus,
  Package,
  Check,
  ChevronRight,
  HelpCircle,
  Eye,
  Columns2,
  Image as ImageIcon,
  Store,
  Crown,
  HeartHandshake,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  imageStudioApi,
  productsApi,
  businessProfileApi,
  ImageStudioGeneratedAsset,
  ImageStudioHistoryItem,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { Product, BusinessProfile } from '../../types';

type StudioMainGoal = 'improve_photo' | 'create_marketing';
type StudioInputMode = 'preset' | 'advanced';
type ViewMode = 'split' | 'enhanced' | 'original';

interface StudioWorkspaceProps {
  initialImage?: string | null;
  onNavigateToWizard?: (image: string) => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  initialImage,
  onNavigateToWizard,
}) => {
  const { user } = useAuth();
  const { t, formatCurrency } = useI18n();

  // State: Images & Assets
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
  const [currentAsset, setCurrentAsset] = useState<ImageStudioGeneratedAsset | null>(null);
  const [history, setHistory] = useState<ImageStudioHistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // State: Goals & Disclosure
  const [mainGoal, setMainGoal] = useState<StudioMainGoal>('improve_photo');
  const [selectedCategory, setSelectedCategory] = useState<string>('photo_cleanup');
  const [selectedOperationId, setSelectedOperationId] = useState<string>('CLEAN_STUDIO');
  const [inputMode, setInputMode] = useState<StudioInputMode>('preset');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [selectedFestival, setSelectedFestival] = useState<string>('Diwali');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Iterative follow-up editing
  const [followUpInput, setFollowUpInput] = useState<string>('');

  // Business profile & branding
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [useBranding, setUseBranding] = useState<boolean>(true);

  // Real products catalog for "Save to Product"
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // History Drawer state
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user business profile & products on mount
  useEffect(() => {
    if (user) {
      businessProfileApi.get().then((res) => {
        if (res?.businessProfile) setBusinessProfile(res.businessProfile);
      }).catch(() => {});

      productsApi.getAll().then((res) => {
        if (res?.products) setUserProducts(res.products);
      }).catch(() => {});

      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const res = await imageStudioApi.getHistory();
      if (res?.assets) setHistory(res.assets);
    } catch {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setOriginalImage(base64);
        setCurrentAsset(null);
        setGenerationError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger generation
  const handleGenerate = async (overrideOpId?: string, overrideInstruction?: string) => {
    if (!originalImage) return;

    setIsGenerating(true);
    setGenerationError(null);

    const opId = overrideOpId || selectedOperationId;
    const instruction = overrideInstruction !== undefined ? overrideInstruction : customInstruction;

    try {
      const res = await imageStudioApi.generate({
        operationId: inputMode === 'preset' ? opId : undefined,
        userInstruction: inputMode === 'advanced' || instruction ? instruction : undefined,
        originalImage,
        aspectRatio,
        festivalOrOccasion: selectedCategory === 'seasonal_cultural' ? selectedFestival : undefined,
        brandContext: useBranding && businessProfile ? {
          brandName: businessProfile.businessName,
          tagline: businessProfile.story,
          craftType: businessProfile.craftType,
          region: businessProfile.state || businessProfile.district,
        } : undefined,
      });

      if (res.asset) {
        setCurrentAsset(res.asset);
        setFollowUpInput('');
        loadHistory();
        setSuccessToast('Your professional image is ready!');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err: any) {
      setGenerationError(err?.message || 'The enhancement could not be completed. Your original photo is still safe.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle follow-up conversational edit
  const handleFollowUpEdit = async (instructionToApply?: string) => {
    const text = instructionToApply || followUpInput;
    if (!text.trim() || !currentAsset) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await imageStudioApi.edit({
        previousAssetId: currentAsset.assetId,
        userInstruction: text.trim(),
        currentImage: currentAsset.generatedImage,
        originalImage: originalImage || undefined,
        aspectRatio: currentAsset.aspectRatio,
      });

      if (res.asset) {
        setCurrentAsset(res.asset);
        setFollowUpInput('');
        loadHistory();
        setSuccessToast('Edit applied successfully!');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err: any) {
      setGenerationError('Could not apply edit. Your current photo is still preserved.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save to Product in Catalog
  const handleSaveToProduct = async () => {
    if (!selectedProductId || !currentAsset) return;

    setIsSavingProduct(true);
    try {
      await imageStudioApi.saveToProduct({
        assetId: currentAsset.assetId,
        productId: selectedProductId,
        imageUrl: currentAsset.generatedImage,
      });
      setSaveModalOpen(false);
      setSuccessToast('Image successfully attached to product in your catalog!');
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      alert('Could not save to product. Please try again.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Human-Friendly Curated Presets by Category
  const CATEGORY_PRESETS: Record<string, Array<{ id: string; label: string; desc: string; icon: any; badge?: string }>> = {
    photo_cleanup: [
      { id: 'CLEAN_STUDIO', label: 'Clean Studio Photo', desc: 'Neutral smooth background with soft diffused lighting', icon: Sun, badge: 'Popular' },
      { id: 'WHITE_BACKGROUND', label: 'Pure White Background', desc: 'Crisp solid white for Amazon, Flipkart & ONDC compliance', icon: Sparkles, badge: 'Marketplace' },
      { id: 'NATURAL_CRAFT', label: 'Natural Craft Setting', desc: 'Handloom linen cloth surface celebrating organic raw materials', icon: HeartHandshake },
      { id: 'WOODEN_SURFACE', label: 'Warm Wooden Table', desc: 'Rich weathered teakwood surface with warm daylight', icon: Store },
      { id: 'BACKGROUND_CLEANUP', label: 'Remove Clutter', desc: 'Erase surrounding domestic mess and isolate product cleanly', icon: Wand2, badge: 'Essential' },
      { id: 'SHADOW_REFINEMENT', label: 'Realistic Shadow Fix', desc: 'Soft grounding contact shadow beneath product', icon: Camera },
    ],
    image_quality: [
      { id: 'MARKETPLACE_PRIMARY_IMAGE', label: 'Amazon / ONDC Standard', desc: 'Strict 85% frame isolation, pure white, commercial sharpness', icon: Store, badge: '1-Click' },
      { id: 'LIGHTING_IMPROVEMENT', label: 'Natural Lighting Boost', desc: 'Lift dark shadows, balance highlights without overexposure', icon: Sun },
      { id: 'COLOR_BALANCE', label: 'True Color Correction', desc: 'Neutralize camera tint and reveal genuine vegetable dye tones', icon: Sparkles },
      { id: 'DETAIL_PRESERVATION', label: 'Emphasize Craft Detail', desc: 'Raking light highlighting intricate carving, weave or painting', icon: Eye },
      { id: 'PORTRAIT_PRODUCT_SHOT', label: 'Vertical Display (4:5)', desc: 'Full-length vertical orientation ideal for saris & apparel', icon: Columns2 },
    ],
    lifestyle_context: [
      { id: 'HOME_DECOR_CONTEXT', label: 'Living Room Credenza', desc: 'Believable modern home setting with natural ambient bokeh', icon: Store, badge: 'Lifestyle' },
      { id: 'HANDMADE_CRAFT_CONTEXT', label: 'Artisan Workshop Studio', desc: 'Traditional craftsman worktable with natural raw fibers', icon: HeartHandshake, badge: 'Heritage' },
      { id: 'PREMIUM_BOUTIQUE_CONTEXT', label: 'Luxury Boutique Gallery', desc: 'Exclusive gallery plinth with museum spotlighting', icon: Crown, badge: 'Luxury' },
      { id: 'TABLETOP_CONTEXT', label: 'Tabletop Dining Runner', desc: 'Handloom runner over light wood with afternoon side-light', icon: Sun },
      { id: 'OUTDOOR_CONTEXT', label: 'Natural Outdoor Sunlight', desc: 'Stone slab with dappled sunlight through garden foliage', icon: Camera },
    ],
    marketing_assets: [
      { id: 'INSTAGRAM_POST', label: 'Instagram Feed Post (4:5)', desc: 'High-engagement aesthetic social composition', icon: Sparkles, badge: 'Social Media' },
      { id: 'INSTAGRAM_STORY', label: 'Instagram & WhatsApp Story (9:16)', desc: 'Full-screen mobile story with header text space', icon: Columns2 },
      { id: 'WHATSAPP_CATALOG', label: 'WhatsApp Product Card', desc: 'Clean, punchy visual for direct customer chat orders', icon: Share2, badge: 'WhatsApp' },
      { id: 'FESTIVAL_PROMOTION', label: 'Festive Campaign Creative', desc: 'Warm celebratory golden glow with festive accents', icon: Crown },
      { id: 'B2B_PROMOTION', label: 'Wholesale / B2B Showcase', desc: 'Professional card emphasizing bulk craft reliability', icon: Package, badge: 'B2B' },
      { id: 'PRODUCT_PROMO_BANNER', label: 'Promotional Banner (16:9)', desc: 'Hero layout with clean space for title messaging', icon: Store },
    ],
    branding: [
      { id: 'BRAND_COLORS_APPLIED', label: 'Apply Brand Palette', desc: 'Harmonize background tones with your business colors', icon: Sparkles, badge: 'Branded' },
      { id: 'PACKAGING_MOCKUP', label: 'Eco-Packaging Box Concept', desc: 'Showcase beside craft unboxing box or cotton pouch', icon: Package },
      { id: 'THANK_YOU_CARD', label: 'Artisan Thank You Card', desc: 'Personal card celebrating your handmade story', icon: HeartHandshake },
      { id: 'BRAND_STORY_VISUAL', label: 'Heritage Story Editorial', desc: 'Honoring traditional technique & regional roots', icon: Crown },
    ],
    catalog_assets: [
      { id: 'PRODUCT_CATALOG_COVER', label: 'Wholesale Catalog Cover', desc: 'Prestige catalog cover with luxurious layout margins', icon: Package },
      { id: 'PRODUCT_CATALOG_PAGE', label: 'Clean Spec Sheet Page', desc: 'Organized presentation for product dimensions & story', icon: Columns2 },
      { id: 'WHOLESALE_CATALOG', label: 'Export Buyer Feature', desc: 'International trade-fair look for bulk orders', icon: Store },
    ],
    seasonal_cultural: [
      { id: 'DIWALI', label: 'Diwali Festive Splendor', desc: 'Warm terracotta diyas & golden marigold bokeh', icon: Sparkles, badge: 'Diwali' },
      { id: 'HOLI', label: 'Holi Colors Celebration', desc: 'Earthy organic gulal powders in decorative bowls', icon: Crown, badge: 'Holi' },
      { id: 'NAVRATRI', label: 'Navratri & Durga Puja', desc: 'Auspicious festive red and gold traditional ambience', icon: Sparkles, badge: 'Navratri' },
      { id: 'EID', label: 'Eid Festive Elegance', desc: 'Royal emerald & warm gold filigree lanterns', icon: MoonIcon, badge: 'Eid' },
      { id: 'WEDDING_GIFTING', label: 'Royal Wedding Gifting', desc: 'Rich raw silk fabric and scattered fresh rose petals', icon: HeartHandshake, badge: 'Wedding' },
    ],
    advanced_editing: [
      { id: 'PRODUCT_REFERENCE_LOCK', label: 'Lock Product Identity', desc: 'Strict 100% craft preservation while updating scenery', icon: Lock, badge: 'Identity Lock' },
      { id: 'BACKGROUND_CHANGE', label: 'Custom Background Style', desc: 'Transpose onto any custom environment you describe', icon: Wand2 },
      { id: 'SURFACE_CHANGE', label: 'Change Table Surface', desc: 'Swap surface to marble, teakwood, linen or stone', icon: Store },
      { id: 'OBJECT_REMOVE', label: 'Erase Background Item', desc: 'Cleanly remove a specific unwanted background object', icon: Trash2 },
    ],
  };

  function MoonIcon(props: any) {
    return <Sparkles {...props} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-inter">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F5132] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-[#D4AF37]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-xs font-semibold font-poppins">{successToast}</span>
        </div>
      )}

      {/* Top Banner: Brand Profile Awareness */}
      {businessProfile && (
        <div className="bg-[#0F5132]/5 dark:bg-[#13251B] p-4 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0F5132] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
              {businessProfile.businessName ? businessProfile.businessName.charAt(0) : 'B'}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#0F5132] dark:text-emerald-400 font-poppins">
                Active Brand Profile
              </span>
              <p className="font-bold text-stone-900 dark:text-white font-poppins">
                {businessProfile.businessName} {businessProfile.craftType ? `• ${businessProfile.craftType}` : ''}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-emerald-200 text-xs font-medium">
            <input
              type="checkbox"
              checked={useBranding}
              onChange={(e) => setUseBranding(e.target.checked)}
              className="accent-[#0F5132] rounded cursor-pointer"
            />
            <span>Include brand identity in marketing graphics</span>
          </label>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Upload & Goal Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Upload / Active Image Card */}
          <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 font-poppins">
                <Camera className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                <span>1. Product Photo</span>
              </h2>
              {originalImage && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-poppins"
                >
                  Change Photo
                </button>
              )}
            </div>

            {/* Image Preview / Dropzone */}
            <div
              onClick={() => !originalImage && fileInputRef.current?.click()}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                originalImage
                  ? 'border-stone-200 dark:border-emerald-900/60 aspect-square sm:aspect-4/3'
                  : 'border-dashed border-[#0F5132]/30 dark:border-emerald-800/80 bg-stone-50 dark:bg-[#0E2016] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0F5132]'
              }`}
            >
              {originalImage ? (
                <img
                  src={originalImage}
                  alt="Original Product"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-emerald-100 font-poppins">
                      Click to upload your product photo
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-emerald-400/60 font-inter mt-1">
                      Works with smartphone craft photos (JPG, PNG, WEBP)
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Step 2: Human-Friendly Goal Selection */}
          <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5132] dark:text-emerald-400 font-poppins">
                2. What do you want to create?
              </span>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white font-poppins mt-0.5">
                Select Your Goal
              </h3>
            </div>

            {/* Primary Entry Points: 2 High-Level Choices */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMainGoal('improve_photo');
                  setSelectedCategory('photo_cleanup');
                  setSelectedOperationId('CLEAN_STUDIO');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  mainGoal === 'improve_photo'
                    ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-sm'
                    : 'bg-stone-50 dark:bg-[#0E2016] text-stone-800 dark:text-emerald-100 border-stone-200 dark:border-emerald-900/40 hover:border-[#0F5132]'
                }`}
              >
                <Camera className={`w-5 h-5 mb-2 ${mainGoal === 'improve_photo' ? 'text-[#D4AF37]' : 'text-[#0F5132] dark:text-emerald-400'}`} />
                <div className="text-xs font-bold font-poppins">Improve Photo</div>
                <div className={`text-[10px] mt-0.5 ${mainGoal === 'improve_photo' ? 'text-emerald-100' : 'text-stone-500 dark:text-emerald-400/70'}`}>
                  Clean studio, white background, lighting fix
                </div>
              </button>

              <button
                onClick={() => {
                  setMainGoal('create_marketing');
                  setSelectedCategory('marketing_assets');
                  setSelectedOperationId('INSTAGRAM_POST');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  mainGoal === 'create_marketing'
                    ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-sm'
                    : 'bg-stone-50 dark:bg-[#0E2016] text-stone-800 dark:text-emerald-100 border-stone-200 dark:border-emerald-900/40 hover:border-[#0F5132]'
                }`}
              >
                <Sparkles className={`w-5 h-5 mb-2 ${mainGoal === 'create_marketing' ? 'text-[#D4AF37]' : 'text-[#D4AF37]'}`} />
                <div className="text-xs font-bold font-poppins">Marketing Creative</div>
                <div className={`text-[10px] mt-0.5 ${mainGoal === 'create_marketing' ? 'text-emerald-100' : 'text-stone-500 dark:text-emerald-400/70'}`}>
                  Social media, festival card, branding, B2B
                </div>
              </button>
            </div>

            {/* Category Sub-Navigation (Progressive Disclosure) */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-stone-500 dark:text-emerald-400/80 font-poppins">
                Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(mainGoal === 'improve_photo'
                  ? [
                      { id: 'photo_cleanup', label: 'Photo Cleanup' },
                      { id: 'image_quality', label: 'Quality & Exposure' },
                      { id: 'lifestyle_context', label: 'Lifestyle Context' },
                      { id: 'advanced_editing', label: 'Advanced Touch-Up' },
                    ]
                  : [
                      { id: 'marketing_assets', label: 'Social & Ads' },
                      { id: 'seasonal_cultural', label: 'Festive & Seasonal' },
                      { id: 'branding', label: 'Branding & Logo' },
                      { id: 'catalog_assets', label: 'Catalog & B2B' },
                    ]
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      const firstPreset = CATEGORY_PRESETS[cat.id]?.[0];
                      if (firstPreset) setSelectedOperationId(firstPreset.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#0F5132] text-white font-bold font-poppins'
                        : 'bg-stone-100 dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300 hover:bg-stone-200 dark:hover:bg-emerald-900/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Switcher: Presets vs Advanced */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-emerald-900/40">
              <span className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">
                Preset or Custom?
              </span>
              <div className="flex bg-stone-100 dark:bg-[#0E2016] p-1 rounded-xl">
                <button
                  onClick={() => setInputMode('preset')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    inputMode === 'preset' ? 'bg-[#0F5132] text-white font-bold' : 'text-stone-600 dark:text-emerald-300'
                  }`}
                >
                  Quick Presets
                </button>
                <button
                  onClick={() => setInputMode('advanced')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    inputMode === 'advanced' ? 'bg-[#0F5132] text-white font-bold' : 'text-stone-600 dark:text-emerald-300'
                  }`}
                >
                  Custom Request
                </button>
              </div>
            </div>

            {/* Quick Presets List (3-6 human-friendly options) */}
            {inputMode === 'preset' ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(CATEGORY_PRESETS[selectedCategory] || []).map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedOperationId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedOperationId(preset.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#0F5132]/10 dark:bg-emerald-950/70 border-[#0F5132] dark:border-emerald-400'
                          : 'bg-stone-50/70 dark:bg-[#0E2016]/60 border-stone-200/80 dark:border-emerald-900/40 hover:border-[#0F5132]/50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isSelected ? 'bg-[#0F5132] text-[#D4AF37]' : 'bg-stone-200 dark:bg-emerald-950 text-stone-600 dark:text-emerald-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-stone-900 dark:text-white font-poppins truncate">
                            {preset.label}
                          </h4>
                          {preset.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] shrink-0 font-poppins">
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-emerald-400/80 line-clamp-2 mt-0.5 font-inter">
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Advanced Mode: Human Request Input */
              <div className="space-y-3">
                <label className="text-xs font-semibold text-stone-700 dark:text-emerald-200">
                  Tell KRIVIO what you need in your own words:
                </label>
                <textarea
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="e.g. Put this Madhubani silk scarf on a rustic teakwood table with warm natural morning window light and a small terracotta cup nearby."
                  className="w-full p-3 bg-stone-50 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-2xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none h-24 resize-none font-inter"
                />
                <p className="text-[11px] text-stone-400 dark:text-emerald-400/60 italic font-inter">
                  💡 No prompts needed. Just describe the setting, table surface, or purpose.
                </p>
              </div>
            )}

            {/* Seasonal Festival Selector if in Festive category */}
            {selectedCategory === 'seasonal_cultural' && (
              <div className="pt-2 border-t border-stone-100 dark:border-emerald-900/40 space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">
                  Select Festival / Occasion:
                </label>
                <select
                  value={selectedFestival}
                  onChange={(e) => setSelectedFestival(e.target.value)}
                  className="w-full p-2.5 bg-stone-100 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white font-poppins cursor-pointer"
                >
                  <option value="Diwali">Diwali (Festival of Lights)</option>
                  <option value="Holi">Holi (Colors of Spring)</option>
                  <option value="Navratri">Navratri & Durga Puja</option>
                  <option value="Eid">Eid Mubarak</option>
                  <option value="Christmas">Winter & Christmas</option>
                  <option value="Wedding">Royal Wedding Gifting</option>
                  <option value="Harvest Fair">Regional Harvest & Mela</option>
                </select>
              </div>
            )}

            {/* Error Message */}
            {generationError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 font-inter">
                {generationError}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !originalImage}
              className="w-full py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#0F5132]/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-poppins disabled:opacity-50 active:scale-98"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                  <span>Preparing your professional image...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Generate with AI Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Canvas & Follow-up Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visual Display Card */}
          <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-100 dark:border-emerald-900/40">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-emerald-400/60 font-poppins">
                  Studio Visualizer
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                  {currentAsset ? currentAsset.operationLabel : 'Interactive Preview'}
                </h3>
              </div>

              {/* Before / After Toggle Buttons */}
              {currentAsset && (
                <div className="flex bg-stone-100 dark:bg-[#0E2016] p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer font-poppins ${
                      viewMode === 'split' ? 'bg-[#0F5132] text-white' : 'text-stone-600 dark:text-emerald-300'
                    }`}
                  >
                    Before / After
                  </button>
                  <button
                    onClick={() => setViewMode('enhanced')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer font-poppins ${
                      viewMode === 'enhanced' ? 'bg-[#0F5132] text-white' : 'text-stone-600 dark:text-emerald-300'
                    }`}
                  >
                    Enhanced
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer font-poppins ${
                      viewMode === 'original' ? 'bg-[#0F5132] text-white' : 'text-stone-600 dark:text-emerald-300'
                    }`}
                  >
                    Original
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Area */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#0E2016] border border-[#0F5132]/15 dark:border-emerald-900/40 flex items-center justify-center">
              {/* Spinner during active generation */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white space-y-3">
                  <RefreshCw className="w-10 h-10 text-[#D4AF37] animate-spin" />
                  <p className="text-xs font-bold font-poppins tracking-wide">
                    Creating your product photo...
                  </p>
                  <p className="text-[11px] text-emerald-200/80 font-inter">
                    Preserving authentic craft textures and proportions
                  </p>
                </div>
              )}

              {/* View Rendering */}
              {currentAsset ? (
                viewMode === 'split' ? (
                  <div className="grid grid-cols-2 w-full h-full">
                    {/* Before */}
                    <div className="relative h-full border-r border-white/20 overflow-hidden group">
                      <img
                        src={originalImage || currentAsset.originalImage}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2.5 left-2.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded font-poppins">
                        Original
                      </span>
                    </div>
                    {/* After */}
                    <div className="relative h-full overflow-hidden">
                      <img
                        src={currentAsset.generatedImage}
                        alt="Enhanced"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2.5 right-2.5 bg-[#0F5132] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded font-poppins">
                        AI Studio
                      </span>
                    </div>
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
                    alt="Original Photo"
                    className="w-full h-full object-contain"
                  />
                )
              ) : originalImage ? (
                <img
                  src={originalImage}
                  alt="Original Photo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-400 space-y-2 p-8 text-center">
                  <ImageIcon className="w-12 h-12 stroke-1" />
                  <p className="text-xs font-bold font-poppins text-stone-600 dark:text-emerald-300">
                    Your transformed studio photo will appear here
                  </p>
                  <p className="text-[11px] text-stone-400 font-inter max-w-xs">
                    Upload a craft photo on the left and choose what you'd like to create
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons Bar when an asset is available */}
            {currentAsset && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Save to Product Catalog Button */}
                  <button
                    onClick={() => setSaveModalOpen(true)}
                    className="px-4 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer font-poppins"
                  >
                    <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Save to Product</span>
                  </button>

                  {/* Download Button */}
                  <a
                    href={currentAsset.generatedImage}
                    download={`krivio-craft-${Date.now()}.png`}
                    className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] dark:hover:bg-emerald-950 text-stone-800 dark:text-emerald-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all font-poppins"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400" />
                    <span>Download</span>
                  </a>

                  {/* Regenerate */}
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] dark:hover:bg-emerald-950 text-stone-800 dark:text-emerald-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-poppins"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Regenerate</span>
                  </button>
                </div>

                {/* Create full listing wizard link */}
                {onNavigateToWizard && (
                  <button
                    onClick={() => onNavigateToWizard(currentAsset.generatedImage)}
                    className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 hover:underline flex items-center gap-1 font-poppins cursor-pointer"
                  >
                    <span>Create Full Listing with this Photo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Iterative Follow-Up Editing (Conversational Touch-ups) */}
          {currentAsset && (
            <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-emerald-400/60 font-poppins">
                    Conversational Editing
                  </span>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white font-poppins">
                    Want to refine this result?
                  </h4>
                </div>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap gap-1.5">
                {currentAsset.suggestedFollowUps.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFollowUpEdit(suggestion)}
                    disabled={isGenerating}
                    className="px-3 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] dark:hover:bg-emerald-950 text-stone-700 dark:text-emerald-200 rounded-full text-[11px] font-medium border border-stone-200 dark:border-emerald-900/40 transition-colors cursor-pointer"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>

              {/* Input for custom follow-up edit */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFollowUpEdit()}
                  placeholder="e.g. Make the surface marble, soften the light, or zoom in slightly..."
                  className="flex-1 p-3 bg-stone-50 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
                />
                <button
                  onClick={() => handleFollowUpEdit()}
                  disabled={!followUpInput.trim() || isGenerating}
                  className="px-4 py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer font-poppins disabled:opacity-40"
                >
                  Apply Edit
                </button>
              </div>
            </div>
          )}

          {/* Generation History Drawer Toggle & Preview */}
          <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-2 font-poppins">
                <History className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                <span>Your Studio History ({history.length})</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer font-poppins"
                >
                  {showHistory ? 'Collapse' : 'View All'}
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-emerald-400/60 font-inter">
                No past studio transformations yet. Generated images will be saved here automatically.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {history.slice(0, showHistory ? 18 : 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setOriginalImage(item.originalAsset);
                      setCurrentAsset({
                        assetId: item.id,
                        operationId: item.operationId,
                        originalImage: item.originalAsset,
                        generatedImage: item.generatedAsset,
                        aspectRatio: item.aspectRatio,
                        operationLabel: item.promptSummary || 'Studio Asset',
                        summaryNote: item.promptSummary || '',
                        modelUsed: item.modelUsed,
                        suggestedFollowUps: ['Make background cleaner', 'Warm morning daylight'],
                        createdAt: item.createdAt,
                      });
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 dark:border-emerald-900/60 cursor-pointer group hover:border-[#0F5132]"
                  >
                    <img
                      src={item.generatedAsset}
                      alt="History Asset"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold font-poppins">
                      Open
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Save to Product in Catalog */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#13251B] p-6 rounded-3xl border border-[#0F5132]/20 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
                <span>Save to Product Catalog</span>
              </h3>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-emerald-200/80 font-inter leading-relaxed">
              Attach this AI-enhanced image directly to an existing product in your inventory as the primary marketplace photo.
            </p>

            {userProducts.length === 0 ? (
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
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-3 bg-stone-100 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white font-poppins cursor-pointer"
                >
                  <option value="">-- Choose a product --</option>
                  {userProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatCurrency(p.price)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] text-stone-700 dark:text-emerald-200 text-xs font-semibold rounded-xl cursor-pointer font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToProduct}
                disabled={!selectedProductId || isSavingProduct}
                className="flex-1 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer font-poppins disabled:opacity-40"
              >
                {isSavingProduct ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
