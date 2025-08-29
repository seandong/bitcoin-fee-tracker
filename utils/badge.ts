import type { FeeData, Priority, FeeLevel, BadgeConfig } from './types';
import { FEE_THRESHOLDS, BADGE_COLORS, DEFAULT_SETTINGS } from './constants';

/**
 * Determine fee level based on value
 */
export function getFeeLevel(feeValue: number): FeeLevel {
  if (feeValue < FEE_THRESHOLDS.LOW) {
    return 'low';
  } else if (feeValue <= FEE_THRESHOLDS.HIGH) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Get badge color for fee level
 */
export function getBadgeColor(level: FeeLevel): string {
  switch (level) {
    case 'low':
      return BADGE_COLORS.LOW;
    case 'medium':
      return BADGE_COLORS.MEDIUM;
    case 'high':
      return BADGE_COLORS.HIGH;
    default:
      return BADGE_COLORS.ERROR;
  }
}

/**
 * Format fee value for badge display
 */
export function formatBadgeText(feeValue: number): string {
  if (feeValue > DEFAULT_SETTINGS.BADGE_MAX_VALUE) {
    return '99+';
  }
  
  return Math.round(feeValue).toString();
}

/**
 * Create badge configuration for fee data
 */
export function createBadgeConfig(feeData: FeeData, priority: Priority): BadgeConfig {
  const feeValue = feeData[priority];
  const level = getFeeLevel(feeValue);
  const text = formatBadgeText(feeValue);
  const color = getBadgeColor(level);
  
  return {
    text,
    color,
    level,
  };
}

/**
 * Update extension badge
 */
export async function updateBadge(badgeConfig: BadgeConfig): Promise<boolean> {
  try {
    // Set badge text
    await browser.action.setBadgeText({ 
      text: badgeConfig.text 
    });
    
    // Set badge background color
    await browser.action.setBadgeBackgroundColor({ 
      color: badgeConfig.color 
    });
    
    return true;
  } catch (error) {
    console.error('Failed to update badge:', error);
    return false;
  }
}

/**
 * Clear badge (show error state)
 */
export async function setBadgeError(): Promise<boolean> {
  try {
    await browser.action.setBadgeText({ 
      text: '?' 
    });
    
    await browser.action.setBadgeBackgroundColor({ 
      color: BADGE_COLORS.ERROR 
    });
    
    return true;
  } catch (error) {
    console.error('Failed to set badge error state:', error);
    return false;
  }
}