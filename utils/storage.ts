import type { StorageData, FeeData, Priority } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';

/**
 * Get user settings from storage
 */
export async function getUserSettings(): Promise<StorageData> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEYS.USER_SETTINGS);
    const settings = result[STORAGE_KEYS.USER_SETTINGS] as StorageData | undefined;
    
    // Return default settings if none exist
    if (!settings) {
      const defaultSettings: StorageData = {
        selectedPriority: DEFAULT_SETTINGS.SELECTED_PRIORITY,
        notificationsEnabled: DEFAULT_SETTINGS.NOTIFICATIONS_ENABLED,
        lastUpdate: 0,
      };
      
      await saveUserSettings(defaultSettings);
      return defaultSettings;
    }
    
    return settings;
  } catch (error) {
    console.error('Failed to get user settings:', error);
    
    // Return default settings on error
    return {
      selectedPriority: DEFAULT_SETTINGS.SELECTED_PRIORITY,
      notificationsEnabled: DEFAULT_SETTINGS.NOTIFICATIONS_ENABLED,
      lastUpdate: 0,
    };
  }
}

/**
 * Save user settings to storage
 */
export async function saveUserSettings(settings: StorageData): Promise<boolean> {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.USER_SETTINGS]: settings,
    });
    return true;
  } catch (error) {
    console.error('Failed to save user settings:', error);
    return false;
  }
}

/**
 * Update specific setting
 */
export async function updateSetting<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
): Promise<boolean> {
  try {
    const settings = await getUserSettings();
    settings[key] = value;
    return await saveUserSettings(settings);
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error);
    return false;
  }
}

/**
 * Cache fee data with timestamp
 */
export async function cacheFeeData(feeData: FeeData): Promise<boolean> {
  try {
    const settings = await getUserSettings();
    settings.cachedData = feeData;
    settings.lastUpdate = Date.now();
    
    return await saveUserSettings(settings);
  } catch (error) {
    console.error('Failed to cache fee data:', error);
    return false;
  }
}

/**
 * Get cached fee data if still valid
 */
export async function getCachedFeeData(): Promise<FeeData | null> {
  try {
    const settings = await getUserSettings();
    
    if (!settings.cachedData || !settings.lastUpdate) {
      return null;
    }
    
    const age = Date.now() - settings.lastUpdate;
    const maxAge = DEFAULT_SETTINGS.CACHE_DURATION;
    
    if (age > maxAge) {
      return null; // Cache expired
    }
    
    return settings.cachedData;
  } catch (error) {
    console.error('Failed to get cached fee data:', error);
    return null;
  }
}

/**
 * Check if cache is valid (not expired)
 */
export async function isCacheValid(): Promise<boolean> {
  try {
    const settings = await getUserSettings();
    
    if (!settings.lastUpdate) {
      return false;
    }
    
    const age = Date.now() - settings.lastUpdate;
    return age < DEFAULT_SETTINGS.CACHE_DURATION;
  } catch {
    return false;
  }
}

/**
 * Get fee value for selected priority
 */
export function getFeeValueForPriority(feeData: FeeData, priority: Priority): number {
  return feeData[priority];
}

/**
 * Clear all stored data
 */
export async function clearAllData(): Promise<boolean> {
  try {
    await browser.storage.local.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear stored data:', error);
    return false;
  }
}