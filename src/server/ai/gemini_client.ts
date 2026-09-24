import { GoogleGenAI } from '@google/genai';

export interface GenerateGeminiOptions {
  model?: string;
  systemInstruction?: string;
  userPrompt: string;
  inlineMedia?: Array<{
    mimeType: string;
    data: string; // clean base64 data without data: prefix
  }>;
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
  maxRetries?: number;
}

export class GeminiService {
  private client: GoogleGenAI | null = null;
  public static readonly DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  public static readonly FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];

  private getClient(): GoogleGenAI | null {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (apiKey && apiKey.trim()) {
        this.client = new GoogleGenAI({
          apiKey: apiKey.trim(),
          httpOptions: {
            headers: {
              'User-Agent': 'krivio-ai-backend',
            },
          },
        });
      }
    }
    return this.client;
  }

  public isAvailable(): boolean {
    return Boolean(this.getClient());
  }

  /**
   * Health diagnostic check
   */
  public async checkHealth(): Promise<{ healthy: boolean; model: string; message: string }> {
    const client = this.getClient();
    if (!client) {
      return {
        healthy: false,
        model: GeminiService.DEFAULT_MODEL,
        message: 'GEMINI_API_KEY is not configured on the server.',
      };
    }

    try {
      const response = await client.models.generateContent({
        model: GeminiService.DEFAULT_MODEL,
        contents: 'Respond with the word OK.',
      });
      const text = response.text || '';
      return {
        healthy: true,
        model: GeminiService.DEFAULT_MODEL,
        message: text.trim().slice(0, 100),
      };
    } catch (err: any) {
      return {
        healthy: false,
        model: GeminiService.DEFAULT_MODEL,
        message: err.message || String(err),
      };
    }
  }

  /**
   * Core generation call with structured JSON, multimodal handling, and bounded transient retry
   */
  public async generateContent(options: GenerateGeminiOptions): Promise<string> {
    const client = this.getClient();
    if (!client) {
      throw new Error('GEMINI_API_KEY is not configured on the server. AI features cannot proceed without valid credentials.');
    }

    const primaryModel = options.model || GeminiService.DEFAULT_MODEL;
    const modelsToTry = [primaryModel, ...GeminiService.FALLBACK_MODELS.filter(m => m !== primaryModel)];
    const maxRetries = options.maxRetries ?? 2;

    // Prepare contents
    const contents: any[] = [];

    // Add inline media (images or audio) if present
    if (options.inlineMedia && options.inlineMedia.length > 0) {
      for (const media of options.inlineMedia) {
        // Strip data: prefix if accidentally passed
        const cleanBase64 = media.data.replace(/^data:[^;]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: media.mimeType,
            data: cleanBase64,
          },
        });
      }
    }

    // Add user text prompt
    contents.push({
      text: options.userPrompt,
    });

    const config: any = {};
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (typeof options.temperature === 'number') {
      config.temperature = options.temperature;
    }
    if (options.responseMimeType) {
      config.responseMimeType = options.responseMimeType;
    }

    let lastError: any = null;

    for (const currentModel of modelsToTry) {
      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          const response = await client.models.generateContent({
            model: currentModel,
            contents,
            config: Object.keys(config).length > 0 ? config : undefined,
          });

          const textResult = response.text;
          if (textResult !== undefined && textResult !== null) {
            return textResult;
          }

          // Check parts
          const parts = response.candidates?.[0]?.content?.parts;
          if (parts && parts.length > 0 && parts[0].text) {
            return parts[0].text;
          }

          throw new Error('Gemini returned an empty candidate or text response.');
        } catch (err: any) {
          lastError = err;
          attempt++;

          const isDailyQuotaExhausted =
            err.message &&
            (err.message.includes('PerDay') ||
              err.message.includes('daily') ||
              err.message.includes('GenerateRequestsPerDay'));

          const isTransient =
            !isDailyQuotaExhausted &&
            (err.status === 429 ||
              err.status === 503 ||
              err.status === 500 ||
              err.status === 'UNAVAILABLE' ||
              err.status === 'RESOURCE_EXHAUSTED' ||
              (err.message && (err.message.includes('ResourceExhausted') || err.message.includes('overloaded') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE') || err.message.includes('EAI_AGAIN'))));

          // If current model is overloaded with 503/UNAVAILABLE and we have alternate models, break early to fail over
          const hasAlternateModel = modelsToTry.some(m => m !== currentModel);
          if ((err.status === 503 || err.status === 'UNAVAILABLE' || (err.message && err.message.includes('high demand'))) && hasAlternateModel) {
            console.warn(`[GeminiClient] Fast failover from ${currentModel} to alternate model due to demand spike.`);
            break;
          }

          if (isTransient && attempt <= (options.maxRetries ?? 2)) {
            let delayMs = Math.min(Math.pow(2, attempt) * 1000, 4000);
            if (err.status === 429 || (err.message && err.message.includes('quota'))) {
              let parsedSeconds = 0;
              const match = typeof err.message === 'string' ? err.message.match(/retry in ([0-9.]+)s/i) : null;
              if (match && match[1]) {
                parsedSeconds = Math.ceil(parseFloat(match[1]));
              }
              delayMs = Math.min(Math.max(delayMs, (parsedSeconds > 0 ? (parsedSeconds + 1) * 1000 : 3000)), 6000);
            }
            console.warn(`[GeminiClient] Transient error on model ${currentModel} attempt ${attempt}/${maxRetries}. Retrying in ${delayMs}ms:`, err.message || err);
            await new Promise(r => setTimeout(r, delayMs));
          } else {
            if (isDailyQuotaExhausted) {
              console.warn(`[GeminiClient] Daily quota limit reached (${currentModel}). Halting immediate retries.`);
            }
            break;
          }
        }
      }

      // If we encountered an error and have an alternate model in modelsToTry, attempt the next model
      const shouldTryNextModel =
        lastError &&
        (lastError.status === 429 ||
          lastError.status === 503 ||
          lastError.status === 'UNAVAILABLE' ||
          lastError.status === 'RESOURCE_EXHAUSTED' ||
          (typeof lastError.message === 'string' &&
            (lastError.message.includes('503') ||
              lastError.message.includes('UNAVAILABLE') ||
              lastError.message.includes('high demand') ||
              lastError.message.includes('ResourceExhausted'))));

      if (shouldTryNextModel) {
        console.warn(`[GeminiClient] Model ${currentModel} failed with ${lastError.status || 'transient error'}. Checking alternate model...`);
        continue;
      }
      break;
    }

    console.error(`[GeminiClient] Exhausted all model attempts:`, lastError?.message || lastError);
    throw lastError;
  }
}

export const geminiService = new GeminiService();
