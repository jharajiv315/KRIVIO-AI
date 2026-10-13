import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Palette,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Package,
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
import { optimizeImageUpload, generateClientStudioAsset } from '../../utils/studioCanvasHelper';
import { PhotoUploader } from './PhotoUploader';
import { GoalSelector, StudioMainGoal, StudioInputMode } from './GoalSelector';
import { AdvancedControls } from './AdvancedControls';
import { StudioPreview, ViewMode } from './StudioPreview';
import { ResultActions } from './ResultActions';
import { StudioHistoryDrawer } from './StudioHistoryDrawer';
import { SaveToProductModal } from './SaveToProductModal';

export interface StudioWorkspaceProps {
  initialImage?: string | null;
  onNavigateToWizard?: (image: string) => void;
  showHistoryDrawer?: boolean;
  onCloseHistoryDrawer?: () => void;
  onHistoryCountUpdate?: (count: number) => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  initialImage,
  onNavigateToWizard,
  showHistoryDrawer: externalShowHistory,
  onCloseHistoryDrawer: externalCloseHistory,
  onHistoryCountUpdate,
}) => {
  const { user } = useAuth();
  const { t } = useI18n();

  // State: Images & Assets
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
  const [currentAsset, setCurrentAsset] = useState<ImageStudioGeneratedAsset | null>(null);
  const [history, setHistory] = useState<ImageStudioHistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // State: Goals & Disclosure
  const [mainGoal, setMainGoal] = useState<StudioMainGoal>('improve_photo');
  const [selectedCategory, setSelectedCategory] = useState<string>('photo_cleanup');
  const [selectedOperationId, setSelectedOperationId] = useState<string>('CLEAN_STUDIO');
  const [inputMode, setInputMode] = useState<StudioInputMode>('preset');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [selectedFestival, setSelectedFestival] = useState<string>('Diwali');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Business profile & branding
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [useBranding, setUseBranding] = useState<boolean>(true);

  // Products catalog for "Save to Product"
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // History Drawer state
  const [internalShowHistory, setInternalShowHistory] = useState(false);
  const isHistoryOpen = externalShowHistory !== undefined ? externalShowHistory : internalShowHistory;
  const handleCloseHistory = externalCloseHistory || (() => setInternalShowHistory(false));

  const changePhotoInputRef = useRef<HTMLInputElement>(null);

  // Sync initial image if provided from parent
  useEffect(() => {
    if (initialImage) {
      setOriginalImage(initialImage);
    }
  }, [initialImage]);

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
      if (res?.assets) {
        setHistory(res.assets);
        if (onHistoryCountUpdate) {
          onHistoryCountUpdate(res.assets.length);
        }
      }
    } catch {}
  };

  const showToast = (type: 'success' | 'info' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handlePhotoUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGenerationError(null);
      const optimized = await optimizeImageUpload(file);
      if (optimized) {
        setOriginalImage(optimized);
        setCurrentAsset(null);
      }
    }
  };

  // Trigger generation with truthful feedback
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

      if (res?.asset) {
        setCurrentAsset(res.asset);
        loadHistory();
        showToast('success', 'Your enhanced image is ready.');
        return;
      }
    } catch (err: any) {
      console.warn('Backend generation note:', err);

      // Truthful client canvas fallback: clearly communicates that a basic composition was created
      try {
        const clientAsset = await generateClientStudioAsset({
          originalImage,
          operationId: opId,
          aspectRatio,
          festival: selectedFestival,
          brandName: businessProfile?.businessName || 'Artisan Craft',
          tagline: businessProfile?.story || businessProfile?.craftType || 'Authentic Handmade',
        });
        if (clientAsset) {
          setCurrentAsset(clientAsset);
          showToast('info', 'A basic studio composition is ready. AI generation was unavailable.');
          return;
        }
      } catch (fallbackErr) {
        console.error('Studio Engine fallback error:', fallbackErr);
      }

      setGenerationError(err?.message || "We couldn't complete this image. Your original photo is safe.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Conversational follow-up iterative edit
  const handleFollowUpEdit = async (instructionText: string) => {
    if (!instructionText.trim() || !currentAsset) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await imageStudioApi.edit({
        previousAssetId: currentAsset.assetId,
        userInstruction: instructionText.trim(),
        currentImage: currentAsset.generatedImage,
        originalImage: originalImage || undefined,
        aspectRatio: currentAsset.aspectRatio,
      });

      if (res?.asset) {
        setCurrentAsset(res.asset);
        loadHistory();
        showToast('success', 'Edit applied successfully.');
        return;
      }
    } catch (err: any) {
      console.warn('Backend edit note:', err);
      try {
        const clientAsset = await generateClientStudioAsset({
          originalImage: currentAsset.generatedImage || originalImage || '',
          operationId: 'ADVANCED_EDITING',
          aspectRatio: currentAsset.aspectRatio,
          brandName: businessProfile?.businessName || 'Artisan Craft',
          tagline: instructionText.trim(),
        });
        if (clientAsset) {
          setCurrentAsset(clientAsset);
          showToast('info', 'Basic adjustment applied.');
          return;
        }
      } catch (fallbackErr) {}
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
      showToast('success', 'Image successfully attached to product in your catalog!');
    } catch (err: any) {
      setGenerationError(err?.message || 'Could not save to product. Please try again.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Primary Action Button dynamic label
  const getPrimaryActionLabel = () => {
    if (isGenerating) return 'Processing Image...';
    if (mainGoal === 'improve_photo') {
      if (selectedOperationId === 'WHITE_BACKGROUND') return 'Create White Background';
      if (selectedOperationId === 'LIGHTING_IMPROVEMENT') return 'Boost Lighting';
      return 'Transform Photo';
    }
    return 'Create Marketing Image';
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border ${
            toastMessage.type === 'success'
              ? 'bg-[#0F5132] text-white border-[#D4AF37]/50'
              : toastMessage.type === 'info'
              ? 'bg-stone-800 text-stone-100 border-stone-600'
              : 'bg-red-900 text-white border-red-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
          )}
          <span className="text-xs font-semibold font-poppins">{toastMessage.text}</span>
        </div>
      )}

      {/* STATE 1: Hero Upload State when no image is loaded */}
      {!originalImage ? (
        <PhotoUploader onImageSelected={(img) => setOriginalImage(img)} />
      ) : (
        /* STATE 2: Active 2-Column Creative Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (approx 40%): Controls & Choices */}
          <div className="lg:col-span-5 space-y-4">
            {/* Step 1: Loaded Photo Status & Quick Change */}
            <div className="bg-white dark:bg-[#13251B] p-4 rounded-2xl border border-stone-200/90 dark:border-emerald-900/60 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 shrink-0">
                  <img
                    src={originalImage}
                    alt="Current Craft Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5132] dark:text-emerald-400 font-poppins">
                    Active Craft Photo
                  </span>
                  <p className="text-xs font-semibold text-stone-800 dark:text-white font-poppins truncate">
                    Ready for transformation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => changePhotoInputRef.current?.click()}
                className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer shrink-0 font-poppins px-2 py-1"
              >
                Change Photo
              </button>
              <input
                ref={changePhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUploadChange}
                className="hidden"
                id="change-photo-input"
              />
            </div>

            {/* Step 2: Goal & Presets Card */}
            <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-stone-200/90 dark:border-emerald-900/60 shadow-2xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5132] dark:text-emerald-400 font-poppins">
                  Select Output Goal
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white font-poppins">
                  What would you like to create?
                </h3>
              </div>

              <GoalSelector
                mainGoal={mainGoal}
                onMainGoalChange={setMainGoal}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedOperationId={selectedOperationId}
                onOperationSelect={setSelectedOperationId}
                inputMode={inputMode}
                onInputModeChange={setInputMode}
                customInstruction={customInstruction}
                onCustomInstructionChange={setCustomInstruction}
              />

              {/* Advanced Controls Accordion */}
              <AdvancedControls
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                selectedCategory={selectedCategory}
                selectedFestival={selectedFestival}
                onFestivalChange={setSelectedFestival}
                useBranding={useBranding}
                onUseBrandingChange={setUseBranding}
                businessProfile={businessProfile}
              />

              {/* Generation Error Feedback */}
              {generationError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 font-inter flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !originalImage}
                className="w-full py-3.5 min-h-[44px] bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#0F5132]/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-poppins disabled:opacity-50 active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4 text-[#D4AF37]" />
                    <span>{getPrimaryActionLabel()}</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (approx 60%): Interactive Studio Visualizer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-emerald-900/60 shadow-2xs space-y-4">
              <StudioPreview
                originalImage={originalImage}
                currentAsset={currentAsset}
                isGenerating={isGenerating}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                aspectRatio={aspectRatio}
              />

              {/* Result Actions Toolbar (revealed when asset exists) */}
              {currentAsset && (
                <ResultActions
                  currentAsset={currentAsset}
                  isGenerating={isGenerating}
                  onOpenSaveModal={() => setSaveModalOpen(true)}
                  onRegenerate={() => handleGenerate()}
                  onNavigateToWizard={onNavigateToWizard}
                  onApplyFollowUpEdit={handleFollowUpEdit}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-out History Drawer */}
      <StudioHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={handleCloseHistory}
        history={history}
        onSelectHistoryItem={(item) => {
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
        onDeleteItem={async (id) => {
          try {
            await imageStudioApi.deleteHistoryItem(id);
            loadHistory();
          } catch {}
        }}
      />

      {/* Save to Product Catalog Modal */}
      <SaveToProductModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        products={userProducts}
        selectedProductId={selectedProductId}
        onSelectProductId={setSelectedProductId}
        onConfirmSave={handleSaveToProduct}
        isSaving={isSavingProduct}
      />
    </div>
  );
};
