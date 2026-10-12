/**
 * KRIVIO AI — Authoritative Centralized Plan Catalogue & Monetization Configuration
 * 
 * Production standard:
 * - Single source of truth for plans, pricing, limits, entitlements, and credit packs.
 * - Client UI and backend server both import from this canonical catalogue.
 * - Pricing is strictly defined in paise and INR. Frontend never dictates price.
 * - Prepaid 30-day access model with manual renewal.
 * - No emojis used in commercial descriptions or UI strings.
 */

export type PlanCode = 'free' | 'artisan_pro' | 'shg_growth';
export type RenewalMode = 'manual' | 'recurring';
export type ResourceType = 'product' | 'ai_text' | 'ai_image' | 'quotation';

export interface PlanLimits {
  /** Maximum number of active retained products allowed to be stored */
  maxProducts: number;
  /** Successful AI text / mentor operations per 30-day allowance period */
  aiTextOperations: number;
  /** Successful paid AI image generations per 30-day allowance period */
  aiImageOperations: number;
  /** Total quotation generation trial limit (-1 = unlimited) */
  quotationsTrialLimit: number;
  /** Maximum number of authorized user seats */
  maxSeats: number;
}

export interface PlanFeatureFlags {
  /** When true, image studio only produces high-fidelity canvas composition, no paid AI gen */
  imageStudioCanvasOnly: boolean;
  /** Advanced export formats (ONDC, Amazon Karigar, GeM, CSV/Excel) */
  advancedExport: boolean;
  /** Professional quotation generation and PDF downloads */
  professionalQuotations: boolean;
  /** B2B wholesale pricing and quotation tools */
  b2bQuotes: boolean;
  /** Branded digital storefront capabilities */
  brandedStorefront: boolean;
  /** Detailed usage and quota dashboard */
  usageDashboard: boolean;
  /** Multi-member organization workspace ownership */
  sharedWorkspace: boolean;
}

export interface Plan {
  code: PlanCode;
  name: string;
  subtitle: string;
  pricePaise: number;
  priceInr: number;
  currency: 'INR';
  durationDays: number;
  renewalMode: RenewalMode;
  isSelfServe: boolean;
  ctaText: string;
  limits: PlanLimits;
  featureFlags: PlanFeatureFlags;
  featureList: string[];
  version: number;
}

export interface CreditPack {
  id: string;
  name: string;
  resourceType: 'ai_image';
  quantity: number;
  pricePaise: number;
  priceInr: number;
  purchaseEnabled: boolean;
  description: string;
}

export const PLAN_CATALOGUE: Record<PlanCode, Plan> = {
  free: {
    code: 'free',
    name: 'Artisan Free',
    subtitle: 'For entrepreneurs beginning their digital journey.',
    pricePaise: 0,
    priceInr: 0,
    currency: 'INR',
    durationDays: 30,
    renewalMode: 'manual',
    isSelfServe: true,
    ctaText: 'Get Started Free',
    limits: {
      maxProducts: 5,
      aiTextOperations: 10,
      aiImageOperations: 0,
      quotationsTrialLimit: 2,
      maxSeats: 1,
    },
    featureFlags: {
      imageStudioCanvasOnly: true,
      advancedExport: false,
      professionalQuotations: false,
      b2bQuotes: false,
      brandedStorefront: true,
      usageDashboard: true,
      sharedWorkspace: false,
    },
    featureList: [
      'Up to 5 stored products',
      '10 AI text and mentor requests per month',
      'Studio composition canvas tools',
      'Basic product catalogue export',
      'Deterministic fair-price calculator',
      'Government scheme guidance',
      'Public storefront access',
      'Limited trial of quotation tools (2 quotes)',
    ],
    version: 1,
  },
  artisan_pro: {
    code: 'artisan_pro',
    name: 'Artisan Pro',
    subtitle: 'For artisans preparing products professionally and selling more regularly.',
    pricePaise: 29900, // ₹299.00
    priceInr: 299,
    currency: 'INR',
    durationDays: 30,
    renewalMode: 'manual',
    isSelfServe: true,
    ctaText: 'Choose Artisan Pro',
    limits: {
      maxProducts: 100,
      aiTextOperations: 75,
      aiImageOperations: 5,
      quotationsTrialLimit: -1, // Unlimited
      maxSeats: 1,
    },
    featureFlags: {
      imageStudioCanvasOnly: false,
      advancedExport: true,
      professionalQuotations: true,
      b2bQuotes: true,
      brandedStorefront: true,
      usageDashboard: true,
      sharedWorkspace: false,
    },
    featureList: [
      'Prepare up to 100 products',
      '75 AI text and mentor requests per 30 days',
      '5 AI product image generations per period',
      'Full Image Studio & composition suite',
      'B2B quotation generation & PDF downloads',
      'Destination-specific export formats (ONDC, GeM, Amazon)',
      'Branded storefront capabilities',
      'Usage dashboard and access history',
      'Prepaid 30-day access, renew manually',
    ],
    version: 1,
  },
  shg_growth: {
    code: 'shg_growth',
    name: 'SHG Growth',
    subtitle: 'For collectives managing products and business activities together.',
    pricePaise: 99900, // ₹999.00
    priceInr: 999,
    currency: 'INR',
    durationDays: 30,
    renewalMode: 'manual',
    isSelfServe: false, // In accordance with spec: self-serve disabled until organization workspace is ready
    ctaText: 'Enquire About Group Access',
    limits: {
      maxProducts: 300,
      aiTextOperations: 250,
      aiImageOperations: 20,
      quotationsTrialLimit: -1,
      maxSeats: 3,
    },
    featureFlags: {
      imageStudioCanvasOnly: false,
      advancedExport: true,
      professionalQuotations: true,
      b2bQuotes: true,
      brandedStorefront: true,
      usageDashboard: true,
      sharedWorkspace: true,
    },
    featureList: [
      'Up to 300 organization-owned products',
      '250 shared AI text and mentor requests',
      '20 shared AI product image generations',
      'Up to 3 authorized member seats',
      'Shared group catalogue operations',
      'Professional quotations and advanced exports',
      'Dedicated group onboarding and support',
    ],
    version: 1,
  },
};

/**
 * Optional credit packs for supplemental AI image generation.
 * Marked purchaseEnabled: false until unit economics and payment integrity are verified.
 */
export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack_img_5',
    name: '5 AI Image Generations',
    resourceType: 'ai_image',
    quantity: 5,
    pricePaise: 12900,
    priceInr: 129,
    purchaseEnabled: false,
    description: 'Supplemental pack of 5 generative AI image studio credits.',
  },
  {
    id: 'pack_img_15',
    name: '15 AI Image Generations',
    resourceType: 'ai_image',
    quantity: 15,
    pricePaise: 32900,
    priceInr: 329,
    purchaseEnabled: false,
    description: 'Supplemental pack of 15 generative AI image studio credits.',
  },
];

export function getPlan(code: string): Plan {
  const normalized = code.toLowerCase().trim();
  if (normalized === 'pro' || normalized === 'artisan_pro') {
    return PLAN_CATALOGUE['artisan_pro'];
  }
  if (normalized === 'shg_growth') {
    return PLAN_CATALOGUE['shg_growth'];
  }
  return PLAN_CATALOGUE['free'];
}

export function getAllPublicPlans(): Plan[] {
  return [
    PLAN_CATALOGUE['free'],
    PLAN_CATALOGUE['artisan_pro'],
    PLAN_CATALOGUE['shg_growth'],
  ];
}

export function getCreditPacks(): CreditPack[] {
  return CREDIT_PACKS;
}
