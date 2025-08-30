# Chrome Extension Notification Troubleshooting Guide

## Quick Diagnosis

If notifications aren't appearing despite successful API calls, the issue is likely at the Chrome or OS level.

## Common Solutions

### 1. Chrome Browser Settings

#### Enable Chrome Notifications:
1. Open Chrome Settings: `chrome://settings/content/notifications`
2. Ensure "Sites can ask to send notifications" is ON
3. Check that the extension isn't in the "Block" list
4. Add the extension to the "Allow" list if needed

#### Reset Chrome Notification Settings:
1. Navigate to: `chrome://settings/content/notifications`
2. Click "Remove all" under blocked sites
3. Restart Chrome

### 2. Operating System Settings

#### macOS
1. **System Settings → Notifications → Google Chrome**
   - Enable "Allow Notifications"
   - Choose alert style (Banners or Alerts)
   - Enable "Show in Notification Center"
   - Enable "Play sound for notifications"

2. **Check Focus/Do Not Disturb:**
   - Click Control Center (top-right menu bar)
   - Ensure Focus/Do Not Disturb is OFF
   - Or add Chrome to allowed apps in Focus settings

3. **Reset Notification Permissions:**
   ```bash
   # Terminal command to reset Chrome notifications
   tccutil reset Notifications com.google.Chrome
   ```

#### Windows 10/11
1. **Settings → System → Notifications**
   - Turn ON "Get notifications from apps"
   - Find Google Chrome in the list
   - Toggle Chrome notifications ON
   - Click Chrome and ensure all sub-options are enabled

2. **Check Focus Assist:**
   - Settings → System → Focus assist
   - Set to "Off" or add Chrome to priority list

3. **Action Center:**
   - Ensure notifications aren't hidden in Action Center
   - Clear any accumulated notifications

#### Linux (Ubuntu/GNOME)
1. **Settings → Notifications**
   - Find Chrome/Chromium
   - Enable notifications
   - Check "Show Banners" and "Show in Lock Screen"

2. **For KDE Plasma:**
   - System Settings → Notifications
   - Application Settings → Chrome
   - Enable all notification types

### 3. Chrome Extension Specific

#### Verify Extension Permissions:
1. Go to: `chrome://extensions`
2. Find "BTC Fee Tracker"
3. Click "Details"
4. Ensure "Display notifications" is listed under Permissions

#### Test Chrome Notification API:
1. Open DevTools Console (F12)
2. Go to the extension's background page
3. Run this test:
   ```javascript
   chrome.notifications.create('test', {
     type: 'basic',
     iconUrl: '/icon/128.png',
     title: 'Test',
     message: 'Testing notifications'
   }, (id) => console.log('Created:', id));
   ```

### 4. Advanced Troubleshooting

#### Check Chrome Flags:
1. Navigate to: `chrome://flags`
2. Search for "notifications"
3. Ensure no notification-related flags are disabled
4. Reset all flags if unsure

#### Clear Chrome Cache:
1. `chrome://settings/privacy`
2. Clear browsing data
3. Select "Cookies and other site data"
4. Restart Chrome

#### Check Background Apps:
1. `chrome://settings/system`
2. Try toggling "Continue running background apps when Google Chrome is closed"

#### Verify No Conflicting Extensions:
1. Disable all other extensions temporarily
2. Test notifications
3. Re-enable extensions one by one to find conflicts

### 5. Alternative Solutions

If Chrome notifications still don't work:

#### Use Chrome's Built-in Alert:
- The extension will fall back to using `alert()` for critical notifications
- Less elegant but ensures you don't miss important fee alerts

#### Check Extension Logs:
1. Go to: `chrome://extensions`
2. Enable "Developer mode"
3. Click "background page" or "service worker"
4. Check Console for errors

#### Reinstall Extension:
1. Export your settings (if applicable)
2. Remove extension
3. Restart Chrome
4. Reinstall extension
5. Re-grant permissions

## Testing Your Setup

After making changes:
1. Restart Chrome completely
2. Open the extension's Alert Settings
3. Set a threshold higher than current fees
4. Click "Test" button
5. Check console for detailed diagnostics

## Still Not Working?

If notifications still don't appear:
1. The issue is likely OS-level Chrome permissions
2. Try testing with another notification-enabled extension
3. Consider using a different Chrome profile
4. Report the issue with diagnostic info from the console

## Diagnostic Information to Collect

When reporting issues, include:
- Chrome version (chrome://version)
- Operating System and version
- Console output from notification test
- Screenshot of chrome://settings/content/notifications
- Any errors in chrome://extensions page