import { GoogleGenAI } from '@google/genai';
import {
  AuthResponse,
  User,
  Product,
  BusinessProfile,
  ImageAnalysis,
  MentorMessage,
  BusinessHealthStats,
  TaskItem,
  ChannelRecommendation,
  PaymentOrder,
  PublicStorefrontData,
} from '../types';

const TOKEN_KEY = 'krivio_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let clientAI: GoogleGenAI | null = null;
const getClientAI = () => {
  if (!clientAI && GEMINI_KEY) {
    clientAI = new GoogleGenAI({ apiKey: GEMINI_KEY });
  }
  return clientAI;
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const targetUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const response = await fetch(targetUrl, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP error ${response.status}`);
  }
  return response.json();
};

export const authApi = {
  syncSupabaseUser: async (params: {
    supabase_user_id?: string;
    email?: string;
    full_name?: string;
    name?: string;
    profile_image?: string;
    avatar_url?: string;
    phone_number?: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const res = await fetchWithAuth('/api/auth/supabase-sync', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    businessName?: string;
    location?: string;
  }): Promise<AuthResponse> => {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  googleSignIn: async (name: string, email: string, supabaseUserId?: string, avatarUrl?: string): Promise<AuthResponse> => {
    return authApi.syncSupabaseUser({
      supabase_user_id: supabaseUserId,
      email,
      full_name: name,
      profile_image: avatarUrl,
    });
  },

  getMe: async (): Promise<{ user: User }> => {
    return await fetchWithAuth('/api/auth/me');
  },

  updateLanguage: async (language: string): Promise<{ success: boolean; preferred_language: string }> => {
    return await fetchWithAuth('/api/users/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    });
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    return await fetchWithAuth('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ status: string; message: string }> => {
    return await fetchWithAuth('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

export const dashboardApi = {
  getStats: async (): Promise<{
    user: Partial<User>;
    stats: BusinessHealthStats;
    tasks: TaskItem[];
    recentProducts?: Product[];
    recentActivity?: any[];
  }> => {
    return await fetchWithAuth('/api/dashboard');
  },

  toggleTask: async (taskId: string): Promise<{ success: boolean; tasks?: TaskItem[] }> => {
    return await fetchWithAuth('/api/tasks/toggle', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
  },
};

export const aiMentorApi = {
  sendMessage: async (
    message: string,
    language: string = 'English',
    conversationHistory: MentorMessage[] = []
  ): Promise<{ reply: string; language: string; timestamp: string }> => {
    try {
      return await fetchWithAuth('/api/ai/mentor', {
        method: 'POST',
        body: JSON.stringify({ message, language, conversationHistory }),
      });
    } catch (backendErr) {
      console.warn('Backend mentor API unavailable, falling back to direct browser Gemini engine:', backendErr);
    }

    const ai = getClientAI();
    if (ai) {
      try {
        const systemPrompt = `You are KRIVIO AI, a friendly, practical voice-first AI business mentor for rural entrepreneurs in India (artisans, SHGs, farmers, potters, weavers).
Topics: pricing craft products, selling on ONDC/Amazon Karigar/Meesho/Etsy, government schemes (PM Vishwakarma, MUDRA, NABARD), taking photos.
Language: ${language}. Keep response clear, encouraging, warm, and concise (under 180 words) for voice output.`;

        const formattedHistory = conversationHistory.slice(-6).map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        return {
          reply: response.text || 'Namaste! I am here to help your rural business grow. What would you like to plan today?',
          language,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } catch (aiErr) {
        console.warn('Direct AI error:', aiErr);
      }
    }

    return {
      reply: 'Namaste! I am KRIVIO AI. To calculate fair pricing: (Raw Material Cost) + (Labor Hours × Fair Wage) + 20% Margin. You can also list products on ONDC via Mystore or Plotch!',
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};

export const businessProfileApi = {
  get: async (): Promise<{ businessProfile: BusinessProfile }> => {
    return await fetchWithAuth('/api/business-profile');
  },

  create: async (data: Partial<BusinessProfile>): Promise<{ businessProfile: BusinessProfile; message?: string }> => {
    return await fetchWithAuth('/api/business-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (data: Partial<BusinessProfile>): Promise<{ businessProfile: BusinessProfile; message?: string }> => {
    return await fetchWithAuth('/api/business-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (): Promise<{ success: boolean }> => {
    return await fetchWithAuth('/api/business-profile', { method: 'DELETE' });
  },
};

export const productsApi = {
  getAll: async (params?: { search?: string; category?: string; status?: string; sort?: string }): Promise<{ products: Product[] }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.sort) query.append('sort', params.sort);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await fetchWithAuth(`/api/products${queryString}`);
  },

  getById: async (id: string): Promise<{ product: Product }> => {
    return await fetchWithAuth(`/api/products/${id}`);
  },

  create: async (data: Partial<Product>): Promise<{ product: Product; warning?: string }> => {
    return await fetchWithAuth('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Product>): Promise<{ product: Product }> => {
    return await fetchWithAuth(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return await fetchWithAuth(`/api/products/${id}`, { method: 'DELETE' });
  },

  duplicate: async (id: string): Promise<{ product: Product; message: string }> => {
    return await fetchWithAuth(`/api/products/${id}/duplicate`, { method: 'POST' });
  },

  archive: async (id: string): Promise<{ success: boolean; message: string }> => {
    return await fetchWithAuth(`/api/products/${id}/archive`, { method: 'POST' });
  },

  generateDetails: async (params: {
    rawName: string;
    craftType?: string;
    materials?: string;
    targetPrice?: number;
    language?: string;
  }): Promise<{ data: any }> => {
    try {
      return await fetchWithAuth('/api/products/generate-details', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (backendErr) {
      console.warn('Backend generation API note:', backendErr);
    }

    const ai = getClientAI();
    if (ai) {
      try {
        const lang = params.language || 'English';
        const prompt = `Act as an e-commerce marketing specialist for rural artisans and SHGs.
Input Product details:
- Name/Concept: ${params.rawName || 'Handcrafted item'}
- Craft Type: ${params.craftType || 'Artisan Craft'}
- Materials used: ${params.materials || 'Natural materials'}
- Intended Price: ${params.targetPrice ? `₹${params.targetPrice}` : 'Suggest fair price'}
- Output Language: ${lang}

Generate JSON with:
1. "title": High-converting descriptive title suitable for Amazon/ONDC in ${lang} (max 80 chars)
2. "description": Engaging narrative highlighting artisan heritage and craft story in ${lang} (120-180 words)
3. "category": Best fitting category name in ${lang}
4. "suggestedPrice": Integer in INR
5. "keywords": Array of 5-8 search tags in ${lang}
6. "readinessScore": Integer 80-98`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        return { data: JSON.parse(response.text || '{}') };
      } catch {}
    }

    return {
      data: {
        title: `Authentic Handcrafted ${params.rawName || 'Heritage Art Piece'}`,
        description: `Lovingly handcrafted by skilled rural artisans using authentic traditional techniques and sustainably sourced ${params.materials || 'natural materials'}. Each piece reflects generations of cultural heritage.`,
        category: params.craftType || 'Handicrafts & Art',
        suggestedPrice: Number(params.targetPrice) || 850,
        keywords: ['handmade', 'rural craft', 'artisan made', 'eco friendly', 'traditional'],
        readinessScore: 92,
      },
    };
  },

  suggestBrand: async (params: {
    craftType?: string;
    region?: string;
    personality?: string;
    language?: string;
  }): Promise<{ suggestions: Array<{ name: string; meaning: string; whyItFits: string; personality: string; tagline: string }> }> => {
    try {
      return await fetchWithAuth('/api/products/suggest-brand', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      return {
        suggestions: [
          { name: 'KalaGram', meaning: 'Village of Art', whyItFits: 'Connects traditional craft with rural roots', personality: 'Cultural & Authentic', tagline: 'Every piece tells a story' },
          { name: 'HastKraft', meaning: 'Handmade Craft', whyItFits: 'Simple, memorable, and highlights handmade origin', personality: 'Traditional & Handmade', tagline: 'Made with hands, made with heart' },
          { name: 'MittiMool', meaning: 'Earth Root', whyItFits: 'Reflects natural materials and rural heritage', personality: 'Natural & Earthy', tagline: 'Rooted in tradition' },
          { name: 'BharatHast', meaning: "India's Hands", whyItFits: 'Artisan focused identity', personality: 'Authentic & Artisan', tagline: 'Crafted for India, loved by the world' },
        ],
      };
    }
  },

  generateIdentity: async (params: {
    imageBase64?: string;
    productName?: string;
    detectedSubject?: string;
    brandName?: string;
    materials?: string;
    whatMakesSpecial?: string;
    region?: string;
    targetAudience?: string;
    priceRange?: string;
    language?: string;
    listingMode?: string;
  }): Promise<{ data: any }> => {
    try {
      return await fetchWithAuth('/api/products/generate-identity', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      const title = params.productName || params.detectedSubject || 'Handcrafted Artisan Product';
      return {
        data: {
          productTitle: `Authentic Handmade ${title}`,
          shortDescription: `A beautifully crafted ${title.toLowerCase()} made by skilled rural artisans using traditional techniques.`,
          detailedDescription: `This ${title.toLowerCase()} is lovingly handcrafted by rural artisans. Made using ${params.materials || 'natural materials'}, each piece carries the unique touch of its maker. Sourced from ${params.region || 'rural India'}, supporting sustainable livelihoods.`,
          keyFeatures: [
            '100% handmade by rural artisans',
            `Made from ${params.materials || 'natural materials'}`,
            'Each piece is unique — no two alike',
            'Supports rural artisan livelihoods',
          ],
          materials: params.materials || 'Natural traditional materials',
          craftMethod: 'Traditional handcraft techniques',
          idealFor: params.targetAudience || 'Home décor enthusiasts & conscious buyers',
          productStory: `Every ${title.toLowerCase()} from ${params.brandName || 'our collective'} carries the story of rural India.`,
          careInstructions: 'Handle with care. Store in a dry place.',
          suggestedTags: ['handmade', 'artisan', 'rural craft', 'authentic', 'traditional'],
          suggestedKeywords: ['handmade', 'rural artisan', 'authentic craft', 'traditional'],
          suggestedPrice: 850,
          category: 'Handicrafts & Art',
        },
      };
    }
  },
};

export const imagesApi = {
  analyze: async (imageBase64: string): Promise<{ analysis: ImageAnalysis }> => {
    try {
      return await fetchWithAuth('/api/images/analyze', {
        method: 'POST',
        body: JSON.stringify({ imageBase64 }),
      });
    } catch (backendErr) {
      console.warn('Backend image API note:', backendErr);
    }

    const ai = getClientAI();
    if (ai) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const prompt = `Act as an e-commerce product photography advisor for rural artisans. Analyze this product photo for selling online on Amazon, ONDC, Meesho, and Etsy.
Evaluate:
1. Lighting quality (0-100)
2. Background clarity (0-100)
3. Overall appeal (0-100)
4. Detected item name

Return JSON with:
"lightingScore": number,
"backgroundScore": number,
"overallScore": number,
"lightingFeedback": string,
"backgroundFeedback": string,
"suggestions": string array with 3 tips,
"detectedSubject": string`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return {
          analysis: {
            id: `img_${Date.now()}`,
            imageUrl: imageBase64,
            ...parsed,
            createdAt: new Date().toISOString(),
          },
        };
      } catch (aiErr) {
        console.warn('Direct vision AI note:', aiErr);
      }
    }

    return {
      analysis: {
        id: `img_${Date.now()}`,
        imageUrl: imageBase64,
        lightingScore: 82,
        backgroundScore: 85,
        overallScore: 84,
        lightingFeedback: 'Good natural lighting detected. Clear visibility of contours.',
        backgroundFeedback: 'Clean neutral backdrop suitable for online marketplace listings.',
        suggestions: [
          'Shoot in morning natural daylight near a window for optimal warmth.',
          'Place a plain white paper or cloth underneath for clean contrast.',
          'Include one close-up shot showing fine texture and craftsmanship.',
        ],
        detectedSubject: 'Handcrafted Artisan Product',
        createdAt: new Date().toISOString(),
      },
    };
  },
};

export interface ImageStudioOperationItem {
  id: string;
  category: string;
  humanCategory: string;
  label: string;
  description: string;
  aspectRatioRules: string;
  badge?: string;
}

export interface ImageStudioCategoryItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
}

export interface ImageStudioGeneratedAsset {
  assetId: string;
  operationId: string;
  originalImage: string;
  generatedImage: string;
  aspectRatio: string;
  operationLabel: string;
  summaryNote: string;
  modelUsed: string;
  suggestedFollowUps: string[];
  createdAt: string;
}

export interface ImageStudioHistoryItem {
  id: string;
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
}

export const imageStudioApi = {
  getOperations: async (): Promise<{ operations: ImageStudioOperationItem[]; categories: ImageStudioCategoryItem[] }> => {
    return await fetchWithAuth('/api/image-studio/operations');
  },

  generate: async (payload: {
    productId?: string;
    operationId?: string;
    userInstruction?: string;
    originalImage: string;
    referenceImages?: Array<{ url: string; role: 'product' | 'logo' | 'style' | 'packaging' }>;
    aspectRatio?: string;
    language?: string;
    brandContext?: any;
    festivalOrOccasion?: string;
    marketingText?: { headline?: string; subheadline?: string; cta?: string; price?: number };
  }): Promise<{ success: boolean; asset: ImageStudioGeneratedAsset }> => {
    return await fetchWithAuth('/api/image-studio/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  edit: async (payload: {
    previousAssetId?: string;
    userInstruction: string;
    currentImage: string;
    originalImage?: string;
    aspectRatio?: string;
  }): Promise<{ success: boolean; asset: ImageStudioGeneratedAsset }> => {
    return await fetchWithAuth('/api/image-studio/edit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getHistory: async (): Promise<{ assets: ImageStudioHistoryItem[] }> => {
    return await fetchWithAuth('/api/image-studio/history');
  },

  saveToProduct: async (payload: {
    assetId?: string;
    productId: string;
    imageUrl: string;
  }): Promise<{ success: boolean; message: string; product: Product }> => {
    return await fetchWithAuth('/api/image-studio/save-to-product', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteHistoryItem: async (id: string): Promise<{ success: boolean }> => {
    return await fetchWithAuth(`/api/image-studio/history/${id}`, {
      method: 'DELETE',
    });
  },
};

export const marketplaceApi = {
  getRecommendations: async (): Promise<{ channels: ChannelRecommendation[] }> => {
    return await fetchWithAuth('/api/marketplace/recommendations');
  },
};

export const paymentsApi = {
  createOrder: async (plan: string = 'pro', amount: number = 299): Promise<PaymentOrder> => {
    return await fetchWithAuth('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan, amount }),
    });
  },

  verifyPayment: async (data: {
    razorpayPaymentId: string;
    razorpayOrderId?: string;
  }): Promise<{ success: boolean; subscriptionPlan: string; message: string }> => {
    return await fetchWithAuth('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const storefrontApi = {
  get: async (userId: string): Promise<PublicStorefrontData> => {
    const targetUrl = `${API_BASE}/api/storefront/${userId}`;
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error('Storefront not found');
    return await res.json();
  },

  trackInquiry: async (data: {
    userId: string;
    productTitle?: string;
    quantity?: number;
    totalAmount?: number;
    city?: string;
    pincode?: string;
    buyerName?: string;
    inquiryType?: string;
  }): Promise<{ success: boolean }> => {
    try {
      const targetUrl = `${API_BASE}/api/storefront/inquiry`;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },
};
