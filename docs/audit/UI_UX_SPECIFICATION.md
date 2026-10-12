# KRIVIO AI — Commercial UI/UX Specification
**Document Version:** 1.0.0 (Production Release Candidate)  
**Author:** Senior Product Designer & Accessibility Specialist  
**Scope:** Pricing Section, Subscription View, Usage Dashboard, Limit Reached Modals, and Visual Restraint Standards  

---

## 1. Visual Restraint & Enterprise Quality Standard

In accordance with KRIVIO's design principles for rural artisans and commercial credibility:
1. **Zero Emojis:** Strictly prohibited across all pricing tables, upgrade buttons, billing cards, invoice receipts, alerts, and limit modals. Only purposeful Lucide SVG icons (`Check`, `Sparkles`, `Package`, `ShieldCheck`, `AlertCircle`, etc.) are permitted.
2. **Palette & Typography:** Forest greens (`#1B4D3E`, `#0F2E25`), warm muted golds (`#C5A059`, `#B38F46`), off-white cards (`#FAFAF8`, `#F5F3EF`), and crisp charcoal text (`#1C1917`, `#44403C`).
3. **Truth in Advertising:**
   - Always display "30-day access, renew manually" for Artisan Pro.
   - Never display "Automated recurring subscription" or "Cancel anytime" for prepaid passes.
   - SHG Growth displays "Enquire About Group Access" to prevent selling incomplete workspace features.

---

## 2. Key Interface Modules

### 2.1 Pricing Modal (`src/components/PricingModal.tsx`)
- Displays the 3 canonical tiers side-by-side or stacked on mobile:
  - **Artisan Free:** ₹0 / free perpetual access. Primary CTA: "Get Started Free"
  - **Artisan Pro:** ₹299 / 30-day prepaid pass. Primary CTA: "Choose Artisan Pro" (launches direct Razorpay checkout).
  - **SHG Growth:** ₹999 / 30-day pass. Primary CTA: "Enquire About Group Access" (opens assisted group enquiry modal).
- Clear, honest feature bullet lists (no 25-item cluttered grids).

### 2.2 Subscription & Usage Dashboard (`src/components/SubscriptionView.tsx`)
- Located in Account / Settings.
- Four real-time usage meters:
  - **Products:** "X of Y products stored" with progress bar.
  - **AI Business Mentor:** "X of Y monthly requests used".
  - **AI Image Studio:** "X of Y generative images used".
  - **Wholesale Quotations:** "X of Y quotations used" (or "Unlimited for Pro").
- Next reset / expiration date presented clearly in local date format.
- Renewal action button with clear explanation of remaining day retention.

### 2.3 Limit Reached Experience (`src/components/LimitReachedModal.tsx`)
- Calm, respectful modal that appears when a user hits a cap (5th product on Free, 10th AI request, or 2nd quotation).
- Explains what limit was reached without shame, aggressive countdown timers, or fake urgency.
- Provides immediate non-AI alternatives: "Continue Without AI" or "Manage Existing Products".
- Displays "View Plan & Upgrade" for users ready to expand capacity.

---

## 3. Accessibility & Mobile Optimization
- Minimum touch target size: 44px $\times$ 44px.
- WCAG AA contrast ratio compliance on all text against card backgrounds (minimum 4.5:1).
- ARIA live regions on quota progress updates and checkout failure notices.
- Keyboard navigation (Tab, Enter, Escape) supported across all modals.
