import { ModelTier } from './types';

export interface ModelRoute {
  primaryModel: string;
  fallbackModels: string[];
  maxOutputDimension: number;
  tier: ModelTier;
}

export class ModelRouter {
  private static routes: Record<ModelTier, ModelRoute> = {
    fast: {
      primaryModel: 'gemini-2.5-flash-image',
      fallbackModels: ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'],
      maxOutputDimension: 1024,
      tier: 'fast',
    },
    production: {
      primaryModel: 'gemini-2.5-flash-image',
      fallbackModels: ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3-pro-image-preview'],
      maxOutputDimension: 1536,
      tier: 'production',
    },
    professional: {
      primaryModel: 'gemini-3.1-flash-image',
      fallbackModels: ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview', 'gemini-3.1-flash-lite-image'],
      maxOutputDimension: 2048,
      tier: 'professional',
    },
  };

  /**
   * Resolves the optimal Gemini model sequence for a given operation tier.
   */
  public static resolve(tier: ModelTier = 'production'): ModelRoute {
    return this.routes[tier] || this.routes.production;
  }
}
