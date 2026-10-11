import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.join(rootDir, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Base standard SVG (with gentle rounded corners for standard launcher)
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="512" height="512">
  <rect width="200" height="200" rx="36" fill="#0F5132"/>
  <!-- Arch line overhead -->
  <path d="M 42 120 C 35 68, 70 28, 126 30 C 146 31, 162 40, 172 54" stroke="#34D399" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- Golden Sparkles / Stars (Top Right) -->
  <path d="M 166 22 C 166 28, 172 34, 178 34 C 172 34, 166 40, 166 46 C 166 40, 160 34, 154 34 C 160 34, 166 28, 166 22 Z" fill="#D4AF37"/>
  <path d="M 184 42 C 184 46, 188 50, 192 50 C 188 50, 184 54, 184 58 C 184 54, 180 50, 176 50 C 180 50, 184 46, 184 42 Z" fill="#D4AF37"/>
  <!-- Central Uplifted Human Figure in Gold -->
  <circle cx="100" cy="70" r="13" fill="#D4AF37"/>
  <path d="M 100 126 C 92 108, 62 82, 58 75 C 55 70, 62 65, 68 70 C 82 82, 94 96, 100 96 C 106 96, 118 82, 132 70 C 138 65, 145 70, 142 75 C 138 82, 108 108, 100 126 Z" fill="#D4AF37"/>
  <!-- Left Leaf -->
  <path d="M 100 152 C 62 144, 25 112, 33 68 C 65 78, 92 110, 100 152 Z" fill="#10B981"/>
  <path d="M 100 152 C 78 128, 55 104, 34 72" stroke="#0F5132" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
  <!-- Right Leaf -->
  <path d="M 100 152 C 138 144, 175 112, 167 68 C 135 78, 108 110, 100 152 Z" fill="#10B981"/>
  <path d="M 100 152 C 122 128, 145 104, 166 72" stroke="#0F5132" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
</svg>`;

// 2. Maskable SVG: Full-bleed square background (#0F5132) with emblem scaled to 70% in center (W3C Safe Zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="512" height="512">
  <!-- Full bleed square without corner rounding for arbitrary OS mask clipping -->
  <rect width="200" height="200" fill="#0F5132"/>
  <!-- Inner Artwork inside the 80% Safe Zone circle -->
  <g transform="translate(30, 30) scale(0.70)">
    <!-- Arch line overhead -->
    <path d="M 42 120 C 35 68, 70 28, 126 30 C 146 31, 162 40, 172 54" stroke="#34D399" stroke-width="8" stroke-linecap="round" fill="none"/>
    <!-- Golden Sparkles / Stars (Top Right) -->
    <path d="M 166 22 C 166 28, 172 34, 178 34 C 172 34, 166 40, 166 46 C 166 40, 160 34, 154 34 C 160 34, 166 28, 166 22 Z" fill="#D4AF37"/>
    <path d="M 184 42 C 184 46, 188 50, 192 50 C 188 50, 184 54, 184 58 C 184 54, 180 50, 176 50 C 180 50, 184 46, 184 42 Z" fill="#D4AF37"/>
    <!-- Central Uplifted Human Figure in Gold -->
    <circle cx="100" cy="70" r="13" fill="#D4AF37"/>
    <path d="M 100 126 C 92 108, 62 82, 58 75 C 55 70, 62 65, 68 70 C 82 82, 94 96, 100 96 C 106 96, 118 82, 132 70 C 138 65, 145 70, 142 75 C 138 82, 108 108, 100 126 Z" fill="#D4AF37"/>
    <!-- Left Leaf -->
    <path d="M 100 152 C 62 144, 25 112, 33 68 C 65 78, 92 110, 100 152 Z" fill="#10B981"/>
    <path d="M 100 152 C 78 128, 55 104, 34 72" stroke="#0F5132" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
    <!-- Right Leaf -->
    <path d="M 100 152 C 138 144, 175 112, 167 68 C 135 78, 108 110, 100 152 Z" fill="#10B981"/>
    <path d="M 100 152 C 122 128, 145 104, 166 72" stroke="#0F5132" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
  </g>
</svg>`;

function renderPng(svgText, width, height) {
  const resvg = new Resvg(svgText, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

console.log('Rendering PWA icons...');

// 1. icon-192x192.png
const png192 = renderPng(standardSvg, 192, 192);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);
console.log('✓ Created public/icons/icon-192x192.png');

// 2. icon-512x512.png
const png512 = renderPng(standardSvg, 512, 512);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);
console.log('✓ Created public/icons/icon-512x512.png');

// 3. icon-maskable-512x512.png
const pngMaskable512 = renderPng(maskableSvg, 512, 512);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), pngMaskable512);
console.log('✓ Created public/icons/icon-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
const pngApple180 = renderPng(standardSvg, 180, 180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pngApple180);
// Also save apple-touch-icon to public root for maximum crawler/safari compatibility
fs.writeFileSync(path.join(rootDir, 'public', 'apple-touch-icon.png'), pngApple180);
console.log('✓ Created public/icons/apple-touch-icon.png and public/apple-touch-icon.png');

console.log('All PWA icons generated successfully!');
