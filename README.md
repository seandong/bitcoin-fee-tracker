# Bitcoin Fee Tracker

A minimalist Chrome extension for real-time Bitcoin network fee monitoring with smart alerts.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/Chrome-88%2B-brightgreen)

## Features

### 🚀 Real-time Monitoring
- Updates every 30 seconds with latest Bitcoin network fees
- Three priority levels: Low (1hr), Medium (30min), Fast (10min)
- Visual indicators with semantic color coding

### 🔔 Smart Alerts
- Set custom fee thresholds
- Get notified when fees drop below your target
- Non-intrusive Chrome notifications

### 🎨 Modern Design
- Clean, minimalist interface
- Dark/Light/Auto theme support
- Responsive and lightweight

### 📊 Additional Features
- Current block height display
- Badge indicator on toolbar
- One-click access to mempool.space
- Offline support with cached data

## Installation

### From Chrome Web Store
Coming soon!

### For Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gas-tracker.git
   cd gas-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` directory

## Usage

### Basic Usage
1. Click the extension icon to view current fees
2. Fees update automatically every 30 seconds
3. Badge shows selected priority fee value

### Setting Alerts
1. Click the bell icon in the popup
2. Enter your target fee threshold
3. Receive notifications when fees drop below threshold

### Changing Settings
1. Click the gear icon to access settings
2. Select fee priority (Low/Medium/Fast)
3. Choose theme preference
4. Settings save automatically

## Development

### Tech Stack
- **Framework**: WXT (Web Extension Framework)
- **UI**: React 19 + TypeScript
- **Icons**: Phosphor Icons
- **API**: mempool.space
- **Build**: Vite

### Project Structure
```
gas-tracker/
├── entrypoints/
│   ├── background/     # Service worker
│   ├── popup/          # Main popup UI
│   ├── options/        # Settings page
│   └── alert-settings/ # Alert configuration
├── utils/
│   ├── api.ts          # API integration
│   ├── badge.ts        # Badge management
│   ├── constants.ts    # Configuration
│   ├── storage.ts      # Data persistence
│   └── types.ts        # TypeScript definitions
├── public/
│   └── icon/           # Extension icons
└── wxt.config.ts       # WXT configuration
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run zip          # Create distribution package
npm run compile      # Type check
```

### Building for Production
```bash
npm run build
npm run zip
```
This creates a `chrome-mv3.zip` file in `.output/` ready for submission.

## API Usage

The extension uses the public mempool.space API:
- Endpoint: `https://mempool.space/api/v1/fees/recommended`
- No authentication required
- Rate limit friendly (30-second intervals)

## Privacy

- **No data collection**: All data stored locally
- **No tracking**: No analytics or user tracking
- **No external servers**: Only connects to mempool.space for fee data
- **Open source**: Full transparency

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gas-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gas-tracker/discussions)

## Acknowledgments

- [mempool.space](https://mempool.space) for the excellent API
- [WXT](https://wxt.dev) for the modern extension framework
- [Phosphor Icons](https://phosphoricons.com) for beautiful icons

---

Made with ❤️ for the Bitcoin community
