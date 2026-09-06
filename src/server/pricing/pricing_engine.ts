import { geminiService } from '../ai/gemini_client';
import { PromptRegistry } from '../ai/prompt_registry';
import { AIRequestContext, LanguageCode } from '../ai/types';

export interface PricingInput {
  productId?: string;
  materialCost?: number;
  laborCost?: number;
  laborHours?: number;
  hourlyRate?: number;
  packagingCost?: number;
  transportCost?: number;
  overheadCost?: number;
  desiredMarginPercent?: number; // e.g., 30 for 30%
  platformFeePercent?: number;   // e.g., 15 for 15% (Amazon/Flipkart)
  quantity?: number;
}

export interface PricingBreakdown {
  isComplete: boolean;
  knownValues: Record<string, number>;
  assumedValues: Record<string, number>;
  missingFields: string[];
  totalDirectCost: number;
  materialCost: number;
  laborCost: number;
  packagingCost: number;
  transportCost: number;
  overheadCost: number;
  marginPercentage: number;
  fairRetailPrice: number;
  platformFeePercentage: number;
  marketplacePrice: number;
  wholesalePrice: number;
  currency: string;
}

export interface PricingCalculationResult {
  breakdown: PricingBreakdown;
  aiExplanation?: {
    explanation: string;
    marginAdvice: string;
    marketplaceTip: string;
    wholesaleGuidance: string;
  };
}

export class PricingEngine {
  /**
   * Deterministic exact arithmetic calculation
   */
  public static calculate(input: PricingInput): PricingBreakdown {
    const knownValues: Record<string, number> = {};
    const assumedValues: Record<string, number> = {};
    const missingFields: string[] = [];

    // 1. Material cost
    let materialCost = 0;
    if (typeof input.materialCost === 'number' && input.materialCost >= 0) {
      materialCost = Math.round(input.materialCost * 100) / 100;
      knownValues.materialCost = materialCost;
    } else {
      missingFields.push('materialCost');
    }

    // 2. Labor cost (either explicit or hourlyRate * laborHours)
    let laborCost = 0;
    if (typeof input.laborCost === 'number' && input.laborCost >= 0) {
      laborCost = Math.round(input.laborCost * 100) / 100;
      knownValues.laborCost = laborCost;
    } else if (
      typeof input.hourlyRate === 'number' && input.hourlyRate > 0 &&
      typeof input.laborHours === 'number' && input.laborHours > 0
    ) {
      laborCost = Math.round(input.hourlyRate * input.laborHours * 100) / 100;
      knownValues.laborCost = laborCost;
      knownValues.hourlyRate = input.hourlyRate;
      knownValues.laborHours = input.laborHours;
    } else {
      missingFields.push('laborCost');
    }

    // 3. Packaging cost
    let packagingCost = 0;
    if (typeof input.packagingCost === 'number' && input.packagingCost >= 0) {
      packagingCost = Math.round(input.packagingCost * 100) / 100;
      knownValues.packagingCost = packagingCost;
    } else {
      packagingCost = 20; // Default assumption for artisan packaging
      assumedValues.packagingCost = packagingCost;
    }

    // 4. Transport cost
    let transportCost = 0;
    if (typeof input.transportCost === 'number' && input.transportCost >= 0) {
      transportCost = Math.round(input.transportCost * 100) / 100;
      knownValues.transportCost = transportCost;
    } else {
      transportCost = 30; // Default assumption for local logistics
      assumedValues.transportCost = transportCost;
    }

    // 5. Overhead cost (utilities, tools, workspace)
    let overheadCost = 0;
    if (typeof input.overheadCost === 'number' && input.overheadCost >= 0) {
      overheadCost = Math.round(input.overheadCost * 100) / 100;
      knownValues.overheadCost = overheadCost;
    } else {
      overheadCost = 15; // Modest standard artisan overhead
      assumedValues.overheadCost = overheadCost;
    }

    // 6. Direct Costs Sum
    const totalDirectCost = Math.round((materialCost + laborCost + packagingCost + transportCost + overheadCost) * 100) / 100;

    // 7. Margin
    let marginPercentage = 30; // Default healthy artisan gross margin: 30%
    if (typeof input.desiredMarginPercent === 'number' && input.desiredMarginPercent > 0 && input.desiredMarginPercent < 90) {
      marginPercentage = input.desiredMarginPercent;
      knownValues.marginPercentage = marginPercentage;
    } else {
      assumedValues.marginPercentage = marginPercentage;
    }

    // Direct / Fair Retail Price = Direct Costs / (1 - Margin)
    const marginFactor = 1 - (marginPercentage / 100);
    const fairRetailPrice = marginFactor > 0 ? Math.round((totalDirectCost / marginFactor) * 100) / 100 : totalDirectCost * 1.5;

    // 8. Platform Fee (e.g., 15% marketplace commission on Amazon/Flipkart/Meesho)
    let platformFeePercentage = 15;
    if (typeof input.platformFeePercent === 'number' && input.platformFeePercent >= 0 && input.platformFeePercent < 50) {
      platformFeePercentage = input.platformFeePercent;
      knownValues.platformFeePercentage = platformFeePercentage;
    } else {
      assumedValues.platformFeePercentage = platformFeePercentage;
    }

    const platformFeeFactor = 1 - (platformFeePercentage / 100);
    const marketplacePrice = platformFeeFactor > 0 ? Math.round((fairRetailPrice / platformFeeFactor) * 100) / 100 : fairRetailPrice * 1.2;

    // 9. Wholesale Price (standard 15-20% above direct costs for bulk quantities)
    const wholesalePrice = Math.round(totalDirectCost * 1.2 * 100) / 100;

    const isComplete = missingFields.length === 0;

    return {
      isComplete,
      knownValues,
      assumedValues,
      missingFields,
      totalDirectCost,
      materialCost,
      laborCost,
      packagingCost,
      transportCost,
      overheadCost,
      marginPercentage,
      fairRetailPrice,
      platformFeePercentage,
      marketplacePrice,
      wholesalePrice,
      currency: 'INR',
    };
  }

