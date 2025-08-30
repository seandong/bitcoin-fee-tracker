import type { FeeData, Priority } from './types';
import { NOTIFICATION_CONFIG } from './constants';
import { getUserSettings, updateSetting } from './storage';
import { getFeeValueForPriority } from './storage';
import { runNotificationDiagnostics, testWebNotificationAPI } from './notification-diagnostics';

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
 * Send fee alert notification with fallback methods
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
    
    // Try Chrome notifications API first
    try {
      const notificationId = await browser.notifications.create(NOTIFICATION_CONFIG.ID, {
        type: NOTIFICATION_CONFIG.TYPE,
        iconUrl: NOTIFICATION_CONFIG.ICON,
        title: NOTIFICATION_CONFIG.TITLE,
        message,
        requireInteraction: false,
        priority: 2
      });
      
      console.log(`Fee alert sent via Chrome API: ${message}`);
      
      // Verify notification was created
      const allNotifications = await browser.notifications.getAll();
      if (Object.keys(allNotifications).length > 0) {
        return true;
      }
      
      console.warn('Chrome notification created but not visible, trying fallback...');
    } catch (chromeError) {
      console.error('Chrome notifications API failed:', chromeError);
    }
    
    // Fallback to Web Notifications API if Chrome API fails
    try {
      const webSuccess = await testWebNotificationAPI();
      if (webSuccess) {
        console.log('Fee alert sent via Web API fallback');
        return true;
      }
    } catch (webError) {
      console.error('Web Notifications API failed:', webError);
    }
    
    // Last resort: Log diagnostic info
    const diagnostics = await runNotificationDiagnostics();
    console.error('All notification methods failed. Diagnostics:', diagnostics);
    
    return false;
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
 * Send a test notification with diagnostics
 */
export async function sendTestNotification(threshold: number): Promise<{
  success: boolean;
  method: 'chrome' | 'web' | 'none';
  diagnostics: any;
}> {
  const diagnostics = await runNotificationDiagnostics();
  console.log('🔔 Running notification test with diagnostics:', diagnostics);
  
  // Try Chrome API
  try {
    const testId = `test-${Date.now()}`;
    await browser.notifications.create(testId, {
      type: 'basic',
      iconUrl: '/icon/128.png',
      title: '🔔 BTC Fee Alert Test',
      message: `Test successful! Threshold: ${threshold} sat/vB`,
      priority: 2,
      requireInteraction: false
    });
    
    // Verify it was created
    const all = await browser.notifications.getAll();
    if (all[testId]) {
      setTimeout(() => browser.notifications.clear(testId), 5000);
      return { success: true, method: 'chrome', diagnostics };
    }
  } catch (error) {
    console.error('Chrome API test failed:', error);
  }
  
  // Try Web API fallback
  try {
    if (await testWebNotificationAPI()) {
      return { success: true, method: 'web', diagnostics };
    }
  } catch (error) {
    console.error('Web API test failed:', error);
  }
  
  return { success: false, method: 'none', diagnostics };
}