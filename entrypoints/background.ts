import { fetchFeeData } from '@/utils/api';
import { getUserSettings, cacheFeeData } from '@/utils/storage';
import { createBadgeConfig, updateBadge, setBadgeError } from '@/utils/badge';
import { shouldSendNotification, sendFeeAlert } from '@/utils/notifications';
import { ALARM_NAME, API_CONFIG } from '@/utils/constants';

export default defineBackground(() => {
  console.log('BTC Fee Tracker background script loaded');
  
  // Initialize on extension startup
  initializeExtension();
  
  // Handle alarm events for periodic updates
  browser.alarms.onAlarm.addListener(handleAlarm);
  
  // Handle extension installation/update
  browser.runtime.onInstalled.addListener(handleInstalled);
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
async function handleInstalled(details: any) {
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
    
    // Create new alarm (every 30 seconds)
    await browser.alarms.create(ALARM_NAME, {
      delayInMinutes: 0.5, // 30 seconds
      periodInMinutes: 0.5, // 30 seconds
    });
    
    console.log('Update alarm created successfully');
  } catch (error) {
    console.error('Failed to create update alarm:', error);
  }
}

/**
 * Handle alarm events
 */
async function handleAlarm(alarm: any) {
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
async function updateBadgeDisplay(feeData: any) {
  try {
    const settings = await getUserSettings();
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
async function checkAndSendNotification(feeData: any) {
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
