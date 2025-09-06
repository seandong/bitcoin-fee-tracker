import type { FeeData, ApiResponse, BlockData, MempoolData, FeeRange } from './types';
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

/**
 * Fetch mempool blocks data to get fee range for next block
 */
export async function fetchMempoolData(): Promise<ApiResponse<any>> {
  const timestamp = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/fees/mempool-blocks`,
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
    
    // Validate response data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid mempool blocks data structure');
    }
    
    return {
      success: true,
      data: data[0], // First block is the next block (block 0)
      timestamp,
    };
  } catch (error) {
    console.error('Failed to fetch mempool blocks data:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

/**
 * Calculate fee range for next block (block 0) from mempool blocks data
 * Uses mempool.space's mempool-blocks API which provides accurate fee ranges
 */
export function calculateNextBlockFeeRange(blockData: any): FeeRange {
  if (!blockData || !Array.isArray(blockData.feeRange) || blockData.feeRange.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const feeRange = blockData.feeRange;
  const minFee = feeRange[0]; // First element is minimum fee
  const maxFee = feeRange[feeRange.length - 1]; // Last element is maximum fee
  
  return { 
    min: minFee, 
    max: maxFee 
  };
}