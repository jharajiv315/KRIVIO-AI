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
  <rect width="200" height="200" rx="44" fill="#0F5132"/>
  <!-- Shuttle aperture frame -->
  <rect x="16" y="16" width="168" height="168" rx="36" fill="none" stroke="rgba(212, 175, 55, 0.35)" stroke-width="3"/>
  <!-- Vertical Grounding Spine (Loom Warp / Artisan Heritage) -->
  <rect x="52" y="42" width="26" height="116" rx="13" fill="#FFFFFF"/>
  <!-- Upper Ascending Arm (Digital Global Commerce / Warm Gold) -->
  <path d="M 98 94 L 142 48 C 147 43 155 43 160 48 C 165 53 165 61 160 66 L 118 108 L 98 94 Z" fill="#D4AF37"/>
  <!-- Lower Descending Interwoven Arm (Craftsmanship Foundation) -->
  <path d="M 112 102 L 158 148 C 163 153 163 161 158 166 C 153 171 145 171 140 166 L 96 122 L 112 102 Z" fill="#34D399"/>
  <!-- Interlocking Textile Weave Node (Central Bridge in Gold) -->
  <circle cx="102" cy="104" r="13" fill="#D4AF37"/>
  <circle cx="102" cy="104" r="6" fill="#0F5132"/>
</svg>`;

// 2. Maskable SVG: Full-bleed square background (#0F5132) with emblem scaled to 70% in center (W3C Safe Zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="512" height="512">
  <!-- Full bleed square without corner rounding for arbitrary OS mask clipping -->
  <rect width="200" height="200" fill="#0F5132"/>
  <!-- Inner Artwork inside the 75% Safe Zone circle -->
  <g transform="translate(32, 32) scale(0.68)">
    <rect x="52" y="42" width="26" height="116" rx="13" fill="#FFFFFF"/>
    <path d="M 98 94 L 142 48 C 147 43 155 43 160 48 C 165 53 165 61 160 66 L 118 108 L 98 94 Z" fill="#D4AF37"/>
    <path d="M 112 102 L 158 148 C 163 153 163 161 158 166 C 153 171 145 171 140 166 L 96 122 L 112 102 Z" fill="#34D399"/>
    <circle cx="102" cy="104" r="13" fill="#D4AF37"/>
    <circle cx="102" cy="104" r="6" fill="#0F5132"/>
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
