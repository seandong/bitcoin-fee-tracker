# Changelog

All notable changes to Bitcoin Fee Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-31

### Initial Release

#### Features
- **Real-time Fee Monitoring**
  - Updates every 30 seconds with latest Bitcoin network fees
  - Three priority levels: Low (1hr), Medium (30min), Fast (10min)
  - Visual indicators with semantic color coding (Red=Slow, Amber=Medium, Green=Fast)

- **Smart Alert System**
  - Set custom fee thresholds
  - Chrome notifications when fees drop below target
  - Persistent alert settings

- **Modern UI/UX**
  - Clean, minimalist design
  - Dark/Light/Auto theme support
  - Responsive popup interface (380x240px)
  - Professional icon set using Phosphor Icons

- **Badge Display**
  - Shows selected priority fee on toolbar
  - Color-coded for quick status check
  - Updates in real-time

- **Additional Features**
  - Current Bitcoin block height display
  - One-click access to mempool.space
  - Offline support with cached data
  - Settings page for customization

#### Technical Details
- Built with WXT (Web Extension Framework)
- React 19 + TypeScript
- Chrome Manifest V3
- mempool.space API integration
- Local storage for data persistence

#### Privacy
- No data collection or tracking
- All data stored locally
- No external servers except mempool.space API

---

## Upcoming Features (Roadmap)

### [1.1.0] - Planned
- [ ] Multiple currency display (USD/EUR conversion)
- [ ] Historical fee chart
- [ ] Export fee history to CSV
- [ ] Sound notifications option
- [ ] Keyboard shortcuts

### [1.2.0] - Planned  
- [ ] Firefox support
- [ ] Edge browser support
- [ ] Multi-language support (中文, 日本語, Español)
- [ ] Custom API endpoint option

### Future Considerations
- Lightning Network fee tracking
- Transaction size calculator
- Fee prediction based on historical data
- Integration with wallet APIs

---

## Support

For bug reports and feature requests, please visit:
- [GitHub Issues](https://github.com/yourusername/gas-tracker/issues)

## License

MIT License - see LICENSE file for details