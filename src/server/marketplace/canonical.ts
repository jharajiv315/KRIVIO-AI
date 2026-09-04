import { CanonicalProduct, DataProvenance } from '../../types/marketplace';

export interface RawDbProduct {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  craft_story?: string | null;
  category?: string | null;
  subcategory?: string | null;
  material?: string | null;
  color?: string | null;
  size?: string | null;
  price?: number | string | null;
  mrp?: number | string | null;
  wholesale_price?: number | string | null;
  currency?: string | null;
  stock?: number | null;
  moq?: number | null;
  lead_time?: string | null;
  sku?: string | null;
  weight?: string | null;
  dimensions?: string | null;
  hsn_code?: string | null;
  gst_rate?: number | string | null;
  brand?: string | null;
  origin_state?: string | null;
  status?: string | null;
  keywords?: any;
  image_urls?: any;
  is_marketplace_ready?: boolean | null;
  readiness_score?: number | null;
  marketplaces?: any;
  created_at?: any;
  updated_at?: any;
}

export interface BusinessProfileContext {
  brandName?: string | null;
  businessName?: string | null;
  state?: string | null;
  district?: string | null;
}

export function parseWeightKg(weightStr?: string | null): number {
  if (!weightStr) return 0.5; // fallback
  const clean = String(weightStr).trim().toLowerCase();
  const numMatch = clean.match(/([\d.]+)/);
  if (!numMatch) return 0.5;
  const val = parseFloat(numMatch[1]);
  if (isNaN(val) || val <= 0) return 0.5;

  if (clean.includes('gm') || clean.includes('g') && !clean.includes('kg')) {
    return Math.round((val / 1000) * 1000) / 1000;
  }
  return val;
}

export function parseDimensionsCm(dimStr?: string | null): { length: number; width: number; height: number } {
  const fallback = { length: 15, width: 10, height: 5 };
  if (!dimStr) return fallback;
  const parts = String(dimStr).toLowerCase().replace(/cm|inch|in|mm/g, '').split(/[x*×]/).map((s) => parseFloat(s.trim()));
  if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return {
      length: Math.max(1, parts[0]),
      width: Math.max(1, parts[1]),
      height: Math.max(1, parts[2]),
    };
  }
  return fallback;
}

/**
 * Normalizes raw database product records into the CanonicalProduct export representation
 */
