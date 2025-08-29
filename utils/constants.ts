import type { Priority, PriorityInfo } from './types';

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

// Badge colors (matching Chrome extension badge API)
export const BADGE_COLORS = {
  LOW: '#4CAF50',    // Green
  MEDIUM: '#FF9800', // Orange/Yellow  
  HIGH: '#F44336',   // Red
  ERROR: '#757575',  // Gray
} as const;

// Design system colors
export const THEME_COLORS = {
  // Bitcoin orange
  PRIMARY: '#F7931A',
  PRIMARY_LIGHT: '#FFB84D',
  PRIMARY_DARK: '#E8841A',
  
  // Fee status colors
  FEE_LOW: '#4CAF50',
  FEE_MEDIUM: '#FF9800',
  FEE_HIGH: '#F44336',
  
  // Neutral colors (will be handled by CSS variables for light/dark theme)
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
} as const;

// Priority information
export const PRIORITIES: PriorityInfo[] = [
  {
    key: 'hourFee',
    name: 'Low Priority',
    description: '1 hour confirmation',
  },
  {
    key: 'halfHourFee', 
    name: 'Medium Priority',
    description: '30 minute confirmation',
  },
  {
    key: 'fastestFee',
    name: 'High Priority', 
    description: 'Fastest confirmation',
  },
] as const;

// Default settings
export const DEFAULT_SETTINGS = {
  SELECTED_PRIORITY: 'halfHourFee' as Priority,
  NOTIFICATIONS_ENABLED: false,
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
  TITLE: 'BTC Fee Alert',
  MESSAGE_TEMPLATE: 'BTC手续费已降至 {value} sat/vB，适合交易！',
  ICON: 'icon/48.png',
  TYPE: 'basic' as const,
} as const;