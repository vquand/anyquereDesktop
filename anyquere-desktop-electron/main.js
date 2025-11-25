const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const DataManager = require('./data-manager');
const TimeConverter = require('./time-converter');

class SystemTrayApp {
    constructor() {
        this.tray = null;
        this.searchWindow = null;
        this.settingsWindow = null;
        this.timeWindow = null;
        this.dataManager = new DataManager();
        this.timeConverter = new TimeConverter();
        this.isReady = false;

        // Handle app ready
        app.whenReady().then(() => {
            this.onReady();
        });

        // Handle all windows closed
        app.on('window-all-closed', () => {
            // On macOS, keep app running even when all windows are closed
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        // Handle app quit - cleanup global shortcuts
        app.on('will-quit', () => {
            globalShortcut.unregisterAll();
        });

        // Handle app activate (macOS)
        app.on('activate', () => {
            if (this.searchWindow) {
                this.searchWindow.show();
            }
        });

        // Setup global error handlers for EPIPE
        this.setupErrorHandlers();

        // Setup IPC handlers
        this.setupIpcHandlers();
    }

    setupErrorHandlers() {
        // Handle EPIPE errors that can occur when writing to closed stdout/stderr
        process.stdout.on('error', (error) => {
            if (error.code === 'EPIPE') {
                // Silently ignore pipe errors - common when output stream is closed
                return;
            }
            // Re-throw other errors
            throw error;
        });

        process.stderr.on('error', (error) => {
            if (error.code === 'EPIPE') {
                // Silently ignore pipe errors - common when output stream is closed
                return;
            }
            // Re-throw other errors
            throw error;
        });

        // Handle uncaught exceptions that might be EPIPE related
        process.on('uncaughtException', (error) => {
            if (error.code === 'EPIPE') {
                // Silently ignore pipe errors - common when output stream is closed
                return;
            }
            // Re-throw other errors
            throw error;
        });
    }

    onReady() {
        console.log('Application ready');
        this.isReady = true;
        this.createTray();
        this.setupGlobalShortcuts();
        this.handleStartupBehavior();
    }

    createTray() {
        try {
            console.log('Creating system tray...');
            let trayIcon;

            // Try different icon sizes for different platforms
            const iconSize = process.platform === 'darwin' ? 18 : 16;

            // Try to load the icon
            const iconPath = path.join(__dirname, 'icon.png');
            console.log('Icon path:', iconPath);
            console.log('Icon file exists:', require('fs').existsSync(iconPath));

            // Just use the PNG icon with proper template mode for macOS
            try {
                const image = nativeImage.createFromPath(iconPath);
                console.log('Icon loaded, size:', image.getSize(), 'empty:', image.isEmpty());

                if (!image.isEmpty()) {
                    // Resize icon properly for macOS system tray
                    trayIcon = image.resize({
                        width: iconSize,
                        height: iconSize,
                        quality: 'best'
                    });

                    // For macOS, we need to set template mode to make it visible in both dark and light mode
                    if (process.platform === 'darwin') {
                        trayIcon.setTemplateImage(true);
                    }

                    console.log('Using resized PNG icon with', process.platform === 'darwin' ? 'template mode' : 'normal mode');
                } else {
                    throw new Error('PNG icon is empty');
                }
            } catch (error) {
                console.log('PNG failed, creating fallback icon:', error.message);
                trayIcon = this.createSimpleFallbackIcon(iconSize);
            }

            // Create tray - same constructor for all platforms
            this.tray = new Tray(trayIcon);
            this.tray.setToolTip('anyQuere');
            console.log('Tray created with icon');

            // Create context menu
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: 'Search',
                    click: () => this.showSearch()
                },
                {
                    label: 'Time',
                    click: () => this.showTime()
                },
                {
                    label: 'Settings',
                    click: () => this.showSettings()
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    click: () => this.quitApp()
                }
            ]);

            this.tray.setContextMenu(contextMenu);

            // Remove automatic left-click behavior
            // Search will only appear when selected from the context menu
            console.log('Tray configured - Search only available from context menu');

            console.log('System tray created successfully');

        } catch (error) {
            console.error('Failed to create tray:', error);
            // Continue without tray - create window instead
            setTimeout(() => {
                this.showSearch();
            }, 1000);
        }
    }

    setupGlobalShortcuts() {
        try {
            console.log('Setting up global shortcuts...');

            // Register Cmd+Space (macOS) or Ctrl+Space (Windows/Linux) for search
            const searchAccelerator = process.platform === 'darwin' ? 'Cmd+Space' : 'Ctrl+Space';

            const success = globalShortcut.register(searchAccelerator, () => {
                console.log('Global shortcut triggered');
                this.showSearch();
            });

            if (success) {
                console.log(`Global shortcut registered: ${searchAccelerator}`);
            } else {
                console.log(`Global shortcut registration failed: ${searchAccelerator}`);
                // Try alternative shortcuts
                this.setupAlternativeShortcuts();
            }

        } catch (error) {
            console.error('Failed to setup global shortcuts:', error);
        }
    }

    setupAlternativeShortcuts() {
        const alternatives = [
            'CmdOrCtrl+K',
            'CmdOrCtrl+Shift+Space',
            'Alt+Space'
        ];

        alternatives.forEach(shortcut => {
            try {
                const success = globalShortcut.register(shortcut, () => {
                    console.log(`Alternative global shortcut triggered: ${shortcut}`);
                    this.showSearch();
                });

                if (success) {
                    console.log(`Alternative global shortcut registered: ${shortcut}`);
                    return; // Stop trying alternatives after first success
                }
            } catch (error) {
                console.log(`Failed to register alternative shortcut: ${shortcut}`);
            }
        });
    }

    handleStartupBehavior() {
        try {
            const settings = this.dataManager.getSettings();
            console.log('Startup settings:', settings);

            // Show search window on startup if enabled
            if (settings.showOnStartup) {
                setTimeout(() => {
                    this.showSearch();
                }, 1000); // Wait 1 second to ensure everything is loaded
            }
        } catch (error) {
            console.error('Failed to handle startup behavior:', error);
        }
    }

    createSimpleFallbackIcon(size) {
        // Create text-only icon like weather app
        const svgData = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <!-- Just text like macOS Weather app shows temperature -->
                <text x="${size/2}" y="${size/2 + 1}"
                      font-family="system-ui, -apple-system, 'SF Pro Text', sans-serif"
                      font-size="${size*0.7}"
                      font-weight="600"
                      fill="white"
                      text-anchor="middle"
                      dominant-baseline="middle">aQ</text>
            </svg>
        `;

        const buffer = Buffer.from(svgData);
        const icon = nativeImage.createFromBuffer(buffer, {
            width: size,
            height: size
        });

        // Set as template image to make it work like system icons (white text, adapts to theme)
        if (process.platform === 'darwin') {
            try {
                icon.setTemplateImage(true);
                console.log('Set text icon as template image for macOS');
            } catch (error) {
                console.log('Could not set template image:', error.message);
            }
        }

        console.log('Created text-only aQ icon like weather app');
        return icon;
    }

    showSearch() {
        try {
            if (this.settingsWindow) {
                this.settingsWindow.hide();
            }

            if (!this.searchWindow) {
                // Calculate 1/2 of screen height for initial window size
                const { screen } = require('electron');
                const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
                const initialHeight = Math.floor(screenHeight * 0.5);

                this.searchWindow = new BrowserWindow({
                    width: 800,
                    height: initialHeight, // Start with 1/2 screen height
                    minHeight: 400, // Allow reasonable minimum height
                    maxHeight: screenHeight, // Allow up to full screen height
                    frame: false,
                    alwaysOnTop: true,
                    skipTaskbar: true,
                    resizable: false, // Disable manual resizing but allow programmatic resizing
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        sandbox: false
                    }
                });

                const searchPath = path.join(__dirname, 'renderer/search.html');
                console.log('Loading search window from:', searchPath);
                console.log('Search file exists:', require('fs').existsSync(searchPath));

                this.searchWindow.loadFile(searchPath);

                this.searchWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                    console.error('Failed to load search window:', errorCode, errorDescription);
                });

                this.searchWindow.webContents.on('did-finish-load', () => {
                    console.log('Search window loaded successfully');
                });

                this.searchWindow.on('closed', () => {
                    this.searchWindow = null;
                });

                this.searchWindow.on('blur', () => {
                    // Optional: hide window when it loses focus
                    // this.searchWindow.hide();
                });
            }

            // Position window at top-center of screen
            const { width: screenWidth } = require('electron').screen.getPrimaryDisplay().workAreaSize;
            const windowWidth = 800;
            const xPos = Math.floor((screenWidth - windowWidth) / 2);
            this.searchWindow.setPosition(xPos, 50); // Position at top-center
            this.searchWindow.show();
            this.searchWindow.focus();

        } catch (error) {
            console.error('Failed to show search window:', error);
        }
    }

    showTime() {
        try {
            if (this.settingsWindow) {
                this.settingsWindow.hide();
            }
            if (this.searchWindow) {
                this.searchWindow.hide();
            }

            if (!this.timeWindow) {
                // Calculate 3/4 of screen height for time converter
                const { screen } = require('electron');
                const { height: screenHeight, width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
                const windowWidth = 900;
                const windowHeight = Math.floor(screenHeight * 0.75);

                this.timeWindow = new BrowserWindow({
                    width: windowWidth,
                    height: windowHeight,
                    minWidth: 800,
                    minHeight: 600,
                    frame: false,
                    // No titleBarStyle at all - let frame: false handle it
                    alwaysOnTop: true,
                    skipTaskbar: true,
                    resizable: false,
                    show: false,  // Don't show until ready
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        sandbox: false
                    }
                });

                const timePath = path.join(__dirname, 'renderer/time.html');
                console.log('Loading time window from:', timePath);
                console.log('Time file exists:', require('fs').existsSync(timePath));

                this.timeWindow.loadFile(timePath);

                this.timeWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                    console.error('Failed to load time window:', errorCode, errorDescription);
                });

                this.timeWindow.webContents.on('did-finish-load', () => {
                    console.log('Time window loaded successfully');
                    this.timeWindow.show();  // Show window after it's loaded
                });

                // Add error handling to detect JavaScript errors
                this.timeWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
                    console.log(`[Time Window Console ${level}]:`, message);
                });

                this.timeWindow.webContents.on('preload-error', (event, preloadPath, error) => {
                    console.error('Time window preload error:', error);
                });

                this.timeWindow.on('closed', () => {
                    this.timeWindow = null;
                });

                // Position window at top-center of screen (same as search window)
                const xPos = Math.floor((screenWidth - windowWidth) / 2);
                this.timeWindow.setPosition(xPos, 50); // Position at top-center
            }

            this.timeWindow.show();
            this.timeWindow.focus();

        } catch (error) {
            console.error('Failed to show time window:', error);
        }
    }

    showSettings(focusTab = null) {
        try {
            if (this.searchWindow) {
                this.searchWindow.hide();
            }
            if (this.timeWindow) {
                this.timeWindow.hide();
            }

            if (!this.settingsWindow) {
                this.settingsWindow = new BrowserWindow({
                    width: 900,
                    height: 700,
                    minWidth: 800,
                    minHeight: 600,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        sandbox: false
                    }
                });

                const settingsPath = path.join(__dirname, 'renderer/settings.html');
                console.log('Loading settings window from:', settingsPath);
                console.log('Settings file exists:', require('fs').existsSync(settingsPath));

                this.settingsWindow.loadFile(settingsPath);

                this.settingsWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                    console.error('Failed to load settings window:', errorCode, errorDescription);
                });

                // Add error handling to detect JavaScript errors in settings window
                this.settingsWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
                    console.log(`[Settings Window Console ${level}]:`, message);
                });

                this.settingsWindow.webContents.on('preload-error', (event, preloadPath, error) => {
                    console.error('Settings window preload error:', error);
                });

                this.settingsWindow.webContents.on('did-finish-load', () => {
                    console.log('Settings window loaded successfully');
                    // Send focus tab information if specified
                    if (focusTab) {
                        this.settingsWindow.webContents.send('focus-tab', focusTab);
                    }
                });

                this.settingsWindow.on('closed', () => {
                    this.settingsWindow = null;
                });
            }

            this.settingsWindow.center();
            this.settingsWindow.show();

        } catch (error) {
            console.error('Failed to show settings window:', error);
        }
    }

    setupIpcHandlers() {
        // Search functionality
        ipcMain.handle('search', async (event, alias, query) => {
            try {
                return await this.dataManager.search(alias, query);
            } catch (error) {
                console.error('Search error:', error);
                return [];
            }
        });

        // Data source management
        ipcMain.handle('get-sources', async () => {
            try {
                console.log('IPC: get-sources called');
                const sources = await this.dataManager.getSources();
                console.log('IPC: get-sources returning', sources.length, 'sources');
                return sources;
            } catch (error) {
                console.error('IPC: Get sources error:', error);
                return [];
            }
        });

        ipcMain.handle('add-source', async (event, sourceConfig) => {
            try {
                this.dataManager.addSource(sourceConfig);
                return { success: true };
            } catch (error) {
                console.error('Add source error:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('remove-source', async (event, alias) => {
            try {
                this.dataManager.removeSource(alias);
                return { success: true };
            } catch (error) {
                console.error('Remove source error:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('load-data', async (event, alias) => {
            try {
                return await this.dataManager.loadData(alias);
            } catch (error) {
                console.error('Load data error:', error);
                return null;
            }
        });

        // Window controls
        ipcMain.handle('close-search', () => {
            if (this.searchWindow) {
                this.searchWindow.hide();
            }
        });

        ipcMain.handle('close-settings', () => {
            if (this.settingsWindow) {
                this.settingsWindow.hide();
            }
        });

        ipcMain.handle('close-time', () => {
            if (this.timeWindow) {
                this.timeWindow.hide();
            }
        });

        ipcMain.handle('open-settings', () => {
            this.showSettings();
        });

        ipcMain.handle('minimize-window', (event, windowName) => {
            let window;
            if (windowName === 'search') {
                window = this.searchWindow;
            } else if (windowName === 'time') {
                window = this.timeWindow;
            } else {
                window = this.settingsWindow;
            }
            if (window) {
                window.minimize();
            }
        });

        // Window resizing (height only, keep x position fixed)
        ipcMain.handle('resize-search-window', (event, width, height) => {
            if (this.searchWindow) {
                const [currentWidth, currentHeight] = this.searchWindow.getSize();
                const [currentX, currentY] = this.searchWindow.getPosition();
                const { screen } = require('electron');
                const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
                const newWidth = width || currentWidth;
                const newHeight = Math.max(400, Math.min(screenHeight, height || currentHeight));

                // Resize window but keep x position the same (top-center)
                this.searchWindow.setSize(newWidth, newHeight);
                this.searchWindow.setPosition(currentX, currentY); // Maintain the same position
                return { success: true, width: newWidth, height: newHeight };
            }
            return { success: false };
        });

        // App control
        ipcMain.handle('quit-app', () => {
            this.quitApp();
        });

        // Settings management
        ipcMain.handle('get-settings', () => {
            try {
                return this.dataManager.getSettings();
            } catch (error) {
                console.error('Get settings error:', error);
                return {};
            }
        });

        ipcMain.handle('update-settings', async (event, newSettings) => {
            try {
                await this.dataManager.updateSettings(newSettings);
                return { success: true };
            } catch (error) {
                console.error('Update settings error:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('clear-cache', async (event, alias = null) => {
            try {
                this.dataManager.clearCache(alias);
                return { success: true };
            } catch (error) {
                console.error('Clear cache error:', error);
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('show-open-dialog', async (event, options) => {
            try {
                const { dialog } = require('electron');
                const result = await dialog.showOpenDialog(this.settingsWindow, options);
                return result;
            } catch (error) {
                console.error('Show open dialog error:', error);
                throw error;
            }
        });

        // Time window functionality
        ipcMain.on('open-settings', () => {
            this.showSettings();
        });

        ipcMain.on('open-settings-with-time-focus', () => {
            this.showSettings('time'); // Focus on Time converter tab
        });

        ipcMain.on('close-time-window', () => {
            if (this.timeWindow) {
                this.timeWindow.close();
                this.timeWindow = null;
            }
        });
    }

    quitApp() {
        console.log('Quitting application');
        if (this.searchWindow) {
            this.searchWindow.close();
        }
        if (this.settingsWindow) {
            this.settingsWindow.close();
        }
        app.quit();
    }
}

// Start the application
new SystemTrayApp();