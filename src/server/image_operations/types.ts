export type OperationCategory =
  | 'photo_cleanup'
  | 'image_quality'
  | 'lifestyle_context'
  | 'marketing_assets'
  | 'branding'
  | 'catalog_assets'
  | 'seasonal_cultural'
  | 'advanced_editing';

export type AspectRatioType = '1:1' | '4:5' | '9:16' | '16:9' | '4:3' | '3:4';

export type ModelTier = 'fast' | 'production' | 'professional';

export interface ImageOperation {
  id: string;
  category: OperationCategory;
  label: string;
  description: string;
  humanCategory: string;
  requiredInputs: string[];
  optionalInputs: string[];
  promptTemplate: string;
  preservationRules: string[];
  aspectRatioRules: AspectRatioType;
  modelPreference: ModelTier;
  outputType: 'photo' | 'marketing_graphic' | 'catalog_page' | 'branding_asset';
  languageSupport: boolean;
  recommendedUse?: string;
  badge?: string;
}

export interface BrandContext {
  brandName?: string;
  tagline?: string;
  brandColors?: string[];
  logoUrl?: string;
  craftType?: string;
  region?: string;
}

export interface GenerateImageRequest {
  productId?: string;
  operationId?: string;
  userInstruction?: string;
  originalImage: string; // Base64 data URI or URL
  referenceImages?: Array<{ url: string; role: 'product' | 'logo' | 'style' | 'packaging' }>;
  aspectRatio?: AspectRatioType;
  language?: string;
  brandContext?: BrandContext;
  festivalOrOccasion?: string;
  marketingText?: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    price?: number;
  };
  previousAssetId?: string; // For iterative conversational edits
}

export interface GenerateImageResponse {
  assetId: string;
  operationId: string;
  originalImage: string;
  generatedImage: string;
  aspectRatio: AspectRatioType;
  operationLabel: string;
  summaryNote: string;
  modelUsed: string;
  suggestedFollowUps: string[];
  createdAt: string;
}

export interface ImageStudioAsset {
  id: string;
  userId: string;
  productId?: string;
  operationId: string;
  category: string;
  originalAsset: string;
  generatedAsset: string;
  selectedAsset?: string;
  aspectRatio: string;
  userInstruction?: string;
  promptSummary?: string;
  modelUsed: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
