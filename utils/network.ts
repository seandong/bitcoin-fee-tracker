/**
 * Network status utilities
 */

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
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