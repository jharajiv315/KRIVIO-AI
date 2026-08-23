import React, { useState } from 'react';
import { imagesApi } from '../services/api';
import { ImageAnalysis } from '../types';
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
  const [mode, setMode] = useState<StudioMode>('diagnosis');

  // ── Photo Diagnosis state (existing, unchanged) ──
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>({
    id: 'img_sample',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop',
    lightingScore: 78,
    backgroundScore: 84,
    overallScore: 81,
    lightingFeedback: 'Good natural illumination detected. Reducing soft shadows on the left side will enhance texture details.',
    backgroundFeedback: 'Clean neutral backdrop. Removes visual clutter and keeps focus entirely on the terracotta craft.',
    suggestions: [
      'Place your product near an open window between 8 AM - 10 AM for soft morning sunlight.',
      'Use a plain white chart paper sheet underneath to create a seamless background.',
      'Take 1 close-up picture capturing the intricate handmade clay texture.',
    ],
    detectedSubject: 'Terracotta Pottery Craft',
    createdAt: new Date().toISOString(),
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Smartphone Image Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full">
                Smart Photo Tools
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'diagnosis'
                ? 'Upload photos to receive real-time feedback on lighting, backdrop clarity, and selling appeal.'
                : 'Turn a product photo into a complete brand name, description, and ready-to-list product in minutes.'}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            id="mode-tab-diagnosis"
            onClick={() => setMode('diagnosis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'diagnosis'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Photo Diagnosis
          </button>
          <button
            id="mode-tab-create"
            onClick={() => setMode('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Create Product
          </button>
        </div>
      </div>

      {/* ── Photo Diagnosis Mode (existing, unchanged) ── */}
      {mode === 'diagnosis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Photo Upload & Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Product Photography Preview</span>
              </h3>

              {/* Photo Container */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {selectedImage ? (
                  <img
                      src={selectedImage}
                      alt="Product preview"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(selectedImage, '_blank')}
                    />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}

                {analyzing && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-300 animate-spin" />
                    <p className="text-xs font-bold">Diagnosing Photo Quality...</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="pt-2">
                <label
                  htmlFor="photo-upload-input"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>Upload Mobile Product Photo</span>
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
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Want to turn this photo into a full product listing?</span>
                <button onClick={() => setMode('create')} className="ml-auto font-bold underline whitespace-nowrap">Create Product</button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis & Lighting Feedback */}
          <div className="lg:col-span-7 space-y-6">
            {analysis && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Detected Item</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {analysis.detectedSubject || 'Artisan Craft'}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Photo Quality</span>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                      {analysis.overallScore} / 100
                    </div>
                  </div>
                </div>

                {/* Lighting & Background Score Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-amber-500" />
                        Lighting Score
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {analysis.lightingScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${analysis.lightingScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      {analysis.lightingFeedback}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-teal-500" />
                        Background Score
                      </span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {analysis.backgroundScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${analysis.backgroundScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      {analysis.backgroundFeedback}
                    </p>
                  </div>
                </div>

                {/* Actionable Photography Tips */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    3 Actionable Tips to Improve Sales Appeal
                  </h4>

                  <div className="space-y-2.5">
                    {analysis.suggestions.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                      >
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA to create product */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setMode('create')}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Turn This Photo Into a Full Product Listing
                  </button>
                </div>
              </div>
            )}

            {!analysis && !analyzing && (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Upload a photo to see your diagnosis</p>
                <p className="text-xs text-slate-400">We will analyse lighting, background, and overall appeal.</p>
              </div>
            )}

            {!analysis && analyzing && (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Analysing your photo...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create Product Mode (NEW wizard) ── */}
      {mode === 'create' && (
        <ProductIdentityWizard
          onSaved={() => setMode('diagnosis')}
          onCancel={() => setMode('diagnosis')}
        />
      )}
    </div>
  );
};
