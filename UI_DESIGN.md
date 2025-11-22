# UI Design Document

This document outlines the user interface design for the Anyquere Desktop application. The application consists of two distinct interfaces: the **Settings Window** and the **Search Interface**.

## 1. Settings Window (Configuration)

**Purpose**: Manage data sources, application preferences, and general configuration.
**Access**: Accessible via the System Tray menu ("Preferences..." or "Settings").

### Layout & Components

*   **Header**: Title "Anyquere Settings"
*   **Data Sources Tab/Section**:
    *   **List View**: Displays currently configured sources.
        *   Columns: `Alias` (e.g., "cdn"), `Type` (Local/Google), `Path/URL`, `Status` (Ready/Error).
        *   Actions per item: `Edit`, `Delete`, `Refresh` (for Google Sheets).
    *   **Add New Source Button**: Opens a modal/form to add a source.
        *   **Type Selector**: Radio buttons for "Local CSV" vs "Google Sheet".
        *   **Alias Input**: Text field for the shortcode (e.g., "products").
        *   **Path/URL Input**: File picker for local, Text field for URL.
        *   **Search Config**:
            *   "Search Column": Dropdown (populated after reading header).
            *   "Result Columns": Multi-select dropdown.
*   **General Settings Tab/Section**:
    *   **Startup**: "Launch at login" checkbox.
    *   **Hotkey**: Input field to set global shortcut (default: `Cmd+Shift+Space` or similar).
    *   **Theme**: System/Light/Dark mode toggle.
*   **Footer**: "Save", "Cancel", "Apply" buttons.

![Settings Window Mockup](/Users/willdo/.gemini/antigravity/brain/900fd98c-f6bf-4589-b5e9-0d67e65b45f4/settings_ui_mockup_1763693360050.png)

### Visual Style
*   Standard OS-native window (Cocoa on Mac, WinUI/Native on Windows).
*   Clean, padded layout.

---

## 2. Search Interface (Usage)

**Purpose**: The primary interface for daily usage. Quick, transient, and keyboard-centric.
**Access**: Global Hotkey or System Tray click.
**Behavior**: Appears centered on screen or near mouse cursor. Disappears on focus loss or `Esc`.

### Layout & Components

*   **Input Bar**: Large, prominent text input field.
    *   **Placeholder**: "Type source alias (e.g., 'cdn')..."
    *   **Left Icon**: Search glass or App icon.
    *   **Right Icon**: Gear icon (Settings) - Clicking this opens the Settings Window.
*   **Autocomplete/Suggestion Dropdown** (Appears when typing alias):
    *   List of matching aliases.
    *   Highlight selection with keyboard navigation.
    *   **Interaction**: Pressing `Tab` or `Right Arrow` on a selection "locks" the source.
*   **Active Search Mode** (After locking source):
    *   **Input Bar Change**: Shows a "pill" or tag with the selected source name (e.g., `[ cdn ]`) followed by the cursor.
    *   **Results List** (Appears as user types query):
        *   Scrollable list below the input bar.
        *   **Result Item**:
            *   **Primary Text**: The matched value.
            *   **Secondary Text**: Additional columns configured in settings.
            *   **Action**: `Enter` to copy to clipboard (or other default action).

![Search Interface Mockup](/Users/willdo/.gemini/antigravity/brain/900fd98c-f6bf-4589-b5e9-0d67e65b45f4/search_ui_mockup_1763693376571.png)

### Visual Style
*   **Spotlight-like**: Floating window, no title bar, rounded corners, heavy drop shadow.
*   **Minimalist**: Only shows what's necessary.
*   **Dark/Light Mode**: Respects system theme.

## User Flow Example

1.  **User presses Hotkey**.
2.  **Search Bar appears**.
3.  User types `c`.
4.  **Dropdown** shows `cdn`, `customers`.
5.  User presses `Down Arrow` to highlight `customers`, then `Tab`.
6.  **Input Bar** now shows `[ customers ] |`.
7.  User types `John`.
8.  **Results List** shows:
    *   "John Doe - ID: 123"
    *   "John Smith - ID: 456"
9.  User selects "John Doe" and presses `Enter`.
10. **Window closes**, data is copied/acted upon.
