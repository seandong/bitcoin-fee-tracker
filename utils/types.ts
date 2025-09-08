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
  badgeVisible: boolean;
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

// Mempool blocks data structure from API
export interface MempoolBlockData {
  feeRange: number[];
  blockSize: number;
  blockVSize: number;
  nTx: number;
  totalFees: number;
  medianFee: number;
}

// Chrome extension details for onInstalled event
export interface ExtensionInstallDetails {
  reason: 'install' | 'update' | 'chrome_update' | 'shared_module_update';
  previousVersion?: string;
  id?: string;
}

// Chrome storage change details
export interface StorageChangeDetails {
  [key: string]: {
    newValue?: any;
    oldValue?: any;
  };
}

// Chrome alarms API alarm object
export interface AlarmDetails {
  name: string;
  scheduledTime: number;
  periodInMinutes?: number;
}

// Runtime message types
export interface RuntimeMessage {
  type: 'UPDATE_BADGE' | 'TEST_NOTIFICATION';
  payload?: any;
}

// Fee range for next block
export interface FeeRange {
  min: number;
  max: number;
}