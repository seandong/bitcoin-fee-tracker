import React, { useState, useEffect } from 'react';
import { getUserSettings, updateSetting } from '@/utils/storage';
import { PRIORITIES } from '@/utils/constants';
// import { Icons } from '@/utils/icons';
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

  const handleBadgeVisibilityChange = async (visible: boolean) => {
    if (!settings) return;
    
    setSaving(true);
    const success = await updateSetting('badgeVisible', visible);
    
    if (success) {
      setSettings({ ...settings, badgeVisible: visible });
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
        <h1>Settings</h1>
        {saved && <div className="save-indicator">Saved</div>}
      </header>

      <div className="options-content">
        {/* Badge Settings Section */}
        <section className="setting-section">
          <h2>Extension Badge</h2>
          <div className="setting-group">
            <div className="toggle-group">
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={settings.badgeVisible}
                  onChange={(e) => handleBadgeVisibilityChange(e.target.checked)}
                  disabled={saving}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  <strong>Show Badge</strong> - Display fee information on browser toolbar icon
                </span>
              </label>
            </div>
            
            {settings.badgeVisible && (
              <div className="setting-subgroup">
                <p className="setting-description">
                  Select which Bitcoin fee priority to display on your browser toolbar icon. The badge will show the current fee rate and update automatically.
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
                        <strong>{priority.name} Priority</strong> - {priority.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
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