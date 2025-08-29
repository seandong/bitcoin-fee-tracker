# BTC Fee Tracker - Product Specification

## Project Overview

BTC Fee Tracker is a Chrome extension that monitors Bitcoin transaction fees in real-time, providing users with current fee information through a dynamic badge system, popup interface, and customizable notifications.

## Core Features

### 1. Real-time Fee Monitoring
- **Data Source**: https://mempool.space/api/v1/fees/recommended
- **Update Interval**: Every 30 seconds
- **Data Structure**:
  ```json
  {
    "fastestFee": 15,    // High priority (fastest confirmation)
    "halfHourFee": 12,   // Medium priority (30-min confirmation)
    "hourFee": 10        // Low priority (1-hour confirmation)
  }
  ```

### 2. Dynamic Badge System
- **Display**: Selected priority fee value on extension icon
- **Color Coding**:
  - Green: < 10 sat/vB (#4CAF50)
  - Yellow: 10-50 sat/vB (#FF9800)  
  - Red: > 50 sat/vB (#F44336)
- **Special Cases**: 
  - Values > 99 display as "99+"
  - API failure displays as "?"

### 3. Popup Interface (400x300px)
- **Layout**: Card-based design showing all three priority levels
- **Content**: 
  - Fee values with priority indicators
  - Current status message
  - Last update timestamp
  - Settings button access
- **Error Handling**: Show cached data with error indicator

### 4. Settings Page (Options)
- **Badge Priority**: Choose which fee level displays on badge (default: Medium)
- **Notifications**: 
  - Enable/disable toggle (default: disabled)
  - Custom threshold setting (sat/vB)
- **About**: Version info and data source attribution

### 5. Smart Notifications
- **Trigger**: When fees drop below user-defined threshold
- **Message**: "BTC手续费已降至 {value} sat/vB，适合交易！"
- **Anti-spam**: Only notify on transition from above→below threshold
- **Permissions**: Requires `notifications` permission

## Technical Specifications

### Architecture
- **Framework**: WXT + React + TypeScript
- **Entry Points**: 
  - Background script (data fetching, badge updates, notifications)
  - Popup (fee display interface)
  - Options (settings configuration)

### Data Management
```typescript
interface FeeData {
  fastestFee: number;
  halfHourFee: number; 
  hourFee: number;
}

interface StorageData {
  selectedPriority: 'fastestFee' | 'halfHourFee' | 'hourFee';
  alertThreshold?: number;
  notificationsEnabled: boolean;
  lastUpdate: number;
  cachedData?: FeeData;
  lastAlertState?: boolean;
}
```

### Default Configuration
- **Badge Display**: Medium priority (`halfHourFee`)
- **Notifications**: Disabled
- **Alert Threshold**: Not set (user configurable)

### Error Handling & Edge Cases
- **API Failure**: 
  - Badge shows "?"
  - Popup displays cached data with error message
- **Network Issues**: Show network disconnection message
- **Cache Strategy**: 5-minute cache validity
- **Initial Load**: Display loading state until first API response
- **Browser Sleep**: Pause timer during browser hibernation

### Performance Requirements
- **Bundle Size**: < 1MB
- **Memory Usage**: < 30MB
- **API Rate**: Strict 30-second intervals
- **Cache Duration**: 5 minutes for failed requests

## Design System

### Visual Identity
- **Primary Color**: Bitcoin Orange (#F7931A)
- **Typography**: Google Fonts - Lexend family
- **Icons**: Lucide Icons (CDN)
- **Theme**: System preference (auto light/dark)
- **Forbidden**: Any purple gradients

### Layout Specifications
```
Popup Layout (400x300px):
┌─────────────────────────────────┐
│ ⚡ BTC Fee Tracker    [⚙️settings]│ 56px header
├─────────────────────────────────┤
│                                 │
│  ┌─────┐   ┌─────┐   ┌─────┐    │ 120px cards
│  │ 🟢  │   │ 🟡  │   │ 🔴  │    │
│  │ 10  │   │ 12  │   │ 15  │    │
│  │sat/vB│   │sat/vB│   │sat/vB│  │
│  │ 1hr │   │30min│   │ fast│    │
│  └─────┘   └─────┘   └─────┘    │
│     ↑         ↑                 │
│  selected  current              │
│                                 │
│ ─────────────────────────────── │
│ 💡 Fees are moderate            │ 48px status
│ 🕒 Updated 2 minutes ago        │ 32px footer
└─────────────────────────────────┘
```

### Color System
```css
/* Bitcoin Theme */
--bitcoin-orange: #F7931A;
--bitcoin-orange-light: #FFB84D;
--bitcoin-orange-dark: #E8841A;

/* Fee Status Colors */
--fee-low: #4CAF50;
--fee-medium: #FF9800;  
--fee-high: #F44336;

/* System Colors (Light/Dark Auto) */
--bg-primary: #FFFFFF / #0F172A;
--bg-secondary: #F8FAFC / #1E293B;
--text-primary: #1E293B / #F1F5F9;
--text-secondary: #64748B / #94A3B8;
--border-color: #E2E8F0 / #334155;
```

## Chrome Extension Configuration

### Permissions Required
```json
{
  "permissions": ["storage", "notifications"],
  "host_permissions": ["https://mempool.space/*"]
}
```

### Manifest Configuration
- **Version**: Manifest V3
- **Name**: BTC Fee Tracker
- **Description**: Bitcoin transaction fee tracker Chrome extension
- **Version**: 1.0.0

## User Experience Flow

### First Time Setup
1. Install extension
2. Default badge shows medium priority fees
3. Popup explains fee levels and access to settings
4. User can optionally configure notifications

### Daily Usage
1. Badge provides at-a-glance fee information with color coding
2. Click popup for detailed fee breakdown
3. Optional notifications for favorable fee conditions
4. Settings adjustment as needed

### Error Recovery
1. Network issues show appropriate error states
2. Cached data available during temporary outages
3. Clear visual indicators for connection problems
4. Automatic recovery when connection restored

## Success Metrics

### Functionality
- ✅ 30-second data refresh accuracy
- ✅ Badge color accuracy based on fee ranges  
- ✅ Notification timing precision
- ✅ Settings persistence across browser sessions

### Performance  
- ✅ Bundle size under 1MB
- ✅ Memory usage under 30MB
- ✅ Fast popup load times (<200ms)
- ✅ Smooth animations and transitions

### User Experience
- ✅ Intuitive interface requiring no learning curve
- ✅ Accurate fee information display
- ✅ Reliable notification system
- ✅ Professional visual design