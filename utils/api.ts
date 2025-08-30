import type { FeeData, ApiResponse, BlockData } from './types';
import { API_CONFIG } from './constants';

/**
 * Fetch Bitcoin fee data from mempool.space API
 */
export async function fetchFeeData(): Promise<ApiResponse<FeeData>> {
  const timestamp = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.FEES_ENDPOINT}`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response data structure
    if (!isValidFeeData(data)) {
      throw new Error('Invalid fee data structure received from API');
    }
    
    return {
      success: true,
      data,
      timestamp,
    };
  } catch (error) {
    console.error('Failed to fetch fee data:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

/**
 * Validate fee data structure
 */
function isValidFeeData(data: any): data is FeeData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.fastestFee === 'number' &&
    typeof data.halfHourFee === 'number' &&
    typeof data.hourFee === 'number' &&
    data.fastestFee > 0 &&
    data.halfHourFee > 0 &&
    data.hourFee > 0
  );
}

/**
 * Test API connectivity
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    const result = await fetchFeeData();
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Fetch latest block height from mempool.space API
 */
export async function fetchBlockHeight(): Promise<ApiResponse<BlockData>> {
  const timestamp = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/blocks/tip/height`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const height = await response.json();
    
    // Validate response data
    if (typeof height !== 'number' || height <= 0) {
      throw new Error('Invalid block height received from API');
    }
    
    return {
      success: true,
      data: { height },
      timestamp,
    };
  } catch (error) {
    console.error('Failed to fetch block height:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}