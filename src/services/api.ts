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
  MarketplaceDestination,
  DestinationMetadata,
  ValidationResult,
  ExportReport,
  Quotation,
  QuotationBuyerInput,
  QuotationItemInput,
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

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? (process.env as any || {}) : {});
const API_BASE = (env.VITE_API_URL || '').replace(/\/$/, '');

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
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.detail || errorData.message || errorMessage;
    } catch {
      try {
        const text = await response.text();
        if (text && text.trim().length > 0 && text.length < 250 && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
          errorMessage = text.trim();
        } else if (response.status === 504 || response.status === 408) {
          errorMessage = 'The server took too long to respond. Please try again with a compressed photo.';
        } else if (response.status === 413) {
          errorMessage = 'The photo payload is too large. Please select a smaller or compressed photo.';
        } else if (response.status >= 500) {
          errorMessage = 'The enhancement service is temporarily busy. Your photo is safe, please try again.';
        }
      } catch {}
    }
    throw new Error(errorMessage);
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
  ): Promise<{
    reply: string;
    language: string;
    timestamp: string;
    intent?: string;
    entities?: Record<string, any>;
    recommendedActions?: string[];
    suggestedFollowUps?: string[];
  }> => {
    return await fetchWithAuth('/api/ai/mentor', {
      method: 'POST',
      body: JSON.stringify({ message, language, conversationHistory }),
    });
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

const LOCAL_PRODUCTS_KEY = 'krivio_local_products_backup';

function getLocalStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoredProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Failed to persist products to local storage:', e);
  }
}

function upsertLocalStoredProduct(product: Product) {
  const prods = getLocalStoredProducts();
  const idx = prods.findIndex((p) => p.id === product.id);
  if (idx !== -1) {
    prods[idx] = product;
  } else {
    prods.unshift(product);
  }
  saveLocalStoredProducts(prods);
}

function removeLocalStoredProduct(id: string) {
  const prods = getLocalStoredProducts();
  saveLocalStoredProducts(prods.filter((p) => p.id !== id));
}

