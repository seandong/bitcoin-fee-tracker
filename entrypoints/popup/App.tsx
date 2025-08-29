import { useState, useEffect } from 'react';
import { getUserSettings, getCachedFeeData } from '@/utils/storage';
import { PRIORITIES, THEME_COLORS } from '@/utils/constants';
import { getFeeLevel } from '@/utils/badge';
import type { FeeData, StorageData, Priority } from '@/utils/types';
import './App.css';

function App() {
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [settings, setSettings] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userSettings, cachedFeeData] = await Promise.all([
        getUserSettings(),
        getCachedFeeData(),
      ]);

      setSettings(userSettings);
      setFeeData(cachedFeeData);
      
      if (userSettings.lastUpdate) {
        setLastUpdate(new Date(userSettings.lastUpdate));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  const openOptions = () => {
    browser.runtime.openOptionsPage();
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const getFeeStatusMessage = (): string => {
    if (!feeData || !settings) return '';
    
    const selectedFee = feeData[settings.selectedPriority];
    const level = getFeeLevel(selectedFee);
    
    switch (level) {
      case 'low':
        return 'Fees are low - great time for transactions!';
      case 'medium':
        return 'Fees are moderate - good time for transactions';
      case 'high':
        return 'Fees are high - consider waiting if possible';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1>⚡ BTC Fee Tracker</h1>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading fee data...</p>
        </div>
      </div>
    );
  }

  if (error || !feeData) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1>⚡ BTC Fee Tracker</h1>
          <button className="settings-btn" onClick={openOptions}>⚙️</button>
        </div>
        <div className="error">
          <p>⚠️ {error || 'No fee data available'}</p>
          <button onClick={loadData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>⚡ BTC Fee Tracker</h1>
        <button className="settings-btn" onClick={openOptions}>⚙️</button>
      </div>

      <div className="fee-cards">
        {PRIORITIES.map((priority) => {
          const feeValue = feeData[priority.key];
          const level = getFeeLevel(feeValue);
          const isSelected = settings?.selectedPriority === priority.key;
          
          return (
            <div 
              key={priority.key}
              className={`fee-card ${level} ${isSelected ? 'selected' : ''}`}
            >
              <div className="fee-indicator">
                {level === 'low' && '🟢'}
                {level === 'medium' && '🟡'}
                {level === 'high' && '🔴'}
              </div>
              <div className="fee-value">{Math.round(feeValue)}</div>
              <div className="fee-unit">sat/vB</div>
              <div className="fee-label">{priority.description}</div>
              {isSelected && <div className="selected-indicator">↑</div>}
            </div>
          );
        })}
      </div>

      <div className="status-section">
        <div className="status-message">
          💡 {getFeeStatusMessage()}
        </div>
        {lastUpdate && (
          <div className="last-update">
            🕒 Updated {formatTimeAgo(lastUpdate)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
