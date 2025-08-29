import type { FeeData, Priority } from './types';
import { NOTIFICATION_CONFIG } from './constants';
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
    const belowThreshold = currentFeeValue < settings.alertThreshold;
    
    // Only send notification on transition from above to below threshold
    if (belowThreshold && settings.lastAlertState !== false) {
      // Update alert state to prevent spam
      await updateSetting('lastAlertState', false);
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
 * Send fee alert notification
 */
export async function sendFeeAlert(feeData: FeeData): Promise<boolean> {
  try {
    const settings = await getUserSettings();
    const feeValue = getFeeValueForPriority(feeData, settings.selectedPriority);
    
    const message = NOTIFICATION_CONFIG.MESSAGE_TEMPLATE.replace(
      '{value}',
      feeValue.toString()
    );
    
    await browser.notifications.create(NOTIFICATION_CONFIG.ID, {
      type: NOTIFICATION_CONFIG.TYPE,
      iconUrl: NOTIFICATION_CONFIG.ICON,
      title: NOTIFICATION_CONFIG.TITLE,
      message,
    });
    
    return true;
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