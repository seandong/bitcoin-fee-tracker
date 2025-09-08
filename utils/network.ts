/**
 * Network status utilities
 */
import { TIME_CONSTANTS } from './constants';

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Test actual network connectivity by making a lightweight request to mempool.space
 */
export async function testNetworkConnection(): Promise<boolean> {
  if (!navigator.onLine) {
    return false;
  }
  
  try {
    // Use a lightweight endpoint from the same API we use for fee data
    const response = await fetch('https://mempool.space/api/blocks/tip/height', {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache',
      signal: AbortSignal.timeout(TIME_CONSTANTS.NETWORK_TEST_TIMEOUT_MS)
    });
    return response.ok;
  } catch (error) {
    console.log('Network connectivity test failed:', error);
    return false;
  }
}

/**
 * Wait for online status
 */
export function waitForOnline(timeout: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', handleOnline);
      resolve(false);
    }, timeout);

    const handleOnline = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      resolve(true);
    };

    window.addEventListener('online', handleOnline);
  });
}

/**
 * Add network status listeners
 */
export function addNetworkStatusListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}