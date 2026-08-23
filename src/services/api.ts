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

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  return response.json();
};

export const authApi = {
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

  googleSignIn: async (name?: string, email?: string): Promise<AuthResponse> => {
    const res = await fetchWithAuth('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  getMe: async (): Promise<{ user: User }> => {
    return fetchWithAuth('/api/auth/me');
  },
};

export const dashboardApi = {
  getStats: async (): Promise<{
    user: Partial<User>;
    stats: BusinessHealthStats;
    tasks: TaskItem[];
  }> => {
    return fetchWithAuth('/api/dashboard');
  },

  toggleTask: async (taskId: string): Promise<{ success: boolean; tasks: TaskItem[] }> => {
    return fetchWithAuth('/api/tasks/toggle', {
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
    return fetchWithAuth('/api/ai/mentor', {
      method: 'POST',
      body: JSON.stringify({ message, language, conversationHistory }),
    });
  },
};

export const businessProfileApi = {
  get: async (): Promise<{ businessProfile: BusinessProfile }> => {
    return fetchWithAuth('/api/business-profile');
  },

  create: async (data: Partial<BusinessProfile>): Promise<{ businessProfile: BusinessProfile; message?: string }> => {
    return fetchWithAuth('/api/business-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (data: Partial<BusinessProfile>): Promise<{ businessProfile: BusinessProfile; message?: string }> => {
    return fetchWithAuth('/api/business-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (): Promise<{ success: boolean }> => {
    return fetchWithAuth('/api/business-profile', {
      method: 'DELETE',
    });
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
    return fetchWithAuth(`/api/products${queryString}`);
  },

  getById: async (id: string): Promise<{ product: Product }> => {
    return fetchWithAuth(`/api/products/${id}`);
  },

  create: async (data: Partial<Product>): Promise<{ product: Product; warning?: string }> => {
    return fetchWithAuth('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Product>): Promise<{ product: Product }> => {
    return fetchWithAuth(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchWithAuth(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  duplicate: async (id: string): Promise<{ product: Product; message: string }> => {
    return fetchWithAuth(`/api/products/${id}/duplicate`, {
      method: 'POST',
    });
  },

  archive: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchWithAuth(`/api/products/${id}/archive`, {
      method: 'POST',
    });
  },

  generateDetails: async (params: {
    rawName: string;
    craftType?: string;
    materials?: string;
    targetPrice?: number;
  }): Promise<{ data: any }> => {
    return fetchWithAuth('/api/products/generate-details', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

export const imagesApi = {
  analyze: async (imageBase64: string): Promise<{ analysis: ImageAnalysis }> => {
    return fetchWithAuth('/api/images/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    });
  },
};

export const marketplaceApi = {
  getRecommendations: async (): Promise<{ channels: ChannelRecommendation[] }> => {
    return fetchWithAuth('/api/marketplace/recommendations');
  },
};

export const paymentsApi = {
  createOrder: async (plan: string = 'pro', amount: number = 299): Promise<PaymentOrder> => {
    return fetchWithAuth('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan, amount }),
    });
  },

  verifyPayment: async (data: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
  }): Promise<{ success: boolean; subscriptionPlan: string; message: string }> => {
    return fetchWithAuth('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
