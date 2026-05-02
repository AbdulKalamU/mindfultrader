import axios from 'axios';
import type { 
  AuthResponse, 
  TradesResponse, 
  InsightsResponse, 
  ProfileResponse,
  WalletResponse,
  Trade, 
  Mood, 
  TradeType,
  TradingStyle,
  ExperienceLevel,
  RiskLevel,
} from '../types';

const API_URL = 'https://mindfultrader-production.up.railway.app/api';
/**
 * Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API error handler
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on authentication error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authApi = {
  signup: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

/**
 * Trade API
 */
export const tradeApi = {
  createTrade: async (tradeData: {
    asset: string;
    entryPrice: number;
    exitPrice: number;
    tradeType: TradeType;
    mood: Mood;
    notes?: string;
  }): Promise<{ trade: Trade; message: string }> => {
    const response = await api.post('/trades', tradeData);
    return response.data;
  },

  getTrades: async (filters?: {
    mood?: Mood;
    asset?: string;
    limit?: number;
  }): Promise<TradesResponse> => {
    const response = await api.get<TradesResponse>('/trades', { params: filters });
    return response.data;
  },
};

/**
 * Insights API
 */
export const insightsApi = {
  getInsights: async (): Promise<InsightsResponse> => {
    const response = await api.get<InsightsResponse>('/insights');
    return response.data;
  },
};

/**
 * Profile API
 */
export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData: {
    username?: string;
    tradingStyle?: TradingStyle;
    experienceLevel?: ExperienceLevel;
    riskLevel?: RiskLevel;
  }): Promise<ProfileResponse> => {
    const response = await api.put<ProfileResponse>('/user/profile', profileData);
    return response.data;
  },
};

/**
 * Wallet API
 */
export const walletApi = {
  getWallet: async (): Promise<WalletResponse> => {
    const response = await api.get<WalletResponse>('/wallet');
    return response.data;
  },

  deposit: async (amount: number, description?: string): Promise<WalletResponse> => {
    const response = await api.post<WalletResponse>('/wallet/deposit', { amount, description });
    return response.data;
  },

  withdraw: async (amount: number, description?: string): Promise<WalletResponse> => {
    const response = await api.post<WalletResponse>('/wallet/withdraw', { amount, description });
    return response.data;
  },
};

export default api;
