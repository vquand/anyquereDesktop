# UI Design Document

This document outlines the user interface design for the Anyquere Desktop application. The application is built with **Electron** and consists of two distinct interfaces: the **Settings Window** and the **Search Interface**.

## 1. Settings Window (Configuration)

**Purpose**: Manage data sources, application preferences, and general configuration.
**Access**: Accessible via the System Tray menu ("Settings") or the gear icon in the search interface.
**Technology**: Electron-based with modern HTML/CSS/JavaScript, native OS styling.

### Layout & Components

*   **Header**: Title "Anyquere Settings" with window controls
*   **Tabbed Interface**:
    *   **📁 Data Sources Tab**: Main configuration interface
    *   **⚙️ General Tab**: Application preferences
    *   **ℹ️ About Tab**: Application information

#### Data Sources Tab
*   **Info Banner**: Helpful guidance text at the top
*   **Sources Table**: Displays currently configured sources with modern styling
    *   Columns: `Alias` (e.g., "cdn"), `Type` (local/Google Sheets), `Path/URL`, `Search Column`, `Status` (✅ Configured/⚠️ Setup required/🔄 Testing)
    *   Checkbox selection for batch operations
    *   Hover effects and row highlighting
*   **Action Buttons**: Modern button design with icons
    *   `[➕ Add]` - Create new data source
    *   `[✏️ Edit]` - Modify selected source
    *   `[🗑️ Delete]` - Remove selected sources
    *   `[🔄 Refresh]` - Reload data from sources
*   **Import/Export**: Configuration management buttons
    *   `[📤 Export]` - Save configuration to JSON
    *   `[📥 Import]` - Load configuration from JSON

#### Advanced Edit Dialog (3 Tabs)
**Modern modal dialog** with smooth transitions and validation feedback.

*   **📁 Basic Info Tab**:
    *   Alias input field with real-time validation
    *   Type selector dropdown (Local CSV/Google Sheets)
    *   Path/URL input with native file browser integration
    *   Helpful tooltips and validation messages
    *   Progressive disclosure of advanced options

*   **🔍 Search Settings Tab**:
    *   Header Row configuration with number input
    *   Search Column selection dropdown (populated with actual headers)
    *   Result Columns multi-select with styled checkboxes
    *   Maximum Results slider control
    *   Real-time preview of settings

*   **👁️ Data Preview Tab**:
    *   Live data preview table (first 10 rows)
    *   Responsive table design with horizontal scrolling
    *   Row and column count information
    *   Data format validation indicators
    *   Export preview functionality

#### General Settings Tab
*   **Startup Options**:
    *   "Launch at login" toggle switch
    *   "Show search window on startup" toggle switch
*   **Hotkey Configuration**:
    *   Display current global shortcut (Cmd+Space default)
    *   List of alternative shortcuts
    *   Shortcut reset functionality
*   **Cache Management**:
    *   Clear cache button with confirmation
    *   Cache size and status information
    *   Per-source cache controls

#### About Tab
*   **Application Information**:
    *   Version number and build info
    *   Technology stack information (Electron + Node.js)
    *   Credits and acknowledgments
*   **Help & Support**:
    *   Links to documentation and GitHub
    *   Bug reporting information
    *   Feature request guidance

---

## 2. Search Interface (Usage)

**Purpose**: The primary interface for daily usage. Quick, transient, and keyboard-centric.
**Access**: Global Hotkey (Cmd+Space/Ctrl+Space) or System Tray click.
**Behavior**: Appears centered at top of screen, 50% screen height with scrolling. Disappears on focus loss or `Esc`.
**Technology**: Frameless Electron window with modern CSS styling and smooth animations.

### Layout & Components

*   **Header Bar**: Custom title bar with minimal design
    *   **Search Input**: Large, prominent text input field
        *   **Placeholder**: "source > query" (dynamic placeholder)
        *   **Left Icon**: Search glass icon
        *   **Right Icons**: Gear icon (Settings) and Close button (✕)
    *   **Modern styling**: Rounded corners, subtle shadows, focus states

*   **Dynamic Search Input**:
    *   **Source Detection**: Automatic parsing of "source > query" format
    *   **Visual Feedback**: Real-time validation indicators
    *   **Autocomplete**: Dropdown appears when typing source alias
    *   **Keyboard Navigation**: Full keyboard support (arrows, tab, enter)

