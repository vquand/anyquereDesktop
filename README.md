# Anyquere Desktop

📊 **Quickly search through your local or Google Sheets spreadsheet data via the System Tray**

> **Note**: This is the Desktop version of the Anyquere browser extension. For the extension requirements, see [README_EXT.md](./README_EXT.md).

## Requirements 

### System Requirements
- **Operating System**: macOS (primary), Windows 11 (planned)
- **Runtime**: Python 3 (Python 2 compatible where possible)
- **Dependencies**: Python UI kit (e.g., `rumps`, `pystray`, or similar)

### Data Requirements
- **Google Sheets**: Must be publicly accessible via "Publish to web"
- **CSV Files**: UTF-8 encoded
- **Network**: Internet connection required for Google Sheets integration

## Features

- 🖥️ **System Tray Integration**: Always available in your menu bar / system tray.
- ⌨️ **Quick Workflow**: Click or shortcut to open, type to search.
- 📂 **Multiple Sources**: Configure multiple CSV files or Google Sheets.
- 🧠 **Smart Autocomplete**:
    - Type a file prefix (e.g., `c`) -> Get suggestions (`cdn`, `ICPE`).
    - Press `Tab` to select source.
    - Type query to search within that source.
- 🔒 **Privacy-First**: Data is processed locally.

## UI Overview

The application features two distinct interfaces:

### 1. Settings Window ⚙️
Manage your data sources and application preferences here.
- **Data Sources**: Add, edit, or remove CSV files and Google Sheets.
- **Configuration**: Set aliases (e.g., `cdn`), choose search columns, and define result formats.
- **Preferences**: Configure global hotkeys and startup behavior.

### 2. Search Bar 🔍
The main interface for quick access.
- **Spotlight-style**: A floating, minimalist bar that appears on command.
- **Keyboard-centric**: Designed for speed—keep your hands on the keyboard.
- **Smart Context**:
    1.  Type an alias (e.g., `c` -> `cdn`).
    2.  Lock it in with `Tab`.
    3.  Search your data instantly.

## Quick Start

### Installation

1.  Clone this repository.
2.  Install dependencies using **system Python** (recommended for macOS):
    ```bash
    pip3 install -r requirements.txt
    ```
    > **Important**: Use system Python 3 instead of virtual environments for best PyQt6 compatibility on macOS.
3.  Run the application:
    ```bash
    python3 main.py
    ```

### Installation Notes

- **macOS**: Use the system Python 3 that comes with macOS or install from python.org
- **Avoid virtual environments**: PyQt6 works best with system-wide installations
- **Dependencies**: The app automatically handles Qt platform plugin paths

### First Time Setup

1.  Click the System Tray icon.
2.  Open **Settings/Preferences**.
3.  Add your data sources:
    -   **Local Files**: Path to your CSV files.
    -   **Google Sheets**: URL of the published CSV.
4.  Assign aliases to your sources (e.g., `cdn`, `products`) for quick access.

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

## Development

This project is built with Python 3.

### AI Agent Instructions
See [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) for details on how to contribute to this project using AI agents.

## License

GPLv3 License
