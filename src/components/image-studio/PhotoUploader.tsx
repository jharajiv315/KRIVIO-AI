import React, { useRef, useState } from 'react';
import { Upload, Palette, Image as ImageIcon, Camera, Check, ArrowRight } from 'lucide-react';
import { optimizeImageUpload } from '../../utils/studioCanvasHelper';

export interface PhotoUploaderProps {
  onImageSelected: (base64Image: string) => void;
}

// Curated high-resolution sample photography for instant testing
const SAMPLE_CRAFT_PHOTOS = [
  {
    id: 'chanderi_silk',
    title: 'Chanderi Silk Saree',
    category: 'Textiles',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'wooden_craft',
    title: 'Channapatna Wooden Craft',
    category: 'Woodwork',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'terracotta_diya',
    title: 'Terracotta Festive Diya',
    category: 'Pottery',
    url: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pashmina_shawl',
    title: 'Kashmiri Pashmina Stole',
    category: 'Weaving',
    url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
  },
];

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const optimized = await optimizeImageUpload(file);
      if (optimized) {
        onImageSelected(optimized);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const optimized = await optimizeImageUpload(file);
      if (optimized) {
        onImageSelected(optimized);
      }
    }
  };

  // Convert external sample URL to base64 data URL for studio processing
  const handleSelectSample = async (sampleUrl: string) => {
    setIsLoadingSample(true);
    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageSelected(base64);
        setIsLoadingSample(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      // Direct pass-through if cross-origin fetch is blocked
      onImageSelected(sampleUrl);
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 font-inter">
      {/* Hero Workspace Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center transition-all cursor-pointer select-none group ${
          isDragging
            ? 'border-[#0F5132] bg-[#0F5132]/5 dark:bg-emerald-950/30 scale-[1.01]'
            : 'border-[#0F5132]/25 dark:border-emerald-800/60 bg-white dark:bg-[#13251B] hover:border-[#0F5132] dark:hover:border-emerald-500 shadow-sm hover:shadow-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="hero-studio-photo-input"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-200">
            <Upload className="w-8 h-8 text-[#D4AF37]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-poppins">
              Drop your product photo here, or browse
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-emerald-300/70 font-inter leading-relaxed">
              Works directly with smartphone photos of handlooms, pottery, woodwork, and artisanal goods.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="px-6 py-3 min-h-[44px] bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all font-poppins inline-flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Camera className="w-4 h-4 text-[#D4AF37]" />
              <span>Select Craft Photo</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400 dark:text-emerald-500/60 font-inter">
            Supported formats: JPG, PNG, WEBP • Up to 15MB
          </p>
        </div>
      </div>

      {/* Instant Samples Carousel for frictionless testing */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-emerald-300 font-poppins flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
            Or try immediately with a sample craft photo:
          </span>
          {isLoadingSample && (
            <span className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 animate-pulse font-poppins">
              Loading sample...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_CRAFT_PHOTOS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample.url)}
              className="bg-white dark:bg-[#13251B] p-2.5 rounded-2xl border border-stone-200/90 dark:border-emerald-900/60 shadow-2xs hover:border-[#0F5132] dark:hover:border-emerald-500 transition-all cursor-pointer group space-y-2"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-[#0E2016]">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 dark:text-emerald-400/60 uppercase font-poppins">
                  {sample.category}
                </span>
                <p className="text-xs font-bold text-stone-800 dark:text-white font-poppins truncate">
                  {sample.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Explanation of Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200/80 dark:border-emerald-900/40">
        <div className="bg-white dark:bg-[#13251B] p-4 rounded-2xl border border-stone-200/80 dark:border-emerald-900/50 space-y-1.5">
          <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5 font-poppins">
            <Check className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
            <span>Clean Backgrounds</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-emerald-300/70 font-inter leading-relaxed">
            Eliminate home clutter and isolate your product for Amazon, Flipkart, and ONDC catalogues.
          </p>
        </div>

        <div className="bg-white dark:bg-[#13251B] p-4 rounded-2xl border border-stone-200/80 dark:border-emerald-900/50 space-y-1.5">
          <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5 font-poppins">
            <Check className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
            <span>Marketplace Lighting</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-emerald-300/70 font-inter leading-relaxed">
            Soft studio daylight that lifts dark shadows while honoring real organic dyes and textures.
          </p>
        </div>

        <div className="bg-white dark:bg-[#13251B] p-4 rounded-2xl border border-stone-200/80 dark:border-emerald-900/50 space-y-1.5">
          <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5 font-poppins">
            <Check className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
            <span>WhatsApp & Social Cards</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-emerald-300/70 font-inter leading-relaxed">
            Generate promotional banners, festival creatives, and wholesale catalog covers in one click.
          </p>
        </div>
      </div>
    </div>
  );
};
