import type { FeeData, Priority } from './types';
import { NOTIFICATION_CONFIG, TIME_CONSTANTS } from './constants';
import { getUserSettings, updateSetting } from './storage';
import { getFeeValueForPriority } from './storage';

/**
 * Check if notification should be sent
 */
export async function shouldSendNotification(feeData: FeeData): Promise<boolean> {
  try {
    const settings = await getUserSettings();
    
    // Don't send if notifications are disabled
    if (!settings.notificationsEnabled) {
      return false;
    }
    
    // Don't send if no threshold is set
    if (!settings.alertThreshold) {
      return false;
    }
    
    const currentFeeValue = getFeeValueForPriority(feeData, settings.selectedPriority);
    const belowThreshold = currentFeeValue <= settings.alertThreshold;
    
    // Check cooldown to prevent spam
    const now = Date.now();
    if (settings.lastNotificationTime && 
        (now - settings.lastNotificationTime) < NOTIFICATION_CONFIG.COOLDOWN) {
      return false;
    }
    
    // Only send notification on transition from above to below threshold
    if (belowThreshold && settings.lastAlertState !== false) {
      // Update alert state and timestamp to prevent spam
      await updateSetting('lastAlertState', false);
      await updateSetting('lastNotificationTime', now);
      return true;
    }
    
    // Update alert state when fee goes above threshold
    if (!belowThreshold && settings.lastAlertState !== true) {
      await updateSetting('lastAlertState', true);
    }
    
    return false;
  } catch (error) {
    console.error('Failed to check notification conditions:', error);
    return false;
  }
}

/**
 * Send fee alert notification using Chrome extension API
 */
export async function sendFeeAlert(feeData: FeeData): Promise<boolean> {
  try {
    const settings = await getUserSettings();
    const feeValue = getFeeValueForPriority(feeData, settings.selectedPriority);
    
    const message = NOTIFICATION_CONFIG.MESSAGE_TEMPLATE.replace(
      '{value}',
      Math.round(feeValue).toString()
    );
    
    // Clear any existing notification first
    await clearNotifications();
    
    // Use Chrome notifications API
    const notificationId = await browser.notifications.create(NOTIFICATION_CONFIG.ID, {
      type: NOTIFICATION_CONFIG.TYPE,
      iconUrl: NOTIFICATION_CONFIG.ICON,
      title: NOTIFICATION_CONFIG.TITLE,
      message,
      requireInteraction: false,
      priority: 2
    });
    
    console.log(`Fee alert notification sent: ${message}`);
    return !!notificationId;
  } catch (error) {
    console.error('Failed to send fee alert notification:', error);
    return false;
  }
}

/**
 * Check notification permission status
 */
export async function getNotificationPermission(): Promise<'granted' | 'denied' | 'unknown'> {
  try {
    const permission = await browser.notifications.getPermissionLevel();
    return permission === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return 'unknown';
  }
}

/**
 * Request notification permission if not granted
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const currentPermission = await getNotificationPermission();
    return currentPermission === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return typeof browser !== 'undefined' && 
         typeof browser.notifications !== 'undefined';
}

/**
 * Clear existing notifications
 */
export async function clearNotifications(): Promise<boolean> {
  try {
    await browser.notifications.clear(NOTIFICATION_CONFIG.ID);
    return true;
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    return false;
  }
}

/**
 * Send a test notification
 */
export async function sendTestNotification(threshold: number): Promise<boolean> {
  try {
    const testId = `test-${Date.now()}`;
    const notificationId = await browser.notifications.create(testId, {
      type: 'basic',
      iconUrl: '/icon/128.png',
      title: '🔔 BTC Fee Alert Test',
      message: `Test successful! Threshold: ${threshold} sat/vB`,
      priority: 2,
      requireInteraction: false
    });
    
    if (notificationId) {
      // Auto-clear after 5 seconds
      setTimeout(() => browser.notifications.clear(testId), TIME_CONSTANTS.TEST_NOTIFICATION_TIMEOUT_MS);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Test notification failed:', error);
    return false;
  }
}