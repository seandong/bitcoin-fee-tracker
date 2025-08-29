import React, { useState, useEffect } from 'react';
import { getUserSettings, updateSetting } from '@/utils/storage';
import { PRIORITIES } from '@/utils/constants';
import type { StorageData, Priority } from '@/utils/types';

function App() {
  const [settings, setSettings] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (priority: Priority) => {
    if (!settings) return;
    
    setSaving(true);
    const success = await updateSetting('selectedPriority', priority);
    
    if (success) {
      setSettings({ ...settings, selectedPriority: priority });
      showSavedMessage();
    }
    setSaving(false);
  };

  const handleNotificationToggle = async () => {
    if (!settings) return;
    
    setSaving(true);
    const newValue = !settings.notificationsEnabled;
    const success = await updateSetting('notificationsEnabled', newValue);
    
    if (success) {
      setSettings({ ...settings, notificationsEnabled: newValue });
      showSavedMessage();
    }
    setSaving(false);
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

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="options-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="options-container">
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
    <div className="options-container">
      <header className="options-header">
        <h1>⚡ BTC Fee Tracker Settings</h1>
        {saved && <div className="save-indicator">✅ Settings saved</div>}
      </header>

      <div className="options-content">
        {/* Badge Priority Section */}
        <section className="setting-section">
          <h2>Display Settings</h2>
          <div className="setting-group">
            <label className="setting-label">Badge Priority</label>
            <p className="setting-description">
              Choose which fee level to display on the extension icon
            </p>
            <div className="radio-group">
              {PRIORITIES.map((priority) => (
                <label key={priority.key} className="radio-option">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.key}
                    checked={settings.selectedPriority === priority.key}
                    onChange={() => handlePriorityChange(priority.key)}
                    disabled={saving}
                  />
                  <span className="radio-label">
                    <strong>{priority.name}</strong>
                    <br />
                    <small>{priority.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="setting-section">
          <h2>Notifications</h2>
          <div className="setting-group">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={handleNotificationToggle}
                disabled={saving}
              />
              Enable fee notifications
            </label>
            <p className="setting-description">
              Get notified when Bitcoin fees drop below your threshold
            </p>
          </div>

          {settings.notificationsEnabled && (
            <div className="setting-group">
              <label className="setting-label">Alert Threshold</label>
              <p className="setting-description">
                Send notification when fees drop below this value (sat/vB)
              </p>
              <div className="threshold-input">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="Enter threshold (e.g., 15)"
                  value={settings.alertThreshold || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const threshold = value ? parseInt(value, 10) : undefined;
                    if (threshold && threshold > 0 && threshold <= 1000) {
                      handleThresholdChange(threshold);
                    } else if (!value) {
                      handleThresholdChange(undefined);
                    }
                  }}
                  disabled={saving}
                />
                <span className="threshold-unit">sat/vB</span>
              </div>
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="setting-section">
          <h2>About</h2>
          <div className="setting-group">
            <div className="about-info">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Data Source:</strong> mempool.space</p>
              <p><strong>Update Frequency:</strong> Every 30 seconds</p>
            </div>
          </div>
        </section>

        {saving && (
          <div className="saving-overlay">
            <div className="saving-message">
              <div className="loading-spinner small"></div>
              Saving...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;