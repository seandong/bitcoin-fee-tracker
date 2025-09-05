# Chrome Web Store Release Checklist

## Pre-Release Testing
- [ ] Test popup functionality
  - [ ] Fee data loads correctly
  - [ ] Updates every 30 seconds
  - [ ] Theme switching works
  - [ ] Settings button opens options page
  - [ ] Alert button opens alert settings
  
- [ ] Test alert functionality
  - [ ] Threshold can be set and saved
  - [ ] Notifications appear when threshold is met
  - [ ] Clear threshold works
  
- [ ] Test badge display
  - [ ] Shows correct fee value
  - [ ] Updates with priority changes
  - [ ] Color coding is correct
  
- [ ] Test offline behavior
  - [ ] Shows cached data when offline
  - [ ] Displays offline message
  - [ ] Auto-reconnects when online

## Build Production Version

1. **Clean build directory**
   ```bash
   rm -rf .output
   ```

2. **Build for Chrome**
   ```bash
   npm run build
   ```

3. **Create distribution package**
   ```bash
   npm run zip
   ```
   This creates a `.output/chrome-mv3.zip` file

## Chrome Web Store Submission

### Developer Account
- [ ] Register as Chrome Web Store developer ($5 one-time fee)
- [ ] Complete identity verification

### Prepare Assets
- [ ] Create 128x128 icon (already have: `/public/icon/128.png`)
- [ ] Create 440x280 promotional tile
- [ ] Take 5 screenshots (1280x800 or 640x400):
  1. Main popup view
  2. Alert settings
  3. Notification example  
  4. Light/dark theme comparison
  5. Badge on toolbar

### Store Listing
- [ ] Fill in extension name: "Bitcoin Fee Tracker"
- [ ] Add short description (132 chars max)
- [ ] Add detailed description (use STORE_LISTING.md)
- [ ] Select category: Productivity
- [ ] Add keywords (5 max)
- [ ] Upload screenshots
- [ ] Upload promotional images

### Privacy & Compliance
- [ ] Host privacy policy online
- [ ] Add privacy policy URL to listing
- [ ] Fill permission justifications
- [ ] Add support email
- [ ] Select distribution regions (all)

### Final Steps
- [ ] Upload `.output/chrome-mv3.zip`
- [ ] Set visibility (Public or Unlisted for testing)
- [ ] Submit for review

## Post-Submission
- Review typically takes 1-3 business days
- May need to respond to reviewer feedback
- Once approved, extension will be live

## Important Notes
- Keep version numbers consistent across `package.json` and `wxt.config.ts`
- Test the packaged .zip file before submission
- Save all store assets for future updates
- Document any reviewer feedback for next release

## Update Process
For future updates:
1. Increment version in `package.json` and `wxt.config.ts`
2. Build and test new version
3. Create new .zip package
4. Upload through Chrome Web Store Developer Dashboard
5. Update screenshots if UI changed
6. Submit for review