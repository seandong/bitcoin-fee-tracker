// Bitcoin fee data from mempool.space API
export interface FeeData {
  fastestFee: number;    // High priority (fastest confirmation)
  halfHourFee: number;   // Medium priority (30-min confirmation)
  hourFee: number;       // Low priority (1-hour confirmation)
}


// User storage data structure
export interface StorageData {
  selectedPriority: 'fastestFee' | 'halfHourFee' | 'hourFee';
  alertThreshold?: number;
  notificationsEnabled: boolean;
  lastUpdate: number;
  cachedData?: FeeData;
  lastAlertState?: boolean;  // For anti-spam notification logic
  lastNotificationTime?: number;  // Timestamp of last notification
}

// Priority type for easier usage
export type Priority = 'fastestFee' | 'halfHourFee' | 'hourFee';

// Fee level for color coding
export type FeeLevel = 'low' | 'medium' | 'high';

// Priority display names
export interface PriorityInfo {
  key: Priority;
  name: string;
  description: string;
}


// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Badge configuration
export interface BadgeConfig {
  text: string;
  color: string;
  backgroundColor?: string;
  level: FeeLevel;
}

// Block data
export interface BlockData {
  height: number;
}

// Mempool data with fee histogram
export interface MempoolData {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: [number, number][]; // [fee_rate, vsize]
}

// Fee range for next block
export interface FeeRange {
  min: number;
  max: number;
}