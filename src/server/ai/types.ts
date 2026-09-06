export type AITaskType =
  | 'MENTOR'
  | 'PHOTO_DIAGNOSIS'
  | 'PRODUCT_ANALYSIS'
  | 'BRAND_SUGGESTION'
  | 'PRODUCT_IDENTITY'
  | 'PRICING_EXPLANATION'
  | 'MARKETING_ASSISTANT';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'gu' | 'bn' | 'as';

export interface UserContext {
  userId: string;
  name?: string;
  preferredLanguage?: LanguageCode | string;
  state?: string;
}

export interface BusinessContext {
  businessName?: string;
  businessType?: string;
  state?: string;
  craftType?: string;
  targetChannels?: string[];
  brandPersonality?: string;
}

export interface ProductContext {
  id?: string;
  name?: string;
  category?: string;
  materials?: string[];
  price?: number;
  description?: string;
  images?: string[];
  dimensions?: string;
  careInstructions?: string;
  confirmedAttributes?: Record<string, any>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ImageInput {
  base64Data: string; // clean base64 data (no header) or data URL
  mimeType: string;
  filename?: string;
}

export interface AIRequestContext {
  task: AITaskType;
  requestId?: string;
  userContext?: UserContext;
  businessContext?: BusinessContext;
  productContext?: ProductContext;
  conversationContext?: ConversationMessage[];
  userInput?: string;
  imageInput?: ImageInput;
  language?: LanguageCode | string;
  parameters?: Record<string, any>;
}

// Structured results

export interface MentorResponse {
  response: string;
  intent: string;
  entities: Record<string, any>;
  recommendedActions: string[];
  suggestedFollowUps: string[];
  language: string;
}

export interface ProductAnalysisResponse {
  productType: string;
  category: string;
  visibleMaterials: string[];
  colors: string[];
  shape: string;
  craftCharacteristics: string[];
  visualStyle: string;
  possibleUseCases: string[];
  imageQualityAssessment: {
    lighting: string;
    sharpness: string;
    composition: string;
    backgroundQuality: string;
    recommendations: string[];
  };
  confidenceScores: {
    categoryConfidence: number; // 0.0 - 1.0
    materialConfidence: number; // 0.0 - 1.0
  };
  uncertainAttributes: string[];
  clarificationQuestions: string[];
}

export interface PhotoDiagnosisResponse {
  overallScore: number; // 0 - 100
  dimensions: {
    lighting: { score: number; status: 'good' | 'fair' | 'poor'; feedback: string };
    background: { score: number; status: 'good' | 'fair' | 'poor'; feedback: string };
    framing: { score: number; status: 'good' | 'fair' | 'poor'; feedback: string };
    sharpness: { score: number; status: 'good' | 'fair' | 'poor'; feedback: string };
    productVisibility: { score: number; status: 'good' | 'fair' | 'poor'; feedback: string };
  };
  keyIssues: string[];
  actionableImprovements: string[];
  marketplaceCompliance: {
    amazonReady: boolean;
    flipkartReady: boolean;
    meeshoReady: boolean;
    ondcReady: boolean;
    issuesToFix: string[];
  };
}

export interface BrandSuggestionItem {
  name: string;
  tagline: string;
  meaning: string;
  culturalRelevance: string;
  targetAppeal: string;
}

export interface BrandSuggestionResponse {
  suggestions: BrandSuggestionItem[];
  personality: string;
  craftHeritage: string;
  language: string;
}

export interface ProductIdentityResponse {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  story: string;
  bulletFeatures: string[];
  specifications: Record<string, string>;
  careInstructions: string;
  keywords: string[];
  tags: string[];
  targetAudience: string;
  suggestedPriceRationale?: string;
  language: string;
}

export interface TelemetryRecord {
  requestId: string;
  timestamp: string;
  task: AITaskType;
  model: string;
  userId?: string;
  productId?: string;
  durationMs: number;
  success: boolean;
  fallbackUsed: boolean;
  fallbackReason?: string;
  error?: string;
}
