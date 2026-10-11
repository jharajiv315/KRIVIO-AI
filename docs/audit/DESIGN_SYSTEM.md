# KRIVIO AI — Design System & Human-Centered UX Specification

**Version:** 1.0.0  
**Target Audience:** Rural artisans, self-help groups (SHGs), weavers, handicraft producers, and small enterprises  
**Brand Identity:** "From Local Hands to Global Markets" — Grounded, Dignified, Forest Green & Warm Gold  
**Standard:** WCAG 2.2 Level AA Compliant, Mobile-First, Indic Script Resilient

---

## 1. Brand Philosophy & Design Principles

KRIVIO AI is not a generic Silicon Valley SaaS tool. It is an operational business companion built for makers and rural entrepreneurs who may have varying digital literacy, multi-lingual preferences, and intermittent network conditions.

### Core Principles
1. **Dignity Over Novelty:** Clean, authentic aesthetics that respect Indian craftsmanship rather than flash decorative AI gradients, blobs, and glassmorphism.
2. **Clarity Over Minimalism:** High contrast, explicit step-by-step guidance, visible labels, and immediate confirmation feedback. Never sacrifice usability for austere minimalism.
3. **Truth in Data:** Never fabricate health scores, market benchmarks, or fake approvals. Real numbers or explicit "Calculating..." states only.
4. **Resilient Typography:** Generous line heights for Indic scripts (Hindi, Marathi, Gujarati, Bengali, Tamil, Assamese) preventing matra glyph clipping.

---

## 2. Semantic Color System

The palette preserves KRIVIO's signature Forest Green and Artisanal Gold while providing accessible contrast (minimum 4.5:1 for body copy, 3:1 for large headings and UI controls).

### 2.1 Core Palette

| Token | CSS Variable | Light Theme | Dark Theme | Purpose / Usage |
|---|---|---|---|---|
| **Primary Brand** | `--color-forest-primary` | `#0F382A` | `#1A4D3B` | Main brand identity, top navigation, primary buttons |
| **Primary Accent** | `--color-gold-accent` | `#C59B27` | `#D8AA30` | Key highlights, active indicators, verified badges |
| **Background** | `--color-bg-page` | `#FBFBF9` | `#0B130E` | Main page canvas (warm ecru / rich dark) |
| **Surface** | `--color-surface` | `#FFFFFF` | `#131F18` | Standard cards, containers, input backgrounds |
| **Elevated Surface**| `--color-surface-elevated`| `#F4F5F1`| `#1A2B22` | Modals, floating sheets, hover cards |
| **Border Subtle** | `--color-border-subtle` | `#E5E7EB` | `#22382D` | Divider lines, card outlines |
| **Border Strong** | `--color-border-strong` | `#D1D5DB` | `#335343` | Active inputs, selected states |

### 2.2 Functional & Feedback Colors

| Token | Hex Value | Accessible Foreground | Usage |
|---|---|---|---|
| **Text Primary** | `#111827` (Light) / `#F9FAFB` (Dark) | N/A | Main titles, form labels, body text |
| **Text Secondary** | `#4B5563` (Light) / `#9CA3AF` (Dark) | N/A | Subtitles, helper text, timestamps |
| **Text Muted** | `#6B7280` (Light) / `#6EE7B7` (Dark muted)| N/A | Non-critical metadata, disabled labels |
| **Success** | `#059669` (Emerald 600) | `#FFFFFF` | Completed tasks, verified payments, successful save |
| **Warning** | `#D97706` (Amber 600) | `#FFFFFF` | Incomplete catalog fields, pending verification |
| **Error** | `#DC2626` (Red 600) | `#FFFFFF` | Form errors, validation blocks, network alerts |
| **Focus Ring** | `#2563EB` / `#C59B27` (2px solid) | N/A | Keyboard focus indicator (never outline: none) |

---

## 3. Typography Hierarchy & Indic Script Resilience

### 3.1 Font Stack
- **Headings & Display:** `'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Body & Forms:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Indic Script Fallback:** `'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Bengali', sans-serif`

### 3.2 Scale & Sizing Guidelines

| Level | Size (Desktop) | Size (Mobile) | Line Height | Weight | Minimum Target |
|---|---|---|---|---|---|
| **Hero Heading (`h1`)** | `32px – 40px` | `26px – 30px` | `1.25` | Bold (700) | 1 per page |
| **Section Heading (`h2`)** | `24px – 28px` | `20px – 24px` | `1.3` | Semibold (600) | Content landmark |
| **Card Heading (`h3`)** | `18px – 20px` | `16px – 18px` | `1.35` | Semibold (600) | Module title |
| **Body Primary** | `16px` | `15px – 16px` | `1.5` | Regular (400) | Default text |
| **Body Secondary** | `14px – 15px` | `14px` | `1.5` | Regular (400) | Descriptions |
| **Form Labels** | `14px – 15px` | `14px` | `1.4` | Medium (500) | Always visible |
| **Helper / Caption** | `13px – 14px` | `13px` | `1.4` | Regular (400) | Never below 12px |

> **Indic Script Rule:** Devanagari matras (e.g., ऊपर, नीचे) require a minimum `line-height` of `1.5` (or `leading-relaxed`). Avoid `leading-none` or `leading-tight` on multi-lingual elements.

---

## 4. Spacing, Elevation & Touch Ergonomics

### 4.1 Spacing Scale
- `space-1`: 4px (tight grouping)
- `space-2`: 8px (icon to text gap)
- `space-3`: 12px (form input internal padding)
- `space-4`: 16px (card padding, standard gutter)
- `space-6`: 24px (section content gap)
- `space-8`: 32px (major layout landmark separation)

### 4.2 Touch Targets & Mobile Ergonomics
- **Minimum Interactive Target:** `44px × 44px` (buttons, checkboxes, chips, tab bars).
- **Mobile Gutters:** Minimum `16px` safe horizontal margin on 360px and 390px viewports.
- **Corner Radii:** Consistent `rounded-lg` (8px) for buttons/inputs, `rounded-xl` (12px) for cards. Avoid mixing pill shapes with sharp corners unnecessarily.

---

## 5. Accessibility & Motion Guidelines

### 5.1 Keyboard & Assistive Technology
1. **Semantic HTML:** All interactive triggers use native `<button>` or `<a href="...">`. No clickable `<div onClick>` without keyboard roles.
2. **Focus Indicators:** High-contrast 2px focus ring (`focus-visible:ring-2 focus-visible:ring-offset-2`).
3. **Color Independence:** Error and warning states pair color with descriptive text and icons (e.g. `AlertCircle`).

### 5.2 Motion Restraint
- Decorative continuous spinning animations and large floating blobs are removed.
- All transitions use gentle durations (`150ms – 250ms`, `ease-out`).
- Complete support for `@media (prefers-reduced-motion: reduce)` with zero layout shifts.
