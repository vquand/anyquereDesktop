# Anyquere Desktop

📊 **Quickly search through your local or Google Sheets spreadsheet data and convert times across time zones via the System Tray**

> **Note**: This is the Desktop version of the Anyquere browser extension. For the extension requirements, see [README_EXT.md](./README_EXT.md).

## Requirements

### System Requirements
- **Operating System**: macOS (10.14+), Windows (10+), Linux (Ubuntu 18.04+)
- **Runtime**: Electron-based desktop application
- **Architecture**: Native performance with web technologies

### Data Requirements
- **Google Sheets**: Must be publicly accessible via "Publish to web"
- **CSV Files**: UTF-8 encoded
- **Network**: Internet connection required for Google Sheets integration

## Features

### 🔍 File Search Capabilities
- 🖥️ **System Tray Integration**: Always available in your menu bar / system tray.
- ⌨️ **Quick Workflow**: Click or shortcut to open, type to search.
- 📂 **Multiple Sources**: Configure multiple CSV files or Google Sheets.
- 🧠 **Smart Autocomplete**:
    - Type a file prefix (e.g., `c`) -> Get suggestions (`cdn`, `ICPE`).
    - Press `Tab` to select source.
    - Type query to search within that source.
- 🔒 **Privacy-First**: Data is processed locally.

### ⏰ Time Converter Capabilities
- 🌍 **Multi-Time Zone Conversion**: Convert times between 10+ major time zones simultaneously
- 🧠 **Smart Time Parsing**: Automatically detects 10+ time formats (ISO 8601, Unix, natural language, etc.)
- 📋 **Multiple Formats**: Display times in ISO 8601, Unix, RFC 2822, local, date-only, time-only formats
- 🎯 **Click-to-Copy**: Instantly copy any converted time or format to clipboard
- ⚡ **Quick Actions**: "Current Time" button and clipboard time detection
- ⚙️ **Customizable**: Configure preferred time zones, formats, and behaviors in settings

## UI Overview

The application features three distinct interfaces:

### 1. Settings Window ⚙️
Manage your data sources and time converter settings here.
- **File Search Tab**: Add, edit, or remove CSV files and Google Sheets.
- **Time Converter Tab**: Configure time zones, formats, and converter behavior.
- **Configuration**: Set aliases (e.g., `cdn`), choose search columns, and define result formats.
- **Preferences**: Configure global hotkeys and startup behavior.

### 2. Search Bar 🔍
The main interface for quick data search access.
- **Spotlight-style**: A floating, minimalist bar that appears on command.
- **Keyboard-centric**: Designed for speed—keep your hands on the keyboard.
- **Smart Context**:
    1.  Type an alias (e.g., `c` -> `cdn`).
    2.  Lock it in with `Tab`.
    3.  Search your data instantly.

### 3. Time Converter ⏰
Dedicated interface for intelligent time zone conversion.
- **Smart Parsing**: Automatically detects multiple time formats (ISO 8601, Unix, natural language).
- **Multi-Zone Display**: Shows converted time in 10+ major time zones simultaneously.
- **Format Variety**: Displays times in ISO, Unix, RFC 2822, local, and custom formats.
- **Click-to-Copy**: Easy clipboard integration for all converted times.
- **Example Formats**: Quick access to common time format examples.

## Quick Start

### Installation

1.  **Download the latest release** from the [Releases](../../releases) page
2.  **Install the application**:
    - **macOS**: Download `anyQuere-1.0.0.dmg` (Intel) or `anyQuere-1.0.0-arm64.dmg` (Apple Silicon)
    - **Windows**: Download `anyQuere Setup 1.0.0.exe`
3.  **Launch the application** from your Applications folder or Start menu

### Development Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/your-username/anyquereDesktop.git
    cd anyquereDesktop/anyquere-desktop-electron
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run in development mode:
    ```bash
    npm start
    ```

### Building for Distribution

```bash
# Build for all platforms
npm run build

# Build specific platforms
npm run build-mac    # macOS DMG (Intel + ARM64)
npm run build-win    # Windows installer
npm run build-linux  # Linux AppImage + DEB
```

### Installation Notes

- **Cross-platform**: Works on macOS, Windows, and Linux
- **No dependencies**: Self-contained Electron application
- **Auto-updates**: Built-in update mechanism (planned feature)
- **System Tray**: Automatically integrates with your OS system tray

### First Time Setup

1.  Click the System Tray icon.
2.  Open **Settings/Preferences**.
3.  **Configure File Search**:
    -   **Local Files**: Add paths to your CSV files.
    -   **Google Sheets**: Add URLs of published CSV files.
    -   Assign aliases to your sources (e.g., `cdn`, `products`) for quick access.
4.  **Configure Time Converter** (Optional):
    -   Select your preferred time zones (NYC, London, Tokyo, etc.).
    -   Choose which time formats to display by default.
    -   Set up keyboard shortcuts for quick access.
5.  **Start Using**:
    -   **Search**: Use `Cmd+Space` or click tray icon → Search
    -   **Time**: Click tray icon → Time or use custom shortcut

## Usage

### Search Workflow

1.  **Open**: Click the tray icon.
2.  **Select Source**:
    -   User types: `c`
    -   System suggests: `cdn | ICPE`
    -   User chooses `cdn` (Arrow keys / Tab)
    -   System displays: `cdn >`
3.  **Search**:
    -   User types: `123`
    -   System searches `cdn` for `123`
    -   Results display instantly.

### Time Converter Workflow

1.  **Open Time Converter**: Click tray icon → Time or use custom shortcut
2.  **Input Time**: Paste or type any time format:
    -   `2025-10-15T14:30:00Z` (ISO 8601)
    -   `1756107358` (Unix timestamp)
    -   `Oct 15, 2025 2:30 PM` (Natural language)
    -   `tomorrow 3 PM` (Relative time)
3.  **Convert**: Press Enter or click "Convert"
4.  **View Results**:
    -   **Multiple Formats**: See time in ISO, Unix, RFC 2822, local formats
    -   **Time Zones**: Automatically shows time in 10+ major world time zones
    -   **Click to Copy**: Click any format or location to copy to clipboard
5.  **Quick Actions**:
    -   Click "Current Time" to convert now
    -   Use example chips for common formats
    -   "Copy All" to export complete conversion results

#### Supported Time Formats

- **ISO 8601**: `2025-10-15T14:30:00Z`, `2025-10-15T14:30:00+08:00`
- **Unix Timestamps**: `1756107358` (seconds), `1756107358000` (milliseconds)
- **US Format**: `10/15/2025 2:30 PM`
- **European Format**: `15.10.2025 14:30`
- **Natural Language**: `October 15, 2025 2:30 PM`
- **Relative Time**: `today`, `tomorrow`, `yesterday`
- **Time Only**: `2:30 PM`, `14:30`

## Development

This project is built with Electron (JavaScript/HTML/CSS).

### AI Agent Instructions
See [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) for details on how to contribute to this project using AI agents.

## License

GPLv3 License