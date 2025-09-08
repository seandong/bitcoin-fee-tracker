import { fetchFeeData } from '@/utils/api';
import { getUserSettings, cacheFeeData } from '@/utils/storage';
import { createBadgeConfig, updateBadge, setBadgeError } from '@/utils/badge';
import { shouldSendNotification, sendFeeAlert } from '@/utils/notifications';
import { ALARM_NAME, TIME_CONSTANTS } from '@/utils/constants';
import type { ExtensionInstallDetails, StorageChangeDetails, AlarmDetails, RuntimeMessage, FeeData } from '@/utils/types';

export default defineBackground(() => {
  console.log('BTC Fee Tracker background script loaded');
  
  // Initialize on extension startup
  initializeExtension();
  
  // Handle alarm events for periodic updates
  browser.alarms.onAlarm.addListener(handleAlarm);
  
  // Handle extension installation/update
  browser.runtime.onInstalled.addListener(handleInstalled);
  
  // Handle storage changes to update badge when settings change
  browser.storage.onChanged.addListener(handleStorageChange);
  
  // Handle runtime messages for immediate badge updates
  browser.runtime.onMessage.addListener(handleMessage);
});

/**
 * Initialize extension on startup
 */
async function initializeExtension() {
  try {
    console.log('Initializing BTC Fee Tracker...');
    
    // Create alarm for periodic updates
    await createUpdateAlarm();
    
    // Perform initial fee data fetch
    await updateFeeData();
    
    console.log('BTC Fee Tracker initialized successfully');
  } catch (error) {
    console.error('Failed to initialize extension:', error);
    await setBadgeError();
  }
}

/**
 * Handle extension installation or update
 */
async function handleInstalled(details: ExtensionInstallDetails) {
  if (details.reason === 'install') {
    console.log('BTC Fee Tracker installed');
    
    // Perform initial setup
    await initializeExtension();
  } else if (details.reason === 'update') {
    console.log('BTC Fee Tracker updated');
    
    // Ensure alarm is still active after update
    await createUpdateAlarm();
  }
}

/**
 * Create alarm for periodic fee data updates
 */
async function createUpdateAlarm() {
  try {
    // Clear existing alarm
    await browser.alarms.clear(ALARM_NAME);
    
    // Create new alarm using defined constants
    await browser.alarms.create(ALARM_NAME, {
      delayInMinutes: TIME_CONSTANTS.UPDATE_INTERVAL_MINUTES,
      periodInMinutes: TIME_CONSTANTS.UPDATE_INTERVAL_MINUTES,
    });
    
    console.log('Update alarm created successfully');
  } catch (error) {
    console.error('Failed to create update alarm:', error);
  }
}

/**
 * Handle alarm events
 */
async function handleAlarm(alarm: AlarmDetails) {
  if (alarm.name === ALARM_NAME) {
    console.log('Alarm triggered: updating fee data');
    await updateFeeData();
  }
}

/**
 * Fetch and process fee data
 */
async function updateFeeData() {
  try {
    console.log('Fetching fee data from API...');
    
    const apiResponse = await fetchFeeData();
    
    if (!apiResponse.success || !apiResponse.data) {
      console.error('API request failed:', apiResponse.error);
      await setBadgeError();
      return;
    }
    
    const feeData = apiResponse.data;
    console.log('Fee data received:', feeData);
    
    // Cache the data
    await cacheFeeData(feeData);
    
    // Update badge
    await updateBadgeDisplay(feeData);
    
    // Check for notification
    await checkAndSendNotification(feeData);
    
    console.log('Fee data updated successfully');
  } catch (error) {
    console.error('Failed to update fee data:', error);
    await setBadgeError();
  }
}

/**
 * Update badge based on current settings
 */
async function updateBadgeDisplay(feeData: FeeData) {
  try {
    const settings = await getUserSettings();
    
    // Check if badge should be visible
    if (!settings.badgeVisible) {
      // Clear the badge if it should be hidden
      await browser.action.setBadgeText({ text: '' });
      console.log('Badge hidden per user settings');
      return;
    }
    
    const badgeConfig = createBadgeConfig(feeData, settings.selectedPriority);
    await updateBadge(badgeConfig);
    
    console.log(`Badge updated: ${badgeConfig.text} (${badgeConfig.level})`);
  } catch (error) {
    console.error('Failed to update badge:', error);
    await setBadgeError();
  }
}

/**
 * Check conditions and send notification if needed
 */
async function checkAndSendNotification(feeData: FeeData) {
  try {
    const shouldNotify = await shouldSendNotification(feeData);
    
    if (shouldNotify) {
      const success = await sendFeeAlert(feeData);
      
      if (success) {
        console.log('Fee alert notification sent');
      } else {
        console.error('Failed to send notification');
      }
    }
  } catch (error) {
    console.error('Failed to check notification conditions:', error);
  }
}

/**
 * Handle storage changes to update badge when settings change
 */
async function handleStorageChange(changes: StorageChangeDetails, area: string) {
  if (area !== 'local') return;
  
  // Check if settings were changed
  if (changes.btc_fee_tracker_settings) {
    const newSettings = changes.btc_fee_tracker_settings.newValue;
    const oldSettings = changes.btc_fee_tracker_settings.oldValue;
    
    // Check if selectedPriority changed
    if (oldSettings && newSettings && 
        oldSettings.selectedPriority !== newSettings.selectedPriority) {
      console.log('Priority changed, updating badge...');
      
      // Get cached fee data and update badge with new priority
      if (newSettings.cachedData) {
        await updateBadgeDisplay(newSettings.cachedData);
      }
    }
  }
}

/**
 * Handle runtime messages
 */
async function handleMessage(message: RuntimeMessage) {
  if (message.type === 'UPDATE_BADGE') {
    console.log('Received badge update request');
    
    // Get cached fee data
    const settings = await getUserSettings();
    if (settings.cachedData) {
      await updateBadgeDisplay(settings.cachedData);
    } else {
      // If no cached data, fetch new data
      await updateFeeData();
    }
    
    return true; // Indicate async response
  }
}
