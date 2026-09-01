export type UserRole = 'artisan' | 'shg' | 'farmer' | 'small_business';

export interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  phone?: string;
  phone_number?: string;
  role: UserRole;
  businessName?: string;
  location?: string;
  is_active?: boolean;
  is_verified?: boolean;
  subscriptionPlan: 'free' | 'pro';
  subscriptionValidUntil?: string;
  avatarUrl?: string;
  profile_image?: string;
  preferred_language?: string;
  preferredLanguage?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  state: string;
  district: string;
  villageCity: string;
  pinCode: string;
  primaryLanguage: string;
  businessLogo?: string;
  yearsInBusiness: number;
  website?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  gstNumber?: string;
  businessRegistration?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  keywords: string[];
  imageUrls: string[];
  isMarketplaceReady: boolean;
  readinessScore: number;
  stock: number;
  sku?: string;
  weight?: string;
  dimensions?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ImageAnalysis {
  id: string;
  imageUrl: string;
  lightingScore: number; // 0 - 100
  backgroundScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  lightingFeedback: string;
  backgroundFeedback: string;
  suggestions: string[];
  detectedSubject: string;
  createdAt: string;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: string;
  audioUrl?: string;
}

export interface BusinessHealthStats {
  totalProducts: number;
  marketplaceReadyProducts: number;
  estimatedMonthlyRevenue: number;
  healthScore: number; // 0 - 100
  completedTasksCount: number;
  totalTasksCount: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'image' | 'marketplace' | 'mentor';
  completed: boolean;
  dueDate: string;
}

export interface ChannelRecommendation {
  channelId: string;
  channelName: string;
  logo: string;
  fitScore: number; // 0 - 100
  description: string;
  benefits: string[];
  requirements: string[];
  isEligible: boolean;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  plan: 'pro';
  keyId: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  department: string;
  description: string;
  eligibility: string;
  benefit: string;
  documentsNeeded: string[];
  category: 'loan' | 'grant' | 'training' | 'marketing' | 'equipment';
  officialUrl: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert' | 'mentor';
  linkTab?: string;
}

export interface PublicStorefrontData {
  artisan: {
    id: string;
    name: string;
    businessName: string;
    location: string;
    craftType: string;
    story: string;
    phone: string;
    isVerified: boolean;
    joinedDate: string;
  };
  products: Product[];
  totalProducts: number;
}


