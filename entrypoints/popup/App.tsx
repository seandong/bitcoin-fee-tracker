import { useState, useEffect } from 'react';
import { getUserSettings, getCachedFeeData } from '@/utils/storage';
import { PRIORITIES, THEME_COLORS } from '@/utils/constants';
import { getFeeLevel } from '@/utils/badge';
import { isOnline, addNetworkStatusListener } from '@/utils/network';
import { Icons } from '@/utils/icons';
import { fetchBlockHeight, fetchMempoolData, calculateNextBlockFeeRange } from '@/utils/api';
import type { FeeData, StorageData, Priority, FeeRange } from '@/utils/types';
import './App.css';

function App() {
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [settings, setSettings] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [nextBlockFeeRange, setNextBlockFeeRange] = useState<FeeRange | null>(null);


  useEffect(() => {
    loadData();
    loadBlockHeight();
    loadNextBlockFeeRange();
    

    // Set up network status monitoring
    const cleanupNetworkListener = addNetworkStatusListener(
      () => {
        setIsOffline(false);
        // Auto-refresh data when coming back online
        loadData();
        loadBlockHeight();
        loadNextBlockFeeRange();
      },
      () => setIsOffline(true)
    );

    // Set up auto-refresh interval (every 10 seconds)
    const refreshInterval = setInterval(() => {
      if (!isOffline && !loading) {
        loadData();
        loadBlockHeight();
        loadNextBlockFeeRange();
      }
    }, 10000);

    // Update current time every second for accurate "time ago" display
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      cleanupNetworkListener();
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
    };
  }, [isOffline, loading]);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!isInitialized) {
        setLoading(true);
      }
      setError(null);

      const [userSettings, cachedFeeData] = await Promise.all([
        getUserSettings(),
        getCachedFeeData(),
      ]);

      setSettings(userSettings);
      
      if (cachedFeeData) {
        setFeeData(cachedFeeData);
        if (userSettings.lastUpdate) {
          setLastUpdate(new Date(userSettings.lastUpdate));
        }
      } else {
        // No cached data available, but not necessarily an error
        if (isOnline()) {
          setError('No fee data available yet. Please wait for initial data fetch.');
        } else {
          setError('You are offline. Please check your internet connection.');
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      if (isOnline()) {
        setError('Failed to load fee data. Please try again.');
      } else {
        setError('You are offline. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsInitialized(true);
    }
  };

  const loadBlockHeight = async () => {
    try {
      const response = await fetchBlockHeight();
      if (response.success && response.data) {
        setBlockHeight(response.data.height);
      }
    } catch (error) {
      console.error('Failed to load block height:', error);
    }
  };

  const loadNextBlockFeeRange = async () => {
    try {
      const response = await fetchMempoolData();
      if (response.success && response.data) {
        const feeRange = calculateNextBlockFeeRange(response.data);
        setNextBlockFeeRange(feeRange);
      }
    } catch (error) {
      console.error('Failed to load next block fee range:', error);
    }
  };

  const handleManualRefresh = () => {
    if (!isRefreshing && !isOffline) {
      loadData(true);
      loadBlockHeight();
      loadNextBlockFeeRange();
    }
  };

  const openMempool = () => {
    browser.tabs.create({ url: 'https://mempool.space' });
  };

  const openOptions = () => {
    browser.runtime.openOptionsPage();
  };

  const openAlertSettings = () => {
    // 打开新的告警设置页面
    browser.tabs.create({ url: browser.runtime.getURL('/alert-settings.html') });
  };

  const formatTimeAgo = (date: Date): string => {
    const diffMs = currentTime.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 30) return 'just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    return `${diffHours}h ago`;
  };

  const formatFeeValue = (value: number): string => {
    if (value >= 10) {
      return Math.round(value).toString();
    }
    // For values < 10, show up to 2 decimal places but remove trailing zeros
    return value.toFixed(2).replace(/\.?0+$/, '');
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

  const getSelectedPriorityColor = (): string => {
    if (!feeData || !settings) return 'var(--primary)';
    
    const selectedFee = feeData[settings.selectedPriority];
    const level = getFeeLevel(selectedFee);
    
    switch (level) {
      case 'low':
        return 'var(--fee-low)';
      case 'medium':
        return 'var(--fee-medium)';
      case 'high':
        return 'var(--fee-high)';
      default:
        return 'var(--primary)';
    }
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1><img src="/icon/32.png" alt="BTC Fee Tracker" style={{ width: 18, height: 18 }} /> BTC Fee Tracker</h1>
        </div>
        <div className="loading">
          <Icons.Loader2 size={32} color="var(--primary)" className="loading-spinner" />
          <p>Loading fee data...</p>
        </div>
      </div>
    );
  }

  if (error || !feeData) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1><img src="/icon/32.png" alt="BTC Fee Tracker" style={{ width: 18, height: 18 }} /> BTC Fee Tracker</h1>
          <button className="settings-btn" onClick={openOptions} title="Open Settings">
            <Icons.Settings size={18} color="var(--text-secondary)" />
          </button>
        </div>
        <div className="error">
          <p>
            {isOffline ? <Icons.WifiOff size={16} color="var(--fee-high)" /> : <Icons.AlertTriangle size={16} color="var(--fee-medium)" />}
            <span>{error || 'No fee data available'}</span>
          </p>
          {isOffline && (
            <p className="network-status">
              <Icons.Signal size={14} color="var(--fee-high)" />
              <span>Offline</span>
            </p>
          )}
          <button 
            onClick={loadData} 
            className="retry-btn"
            disabled={isOffline}
          >
            {isOffline ? 'Waiting for connection...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container" style={{'--dynamic-border-color': getSelectedPriorityColor()} as React.CSSProperties}>
      <div className="popup-header">
        <h1><img src="/icon/32.png" alt="BTC Fee Tracker" style={{ width: 18, height: 18 }} /> BTC Fee Tracker</h1>
        <div className="header-actions">
          <button 
            className={`alert-btn ${settings?.alertThreshold ? 'alert-active' : ''}`} 
            onClick={openAlertSettings} 
            title={settings?.alertThreshold 
              ? `Alert set for ≤${settings.alertThreshold} sat/vB` 
              : "Set fee alert threshold"
            }
          >
            <Icons.Bell 
              size={16} 
              color="currentColor"
              weight="regular"
            />
          </button>
          <button className="settings-btn" onClick={openOptions} title="Settings">
            <Icons.Settings size={16} color="currentColor" weight="regular" />
          </button>
        </div>
      </div>

      <div className="fee-cards">
        {PRIORITIES.map((priority, index) => {
          const feeValue = feeData[priority.key];
          const level = getFeeLevel(feeValue);
          const isSelected = settings?.selectedPriority === priority.key;
          
          return (
            <div 
              key={priority.key}
              className={`fee-card ${level}`}
              title={`${priority.name}: ${Math.round(feeValue)} sat/vB${isSelected ? ' (currently displayed on badge)' : ''}`}
            >
              <div className="fee-value">{formatFeeValue(feeValue)}</div>
              <div className="fee-unit">sat/vB</div>
              <div className="fee-label">{priority.description}</div>
              {isSelected && (
                <div className="selected-indicator"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="status-section">
        <div className="status-row">
          {lastUpdate && (
            <div className="last-update">
              <Icons.Clock size={12} color="currentColor" weight="regular" />
              <span>Updated {formatTimeAgo(lastUpdate)}</span>
            </div>
          )}
          <div className="combined-info">
            {nextBlockFeeRange && (
              <button 
                className="next-block-values"
                onClick={() => browser.tabs.create({ url: 'https://mempool.space/mempool-block/0' })}
                title="Next block fee range - estimated fees for upcoming Bitcoin block"
              >
                <span className="next-block-label">Next Block</span>
                <span className="next-block-range">{formatFeeValue(nextBlockFeeRange.min)} ~ {formatFeeValue(nextBlockFeeRange.max)} sat/vB</span>
              </button>
            )}
            {nextBlockFeeRange && (blockHeight || loading) && <div className="divider"></div>}
            <button 
              className="block-height" 
              onClick={openMempool}
              title="Open mempool.space"
            >
              <span className="block-label">Block</span>
              <span className="block-number">
                {loading ? (
                  <Icons.Loader2 size={10} color="currentColor" className="loading-spinner" />
                ) : blockHeight ? (
                  blockHeight.toLocaleString()
                ) : (
                  'Loading...'
                )}
              </span>
            </button>
          </div>
          {settings?.alertThreshold && (
            <button 
              className="alert-threshold" 
              onClick={openAlertSettings}
              title="Fee alert threshold - click to modify"
            >
              <span className="alert-threshold-label">Alert</span>
              <span className="alert-threshold-value">≤{settings.alertThreshold} sat/vB</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