  /**
   * Deterministic calculation with optional AI vernacular explanation
   */
  public static async calculateWithExplanation(
    input: PricingInput,
    context?: {
      productName?: string;
      category?: string;
      language?: LanguageCode | string;
      artisanName?: string;
    }
  ): Promise<PricingCalculationResult> {
    const breakdown = this.calculate(input);

    let aiExplanation: PricingCalculationResult['aiExplanation'] | undefined = undefined;

    // Only invoke AI if API key is available and direct costs exist
    if (geminiService.isAvailable() && breakdown.totalDirectCost > 0) {
      try {
        const reqContext: AIRequestContext = {
          task: 'PRICING_EXPLANATION',
          language: context?.language || 'en',
          parameters: { pricingBreakdown: breakdown },
          productContext: {
            name: context?.productName,
            category: context?.category,
          },
        };

        const { systemInstruction, userPrompt } = PromptRegistry.buildPricingExplanationPrompt(reqContext);

        const raw = await geminiService.generateContent({
          systemInstruction,
          userPrompt,
          responseMimeType: 'application/json',
          temperature: 0.3,
        });

        const parsed = JSON.parse(raw);
        aiExplanation = {
          explanation: parsed.explanation || 'Pricing calculated deterministically based on direct artisan costs and fair profit margins.',
          marginAdvice: parsed.marginAdvice || 'A healthy margin ensures fair wages and sustainable craft production.',
          marketplaceTip: parsed.marketplaceTip || 'Factor in platform fees so your take-home price remains protected.',
          wholesaleGuidance: parsed.wholesaleGuidance || 'For bulk orders, offer wholesale pricing while keeping minimum order quantities in mind.',
        };
      } catch (err: any) {
        console.warn('[PricingEngine] AI explanation failed, returning deterministic breakdown alone:', err.message || err);
      }
    }

    return {
      breakdown,
      aiExplanation,
    };
  }
}
