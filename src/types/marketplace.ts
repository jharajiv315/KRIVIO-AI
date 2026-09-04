/**
 * KRIVIO AI — Marketplace & Catalog Export Types
 * Canonical representation and strict interfaces for multi-channel listing preparation
 */

export type MarketplaceDestination =
  | 'amazon'
  | 'meesho'
  | 'flipkart'
  | 'generic_csv'
  | 'generic_xlsx'
  | 'ondc';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type DataProvenance =
  | 'USER_PROVIDED'
  | 'AI_GENERATED'
  | 'AI_INFERRED'
  | 'SYSTEM_DERIVED'
  | 'MARKETPLACE_MAPPED'
  | 'NOT_AVAILABLE';

export interface ValidationIssue {
  field: string;
  severity: ValidationSeverity;
  message: string;
  remediation?: string;
  source?: string;
}

export interface ValidationResult {
  ready: boolean;
  destination: MarketplaceDestination;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
  checkedFields: string[];
  schemaVersion: string;
}

export interface CanonicalProduct {
  id: string;
  userId: string;
  sku: string;
  title: string;
  shortDescription?: string;
  description: string;
  bulletPoints?: string[];
  craftStory?: string;
  brand: string;
  category: string;
  subcategory?: string;
  material?: string;
  color?: string;
  size?: string;
  price: number; // Selling Price (INR or configured currency)
  mrp?: number; // Maximum Retail Price
  wholesalePrice?: number; // Wholesale/B2B Unit Price
  currency: string;
  moq: number; // Minimum Order Quantity (default 1)
  stock: number;
  leadTime: string; // e.g. "3-5 business days"
  weight: string; // e.g. "0.5 kg" or "500g"
  weightKg: number;
  dimensions: string; // e.g. "15x10x5 cm"
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  hsnCode?: string;
  gstRate?: number;
  imageUrls: string[];
  primaryImageUrl?: string;
  keywords: string[];
  status: string;
  originState?: string;
  provenance: Record<string, DataProvenance>;
}

export interface DestinationMetadata {
  id: MarketplaceDestination;
  name: string;
  tagline: string;
  badge: string;
  format: ExportFormat;
  schemaVersion: string;
  lastVerifiedDate: string;
  description: string;
  instructions: string[];
  supportedCategories: string[];
  disclaimer: string;
}

export interface ExportReport {
  destination: MarketplaceDestination;
  destinationName: string;
  format: ExportFormat;
  schemaVersion: string;
  generatedAt: string;
  totalRequested: number;
  totalExported: number;
  totalExcluded: number;
  warningsCount: number;
  errorsCount: number;
  downloadFilename: string;
  excludedReasons?: { productId: string; productTitle: string; reason: string }[];
}

export interface PricingTier {
  minQuantity: number;
  maxQuantity?: number; // undefined or null denotes "and above"
  unitPrice: number;
}

export interface QuotationItemInput {
  productId: string;
  title: string;
  sku?: string;
  imageUrl?: string;
  description?: string;
  craftStory?: string;
  material?: string;
  quantity: number;
  moq: number;
  unitPrice: number;
  leadTime?: string;
  pricingTiers?: PricingTier[];
  notes?: string;
}

export interface QuotationItemSnapshot extends QuotationItemInput {
  lineTotal: number;
}

export interface QuotationSellerSnapshot {
  businessName: string;
  brandName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  state?: string;
  district?: string;
  village?: string;
  pinCode?: string;
  gstNumber?: string;
  businessRegistration?: string;
  website?: string;
  logoUrl?: string;
}

export interface QuotationBuyerInput {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

export interface Quotation {
  id: string;
  userId: string;
  quotationNumber: string;
  buyer: QuotationBuyerInput;
  seller: QuotationSellerSnapshot;
  currency: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  validUntil: string;
  commercialNotes?: string;
  shippingTerms?: string;
  paymentTerms?: string;
  status: 'draft' | 'generated' | 'sent' | 'archived';
  items: QuotationItemSnapshot[];
  createdAt: string;
  updatedAt: string;
}
