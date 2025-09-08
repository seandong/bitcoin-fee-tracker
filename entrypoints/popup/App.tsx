import { useState, useEffect } from 'react';
import { getUserSettings, getCachedFeeData } from '@/utils/storage';
import { PRIORITIES, TIME_CONSTANTS } from '@/utils/constants';
import { getFeeLevel } from '@/utils/badge';
import { isOnline, addNetworkStatusListener, testNetworkConnection } from '@/utils/network';
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
    // Check initial network status with actual connectivity test
    const checkInitialNetwork = async () => {
      const connected = await testNetworkConnection();
      setIsOffline(!connected);
      if (!connected) {
        setError('You are offline. Please check your internet connection.');
      }
    };
    
    checkInitialNetwork();
    
    loadData();
    loadBlockHeight();
    loadNextBlockFeeRange();
    

    // Set up network status monitoring
    const cleanupNetworkListener = addNetworkStatusListener(
      () => {
        console.log('Network came back online');
        setIsOffline(false);
        // Auto-refresh data when coming back online
        loadData();
        loadBlockHeight();
        loadNextBlockFeeRange();
      },
      () => {
        console.log('Network went offline');
        setIsOffline(true);
        setError('You are offline. Please check your internet connection.');
      }
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

      // Check network status first
      const online = isOnline();
      setIsOffline(!online);

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
        if (online) {
          setError('No fee data available yet. Please wait for initial data fetch.');
        } else {
          setError('You are offline. Please check your internet connection.');
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      const online = isOnline();
      setIsOffline(!online);
      
      if (online) {
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
      if (!isOnline()) {
        setIsOffline(true);
        return;
      }
      const response = await fetchBlockHeight();
      if (response.success && response.data) {
        setBlockHeight(response.data.height);
      }
    } catch (error) {
      console.error('Failed to load block height:', error);
      if (!isOnline()) {
        setIsOffline(true);
        setError('You are offline. Please check your internet connection.');
      }
    }
  };

  const loadNextBlockFeeRange = async () => {
    try {
      if (!isOnline()) {
        setIsOffline(true);
        return;
      }
      const response = await fetchMempoolData();
      if (response.success && response.data) {
        const feeRange = calculateNextBlockFeeRange(response.data);
        setNextBlockFeeRange(feeRange);
      }
    } catch (error) {
      console.error('Failed to load next block fee range:', error);
      if (!isOnline()) {
        setIsOffline(true);
        setError('You are offline. Please check your internet connection.');
      }
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
    
    if (diffSecs < TIME_CONSTANTS.JUST_NOW_THRESHOLD_SECONDS) return 'just now';
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

  const formatGasRangeValue = (value: number): string => {
    if (value >= 100) {
      return Math.round(value).toString();
    }
    // For values < 100, show up to 1 decimal place but remove trailing zeros
    return value.toFixed(1).replace(/\.0$/, '');
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
    if (!settings || !settings.badgeVisible) return 'var(--badge-disabled)';
    
    switch (settings.selectedPriority) {
      case 'hourFee':      // Low priority = Green (low fees, good value)
        return 'var(--fee-low)';
      case 'halfHourFee':  // Medium priority = Amber (balanced)
        return 'var(--fee-medium)';
      case 'fastestFee':   // High priority = Red (high fees, expensive)
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

  if (error || !feeData || isOffline) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1><img src="/icon/32.png" alt="BTC Fee Tracker" style={{ width: 18, height: 18 }} /> BTC Fee Tracker</h1>
          <button className="settings-btn" onClick={openOptions} title="Open Settings">
            <Icons.Settings size={18} color="var(--text-secondary)" />
          </button>
        </div>
        <div className="error-state">
          <div className="error-content">
            <div className="error-icon">
              {isOffline ? (
                <Icons.WifiOff size={24} color="#708070" />
              ) : (
                <Icons.AlertTriangle size={24} color="#708070" />
              )}
            </div>
            <div className="error-text">
              <h3>{isOffline ? 'You\'re offline' : 'Unable to load fee data'}</h3>
              <p>
                {error || (isOffline 
                  ? 'Please check your internet connection and try again.' 
                  : 'There seems to be an issue loading Bitcoin fee data.'
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setError(null);
              loadData(true);
            }}
            className="retry-btn"
            disabled={isOffline}
          >
            {isOffline ? 'Waiting for connection...' : 'Try Again'}
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
          {settings?.alertThreshold ? (
            <button 
              className="alert-threshold-header" 
              onClick={openAlertSettings}
              title={`Alert: ≤${settings.alertThreshold} sat/vB - click to modify fee alert threshold`}
            >
              <span className="alert-threshold-value">≤{settings.alertThreshold} sat/vB</span>
            </button>
          ) : (
            <button 
              className="alert-btn" 
              onClick={openAlertSettings} 
              title="Set fee alert threshold"
            >
              <Icons.Bell 
                size={16} 
                color="currentColor"
                weight="regular"
              />
            </button>
          )}
          <button className="settings-btn" onClick={openOptions} title="Settings">
            <Icons.Settings size={16} color="currentColor" weight="regular" />
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="fee-cards">
          {PRIORITIES.map((priority, index) => {
            const feeValue = feeData[priority.key];
            const level = getFeeLevel(feeValue);
            const isSelected = settings?.selectedPriority === priority.key && settings?.badgeVisible;
            
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
      </div>

      <div className="block-footer">
        <div 
          className="next-block-values"
          title={nextBlockFeeRange ? `Next block: ${formatGasRangeValue(nextBlockFeeRange.min)}-${formatGasRangeValue(nextBlockFeeRange.max)} sat/vB` : "Loading next block fees..."}
        >
          <span className="next-block-range">
            {loading && !nextBlockFeeRange ? (
              <Icons.Loader2 size={10} color="currentColor" className="loading-spinner" />
            ) : nextBlockFeeRange ? (
              `${formatGasRangeValue(nextBlockFeeRange.min)} ~ ${formatGasRangeValue(nextBlockFeeRange.max)} sat/vB`
            ) : (
              'Loading...'
            )}
          </span>
        </div>
        <div className="divider"></div>
        <div 
          className="block-height"
          title={loading ? 'Loading...' : blockHeight ? `Current block: #${blockHeight.toLocaleString()}` : 'Loading...'}
        >
          <span className="block-number">
            {loading ? (
              <Icons.Loader2 size={10} color="currentColor" className="loading-spinner" />
            ) : blockHeight ? (
              blockHeight.toLocaleString()
            ) : (
              'Loading...'
            )}
          </span>
        </div>
        <button 
          className="info-btn-inline" 
          onClick={() => browser.tabs.create({ url: 'https://mempool.space' })}
          title={`Data from Mempool.space${lastUpdate ? ` • ${formatTimeAgo(lastUpdate)}` : ''}`}
        >
          <Icons.ExternalLink 
            size={14} 
            color="currentColor"
            weight="regular"
          />
        </button>
      </div>
    </div>
  );
}

export default App;
