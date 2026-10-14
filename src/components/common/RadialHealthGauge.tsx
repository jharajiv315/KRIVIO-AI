import React, { useEffect, useState } from 'react';

export interface RadialHealthGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export const RadialHealthGauge: React.FC<RadialHealthGaugeProps> = ({
  score,
  size = 110,
  strokeWidth = 9,
  label = 'Business Health',
  className = '',
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth progress animation from 0 to score
    const target = Math.min(Math.max(score, 0), 100);
    const duration = 1200;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: cubic-bezier out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeOut * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine status color
  const isHealthy = score >= 70;
  const isModerate = score >= 40 && score < 70;

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Subtle Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-stone-200 dark:text-emerald-950/80"
          />

          {/* Active Gradient Meter */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isHealthy ? '#0F5132' : isModerate ? '#D4AF37' : '#C85A32'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300 ease-out"
            style={{
              filter: 'drop-shadow(0px 2px 4px rgba(15, 81, 50, 0.25))',
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl sm:text-2xl font-black font-poppins text-stone-900 dark:text-white leading-none tabular-nums">
            {animatedScore}%
          </span>
          <span className="text-[9px] uppercase font-bold text-stone-400 dark:text-emerald-400/70 font-poppins mt-0.5">
            {isHealthy ? 'Optimal' : isModerate ? 'Growing' : 'Needs Action'}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold text-stone-900 dark:text-white font-poppins block">
          {label}
        </span>
        <p className="text-[11px] text-stone-500 dark:text-emerald-300/80 leading-relaxed font-inter max-w-[140px]">
          {isHealthy
            ? 'Catalog, photos & pricing meet global standards.'
            : isModerate
            ? 'Add photos or Calibrate pricing to reach 90%+.'
            : 'Catalog items to start selling online.'}
        </p>
      </div>
    </div>
  );
};
