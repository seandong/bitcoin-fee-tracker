import type { Priority, PriorityInfo, ThemeMode, ThemeInfo } from './types';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://mempool.space/api/v1',
  FEES_ENDPOINT: '/fees/recommended',
  TIMEOUT: 10000, // 10 seconds
  UPDATE_INTERVAL: 30 * 1000, // 30 seconds
} as const;

// Fee level thresholds (sat/vB)
export const FEE_THRESHOLDS = {
  LOW: 10,
  HIGH: 50,
} as const;

// Badge colors
export const BADGE_COLORS = {
  // Text colors (same as priority labels)
  LOW: '#10B981',    // Emerald-500 - Green
  MEDIUM: '#F59E0B', // Amber-500 - Orange/Yellow  
  HIGH: '#EF4444',   // Red-500 - Red
  ERROR: '#6B7280',  // Gray-500 - Gray
  
  // Background colors (matching priority label backgrounds)
  LOW_BG: '#10B981',    // Emerald-500 - Green (same as label)
  MEDIUM_BG: '#F59E0B', // Amber-500 - Orange/Yellow (same as label)
  HIGH_BG: '#EF4444',   // Red-500 - Red (same as label)
  ERROR_BG: '#6B7280',  // Gray-500 - Gray
} as const;

// Phosphor-inspired design system colors
export const THEME_COLORS = {
  // Primary palette - sophisticated orange/amber
  PRIMARY: '#F59E0B',     // Amber-500 - more refined than bitcoin orange
  PRIMARY_LIGHT: '#FCD34D', // Amber-300 - lighter variant
  PRIMARY_DARK: '#D97706',  // Amber-600 - darker variant
  PRIMARY_SUBTLE: '#FEF3C7', // Amber-100 - very light background
  
  // Fee status colors - balanced and accessible
  FEE_LOW: '#10B981',     // Emerald-500 - fresh green
  FEE_MEDIUM: '#F59E0B',  // Amber-500 - warm amber
  FEE_HIGH: '#EF4444',    // Red-500 - clear red
  
  // Neutral palette - clean grays inspired by Phosphor's minimalism
  GRAY_50: '#F9FAFB',     // Lightest background
  GRAY_100: '#F3F4F6',    // Light background
  GRAY_200: '#E5E7EB',    // Light border
  GRAY_300: '#D1D5DB',    // Medium border
  GRAY_400: '#9CA3AF',    // Light text
  GRAY_500: '#6B7280',    // Medium text
  GRAY_600: '#4B5563',    // Dark text
  GRAY_700: '#374151',    // Darker text
  GRAY_800: '#1F2937',    // Darkest text
  GRAY_900: '#111827',    // Almost black
  
  // Semantic colors
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
} as const;

// Priority information
export const PRIORITIES: PriorityInfo[] = [
  {
    key: 'hourFee',
    name: 'Low',
    description: '~60 minutes',
  },
  {
    key: 'halfHourFee', 
    name: 'Medium',
    description: '~30 minutes',
  },
  {
    key: 'fastestFee',
    name: 'High', 
    description: '~10 minutes',
  },
] as const;

// Theme information
export const THEMES: ThemeInfo[] = [
  {
    key: 'light',
    name: 'Light',
    description: '',
  },
  {
    key: 'dark',
    name: 'Dark',
    description: '',
  },
  {
    key: 'system',
    name: 'Auto',
    description: '',
  },
] as const;

// Default settings
export const DEFAULT_SETTINGS = {
  SELECTED_PRIORITY: 'halfHourFee' as Priority,
  NOTIFICATIONS_ENABLED: true,
  ALERT_THRESHOLD: undefined as number | undefined,
  THEME: 'system' as ThemeMode,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  BADGE_MAX_VALUE: 99,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_SETTINGS: 'btc_fee_tracker_settings',
  CACHED_DATA: 'btc_fee_tracker_cache',
  LAST_UPDATE: 'btc_fee_tracker_last_update',
} as const;

// Alarm name for background timer
export const ALARM_NAME = 'btc_fee_update_alarm' as const;

// Notification configuration
export const NOTIFICATION_CONFIG = {
  ID: 'btc_fee_alert',
  TITLE: 'BTC Fee Alert 🚀',
  MESSAGE_TEMPLATE: 'Bitcoin fees dropped to {value} sat/vB - great time to transact!',
  ICON: '/icon/48.png',
  TYPE: 'basic' as const,
  COOLDOWN: 15 * 60 * 1000, // 15 minutes between notifications
} as const;