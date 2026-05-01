/**
 * Type definitions for MindfulTrader frontend
 */

export type Mood = 'Calm' | 'Anxious' | 'Greedy' | 'Disciplined' | 'Fearful';
export type TradeType = 'long' | 'short';
export type TradingStyle = 'Day Trader' | 'Swing Trader' | 'Scalper' | 'Position Trader' | 'Other';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface User {
  id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  tradingStyle?: TradingStyle;
  experienceLevel?: ExperienceLevel;
  riskLevel?: RiskLevel;
  createdAt: string;
}

export interface Trade {
  id: string;
  asset: string;
  entryPrice: number;
  exitPrice: number;
  tradeType: TradeType;
  mood: Mood;
  notes?: string;
  profitLoss: number;
  timestamp: string;
  // New optional fields
  tags?: string[];
  rating?: number;
}

export interface MoodCorrelation {
  mood: Mood;
  totalProfitLoss: number;
  averageProfitLoss: number;
  tradeCount: number;
  rank: number;
}

export interface Analytics {
  winRateByAsset?: { asset: string; winRate: number; tradeCount: number }[];
  avgProfit?: number;
  avgLoss?: number;
  currentStreak?: { type: string; count: number };
  longestWinStreak?: number;
  longestLossStreak?: number;
}

export interface Insight {
  id: string;
  text: string;
  moodAnalysis: MoodCorrelation[];
  generatedAt: string;
  // New optional fields
  warnings?: string[];
  recommendations?: string[];
  analytics?: Analytics;
}

export interface Transaction {
  type: 'deposit' | 'withdraw' | 'trade';
  amount: number;
  date: string;
  description?: string;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  transactions?: Transaction[];
  transactionCount?: number;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface TradesResponse {
  trades: Trade[];
  count: number;
}

export interface InsightsResponse {
  insights: Insight[];
  tradeCount: number;
  hasMinimumData: boolean;
  message?: string;
}

export interface ProfileResponse {
  profile: UserProfile;
  message?: string;
}

export interface WalletResponse {
  wallet: Wallet;
  transaction?: Transaction;
  message?: string;
}
