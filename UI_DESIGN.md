# UI Design Document

This document outlines the user interface design for the Anyquere Desktop application. The application is built with **Electron** and consists of two distinct interfaces: the **Settings Window** and the **Search Interface**.

## 1. Settings Window (Configuration)

**Purpose**: Manage data sources, application preferences, and general configuration.
**Access**: Accessible via the System Tray menu ("Settings") or the gear icon in the search interface.
**Technology**: Electron-based with modern HTML/CSS/JavaScript, native OS styling.

### Layout & Components

*   **Header**: Title "Anyquere Settings" with window controls
*   **Tabbed Interface** (Streamlined 3-tab design):
    *   **📁 File Search Tab**: CSV and Google Sheets search configuration
    *   **⏰ Time Converter Tab**: Time zone conversion settings and preferences
    *   **ℹ️ About Tab**: Application information

#### File Search Tab (Data Sources Configuration)
*   **Info Banner**: Helpful guidance text at the top
*   **Sources Table**: Displays currently configured sources with modern styling
    *   Columns: `Alias` (e.g., "cdn"), `Type` (local/Google Sheets), `Status` (Connected/Error/Testing), `Actions`
    *   **Inline Action Buttons**: Each row contains direct action buttons:
        *   `[✏️ Edit]` - Modify source configuration
        *   `[🔄 Test]` - Test connection and data loading
        *   `[👁️ Preview]` - Open data preview modal for this source
        *   `[🗑️ Delete]` - Remove data source
    *   Hover effects and row highlighting
*   **Global Action Buttons**: Simplified toolbar
    *   `[➕ Add Source]` - Create new data source (opens modal dialog)
*   **Data Preview Modal**: Contextual dialog opened from inline preview buttons
    *   **Source Information**: Displays alias, type, path, and row count
    *   **Configurable Preview**: User can select number of rows to display
    *   **Interactive Table**: Shows data with column indicators (🔍 search column, 📋 result columns)
    *   **Export Functionality**: Download preview data as CSV
    *   **Real-time Refresh**: Reload data from source

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

#### About Tab
*   **Application Information**:
    *   Version number and build info
    *   Technology stack information (Electron + Node.js)
    *   Credits and acknowledgments
*   **Help & Support**:
    *   Links to documentation and GitHub
    *   Bug reporting information
    *   Feature request guidance

#### Time Converter Tab
**Purpose**: Configure time zone conversion settings, default formats, and behavior preferences.

*   **Default Time Zones Section**:
    *   Pre-populated checkboxes for major world time zones
    *   Options: Local Time (auto-detect), UTC, New York, London, Paris, Tokyo, Sydney, Los Angeles, Chicago, Dubai
    *   Add custom time zones functionality with validation
    *   Visual feedback for selected/deselected states
    *   Right-click to remove custom time zones

*   **Display Formats Section**:
    *   Format selection checkboxes with example formats:
        *   ISO 8601 (2025-10-15T14:30:00Z)
        *   Unix Timestamp (1756107358)
        *   RFC 2822 (Tue, 15 Oct 2025 14:30:00 GMT)
        *   Local Format (10/15/2025, 2:30:00 PM)
        *   Date Only (10/15/2025)
        *   Time Only (2:30:00 PM)
    *   Real-time preview of format selections

*   **Behavior Settings Section**:
    *   Auto-detect time strings in clipboard
    *   Show quick example formats
    *   Copy converted time to clipboard when clicked
    *   Default input format selection (Auto-detect, ISO 8601, Unix, US, European, Natural)
    *   Time zone display format (Abbreviation, UTC Offset, Both)

*   **Shortcuts & Quick Actions Section**:
    *   Configure keyboard shortcuts for time converter
    *   Enable/disable "Current Time" quick action button
    *   Clipboard time detection toggle
    *   Global hotkey configuration (Cmd/Ctrl+Shift+T)

*   **Visual Design**:
    *   Grid layout with organized sections
    *   Card-based design with subtle shadows
    *   Color-coded section headers with blue accent bars
    *   Smooth transitions and hover effects
    *   Responsive design for different screen sizes
    *   Consistent with overall application design language

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

## 3. Time Converter Interface

**Purpose**: Intelligent time zone conversion with multi-format support.
**Access**: System Tray menu ("Time") or configurable keyboard shortcut (Cmd/Ctrl+Shift+T).
**Behavior**: Dedicated window with smart time parsing and multi-location conversion.
**Technology**: Electron window with advanced time parsing algorithms and real-time conversion.

### Layout & Components

*   **Header Section**:
    *   **Title**: "⏰ Time Converter" with modern typography
    *   **Description**: "Convert time between multiple time zones and formats"
    *   **Clean design**: Dark theme with blue accent colors

*   **Input Section**:
    *   **Large Input Field**:
        *   **Placeholder**: "Paste or type time (e.g., 2025-10-15T14:30:00Z, 1756107358, Oct 15, 2025 2:30 PM)"
        *   **Auto-focus**: Automatically focused when window opens
        *   **Smart parsing**: Detects multiple time formats automatically
        *   **Real-time validation**: Shows parsing status as you type

    *   **Action Buttons**:
        *   **Convert** - Main conversion button
        *   **Current Time** - Quick action to convert current time
        *   **Clear** - Reset all inputs and results

