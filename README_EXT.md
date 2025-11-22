# Anyquere - Data Search Extension

📊 **Search through your local or Google Sheets spreadsheet data by selecting text on any webpage**

## Requirements

### Browser Requirements
- **Chrome**: 88+ (Manifest V3 support)
- **Microsoft Edge**: 88+ (Manifest V3 support)
- **Firefox**: 78+ (Manifest V2 compatibility mode)

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB (8GB recommended for large datasets)
- **Storage**: 50MB free space for extension and cached data

### Data Requirements
- **Google Sheets**: Must be publicly accessible via "Publish to web"
- **CSV Files**: UTF-8 encoded, maximum 50MB per file
- **Network**: Internet connection required for Google Sheets integration

## Features

- 🔍 **Universal Search**: Search your data on any website using text selection
- 📁 **Multiple Sources**: Support for local CSV files and Google Sheets
- ⚡ **Quick Access**: Right-click context menu and keyboard shortcuts (Ctrl+Shift+Q)
- 🎯 **Smart Results**: Column-wise search with configurable result display
- 🔒 **Privacy-First**: All data stored locally, no external tracking

## Quick Start

### Installation

1. Clone this repository
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Load extension in Chrome/Edge:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `.output/chrome-mv3` folder

### First Time Setup

1. Open extension popup
2. Click "⚙️ Options" to open configuration page
3. Import your data:
   - **Local Files**: Upload CSV files
   - **Google Sheets**: Use "File > Share > Publish to web > CSV format"
4. Configure search settings (which columns to search, results to show)
5. Start searching!

## Usage

### Method 1: Context Menu
1. Select text on any webpage
2. Right-click and choose "🔍 Search '[your text]' in [your file]"
3. View results in the popup overlay

### Method 2: Keyboard Shortcut
1. Select text on any webpage
2. Press `Ctrl+Shift+Q` (or `Cmd+Shift+Q` on Mac)
3. View results in the popup overlay

## Data Sources

### Google Sheets
1. Open your Google Sheet
2. Go to `File > Share > Publish to web`
3. Select "Link to Google Sheet in CSV format"
4. Copy the generated URL
5. Paste into extension options

### Local CSV Files
1. Click "📁 Import Data" in options page
2. Select your CSV file
3. Configure search settings
4. Save configuration

## Build & Development

📖 **[BUILD.md](./BUILD.md)** - **Authoritative build guide** - Always reference this file for build instructions.

### Quick Build Commands
```bash
npm run build          # Build for all browsers
npm run build:chrome   # Chrome/Edge build
npm run build:firefox  # Firefox build
npm run dev            # Development mode
```

## Configuration Options

### Search Settings
- **Search Column**: Which column to search in
- **Header Row**: Row containing column headers
- **Result Columns**: Which columns to display in results
- **Max Results**: Maximum number of results to show

### File Management
- **Import**: Add new CSV files
- **Edit**: Modify file settings
- **Delete**: Remove unused files
- **Refresh**: Update data from Google Sheets

## Troubleshooting

### Extension Won't Load
- Ensure you're using the correct build folder (`.output/chrome-mv3`)
- Check browser console for errors
- Try reloading the extension

### Google Sheets Not Working
- Make sure the sheet is publicly accessible
- Use "Publish to web" instead of direct sharing
- Check that the URL is a CSV export link

### Search Results Not Showing
- Verify search column is configured correctly
- Check that data has been loaded
- Try the test button in the popup

## Privacy & Security

- ✅ **Local Storage**: All data stored locally in browser, never sent to external servers
- ✅ **No Analytics**: No tracking, analytics, or telemetry data collected
- ✅ **Google Sheets Access**: Requires explicit public sharing via "Publish to web"
- ✅ **CSP Protection**: Content Security Policy prevents XSS attacks
- ✅ **Minimal Permissions**: Only essential permissions requested (see [PERMISSION_TRACKING.md](./PERMISSION_TRACKING.md))
- ✅ **Open Source**: Full source code available for audit
- ✅ **No Network Calls**: No background network requests except for Google Sheets CSV exports

## Browser Support

- ✅ Chrome (Manifest V3)
- ✅ Edge (Manifest V3)
- ✅ Firefox (Manifest V2 compatibility)
- ❌ Safari (not supported)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run build`
5. Submit a pull request

## Version History

Current version: **1.0.2** (2025-10-31)

For detailed permission history and changes, see [PERMISSION_TRACKING.md](./PERMISSION_TRACKING.md).

## License

MIT License - see LICENSE file for details

## Documentation Structure

This project uses three main documentation files:

- 📖 **[README.md](./README.md)** - User guide, features, and requirements (this file)
- 🔧 **[BUILD.md](./BUILD.md)** - Build instructions and development guide
- 🔐 **[PERMISSION_TRACKING.md](./PERMISSION_TRACKING.md)** - Permission history and security tracking

## Support

For issues and feature requests:
- 🐛 Report bugs via GitHub Issues
- 💡 Feature requests welcome
- 📧 Questions: open a discussion

---

**Built with ❤️ using [WXT](https://wxt.dev/)** extension framework
