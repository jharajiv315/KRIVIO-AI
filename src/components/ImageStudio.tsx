import React, { useState } from 'react';
import { imagesApi } from '../services/api';
import { ImageAnalysis } from '../types';
import { useI18n } from '../i18n/LanguageContext';
import {
  Camera,
  Upload,
  Sparkles,
  Sun,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { ProductIdentityWizard } from './ProductIdentityWizard';

type StudioMode = 'diagnosis' | 'create';

export const ImageStudio: React.FC = () => {
  const { t } = useI18n();
  const [mode, setMode] = useState<StudioMode>('diagnosis');

  // Photo Diagnosis state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        runAIAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIAnalysis = async (imgBase64: string) => {
    setAnalyzing(true);
    try {
      const res = await imagesApi.analyze(imgBase64);
      setAnalysis(res.analysis);
    } catch (err) {
      console.error('Failed image analysis', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Header */}
      <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-poppins">
                {t('imageStudio.title')}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-[#0F5132]/20 dark:border-emerald-800 font-poppins">
                Smart Photo Tools
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70">
              {t('imageStudio.subtitle')}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-[#0E2016] rounded-2xl w-fit border border-[#0F5132]/10 dark:border-emerald-900/40">
          <button
            id="mode-tab-diagnosis"
            onClick={() => setMode('diagnosis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all font-poppins cursor-pointer ${
              mode === 'diagnosis'
                ? 'bg-[#0F5132] text-white shadow-xs'
                : 'text-stone-600 dark:text-emerald-300/80 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Photo Diagnosis
          </button>
          <button
            id="mode-tab-create"
            onClick={() => setMode('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all font-poppins cursor-pointer ${
              mode === 'create'
                ? 'bg-[#0F5132] text-white shadow-xs'
                : 'text-stone-600 dark:text-emerald-300/80 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            {t('product.addProduct')}
          </button>
        </div>
      </div>

      {/* Photo Diagnosis Mode */}
      {mode === 'diagnosis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Photo Upload & Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 font-poppins">
                <Camera className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                <span>Product Photography Preview</span>
              </h3>

              {/* Photo Container */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#0E2016] border border-[#0F5132]/15 dark:border-emerald-900/40">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Product preview"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(selectedImage, '_blank')}
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
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Switch to Create mode prompt */}
              <div className="p-3 bg-[#0F5132]/5 dark:bg-[#183023]/70 border border-[#0F5132]/20 dark:border-emerald-700/50 rounded-xl flex items-center gap-2 text-[11px] text-stone-800 dark:text-emerald-100 font-inter">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>Want to turn this photo into a full product listing?</span>
                <button onClick={() => setMode('create')} className="ml-auto font-bold text-[#0F5132] dark:text-[#34D399] underline whitespace-nowrap cursor-pointer font-poppins">{t('product.addProduct')}</button>
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

                {/* CTA to create product */}
                <div className="pt-2 border-t border-stone-100 dark:border-emerald-900/40">
                  <button
                    onClick={() => setMode('create')}
                    className="w-full py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-[#D4AF37]" />
                    {t('imageStudio.generateAI')}
                  </button>
                </div>
              </div>
            )}

            {!analysis && !analyzing && (
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

      {/* Create Product Mode (Wizard) */}
      {mode === 'create' && (
        <ProductIdentityWizard
          onSaved={() => setMode('diagnosis')}
          onCancel={() => setMode('diagnosis')}
        />
      )}
    </div>
  );
};