*   **Example Format Chips**:
    *   **Interactive examples**: Click to insert example time strings
    *   **Formats available**: ISO 8601, Unix Timestamp, US Format, European Format, Natural Language, Relative Time
    *   **Visual feedback**: Hover effects and selection states

*   **Multiple Formats Section**:
    *   **Grid layout**: Organized display of converted time formats
    *   **Format cards**: Click to copy individual formats to clipboard
    *   **Formats displayed**: ISO 8601, Unix Timestamp, RFC 2822, Local Format, Date Only, Time Only
    *   **Copy feedback**: Visual indication when format is copied

*   **Time Zones Section**:
    *   **Location cards**: Display converted time in multiple time zones
    *   **Default locations**: Local Time, UTC, New York, London, Paris, Tokyo, Sydney, Los Angeles, Chicago, Dubai
    *   **Custom time zones**: User-configurable from settings
    *   **DST awareness**: Automatically handles daylight saving time
    *   **Copy functionality**: Click any location card to copy formatted time
    *   **Copy all button**: Export all conversions to clipboard

*   **Smart Features**:
    *   **Intelligent parsing**: Supports 10+ time formats automatically
    *   **Multi-location conversion**: Simultaneous display in multiple time zones
    *   **Click-to-copy**: Easy clipboard integration
    *   **Error handling**: Clear error messages for invalid time strings
    *   **Loading states**: Visual feedback during conversion

### Time Parser Capabilities

*   **ISO 8601**: 2025-10-15T14:30:00Z, 2025-10-15T14:30:00+08:00
*   **Unix Timestamps**: 1756107358 (seconds), 1756107358000 (milliseconds)
*   **US Format**: 10/15/2025 2:30 PM, October 15, 2025
*   **European Format**: 15.10.2025 14:30
*   **Natural Language**: "Oct 15, 2025 2:30 PM", "tomorrow 3 PM"
*   **Relative Time**: "today", "tomorrow", "yesterday"
*   **Time Only**: "2:30 PM", "14:30"

### Visual Design

*   **Dark theme**: Professional dark color scheme optimized for extended use
*   **Card-based layout**: Organized sections with subtle shadows and rounded corners
*   **Responsive design**: Adapts to different screen sizes and window dimensions
*   **Smooth animations**: Loading states, hover effects, and transitions
*   **Accessibility**: High contrast, keyboard navigation, and screen reader support
*   **Consistent styling**: Matches overall application design language

---

## 4. System Tray Integration

**Purpose**: Background access and quick actions.
**Technology**: Native system tray integration with custom menu.

### Tray Menu
*   **App Icon**: Custom "aQ" text icon that adapts to system theme
*   **Context Menu**: Clean, native-styled context menu
    *   **Search** - Open CSV and Google Sheets search interface
    *   **Time** - Open time zone conversion interface
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

## 6. Recent UI Improvements (Latest Version)

### 🎯 **Streamlined Settings Interface**
- **Reduced Tab Count**: Simplified from 4 tabs to 3 essential tabs (File Search, Time Converter, About)
- **Removed Data Preview Tab**: Replaced with contextual modal for better workflow
- **Cleaner Navigation**: More focused and less overwhelming interface

### 👁️ **Enhanced Data Preview System**
- **Inline Preview Buttons**: Each data source row now has its own "Preview" button
- **Contextual Modal**: Data preview opens as a modal dialog specific to the selected source
- **One-Click Access**: Users can preview any source directly without selection steps
- **Rich Preview Features**:
  - Configurable number of preview rows
  - Column indicators (🔍 search column, 📋 result columns)
  - Export to CSV functionality
  - Real-time data refresh

### 🔧 **Improved User Experience**
- **Simplified Toolbar**: Reduced to essential "Add Source" button only
- **Inline Actions**: All source operations (Edit, Test, Preview, Delete) available in-row
- **Better Modal Workflow**: File dialogs, source editing, and data preview all use consistent modal patterns
- **Responsive Design**: Better support for different screen sizes and high DPI displays

### 📊 **Table Design Updates**
- **Four Columns**: Alias | Type | Status | Actions (was previously more complex)
- **Action Button Set**: Edit | Test | Preview | Delete (was previously separate/global)
- **Status Indicators**: Clear visual feedback for connection states
- **Hover Effects**: Enhanced interactivity and visual feedback

### 🎨 **Visual Consistency**
- **Modern Button Design**: Consistent styling across all interactive elements
- **Modal Consistency**: All modals follow the same design patterns
- **Icon Usage**: Meaningful icons for different actions and states
- **Cross-Platform Compatibility**: Native feel on macOS, Windows, and Linux

---

*This design document reflects the current Electron-based implementation with modern UI/UX principles, cross-platform compatibility, and the latest improvements focused on streamlined workflows and enhanced user experience.*