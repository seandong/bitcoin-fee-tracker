import React from 'react';
import {
  Lightning,
  Gear,
  Bell,
  BellRinging,
  SpinnerGap,
  Clock,
  ArrowClockwise,
  WifiHigh,
  WifiX,
  WifiMedium,
  Warning,
  Info,
  CaretUp,
  CaretDown,
  ArrowSquareOut,
  CheckCircle,
  CurrencyBtc,
  Broadcast,
  ChartLine,
  ShieldCheck,
  ShieldWarning,
  Desktop,
  ComputerTower,
  Devices,
  Wrench,
  AppleLogo,
  WindowsLogo,
  LinuxLogo,
  BookOpen,
  Equals,
  XCircle,
} from '@phosphor-icons/react';

// Phosphor Icons wrapper with consistent theming
interface IconProps {
  size?: number | string;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

// Icon component factory for consistent styling
const createIcon = (PhosphorIcon: React.ComponentType<any>) => {
  return ({ size = 16, color = 'currentColor', weight = 'regular', className = '', ...props }: IconProps) => (
    <PhosphorIcon 
      size={size}
      color={color}
      weight={weight}
      className={className}
      {...props}
    />
  );
};

/**
 * Professional Icon Set for BTC Fee Tracker
 * Using Phosphor Icons for clean, modern design
 */
export const Icons = {
  // Lightning/Zap for fee tracker - using Lightning bolt
  Zap: createIcon(Lightning),
  
  // Settings - using Gear
  Settings: createIcon(Gear),
  
  // Bell for notifications
  Bell: createIcon(Bell),
  BellRinging: createIcon(BellRinging),
  
  // Loading spinner - using SpinnerGap for smooth rotation
  Loader2: createIcon(SpinnerGap),
  
  // Clock for timestamps
  Clock: createIcon(Clock),
  
  // Refresh - using ArrowClockwise
  RefreshCcw: createIcon(ArrowClockwise),
  RefreshCw: createIcon(ArrowClockwise),
  
  // Network status
  Wifi: createIcon(WifiHigh),
  WifiOff: createIcon(WifiX),
  Signal: createIcon(WifiMedium),
  
  // Alerts and info
  AlertTriangle: createIcon(Warning),
  Warning: createIcon(Warning),
  Info: createIcon(Info),
  
  // Arrows - using CaretUp/Down for better visual balance
  ArrowUp: createIcon(CaretUp),
  ArrowDown: createIcon(CaretDown),
  Equals: createIcon(Equals),
  
  // External link
  ExternalLink: createIcon(ArrowSquareOut),
  
  // Additional icons for alert settings
  CheckCircle: createIcon(CheckCircle),
  CurrencyBtc: createIcon(CurrencyBtc),
  Broadcast: createIcon(Broadcast),
  Activity: createIcon(ChartLine),
  Shield: createIcon(ShieldCheck),
  ShieldWarning: createIcon(ShieldWarning),
  Desktop: createIcon(Desktop),
  DesktopTower: createIcon(ComputerTower),
  Devices: createIcon(Devices),
  Wrench: createIcon(Wrench),
  AppleLogo: createIcon(AppleLogo),
  WindowsLogo: createIcon(WindowsLogo),
  LinuxLogo: createIcon(LinuxLogo),
  Book: createIcon(BookOpen),
  XCircle: createIcon(XCircle),
};