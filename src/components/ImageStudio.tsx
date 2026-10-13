import React, { useState } from 'react';
import { imagesApi } from '../services/api';
import { ImageAnalysis } from '../types';
import { useI18n } from '../i18n/LanguageContext';
import {
  Camera,
  Upload,
  Palette,
  Sun,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  RefreshCw,
  Wand2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ProductIdentityWizard } from './ProductIdentityWizard';
import { StudioWorkspace } from './image-studio/StudioWorkspace';
import { StudioHeader } from './image-studio/StudioHeader';

type StudioTab = 'studio' | 'diagnosis';

export const ImageStudio: React.FC = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<StudioTab>('studio');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardImage, setWizardImage] = useState<string | null>(null);

  // History count & drawer state shared with header
  const [historyCount, setHistoryCount] = useState(0);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Photo Diagnosis state
  const [diagnosisImage, setDiagnosisImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleDiagnosisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setDiagnosisImage(base64);
        setAnalysisError(null);
        runAIAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIAnalysis = async (imgBase64: string) => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await imagesApi.analyze(imgBase64);
      setAnalysis(res.analysis);
    } catch (err: any) {
      console.error('Failed image analysis', err);
      setAnalysisError(err.message || 'Vision AI analysis could not be completed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (showWizard) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <ProductIdentityWizard
          onSaved={() => setShowWizard(false)}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 font-inter">
      {/* Editorial Header */}
      <StudioHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        historyCount={historyCount}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
      />

      {/* Flagship Intelligent Studio Mode */}
      {activeTab === 'studio' && (
        <StudioWorkspace
          initialImage={diagnosisImage}
          showHistoryDrawer={isHistoryDrawerOpen}
          onCloseHistoryDrawer={() => setIsHistoryDrawerOpen(false)}
          onHistoryCountUpdate={(count) => setHistoryCount(count)}
          onNavigateToWizard={(img) => {
            setWizardImage(img);
            setShowWizard(true);
          }}
        />
      )}

      {/* Photo Diagnosis Mode */}
      {activeTab === 'diagnosis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Photo Upload & Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-emerald-900/60 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 font-poppins">
                <Camera className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                <span>Product Photography Preview</span>
              </h3>

              {/* Photo Container */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#0E2016] border border-[#0F5132]/15 dark:border-emerald-900/40">
                {diagnosisImage ? (
                  <img
                    src={diagnosisImage}
                    alt="Product preview"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(diagnosisImage, '_blank')}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs font-inter">{t('imageStudio.dropzone')}</span>
                  </div>
                )}

                {analyzing && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                    <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
                    <p className="text-xs font-bold font-poppins">{t('imageStudio.generating')}</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="pt-2">
                <label
                  htmlFor="photo-upload-input"
                  className="w-full py-3 px-4 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98 font-poppins"
                >
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('imageStudio.uploadButton')}</span>
                </label>
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleDiagnosisUpload}
                  className="hidden"
                />
              </div>

              {/* Switch to Create mode prompt */}
              <div className="p-3 bg-[#0F5132]/5 dark:bg-[#183023]/70 border border-[#0F5132]/20 dark:border-emerald-700/50 rounded-xl flex items-center gap-2 text-[11px] text-stone-800 dark:text-emerald-100 font-inter">
                <Palette className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>Want to turn this photo into a full product listing?</span>
                <button
                  type="button"
                  onClick={() => {
                    setWizardImage(diagnosisImage);
                    setShowWizard(true);
                  }}
                  className="ml-auto font-bold text-[#0F5132] dark:text-[#34D399] underline whitespace-nowrap cursor-pointer font-poppins"
                >
                  {t('product.addProduct')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis & Lighting Feedback */}
          <div className="lg:col-span-7 space-y-6">
            {analysis && (
              <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-emerald-900/40">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-emerald-400/60 font-poppins">Detected Item</span>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                      {analysis.detectedSubject || 'Artisan Craft'}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-emerald-400/60 font-poppins">Photo Quality</span>
                    <div className="text-xl font-black text-[#0F5132] dark:text-[#34D399] font-poppins">
                      {analysis.overallScore} / 100
                    </div>
                  </div>
                </div>

                {/* Lighting & Background Score Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="bg-[#F8F9F5] dark:bg-[#183023]/60 p-4 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800 dark:text-emerald-100 flex items-center gap-1.5 font-poppins">
                        <Sun className="w-4 h-4 text-[#D4AF37]" />
                        Lighting Score
                      </span>
                      <span className="font-bold text-[#8B6E10] dark:text-[#D4AF37] font-poppins">
                        {analysis.lightingScore}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-emerald-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D4AF37] h-2 rounded-full"
                        style={{ width: `${analysis.lightingScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-emerald-200/80 leading-relaxed pt-1 font-inter">
                      {analysis.lightingFeedback}
                    </p>
                  </div>

                  <div className="bg-[#F8F9F5] dark:bg-[#183023]/60 p-4 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800 dark:text-emerald-100 flex items-center gap-1.5 font-poppins">
                        <ImageIcon className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                        Background Score
                      </span>
                      <span className="font-bold text-[#0F5132] dark:text-[#34D399] font-poppins">
                        {analysis.backgroundScore}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-emerald-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0F5132] dark:bg-emerald-400 h-2 rounded-full"
                        style={{ width: `${analysis.backgroundScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-emerald-200/80 leading-relaxed pt-1 font-inter">
                      {analysis.backgroundFeedback}
                    </p>
                  </div>
                </div>

                {/* Actionable Photography Tips */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5 font-poppins">
                    <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
                    {t('imageStudio.tipsTitle')}
                  </h4>

                  <div className="space-y-2.5">
                    {analysis.suggestions.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#0F5132]/5 dark:bg-[#183023]/70 border border-[#0F5132]/20 dark:border-emerald-700/50 rounded-xl text-xs text-stone-800 dark:text-emerald-100 flex items-start gap-2.5 font-inter"
                      >
                        <Check className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA to enhance in AI Studio or create product */}
                <div className="pt-3 border-t border-stone-100 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('studio')}
                    className="w-full py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer"
                  >
                    <Palette className="w-4 h-4 text-[#D4AF37]" />
                    <span>Enhance in AI Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWizardImage(diagnosisImage);
                      setShowWizard(true);
                    }}
                    className="w-full py-3 bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] text-stone-800 dark:text-emerald-100 font-bold text-xs rounded-xl border border-stone-200 dark:border-emerald-900/40 transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('imageStudio.generateAI')}</span>
                  </button>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="bg-red-50 dark:bg-red-950/40 p-5 rounded-2xl border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <div className="space-y-1">
                  <p className="font-bold font-poppins">Diagnosis Unavailable</p>
                  <p className="font-inter">{analysisError}</p>
                </div>
              </div>
            )}

            {!analysis && !analyzing && !analysisError && (
              <div className="bg-white dark:bg-[#13251B] p-8 sm:p-12 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-[#0E2016] flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-stone-400 dark:text-emerald-400/60" />
                </div>
                <p className="text-sm font-semibold text-stone-700 dark:text-emerald-200 font-poppins">{t('imageStudio.dropzone')}</p>
                <p className="text-xs text-stone-400 font-inter">{t('imageStudio.subtitle')}</p>
              </div>
            )}

            {!analysis && analyzing && (
              <div className="bg-white dark:bg-[#13251B] p-8 sm:p-12 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="w-8 h-8 text-[#D4AF37]" />
                <p className="text-sm font-semibold text-stone-800 dark:text-white font-poppins">{t('imageStudio.generating')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

