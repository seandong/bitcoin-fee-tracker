export interface NotificationDiagnostics {
  browserSupport: boolean;
  extensionPermission: 'granted' | 'denied' | 'unknown';
  chromeVersion: string | null;
  platform: string;
  osNotificationStatus: 'unknown' | 'enabled' | 'disabled' | 'dnd';
  manifestPermissions: string[] | undefined;
  chromeNotificationSetting?: 'allow' | 'block' | 'ask';
}

export async function runNotificationDiagnostics(): Promise<NotificationDiagnostics> {
  const diagnostics: NotificationDiagnostics = {
    browserSupport: 'notifications' in browser,
    extensionPermission: 'unknown',
    chromeVersion: null,
    platform: navigator.platform || 'Unknown',
    osNotificationStatus: 'unknown',
    manifestPermissions: undefined
  };

  // Check Chrome version
  const chromeMatch = navigator.userAgent.match(/Chrome\/([0-9.]+)/);
  if (chromeMatch) {
    diagnostics.chromeVersion = chromeMatch[1];
  }

  // Check extension permission
  try {
    const permission = await browser.permissions.contains({
      permissions: ['notifications']
    });
    diagnostics.extensionPermission = permission ? 'granted' : 'denied';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
  }

  // Get manifest permissions
  try {
    diagnostics.manifestPermissions = browser.runtime.getManifest().permissions;
  } catch (error) {
    console.error('Failed to get manifest permissions:', error);
  }

  return diagnostics;
}

export function getNotificationTroubleshootingSteps(diagnostics: NotificationDiagnostics): string[] {
  const steps: string[] = [];

  if (!diagnostics.browserSupport) {
    steps.push('Your browser does not support the notifications API');
    return steps;
  }

  if (diagnostics.extensionPermission === 'denied') {
    steps.push('Grant notification permission to this extension in Chrome settings');
    steps.push('Go to: chrome://settings/content/notifications');
  }

  if (!diagnostics.manifestPermissions?.includes('notifications')) {
    steps.push('The extension manifest is missing notification permissions');
    steps.push('Contact the developer to fix this issue');
  }

  // Platform-specific guidance
  if (diagnostics.platform.includes('Mac')) {
    steps.push('Check macOS System Settings → Notifications → Chrome');
    steps.push('Ensure Chrome is allowed to send notifications');
    steps.push('Turn off Do Not Disturb / Focus mode if enabled');
  } else if (diagnostics.platform.includes('Win')) {
    steps.push('Check Windows Settings → System → Notifications → Chrome');
    steps.push('Ensure Chrome notifications are enabled');
    steps.push('Turn off Focus Assist if enabled');
  } else if (diagnostics.platform.includes('Linux')) {
    steps.push('Check your desktop environment notification settings');
    steps.push('Ensure Chrome can display notifications');
  }

  steps.push('Try restarting Chrome after changing any settings');
  steps.push('Test with another Chrome extension to verify system notifications work');

  return steps;
}

export async function testChromeNotificationAPI(): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
  activeNotifications?: Record<string, any>;
}> {
  try {
    const testId = `diagnostic-test-${Date.now()}`;
    
    // Create a test notification
    const notificationId = await browser.notifications.create(testId, {
      type: 'basic',
      iconUrl: '/icon/128.png',
      title: '🔔 Notification Test',
      message: 'If you can see this, notifications are working!',
      priority: 2,
      requireInteraction: false
    });

    // Check if it was created
    const allNotifications = await browser.notifications.getAll();
    
    // Clean up after 3 seconds
    setTimeout(() => {
      browser.notifications.clear(testId);
    }, 3000);

    return {
      success: true,
      notificationId,
      activeNotifications: allNotifications
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// Alternative notification method using service worker + Web Notifications API
export async function testWebNotificationAPI(): Promise<boolean> {
  if (!('Notification' in self)) {
    console.log('Web Notifications API not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const notification = new Notification('BTC Fee Alert Test (Web API)', {
        body: 'This uses the Web Notifications API as fallback',
        icon: '/icon/128.png',
        badge: '/icon/48.png',
        tag: 'web-api-test',
        requireInteraction: false
      });

      setTimeout(() => notification.close(), 3000);
      return true;
    }
  } catch (error) {
    console.error('Web Notification API failed:', error);
  }

  return false;
}