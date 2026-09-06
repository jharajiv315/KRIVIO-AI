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
  public static readonly DEFAULT_MODEL = 'gemini-3.6-flash';

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

    const modelName = options.model || GeminiService.DEFAULT_MODEL;
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

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
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

        const isTransient =
          err.status === 429 ||
          err.status === 503 ||
          err.status === 500 ||
          (err.message && (err.message.includes('ResourceExhausted') || err.message.includes('overloaded') || err.message.includes('EAI_AGAIN')));

        if (isTransient && attempt <= maxRetries) {
          const delayMs = Math.pow(2, attempt) * 600;
          console.warn(`[GeminiClient] Transient error on attempt ${attempt}/${maxRetries}. Retrying in ${delayMs}ms:`, err.message || err);
          await new Promise(r => setTimeout(r, delayMs));
        } else {
          break;
        }
      }
    }

    console.error(`[GeminiClient] Exhausted attempts for model ${modelName}:`, lastError?.message || lastError);
    throw lastError;
  }
}

export const geminiService = new GeminiService();
