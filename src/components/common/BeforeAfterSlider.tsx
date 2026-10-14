import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

export interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatioClass?: string;
  className?: string;
  initialSliderPos?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Workshop Original',
  afterLabel = 'KRIVIO Studio Standard',
  aspectRatioClass = 'aspect-4/3 sm:aspect-16/10',
  className = '',
  initialSliderPos = 50,
}) => {
  const [sliderPos, setSliderPos] = useState(initialSliderPos);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPercentage = Math.min(Math.max((x / rect.width) * 100, 2), 98);
    setSliderPos(clampedPercentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos((prev) => Math.max(prev - 5, 2));
    } else if (e.key === 'ArrowRight') {
      setSliderPos((prev) => Math.min(prev + 5, 98));
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="Before and after product photography comparison slider"
      aria-valuenow={Math.round(sliderPos)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative select-none overflow-hidden rounded-2xl border border-stone-200/90 dark:border-emerald-800/60 shadow-lg group cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] ${aspectRatioClass} ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Background / After Image (Studio Enhanced) */}
      <img
        src={afterImage}
        alt="After: Studio enhanced product photography"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* Foreground / Before Image (Clipped with zero layout thrashing) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Before: Original product photo"
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* Floating Badges */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold font-poppins shadow-xs border border-white/10">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-[#0F5132]/90 backdrop-blur-md text-[#D4AF37] text-[11px] font-bold font-poppins shadow-xs border border-[#D4AF37]/30">
          {afterLabel}
        </span>
      </div>

      {/* Draggable Divider Line & Golden Grip Handle */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0F5132] text-[#D4AF37] border-2 border-white shadow-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110 active:scale-95 pointer-events-auto cursor-ew-resize">
            <ChevronsLeftRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
