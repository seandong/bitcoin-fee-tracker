import React, { useState, useEffect } from 'react';
import { getUserSettings, updateSetting } from '@/utils/storage';
import { getNotificationPermission, isNotificationSupported, sendTestNotification } from '@/utils/notifications';
import { Icons } from '@/utils/icons';
import type { StorageData } from '@/utils/types';

function App() {
  const [settings, setSettings] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const [inputValue, setInputValue] = useState<string>('');


  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if (isNotificationSupported()) {
      const permission = await getNotificationPermission();
      setNotificationPermission(permission);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getUserSettings();
      setSettings(userSettings);
      // Set input value to show current threshold or empty
      setInputValue(userSettings.alertThreshold ? userSettings.alertThreshold.toString() : '');
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdChange = async (threshold: number | undefined) => {
    if (!settings) return;
    
    setSaving(true);
    const success = await updateSetting('alertThreshold', threshold);
    
    if (success) {
      setSettings({ ...settings, alertThreshold: threshold });
      showSavedMessage();
    }
    setSaving(false);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const value = inputValue.trim();
    if (value === '') {
      // Clear the threshold if input is empty
      handleThresholdChange(undefined);
    } else {
      const threshold = parseInt(value, 10);
      if (threshold && threshold > 0 && threshold <= 1000) {
        handleThresholdChange(threshold);
      } else {
        // Reset to current value if invalid
        setInputValue(settings?.alertThreshold ? settings.alertThreshold.toString() : '');
      }
    }
  };

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="alert-container">
        <div className="loading">
          <Icons.Loader2 size={32} color="var(--primary)" className="loading-spinner" />
          <p>Loading alert settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="alert-container">
        <div className="error">
          <p>Failed to load settings</p>
          <button onClick={loadSettings} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-container">
      <header className="alert-header">
        <div className="header-content">
          <Icons.Bell size={20} color="var(--text-tertiary)" weight="regular" />
          <div className="header-text">
            <h1>Alert Settings</h1>
            <p className="header-subtitle">Configure Bitcoin fee notifications</p>
          </div>
        </div>
        {saved && (
          <div className="save-indicator">
            <Icons.CheckCircle size={16} color="#10B981" weight="fill" />
            <span>Saved</span>
          </div>
        )}
      </header>

      <div className="alert-content">
        <section className="setting-section primary-section">
          <div className="setting-card">
            <h2>Fee Alert Threshold</h2>
            <p className="setting-description">
              Receive instant notifications when Bitcoin network fees drop to or below your target threshold
            </p>
            
            {notificationPermission === 'denied' && (
              <div className="permission-banner warning">
                <span>⚠️ Notifications are disabled. Enable them in browser settings.</span>
              </div>
            )}
            
            <div className="threshold-control">
              <div className="threshold-input-wrapper">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="Enter threshold"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleInputBlur}
                  disabled={saving}
                  className="threshold-input"
                />
                <div className="input-suffix">
                  <span className="threshold-unit">sat/vB</span>
                </div>
              </div>
              
              {settings.alertThreshold && (
                <button 
                  onClick={async () => {
                    try {
                      if (notificationPermission !== 'granted') {
                        alert('❌ Notifications not permitted.\n\nPlease:\n1. Enable notifications in browser settings\n2. Check Chrome notification settings: chrome://settings/content/notifications\n3. Ensure Chrome notifications are enabled in your OS settings');
                        return;
                      }

                      // Send test notification
                      const success = await sendTestNotification(settings.alertThreshold!);
                      
                      if (success) {
                        alert('✅ Test notification sent successfully!\n\nThe notification should appear in your system tray.');
                      } else {
                        alert('⚠️ Notification test failed!\n\nPlease check:\n1. Notification permissions in Chrome settings\n2. OS notification settings for Chrome\n3. Do Not Disturb / Focus mode is disabled');
                      }
                    } catch (error) {
                      console.error('❌ Notification test failed:', error);
                      alert(`❌ Notification test failed:\n${(error as Error).message}`);
                    }
                  }}
                  className="test-btn"
                  disabled={saving}
                >
                  Test
                </button>
              )}
            </div>
            
            {settings.alertThreshold && (
              <div className="threshold-display">
                <span>✓ Alert enabled for fees ≤ {settings.alertThreshold} sat/vB</span>
              </div>
            )}
          </div>
        </section>

        <div className="troubleshoot-section">
          <h3>Notification not working?</h3>
          <div className="troubleshoot-list">
            <p>• Check Chrome settings: <a href="#" onClick={(e) => { e.preventDefault(); browser.tabs.create({ url: 'chrome://settings/content/notifications' }); }}>chrome://settings/content/notifications</a></p>
            <p>• Enable notifications in your system settings for Chrome</p>
            <p>• Turn off Do Not Disturb / Focus mode</p>
            <p>• Restart Chrome after changing settings</p>
          </div>
        </div>

        {saving && (
          <div className="saving-overlay">
            <div className="saving-message">
              <Icons.Loader2 size={16} color="var(--primary)" className="loading-spinner small" />
              Saving...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;