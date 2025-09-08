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
 * Get badge colors for fee level
 */
export function getBadgeColors(level: FeeLevel): { text: string; background: string } {
  switch (level) {
    case 'low':
      return { text: BADGE_COLORS.LOW, background: BADGE_COLORS.LOW_BG };
    case 'medium':
      return { text: BADGE_COLORS.MEDIUM, background: BADGE_COLORS.MEDIUM_BG };
    case 'high':
      return { text: BADGE_COLORS.HIGH, background: BADGE_COLORS.HIGH_BG };
    default:
      return { text: BADGE_COLORS.ERROR, background: BADGE_COLORS.ERROR_BG };
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
 * Get level based on priority selection (consistent color mapping)
 */
export function getLevelForPriority(priority: Priority): FeeLevel {
  switch (priority) {
    case 'hourFee':      // Low priority = Green (low fees, good value)
      return 'low';
    case 'halfHourFee':  // Medium priority = Amber (balanced)
      return 'medium';
    case 'fastestFee':   // High priority = Red (high fees, expensive)
      return 'high';
    default:
      return 'medium';
  }
}

/**
 * Create badge configuration for fee data
 */
export function createBadgeConfig(feeData: FeeData, priority: Priority): BadgeConfig {
  const feeValue = feeData[priority];
  const text = formatBadgeText(feeValue);
  // Use priority-based level for color, not fee value threshold
  const level = getLevelForPriority(priority);
  const colors = getBadgeColors(level);
  
  return {
    text,
    color: colors.text,
    backgroundColor: colors.background,
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
    
    // Set badge background color to match priority label style
    await browser.action.setBadgeBackgroundColor({ 
      color: badgeConfig.backgroundColor || BADGE_COLORS.ERROR_BG
    });
    
    // Set text color to white for better contrast on colored backgrounds
    await browser.action.setBadgeTextColor({
      color: '#FFFFFF'  // White text for all backgrounds
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
      color: BADGE_COLORS.ERROR_BG
    });
    
    await browser.action.setBadgeTextColor({
      color: '#FFFFFF'  // White text for consistency
    });
    
    return true;
  } catch (error) {
    console.error('Failed to set badge error state:', error);
    return false;
  }
}