export function toCanonicalProduct(
  raw: RawDbProduct,
  businessProfile?: BusinessProfileContext
): CanonicalProduct {
  const provenance: Record<string, DataProvenance> = {};

  // Title
  const title = (raw.title || '').trim();
  provenance.title = title ? 'USER_PROVIDED' : 'NOT_AVAILABLE';

  // SKU
  let sku = (raw.sku || '').trim();
  if (!sku) {
    sku = `SKU-${raw.id ? raw.id.slice(-6).toUpperCase() : Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    provenance.sku = 'SYSTEM_DERIVED';
  } else {
    provenance.sku = 'USER_PROVIDED';
  }

  // Brand: check product level brand, then business profile brand, fallback to business name or "Krivio Artisan"
  let brand = (raw.brand || '').trim();
  if (brand) {
    provenance.brand = 'USER_PROVIDED';
  } else if (businessProfile?.brandName) {
    brand = businessProfile.brandName.trim();
    provenance.brand = 'SYSTEM_DERIVED';
  } else if (businessProfile?.businessName) {
    brand = businessProfile.businessName.trim();
    provenance.brand = 'SYSTEM_DERIVED';
  } else {
    brand = 'Handcrafted by Krivio Artisan';
    provenance.brand = 'SYSTEM_DERIVED';
  }

  // Description & Story
  const description = (raw.description || '').trim();
  provenance.description = description ? 'USER_PROVIDED' : 'NOT_AVAILABLE';
  const craftStory = raw.craft_story ? raw.craft_story.trim() : undefined;
  if (craftStory) provenance.craftStory = 'USER_PROVIDED';

  // Category
  const category = (raw.category || 'Handicrafts & Art').trim();
  provenance.category = raw.category ? 'USER_PROVIDED' : 'SYSTEM_DERIVED';

  // Pricing
  const price = typeof raw.price === 'number' ? raw.price : parseFloat(String(raw.price || 0)) || 0;
  provenance.price = price > 0 ? 'USER_PROVIDED' : 'NOT_AVAILABLE';

  const mrp = raw.mrp ? (typeof raw.mrp === 'number' ? raw.mrp : parseFloat(String(raw.mrp)) || undefined) : undefined;
  if (mrp) provenance.mrp = 'USER_PROVIDED';

  const wholesalePrice = raw.wholesale_price
    ? typeof raw.wholesale_price === 'number'
      ? raw.wholesale_price
      : parseFloat(String(raw.wholesale_price)) || undefined
    : undefined;
  if (wholesalePrice) provenance.wholesalePrice = 'USER_PROVIDED';

  const currency = (raw.currency || 'INR').trim().toUpperCase();

  // Inventory & Logistics
  const stock = typeof raw.stock === 'number' ? Math.max(0, raw.stock) : parseInt(String(raw.stock || 1), 10);
  const moq = typeof raw.moq === 'number' && raw.moq > 0 ? raw.moq : parseInt(String(raw.moq || 1), 10) || 1;
  const leadTime = (raw.lead_time || '3-5 business days').trim();

  // Weight & Dimensions
  const weightStr = (raw.weight || '0.5 kg').trim();
  const weightKg = parseWeightKg(weightStr);
  const dimStr = (raw.dimensions || '15x10x5 cm').trim();
  const dim = parseDimensionsCm(dimStr);

  // Images
  let imageUrls: string[] = [];
  if (Array.isArray(raw.image_urls)) {
    imageUrls = raw.image_urls.filter((url) => typeof url === 'string' && url.trim().length > 0);
  } else if (typeof raw.image_urls === 'string') {
    try {
      const parsed = JSON.parse(raw.image_urls);
      if (Array.isArray(parsed)) imageUrls = parsed.filter((u) => typeof u === 'string' && u.trim().length > 0);
    } catch {}
  }
  const primaryImageUrl = imageUrls.length > 0 ? imageUrls[0] : undefined;
  provenance.imageUrls = imageUrls.length > 0 ? 'USER_PROVIDED' : 'NOT_AVAILABLE';

  // Keywords
  let keywords: string[] = [];
  if (Array.isArray(raw.keywords)) {
    keywords = raw.keywords.map(String).filter((k) => k.trim().length > 0);
  } else if (typeof raw.keywords === 'string') {
    try {
      const parsed = JSON.parse(raw.keywords);
      if (Array.isArray(parsed)) keywords = parsed.map(String).filter((k) => k.trim().length > 0);
    } catch {
      keywords = raw.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }

  // Material & Details
  const material = (raw.material || '').trim() || undefined;
  if (material) provenance.material = 'USER_PROVIDED';

  const color = (raw.color || '').trim() || undefined;
  const size = (raw.size || '').trim() || undefined;
  const hsnCode = (raw.hsn_code || '').trim() || undefined;
  if (hsnCode) provenance.hsnCode = 'USER_PROVIDED';

  const gstRate = raw.gst_rate ? (typeof raw.gst_rate === 'number' ? raw.gst_rate : parseFloat(String(raw.gst_rate)) || undefined) : undefined;
  const originState = (raw.origin_state || businessProfile?.state || 'India').trim();

  return {
    id: raw.id,
    userId: raw.user_id,
    sku,
    title,
    shortDescription: raw.short_description ? raw.short_description.trim() : undefined,
    description,
    bulletPoints: keywords.length > 0 ? keywords.slice(0, 5) : undefined,
    craftStory,
    brand,
    category,
    subcategory: raw.subcategory ? raw.subcategory.trim() : undefined,
    material,
    color,
    size,
    price,
    mrp: mrp && mrp >= price ? mrp : Math.round(price * 1.25), // safe MRP estimate if not set
    wholesalePrice,
    currency,
    moq,
    stock,
    leadTime,
    weight: weightStr,
    weightKg,
    dimensions: dimStr,
    lengthCm: dim.length,
    widthCm: dim.width,
    heightCm: dim.height,
    hsnCode,
    gstRate: gstRate ?? 12, // standard handicraft GST rate
    imageUrls,
    primaryImageUrl,
    keywords,
    status: raw.status || 'published',
    originState,
    provenance,
  };
}
