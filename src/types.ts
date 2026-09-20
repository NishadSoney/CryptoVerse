/**
 * CryptoVerse - Core TypeScript Interfaces & Database Schema Types
 * Mirrored directly from /database/schema.sql
 */

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type UserRole = 'STUDENT' | 'ADMIN';
export type LessonStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
export type TradeType = 'BUY' | 'SELL';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  experience_level: ExperienceLevel;
  role: UserRole;
  created_at: string;
  last_login?: string;
}

export interface UserProfile {
  user_id: number;
  avatar_url: string;
  xp_total: number;
  current_level: number;
  streak_days: number;
  last_active_date: string;
  preferred_chart_mode: 'SIMPLE' | 'ADVANCED';
  enable_3d_effects: boolean;
}

export interface Wallet {
  id: number;
  user_id: number;
  virtual_cash: number; // Defaults to $100,000.00
  updated_at: string;
}

export interface WalletAsset {
  id: number;
  wallet_id: number;
  asset_symbol: string;
  quantity: number;
  avg_buy_price: number;
  updated_at: string;
}

export interface Trade {
  id: number;
  user_id: number;
  asset_symbol: string;
  trade_type: TradeType;
  quantity: number;
  price: number;
  total_value: number;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  badge_icon: string;
  sort_order: number;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  level_badge: string;
  sort_order: number;
}

export interface Lesson {
  id: number;
  module_id: number;
  module?: string;
  slug: string;
  title: string;
  summary: string;
  simple_explanation: string;
  analogy: string;
  technical_explanation: string;
  key_takeaway: string;
  xp_reward: number;
  estimated_minutes: number;
  sort_order: number;
  order_num?: number;
}

export interface QuizQuestion {
  id: number;
  quiz_id?: number;
  lesson_id?: number;
  question_text?: string;
  scenario?: string;
  explanation: string;
  options: (QuizOption | string)[];
  correct_index?: number;
}

export interface QuizOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  pass_score: number;
  xp_reward: number;
  questions: QuizQuestion[];
}

export interface GlossaryTerm {
  id: number;
  term: string;
  slug: string;
  category: string;
  simple_definition: string;
  technical_definition: string;
  example_usage: string;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  unlocked?: boolean;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  type: 'LESSON' | 'QUIZ' | 'TRADE' | 'SECURITY';
  target_count: number;
  completed?: boolean;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
}
