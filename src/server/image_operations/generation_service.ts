import { GoogleGenAI } from '@google/genai';
import { GenerateImageRequest, GenerateImageResponse } from './types';
import { IMAGE_OPERATIONS } from './registry';
import { classifyUserIntent } from './classifier';
import { buildPrompt } from './prompt_builder';
import { ModelRouter } from './model_router';

export class GenerationService {
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'krivio-image-studio',
          },
        },
      });
    }
  }

  /**
   * Main image generation execution method
   */
  public async generate(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!request.originalImage) {
      throw new Error('An original product image is required for enhancement.');
    }

    // 1. Resolve Operation & Intent
    const classification = classifyUserIntent(
      request.userInstruction,
      request.operationId,
      request.festivalOrOccasion,
      request.aspectRatio
    );

    const operation = IMAGE_OPERATIONS[classification.operationId] || IMAGE_OPERATIONS['CLEAN_STUDIO'];
    const targetAspectRatio = classification.aspectRatio;

    // 2. Build Composed Prompt
    const { fullPrompt, summaryNote } = buildPrompt(operation, request);

    // 3. Resolve Model Route
    const route = ModelRouter.resolve(operation.modelPreference);
    const modelUsed = route.primaryModel;

    // 4. Perform Image Generation / Transformation
    let generatedImage = '';

    if (this.aiClient) {
      try {
        // Clean base64 data
        const cleanBase64 = request.originalImage.replace(/^data:image\/\w+;base64,/, '');

        // Attempt generation using Gemini multimodal image editing / generation
        const contentsParts: any[] = [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: fullPrompt,
          },
        ];

        // Add reference images if provided (e.g. logo or packaging)
        if (request.referenceImages && request.referenceImages.length > 0) {
          for (const ref of request.referenceImages) {
            const refBase64 = ref.url.replace(/^data:image\/\w+;base64,/, '');
            contentsParts.push({
              inlineData: {
                mimeType: 'image/png',
                data: refBase64,
              },
            });
            contentsParts.push({
              text: `REFERENCE ASSET [ROLE: ${ref.role.toUpperCase()}]: Incorporate this asset faithfully according to its designated role without distorting colors or geometry.`,
            });
          }
        }

        // Call Gemini
        const response = await this.aiClient.models.generateContent({
          model: modelUsed,
          contents: contentsParts,
        });

        // Check if image part is returned in response
        const candidateParts = response.candidates?.[0]?.content?.parts || [];
        for (const part of candidateParts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            generatedImage = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }

        // If direct image bytes weren't returned by the text-multimodal response,
        // we check if Imagen API is supported or create an enhanced commercial canvas
        if (!generatedImage) {
          // Attempt generateImages if supported
          try {
            const imageGenRes = await (this.aiClient.models as any).generateImages?.({
              model: 'imagen-3.0-generate-002',
              prompt: fullPrompt,
              config: {
                numberOfImages: 1,
                aspectRatio: targetAspectRatio === '9:16' ? '9:16' : targetAspectRatio === '16:9' ? '16:9' : targetAspectRatio === '4:5' || targetAspectRatio === '3:4' ? '3:4' : '1:1',
              },
            });
            if (imageGenRes?.generatedImages?.[0]?.image?.imageBytes) {
              generatedImage = `data:image/jpeg;base64,${imageGenRes.generatedImages[0].image.imageBytes}`;
            }
          } catch (imagenErr) {
            console.warn('Imagen 3 fallback note:', (imagenErr as any)?.message || imagenErr);
          }
        }
      } catch (geminiError: any) {
        console.warn('Primary Gemini image model note:', geminiError?.message || geminiError);
      }
    }

    // 5. Explicit Error Handling on API Failure
    if (!generatedImage) {
      throw new Error('AI Image Generation could not process this request right now. Please verify your connection or try another prompt.');
    }

    // 6. Contextual Follow-Up Suggestions
    const suggestedFollowUps = this.generateFollowUpSuggestions(operation.category);

    const assetId = `ast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    return {
      assetId,
      operationId: operation.id,
      originalImage: request.originalImage,
      generatedImage,
      aspectRatio: targetAspectRatio,
      operationLabel: operation.label,
      summaryNote,
      modelUsed,
      suggestedFollowUps,
      createdAt: new Date().toISOString(),
    };
  }

  private generateFollowUpSuggestions(category: string): string[] {
    switch (category) {
      case 'photo_cleanup':
        return [
          'Make lighting slightly warmer',
          'Add subtle natural wooden surface',
          'Prepare for Amazon marketplace (pure white)',
          'Create an Instagram post version',
        ];
      case 'image_quality':
        return [
          'Enhance shadow detail further',
          'Add soft morning daylight warmth',
          'Create a 1:1 catalog square crop',
          'Switch to a lifestyle living room context',
        ];
      case 'lifestyle_context':
        return [
          'Try festive cultural celebration setting',
          'Move product slightly left for text space',
          'Switch to minimal boutique gallery pedestal',
          'Generate WhatsApp product card',
        ];
      case 'seasonal_cultural':
        return [
          'Add subtle Diwali marigold and diya glow',
          'Create an Instagram Story version (9:16)',
          'Add handmade gift wrapping presentation',
          'Make background slightly brighter',
        ];
      case 'branding':
        return [
          'Place logo in upper right corner',
          'Create an artisan thank-you card concept',
          'Create eco-packaging box mockup',
          'Apply natural earthy brand palette',
        ];
      default:
        return [
          'Make background cleaner',
          'Warm morning daylight',
          'Create festive version',
          'Format for Instagram',
        ];
    }
  }
}
