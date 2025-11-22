# AI Agent Instructions

This file is intended for any AI agent (Gemini, Claude, etc.) working on the `anyquereDesktop` project.

## Role & Persona
You are an **Expert Python 3 Developer** with deep system integration knowledge.
- **Primary OS**: MacOS (current target).
- **Secondary OS**: Windows 11 (future target).
- **Language**: Python 3 (maintain Python 2 compatibility where feasible, but prioritize Python 3 features if necessary for modern UI/System integration).

## Project Overview
`anyquereDesktop` is a desktop application adaptation of the `anyquere` browser extension.
- **Reference**: Read `README_EXT.md` for the core business logic and data requirements.
- **Goal**: Create a system-tray based application for quick data searching.

## Core Requirements

### 1. Technology Stack
- **Language**: Python 3.
- **UI Framework**: **tkinter + pystray** (migrated from PyQt6 for better macOS compatibility).
- **Compatibility**: Code should be Python 2 compatible as much as possible, but do not sacrifice core functionality or security for it.

### 2. User Interaction Flow
The application runs in the background with a **System Tray Indicator**.

**Interaction Steps:**
1.  **Trigger**: User clicks the system tray icon OR uses a global hotkey (if implemented).
2.  **Input**: A search bar/window appears.
3.  **Source Selection**:
    -   User types a prefix (e.g., `c`).
    -   System suggests configured filenames (e.g., `cdn`, `ICPE`).
    -   User selects a source using `Arrow Keys` or `Tab`.
    -   UI updates to show context (e.g., `cdn > `).
4.  **Search**:
    -   User types the query (e.g., `123`).
    -   System searches within the selected source.
    -   Results are displayed.

### 3. Data Sources
-   Support **Local CSV files**.
-   Support **Google Sheets** (published to web as CSV), similar to the extension.

## Development Guidelines
-   **Read the Reference**: Always check `README_EXT.md` to understand the data format and search logic required.
-   **System Integration**: The app must feel native. It should not be a clunky window that stays open; it's a quick-access tool.
-   **Clean Code**: Write modular, well-documented Python code.

## Build Process (CRITICAL)
### DMG Creation with Applications Folder
**ALWAYS include the Applications folder in DMG builds:**

1. **Use the provided build script**: `./build_dmg.sh`
2. **Manual DMG creation process**:
   ```bash
   mkdir -p dist/dmg_temp
   cp -R dist/anyquereDesktop.app dist/dmg_temp/
   ln -s /Applications dist/dmg_temp/Applications
   hdiutil create -volname "anyquereDesktop" -srcfolder dist/dmg_temp -ov -format UDZO -imagekey zlib-level=9 dist/anyquereDesktop.dmg
   ```

3. **Why Applications folder is required**:
   - Provides proper drag-and-drop installation experience
   - Users expect to see Applications folder in macOS DMG installers
   - Without it, users don't know where to install the app

### Build Specifications
- **Main Spec File**: `anyquereDesktop_full.spec` (uses `main_tkinter.py`)
- **Always build**: Full tkinter version with UI components, not simple version
- **PyInstaller Command**: `python3 -m PyInstaller --clean --noconfirm anyquereDesktop_full.spec`

## Testing Requirements
- **Always test**: Search window opens when clicking "Search" in system tray
- **Verify**: Settings window opens when clicking "Settings"
- **Confirm**: Floating UI appears with proper dark theme
- **Check**: All DataManager methods are working (get_source_aliases, search_data, etc.)
