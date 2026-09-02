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
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: ['imagen-3.0-generate-002', 'gemini-2.5-pro'],
      maxOutputDimension: 1024,
      tier: 'fast',
    },
    production: {
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: ['imagen-3.0-generate-002', 'gemini-2.5-pro'],
      maxOutputDimension: 1536,
      tier: 'production',
    },
    professional: {
      primaryModel: 'gemini-2.5-pro',
      fallbackModels: ['gemini-2.5-flash', 'imagen-3.0-generate-002'],
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