export const productsApi = {
  getAll: async (params?: { search?: string; category?: string; status?: string; sort?: string }): Promise<{ products: Product[] }> => {
    const localProducts = getLocalStoredProducts();
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category) query.append('category', params.category);
      if (params?.status) query.append('status', params.status);
      if (params?.sort) query.append('sort', params.sort);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetchWithAuth(`/api/products${queryString}`);
      const serverProducts: Product[] = res.products || [];

      // Merge server products and local pending items
      const serverIds = new Set(serverProducts.map((p) => p.id));
      const pendingLocal = localProducts.filter((p) => !serverIds.has(p.id));
      const merged = [...pendingLocal, ...serverProducts];
      saveLocalStoredProducts(merged);
      return { products: merged };
    } catch (err) {
      console.warn('Products API unreachable, returning local storage items:', err);
      let list = localProducts;
      if (params?.category && params.category !== 'all') {
        list = list.filter((p) => p.category?.toLowerCase().includes(params.category!.toLowerCase()));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
      }
      return { products: list };
    }
  },

  getById: async (id: string): Promise<{ product: Product }> => {
    try {
      const res = await fetchWithAuth(`/api/products/${id}`);
      if (res.product) {
        upsertLocalStoredProduct(res.product);
        return res;
      }
    } catch (err) {
      console.warn('Get product by ID server error, checking local store:', err);
    }
    const prods = getLocalStoredProducts();
    const found = prods.find((p) => p.id === id);
    if (found) return { product: found };
    throw new Error('Product not found in local or remote storage');
  },

  create: async (data: Partial<Product>): Promise<{ product: Product; warning?: string }> => {
    const now = new Date().toISOString();
    const fallbackId = 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const optimisticProduct: Product = {
      id: data.id || fallbackId,
      userId: 'local_artisan',
      title: data.title || 'Untitled Product',
      description: data.description || '',
      category: data.category || 'Handicrafts & Art',
      price: Number(data.price) || 0,
      currency: data.currency || 'INR',
      stock: Number(data.stock) || 1,
      sku: data.sku || `SKU-${Date.now().toString().slice(-5)}`,
      weight: data.weight || '0.5 kg',
      dimensions: data.dimensions || '10x10x10 cm',
      material: data.material || '',
      shortDescription: data.shortDescription || '',
      craftStory: data.craftStory || '',
      hsnCode: data.hsnCode || '',
      wholesalePrice: data.wholesalePrice,
      mrp: data.mrp,
      moq: data.moq || 1,
      leadTime: data.leadTime || '3-5 business days',
      brand: data.brand || '',
      color: data.color || '',
      originState: data.originState || 'India',
      status: data.status || 'published',
      keywords: data.keywords || [],
      imageUrls: data.imageUrls || [],
      isMarketplaceReady: data.isMarketplaceReady ?? true,
      readinessScore: data.readinessScore || 85,
      marketplaces: data.marketplaces || ['ONDC'],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await fetchWithAuth('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.product) {
        upsertLocalStoredProduct(res.product);
        return res;
      }
    } catch (err: any) {
      console.warn('Network/backend error on product creation, saving to local storage:', err);
      upsertLocalStoredProduct(optimisticProduct);
      return {
        product: optimisticProduct,
        warning: 'Saved locally on your device. Product will sync to cloud when connected.',
      };
    }

    upsertLocalStoredProduct(optimisticProduct);
    return { product: optimisticProduct };
  },

  update: async (id: string, data: Partial<Product>): Promise<{ product: Product }> => {
    try {
      const res = await fetchWithAuth(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res && res.product) {
        upsertLocalStoredProduct(res.product);
        return res;
      }
    } catch (err) {
      console.warn('Failed to update product on server, saving changes locally:', err);
    }
    const prods = getLocalStoredProducts();
    const idx = prods.findIndex((p) => p.id === id);
    if (idx !== -1) {
      prods[idx] = { ...prods[idx], ...data, updatedAt: new Date().toISOString() };
      saveLocalStoredProducts(prods);
      return { product: prods[idx] };
    }
    throw new Error('Product not found in local or server storage');
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    removeLocalStoredProduct(id);
    try {
      return await fetchWithAuth(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Server delete request failed, removed from local cache:', err);
      return { success: true };
    }
  },

  duplicate: async (id: string): Promise<{ product: Product; message: string }> => {
    try {
      const res = await fetchWithAuth(`/api/products/${id}/duplicate`, { method: 'POST' });
      if (res.product) upsertLocalStoredProduct(res.product);
      return res;
    } catch (err) {
      const prods = getLocalStoredProducts();
      const orig = prods.find((p) => p.id === id);
      if (orig) {
        const copy: Product = {
          ...orig,
          id: 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          title: `${orig.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        upsertLocalStoredProduct(copy);
        return { product: copy, message: 'Product duplicated locally' };
      }
      throw err;
    }
  },

  archive: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetchWithAuth(`/api/products/${id}/archive`, { method: 'POST' });
      const prods = getLocalStoredProducts();
      const idx = prods.findIndex((p) => p.id === id);
      if (idx !== -1) {
        prods[idx].status = 'archived';
        saveLocalStoredProducts(prods);
      }
      return res;
    } catch (err) {
      const prods = getLocalStoredProducts();
      const idx = prods.findIndex((p) => p.id === id);
      if (idx !== -1) {
        prods[idx].status = 'archived';
        saveLocalStoredProducts(prods);
        return { success: true, message: 'Product archived locally' };
      }
      throw err;
    }
  },

  generateDetails: async (params: {
    rawName: string;
    craftType?: string;
    materials?: string;
    targetPrice?: number;
    materialCost?: number;
    laborCost?: number;
    language?: string;
  }): Promise<{ data: any }> => {
    return await fetchWithAuth('/api/products/generate-details', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  suggestBrand: async (params: {
    craftType?: string;
    region?: string;
    personality?: string;
    language?: string;
    productName?: string;
  }): Promise<{ suggestions: Array<{ name: string; meaning: string; whyItFits?: string; culturalRelevance?: string; targetAppeal?: string; personality: string; tagline: string }> }> => {
    return await fetchWithAuth('/api/products/suggest-brand', {
      method: 'POST',
      body: JSON.stringify(params),
    });
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
    targetPrice?: number;
    materialCost?: number;
    laborCost?: number;
  }): Promise<{ data: any }> => {
    return await fetchWithAuth('/api/products/generate-identity', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

export const imagesApi = {
  analyze: async (imageBase64: string): Promise<{ analysis: ImageAnalysis }> => {
    return await fetchWithAuth('/api/images/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    });
  },
};

export const pricingApi = {
  calculate: async (params: {
    productId?: string;
    productName?: string;
    category?: string;
    materialCost?: number;
    laborCost?: number;
    laborHours?: number;
    hourlyRate?: number;
    packagingCost?: number;
    transportCost?: number;
    overheadCost?: number;
    desiredMarginPercent?: number;
    platformFeePercent?: number;
    language?: string;
  }): Promise<{
    breakdown: {
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
    };
    aiExplanation?: {
      explanation: string;
      marginAdvice: string;
      marketplaceTip: string;
      wholesaleGuidance: string;
    };
  }> => {
    return await fetchWithAuth('/api/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
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
    return await fetchWithAuth('/api/marketplace/recommendations').catch(() => ({ channels: [] }));
  },

  getDestinations: async (): Promise<{ destinations: DestinationMetadata[] }> => {
    return await fetchWithAuth('/api/marketplace/destinations');
  },

  checkReadiness: async (
    destination: MarketplaceDestination,
    productIds?: string[]
  ): Promise<{
    destination: MarketplaceDestination;
    totalProducts: number;
    readyProductsCount: number;
    unreadyProductsCount: number;
    results: { productId: string; productTitle: string; validation: ValidationResult }[];
  }> => {
    return await fetchWithAuth('/api/marketplace/readiness', {
      method: 'POST',
      body: JSON.stringify({ destination, productIds }),
    });
  },

  exportCatalog: async (
    destination: MarketplaceDestination,
    productIds?: string[],
    allowPartial: boolean = false
  ): Promise<{ success: boolean; filename: string; report?: ExportReport }> => {
    const token = getStoredToken();
    const targetUrl = `${API_BASE}/api/marketplace/export`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ destination, productIds, allowPartial }),
    });

    if (!res.ok) {
      let errText = 'Failed to generate export file';
      try {
        const json = await res.json();
        errText = json.error || errText;
      } catch {}
      throw new Error(errText);
    }

    // Extract filename from Content-Disposition header
    const disposition = res.headers.get('Content-Disposition') || '';
    let filename = `krivio_${destination}_export_${Date.now()}`;
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].trim();
    }

    // Extract report header if present
    let report: ExportReport | undefined;
    const reportHeader = res.headers.get('X-Krivio-Export-Report');
    if (reportHeader) {
      try {
        report = JSON.parse(decodeURIComponent(reportHeader));
      } catch {}
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    return { success: true, filename, report };
  },

  getExports: async (): Promise<{ exports: any[] }> => {
    return await fetchWithAuth('/api/marketplace/exports');
  },
};

export const quotationsApi = {
  create: async (data: {
    buyer: QuotationBuyerInput;
    items: QuotationItemInput[];
    validDays?: number;
    commercialNotes?: string;
    shippingTerms?: string;
    paymentTerms?: string;
    currency?: string;
    taxRatePercent?: number;
  }): Promise<{ quotation: Quotation }> => {
    return await fetchWithAuth('/api/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async (): Promise<{ quotations: Quotation[] }> => {
    return await fetchWithAuth('/api/quotations');
  },

  getById: async (id: string): Promise<{ quotation: Quotation }> => {
    return await fetchWithAuth(`/api/quotations/${id}`);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return await fetchWithAuth(`/api/quotations/${id}`, {
      method: 'DELETE',
    });
  },

  downloadPdf: async (id: string, quotationNumber?: string): Promise<{ success: boolean; filename: string }> => {
    const token = getStoredToken();
    const targetUrl = `${API_BASE}/api/quotations/${id}/pdf`;

    const res = await fetch(targetUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      let err = 'Failed to generate PDF';
      try {
        const j = await res.json();
        err = j.error || err;
      } catch {}
      throw new Error(err);
    }

    const disposition = res.headers.get('Content-Disposition') || '';
    let filename = `krivio_quotation_${quotationNumber || id}.pdf`;
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].trim();
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    return { success: true, filename };
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

export interface VoiceInteractionItem {
  id: string;
  user_id: string;
  transcript: string;
  intent?: string;
  entities?: Record<string, any>;
  response_text?: string;
  response_audio?: string | null;
  created_at: string;
}

export const voiceApi = {
  transcribe: async (payload: {
    audio_data?: string;
    language?: string;
    mime_type?: string;
  }): Promise<{
    success: boolean;
    transcript: string;
    request_id: string;
    need_confirmation: boolean;
    detected_language: string;
    confidence: number;
  }> => {
    return await fetchWithAuth('/api/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  respond: async (payload: {
    transcript: string;
    request_id?: string;
    language?: string;
    context?: any;
    need_audio?: boolean;
  }): Promise<{
    success: boolean;
    asset_id: string;
    intent: string;
    entities: Record<string, any>;
    response_text: string;
    response_audio: string | null;
    language: string;
  }> => {
    return await fetchWithAuth('/api/voice/respond', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listen: async (payload: {
    text: string;
    language?: string;
  }): Promise<{
    success: boolean;
    audio_data: string | null;
    format: string;
    text: string;
    language: string;
  }> => {
    return await fetchWithAuth('/api/voice/listen', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getHistory: async (): Promise<{ success: boolean; interactions: VoiceInteractionItem[] }> => {
    return await fetchWithAuth('/api/voice/history');
  },

  clearHistory: async (): Promise<{ success: boolean; message: string }> => {
    return await fetchWithAuth('/api/voice/history', {
      method: 'DELETE',
    });
  },
};

export interface WhatsAppSystemStatus {
  whatsapp: {
    status: 'configured' | 'unconfigured';
    is_configured: boolean;
    has_access_token: boolean;
    has_phone_number_id: boolean;
    has_verify_token: boolean;
    graph_api_version: string;
  };
  speech: {
    active_provider: string;
    is_configured: boolean;
  };
  webhook_endpoint: string;
  ready_for_credentials: boolean;
}

export const whatsappApi = {
  getStatus: async (): Promise<WhatsAppSystemStatus> => {
    try {
      return await fetchWithAuth('/api/whatsapp/status');
    } catch {
      return {
        whatsapp: {
          status: 'unconfigured',
          is_configured: false,
          has_access_token: false,
          has_phone_number_id: false,
          has_verify_token: false,
          graph_api_version: 'v21.0',
        },
        speech: {
          active_provider: 'gemini_audio',
          is_configured: true,
        },
        webhook_endpoint: '/webhook/whatsapp',
        ready_for_credentials: true,
      };
    }
  },
};

