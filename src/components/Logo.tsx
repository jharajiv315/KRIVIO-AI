import React from 'react';

export interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'iconOnly';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
  className?: string;
  isDarkBg?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  className = '',
  isDarkBg = false,
}) => {
  // Dimension mappings for SVG Emblem
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
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

  // Dynamic green color for stroke & fill that adapts seamlessly to theme or dark background
  const greenClass = isDarkBg
    ? 'text-[#4CAF50]'
    : 'text-[#0F5132] dark:text-[#34D399]';

  return (
    <div
      className={`inline-flex items-center ${
        variant === 'stacked' ? 'flex-col text-center gap-2' : 'gap-3'
      } ${className}`}
    >
      {/* Official KRIVIO AI Emblem */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconDimensions[size]} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}
      >
        {/* Arch line overhead */}
        <path
          d="M 42 120 C 35 68, 70 28, 126 30 C 146 31, 162 40, 172 54"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={greenClass}
        />

        {/* Golden Sparkles / Stars (Top Right) */}
        {/* Larger 4-point star */}
        <path
          d="M 166 22 C 166 28, 172 34, 178 34 C 172 34, 166 40, 166 46 C 166 40, 160 34, 154 34 C 160 34, 166 28, 166 22 Z"
          fill="#D4AF37"
        />
        {/* Smaller 4-point star */}
        <path
          d="M 184 42 C 184 46, 188 50, 192 50 C 188 50, 184 54, 184 58 C 184 54, 180 50, 176 50 C 180 50, 184 46, 184 42 Z"
          fill="#D4AF37"
        />

        {/* Central Uplifted Human Figure in Gold */}
        <circle cx="100" cy="70" r="13" fill="#D4AF37" />
        <path
          d="M 100 126 C 92 108, 62 82, 58 75 C 55 70, 62 65, 68 70 C 82 82, 94 96, 100 96 C 106 96, 118 82, 132 70 C 138 65, 145 70, 142 75 C 138 82, 108 108, 100 126 Z"
          fill="#D4AF37"
        />

        {/* Left Leaf */}
        <path
          d="M 100 152 C 62 144, 25 112, 33 68 C 65 78, 92 110, 100 152 Z"
          fill="currentColor"
          className={greenClass}
        />
        <path
          d="M 100 152 C 78 128, 55 104, 34 72"
          stroke="#F8F9F5"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Right Leaf */}
        <path
          d="M 100 152 C 138 144, 175 112, 167 68 C 135 78, 108 110, 100 152 Z"
          fill="currentColor"
          className={greenClass}
        />
        <path
          d="M 100 152 C 122 128, 145 104, 166 72"
          stroke="#F8F9F5"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>

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
              className={`font-inter font-medium tracking-normal mt-1 ${taglineSize[size]} ${
                isDarkBg
                  ? 'text-emerald-100/80'
                  : 'text-[#2E7D32] dark:text-emerald-400'
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