*   **Results Container**:
    *   **Fixed Height**: 50% of screen height with scrollable content
    *   **Empty State**: Helpful message when no results or sources configured
    *   **Loading State**: Animated spinner during data loading
    *   **Error States**: Clear error messages with recovery options

*   **Results List**: Modern card-based design
    *   **Result Item**: Styled result cards with proper typography
        *   **Primary Text**: Matched value (highlighted)
        *   **Secondary Text**: Additional configured columns
        *   **Hover Effects**: Subtle highlighting and action hints
    *   **Scrolling**: Smooth scrolling with proper momentum
    *   **Actions**: Enter to copy, click to select, keyboard navigation

*   **Responsive Design**:
    *   **Window Positioning**: Centered at top of screen
    *   **Dynamic Width**: Adapts to content (min/max constraints)
    *   **Theme Support**: Respects system light/dark mode
    *   **High DPI**: Sharp rendering on retina displays

### Visual Style
*   **Modern Design**: Clean, minimalist interface following macOS/Windows design guidelines
*   **Frameless Window**: No native title bar, custom controls
*   **Smooth Animations**: Subtle transitions and micro-interactions
*   **Accessibility**: Proper contrast, keyboard navigation, screen reader support
*   **Performance**: Efficient rendering with virtual scrolling for large datasets

### Visual Style Details
*   **Color Scheme**: System-aware with proper contrast ratios
*   **Typography**: System fonts for native feel
*   **Shadows**: Subtle drop shadows for depth
*   **Borders**: Minimal borders with rounded corners
*   **Icons**: Consistent icon set throughout the application
*   **Responsive Layout**: Adapts to different screen sizes and DPI settings

---

## 3. System Tray Integration

**Purpose**: Background access and quick actions.
**Technology**: Native system tray integration with custom menu.

### Tray Menu
*   **App Icon**: Custom "aQ" text icon that adapts to system theme
*   **Context Menu**: Clean, native-styled context menu
    *   **Search** - Open search interface
    *   **Settings** - Open configuration window
    *   **Separator**
    *   **Quit** - Exit application

### Tray Behavior
*   **Auto-start**: Optional launch at system startup
*   **Global Shortcuts**: System-wide hotkey registration
*   **Background Operation**: Runs efficiently in system tray
*   **Cross-platform**: Native tray behavior on macOS, Windows, and Linux

---

## User Flow Example (Updated)

1.  **User presses Global Hotkey** (Cmd+Space).
2.  **Search Bar appears** at top-center of screen (50% height).
3.  User types `cdn >`.
4.  **Input field** shows `cdn > |` with source detection.
5.  User types `john`.
6.  **Results List** appears below input with styled cards:
    *   "John Doe - john@example.com - Active"
    *   "John Smith - smith@company.com - Active"
7.  User navigates with arrows, presses **Enter** on "John Doe".
8.  **Result copied** to clipboard, window closes with smooth animation.
9.  **Toast notification** briefly shows "John Doe copied to clipboard".

---

## 4. Technical Implementation Details

### Electron Architecture
*   **Main Process**: Handles system integration, file operations, IPC
*   **Renderer Process**: Manages UI, user interactions, data presentation
*   **Data Manager**: Centralized data handling with caching
*   **Configuration**: JSON-based configuration with import/export

### Styling & Design System
*   **CSS Framework**: Modern CSS with custom properties
*   **Responsive Design**: Flexbox and Grid layouts
*   **Theme Support**: CSS custom properties for light/dark modes
*   **Animations**: CSS transitions and keyframe animations
*   **Typography**: System font stacks for native appearance

### Accessibility Features
*   **Keyboard Navigation**: Full keyboard support throughout
*   **Screen Reader**: Proper ARIA labels and semantic HTML
*   **High Contrast**: Support for high contrast themes
*   **Focus Management**: Logical tab order and focus indicators
*   **Reduced Motion**: Respect user's motion preferences

---

## 5. Cross-Platform Considerations

### macOS
*   Native menu bar integration
*   System-appropriate styling
*   Retina display support
*   macOS-specific shortcuts and behaviors

### Windows
*   Windows 10/11 styling
*   Taskbar integration
*   Windows-specific file dialogs
* .NET-style shortcuts where appropriate

### Linux
*   GTK/Qt integration
*   Freedesktop.org standards
* distribution-agnostic behavior
* Linux-specific file pickers

---

*This design document reflects the current Electron-based implementation with modern UI/UX principles and cross-platform compatibility.*