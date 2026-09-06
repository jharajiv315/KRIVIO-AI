import { DomainValidator } from './domain_validators';
import { geminiService } from './gemini_client';
import { aiObservability } from './observability';
import { PromptRegistry } from './prompt_registry';
import {
  AIRequestContext,
  BrandSuggestionResponse,
  MentorResponse,
  PhotoDiagnosisResponse,
  ProductAnalysisResponse,
  ProductIdentityResponse,
} from './types';

export class AITaskRouter {
  /**
   * Main entry point to route AI requests safely and context-aware
   */
  public static async handle(req: AIRequestContext): Promise<any> {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const startTime = Date.now();
    const task = req.task;
    const model = GeminiService_Model;

    aiObservability.logStart(requestId, task, model, req.userContext?.userId, req.productContext?.id);

    try {
      let result: any;

      switch (task) {
        case 'MENTOR':
          result = await this.handleMentor(req);
          break;
        case 'PRODUCT_ANALYSIS':
          result = await this.handleProductAnalysis(req);
          break;
        case 'PHOTO_DIAGNOSIS':
          result = await this.handlePhotoDiagnosis(req);
          break;
        case 'BRAND_SUGGESTION':
          result = await this.handleBrandSuggestion(req);
          break;
        case 'PRODUCT_IDENTITY':
          result = await this.handleProductIdentity(req);
          break;
        default:
          throw new Error(`Unsupported AI task: ${task}`);
      }

      const durationMs = Date.now() - startTime;
      aiObservability.recordTelemetry({
        requestId,
        timestamp: new Date().toISOString(),
        task,
        model,
        userId: req.userContext?.userId,
        productId: req.productContext?.id,
        durationMs,
        success: true,
        fallbackUsed: false,
      });

      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      aiObservability.recordTelemetry({
        requestId,
        timestamp: new Date().toISOString(),
        task,
        model,
        userId: req.userContext?.userId,
        productId: req.productContext?.id,
        durationMs,
        success: false,
        fallbackUsed: false,
        error: err.message || String(err),
      });

      console.error(`[AITaskRouter] Error handling ${task}:`, err);
      // Re-throw genuine error to prevent fake fallback
      throw err;
    }
  }

  /**
   * Handle MENTOR task
   */
  private static async handleMentor(req: AIRequestContext): Promise<MentorResponse> {
    const { systemInstruction, userPrompt } = PromptRegistry.buildMentorPrompt(req);

    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      responseMimeType: 'application/json',
      temperature: 0.7,
    });

    try {
      const parsed = JSON.parse(raw);
      return {
        response: parsed.response || raw,
        intent: parsed.intent || 'GENERAL_ADVICE',
        entities: parsed.entities || {},
        recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
        suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
        language: parsed.language || (req.language as string) || 'en',
      };
    } catch (parseErr) {
      // If output was plain text rather than JSON, wrap it cleanly
      return {
        response: raw.trim(),
        intent: 'GENERAL_ADVICE',
        entities: {},
        recommendedActions: [],
        suggestedFollowUps: [],
        language: (req.language as string) || 'en',
      };
    }
  }

  /**
   * Handle PRODUCT_ANALYSIS multimodal vision task
   */
  private static async handleProductAnalysis(req: AIRequestContext): Promise<ProductAnalysisResponse> {
    if (!req.imageInput || !req.imageInput.base64Data) {
      throw new Error('An image payload is required for product analysis inspection.');
    }

    const { systemInstruction, userPrompt } = PromptRegistry.buildProductAnalysisPrompt(req);

    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      inlineMedia: [
        {
          mimeType: req.imageInput.mimeType || 'image/jpeg',
          data: req.imageInput.base64Data,
        },
      ],
      responseMimeType: 'application/json',
      temperature: 0.2, // Low temperature for factual precision
    });

    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validateProductAnalysis(parsed);

    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Product analysis failed domain validation: ${validation.error}`);
    }

    return validation.sanitized;
  }

  /**
   * Handle PHOTO_DIAGNOSIS task
   */
  private static async handlePhotoDiagnosis(req: AIRequestContext): Promise<PhotoDiagnosisResponse> {
    if (!req.imageInput || !req.imageInput.base64Data) {
      throw new Error('An image payload is required for photo diagnosis.');
    }

    const { systemInstruction, userPrompt } = PromptRegistry.buildPhotoDiagnosisPrompt(req);

    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      inlineMedia: [
        {
          mimeType: req.imageInput.mimeType || 'image/jpeg',
          data: req.imageInput.base64Data,
        },
      ],
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validatePhotoDiagnosis(parsed);

    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Photo diagnosis failed domain validation: ${validation.error}`);
    }

    return validation.sanitized;
  }

  /**
   * Handle BRAND_SUGGESTION task
   */
  private static async handleBrandSuggestion(req: AIRequestContext): Promise<BrandSuggestionResponse> {
    const { systemInstruction, userPrompt } = PromptRegistry.buildBrandSuggestionPrompt(req);

    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      responseMimeType: 'application/json',
      temperature: 0.7,
    });

    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validateBrandSuggestions(parsed);

    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Brand suggestion failed domain validation: ${validation.error}`);
    }

    return validation.sanitized;
  }

  /**
   * Handle PRODUCT_IDENTITY task
   */
  private static async handleProductIdentity(req: AIRequestContext): Promise<ProductIdentityResponse> {
    const { systemInstruction, userPrompt } = PromptRegistry.buildProductIdentityPrompt(req);

    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      responseMimeType: 'application/json',
      temperature: 0.4,
    });

    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validateProductIdentity(parsed);

    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Product identity failed domain validation: ${validation.error}`);
    }

    return validation.sanitized;
  }
}

const GeminiService_Model = 'gemini-3.6-flash';
