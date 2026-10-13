import React from 'react';

export type LogoConcept = 'weave' | 'hallmark' | 'cartouche';

export interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'iconOnly';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  concept?: LogoConcept;
  showTagline?: boolean;
  className?: string;
  isDarkBg?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  concept = 'weave',
  showTagline = false,
  className = '',
  isDarkBg = false,
}) => {
  // Dimension mappings for SVG Emblem
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  // Typography size mappings
  const textSize = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  const taglineSize = {
    xs: 'text-[8px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-base',
  };

  // Dynamic green color that adapts seamlessly to theme or dark background
  const greenFill = isDarkBg ? '#34D399' : '#0F5132';
  const greenClass = isDarkBg ? 'text-emerald-400' : 'text-[#0F5132] dark:text-[#34D399]';
  const goldFill = '#D4AF37';

  // Render Emblem based on concept
  const renderEmblem = () => {
    if (concept === 'hallmark') {
      // Candidate B: The Artisan Hallmark & Compass
      return (
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconDimensions[size]} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}
        >
          <rect x="24" y="24" width="152" height="152" rx="32" stroke={greenFill} strokeWidth="14" />
          <path d="M 64 64 L 136 64 L 136 136" stroke={goldFill} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy="100" r="16" fill={greenFill} />
        </svg>
      );
    }

    if (concept === 'cartouche') {
      // Candidate C: Connected Craft Loop
      return (
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconDimensions[size]} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}
        >
          <circle cx="85" cy="100" r="48" stroke={greenFill} strokeWidth="16" />
          <circle cx="125" cy="100" r="48" stroke={goldFill} strokeWidth="16" opacity="0.9" />
        </svg>
      );
    }

    // Default / Candidate A: The "Tana-Bana" Weave Monogram ('K')
    // A bespoke interlocked letter 'K' derived from loom warp & weft threads.
    return (
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconDimensions[size]} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}
      >
        {/* Subtle grounding loom shuttle base / container curve */}
        <rect
          x="12"
          y="12"
          width="176"
          height="176"
          rx="42"
          fill={isDarkBg ? 'rgba(52, 211, 153, 0.08)' : 'rgba(15, 81, 50, 0.06)'}
          stroke={isDarkBg ? 'rgba(52, 211, 153, 0.25)' : 'rgba(15, 81, 50, 0.14)'}
          strokeWidth="2.5"
        />

        {/* Vertical Grounding Spine (Loom Warp / Artisan Heritage) */}
        <rect
          x="52"
          y="42"
          width="26"
          height="116"
          rx="13"
          fill={greenFill}
        />

        {/* Upper Ascending Arm (Digital Global Commerce / Warm Gold) */}
        <path
          d="M 98 94 L 142 48 C 147 43 155 43 160 48 C 165 53 165 61 160 66 L 118 108 L 98 94 Z"
          fill={goldFill}
        />

        {/* Lower Descending Interwoven Arm (Craftsmanship Foundation) */}
        <path
          d="M 112 102 L 158 148 C 163 153 163 161 158 166 C 153 171 145 171 140 166 L 96 122 L 112 102 Z"
          fill={greenFill}
        />

        {/* Interlocking Textile Weave Node (Central Bridge in Gold) */}
        <circle
          cx="102"
          cy="104"
          r="12"
          fill={goldFill}
        />
        <circle
          cx="102"
          cy="104"
          r="5.5"
          fill={isDarkBg ? '#0B1911' : '#FFFFFF'}
        />
      </svg>
    );
  };

  return (
    <div
      className={`inline-flex items-center ${
        variant === 'stacked' ? 'flex-col text-center gap-2' : 'gap-2.5'
      } ${className}`}
    >
      {renderEmblem()}

      {/* Brand Text */}
      {variant !== 'iconOnly' && (
        <div className={`flex flex-col ${variant === 'stacked' ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-poppins font-bold tracking-tight ${textSize[size]} ${
                isDarkBg
                  ? 'text-white'
                  : 'text-[#0F5132] dark:text-emerald-200'
              }`}
            >
              KRIVIO
            </span>
            <span className={`font-poppins font-extrabold ${textSize[size]} text-[#D4AF37]`}>
              AI
            </span>
          </div>

          {(showTagline || variant === 'stacked') && (
            <span
              className={`font-inter font-medium tracking-tight mt-1 ${taglineSize[size]} ${
                isDarkBg
                  ? 'text-emerald-200/80'
                  : 'text-stone-500 dark:text-emerald-400/80'
              }`}
            >
              From Local Hands to Global Markets
            </span>
          )}
        </div>
      )}
    </div>
  );
};

