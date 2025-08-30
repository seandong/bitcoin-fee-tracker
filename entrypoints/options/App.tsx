import React, { useState, useEffect } from 'react';
import { getUserSettings, updateSetting } from '@/utils/storage';
import { PRIORITIES, THEMES } from '@/utils/constants';
// import { Icons } from '@/utils/icons';
import type { StorageData, Priority, ThemeMode } from '@/utils/types';

function App() {
  const [settings, setSettings] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.theme) {
      applyTheme(settings.theme);
    }
  }, [settings?.theme]);

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

  const handleThemeChange = async (theme: ThemeMode) => {
    if (!settings) return;
    
    setSaving(true);
    const success = await updateSetting('theme', theme);
    
    if (success) {
      setSettings({ ...settings, theme });
      applyTheme(theme);
      showSavedMessage();
    }
    setSaving(false);
  };

  const applyTheme = (theme: ThemeMode) => {
    const html = document.documentElement;
    
    if (theme === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }
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
        {/* Badge Priority Section */}
        <section className="setting-section">
          <h2>Badge Display</h2>
          <div className="setting-group">
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
                    <strong>{priority.name}</strong> {priority.description}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="setting-section">
          <h2>Theme</h2>
          <div className="setting-group">
            <p className="setting-description">
              Choose interface appearance
            </p>
            <div className="radio-group">
              {THEMES.map((theme) => (
                <label key={theme.key} className="radio-option">
                  <input
                    type="radio"
                    name="theme"
                    value={theme.key}
                    checked={settings.theme === theme.key}
                    onChange={() => handleThemeChange(theme.key)}
                    disabled={saving}
                  />
                  <span className="radio-label">
                    <strong>{theme.name}</strong>
                  </span>
                </label>
              ))}
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