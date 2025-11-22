import threading
import logging
import queue
import pystray
from PIL import Image, ImageDraw
from src.core.data_manager import DataManager

class SystemTrayApp:
    def __init__(self):
        self.icon = None
        self.search_window = None
        self.settings_window = None
        self.data_manager = None
        self.running = False
        self.qt_app = None  # QApplication for PySide6
        self.window_queue = queue.Queue()
        self.pystray_thread = None

        logging.info("Creating SystemTrayApp...")

        try:
            # Initialize Qt in main thread (required for macOS)
            self.init_qt_main_thread()
            logging.info("✓ Qt initialized in main thread")

            # Initialize data manager
            self.data_manager = DataManager()
            logging.info("✓ DataManager created successfully")

            # Create system tray icon
            self.create_icon()
            logging.info("✓ System tray icon created successfully")

        except Exception as e:
            logging.error(f"✗ Failed to initialize SystemTrayApp: {e}")
            import traceback
            logging.error(f"Traceback: {traceback.format_exc()}")

    def init_qt_main_thread(self):
        """Initialize Qt in main thread for macOS compatibility"""
        try:
            from PySide6.QtWidgets import QApplication

            # Create QApplication instance if it doesn't exist
            if not QApplication.instance():
                self.qt_app = QApplication([])
                logging.info("✓ QApplication created in main thread")
            else:
                self.qt_app = QApplication.instance()
                logging.info("✓ Using existing QApplication instance")

            logging.info("✓ Qt initialized in main thread for macOS")

        except Exception as e:
            logging.error(f"Failed to initialize Qt in main thread: {e}")
            import traceback
            logging.error(f"Traceback: {traceback.format_exc()}")
            self.qt_app = None

    def start_pystray_thread(self):
        """Start pystray in a separate thread (Qt must be in main thread on macOS)"""
        def pystray_loop():
            logging.info("pystray thread started successfully")
            try:
                if self.icon:
                    self.icon.run()
                    logging.info("pystray loop completed")
            except Exception as e:
                logging.error(f"Error in pystray loop: {e}")

        # Start pystray in separate thread
        self.pystray_thread = threading.Thread(target=pystray_loop, daemon=True)
        self.pystray_thread.start()
        logging.info("pystray thread started")

    def process_window_requests(self):
        """Process window requests in main Qt thread"""
        if not self.running:
            return False

        try:
            # Check for window requests (non-blocking)
            request = self.window_queue.get_nowait()
            logging.info(f"Processing window request: {request}")

            if request['type'] == 'search':
                try:
                    # Close settings window first if open
                    self._close_settings_window()

                    if self.search_window is None:
                        from src.ui.search_window_pyside6 import SearchWindow
                        self.search_window = SearchWindow(self.data_manager)
                        # Connect settings signal
                        self.search_window.settings_requested.connect(self.show_settings)

                    self.search_window.show_search()
                    logging.info("✓ Search window displayed successfully")
                except Exception as e:
                    logging.error(f"Error showing search window: {e}")

            elif request['type'] == 'settings':
                try:
                    # Close search window first if open
                    self._close_search_window()

                    if self.settings_window is None:
                        from src.ui.settings_window_pyside6 import SettingsWindow
                        self.settings_window = SettingsWindow(self.data_manager)

                    self.settings_window.show()
                    logging.info("✓ Settings window displayed successfully")
                except Exception as e:
                    logging.error(f"Error showing settings window: {e}")

            elif request['type'] == 'quit':
                return False

        except queue.Empty:
            # No request, continue processing Qt events
            pass
        except Exception as e:
            logging.error(f"Error processing window request: {e}")

        # Process Qt events with proper error handling
        try:
            if self.qt_app and hasattr(self.qt_app, 'processEvents'):
                self.qt_app.processEvents()
        except Exception as e:
            logging.error(f"Error processing Qt events: {e}")
            # Don't return False here, just continue the loop

        return True

    def create_icon(self):
        """Create a simple icon for the system tray"""
        try:
            logging.info("Creating icon image...")

            # Create a simple 64x64 image with solid color
            image = Image.new('RGB', (64, 64), color=(0, 100, 200))
            draw = ImageDraw.Draw(image)

            # Draw a simple circle
            draw.ellipse([8, 8, 56, 56], fill=(255, 255, 255), outline=(0, 50, 150), width=2)

            # Draw a simple "A" in the center
            draw.text((20, 20), "A", fill=(0, 0, 0))

            logging.info(f"Icon image created: {image.size}, mode: {image.mode}")

            # Create menu items
            menu_items = [
                pystray.MenuItem("Search", self.show_search),
                pystray.MenuItem("Settings", self.show_settings),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Quit", self.quit_app)
            ]

            # Create icon with all parameters
            self.icon = pystray.Icon(
                "anyquereDesktop",
                icon=image,  # Use 'icon' parameter instead of 'image'
                title="anyquereDesktop",
                menu=pystray.Menu(*menu_items)
            )

            logging.info("✓ System tray icon created successfully")

        except Exception as e:
            logging.error(f"✗ Failed to create icon: {e}")
            import traceback
            logging.error(f"Traceback: {traceback.format_exc()}")

            # Create icon without image as fallback
            try:
                menu_items = [
                    pystray.MenuItem("Search", self.show_search),
                    pystray.MenuItem("Settings", self.show_settings),
                    pystray.Menu.SEPARATOR,
                    pystray.MenuItem("Quit", self.quit_app)
                ]

                # Create minimal icon
                self.icon = pystray.Icon(
                    "anyquereDesktop",
                    title="anyquereDesktop",
                    menu=pystray.Menu(*menu_items)
                )

                logging.info("✓ Text-only icon created as fallback")

            except Exception as fallback_error:
                logging.error(f"✗ Failed to create fallback icon: {fallback_error}")
                self.icon = None

    def show_search(self, icon=None, item=None):
        """Show the search window (close settings first if open)"""
        try:
            logging.info("Queueing search window request...")
            # Put request in queue for tkinter thread to handle
            self.window_queue.put({'type': 'search'})
            logging.info("Search window request queued successfully")

        except Exception as e:
            logging.error(f"Failed to show search window: {e}")
            import traceback
            logging.error(f"Traceback: {traceback.format_exc()}")

    def show_settings(self, icon=None, item=None):
        """Show the settings window (close search first if open)"""
        try:
            logging.info("Queueing settings window request...")
            # Put request in queue for tkinter thread to handle
            self.window_queue.put({'type': 'settings'})
            logging.info("Settings window request queued successfully")

        except Exception as e:
            logging.error(f"Failed to show settings window: {e}")
            import traceback
            logging.error(f"Traceback: {traceback.format_exc()}")

    def _close_search_window(self):
        """Close the search window if it's open"""
        if self.search_window is not None:
            try:
                if hasattr(self.search_window, 'root') and self.search_window.root:
                    self.search_window.hide_window()
                    logging.info("✓ Search window closed before opening settings")
                else:
                    # Destroy the window completely if it doesn't have hide_window
                    self.search_window = None
                    logging.info("✓ Search window cleaned up before opening settings")
            except Exception as e:
                logging.warning(f"Error closing search window: {e}")
                # Force cleanup
                self.search_window = None

    def _close_settings_window(self):
        """Close the settings window if it's open"""
        if self.settings_window is not None:
            try:
                if hasattr(self.settings_window, 'hide'):
                    self.settings_window.hide()
                    logging.info("✓ Settings window closed before opening search")
                else:
                    # Destroy the window completely if it doesn't have hide method
                    self.settings_window = None
                    logging.info("✓ Settings window cleaned up before opening search")
            except Exception as e:
                logging.warning(f"Error closing settings window: {e}")
                # Force cleanup
                self.settings_window = None

    def _ensure_qt_initialized(self):
        """Ensure Qt is initialized (lazy initialization for macOS)"""
        if self.qt_app is None:
            logging.info("Initializing Qt on demand...")
            from PySide6.QtWidgets import QApplication

            # Get or create QApplication instance
            self.qt_app = QApplication.instance()
            if self.qt_app is None:
                self.qt_app = QApplication([])
                logging.info("✓ QApplication created on demand")
            else:
                logging.info("✓ Using existing QApplication instance")

    def quit_app(self, icon=None, item=None):
        """Quit the application"""
        logging.info("Quitting anyquereDesktop...")
        self.running = False
        if self.icon:
            self.icon.stop()
            # Clean up Qt windows if they exist
            if self.search_window:
                try:
                    self.search_window.close()
                except:
                    pass
            if self.settings_window:
                try:
                    self.settings_window.close()
                except:
                    pass
        # Clean up QApplication if it exists
        if self.qt_app:
            try:
                self.qt_app.quit()
            except:
                pass

    def run(self):
        """Run the system tray application"""
        if self.icon is None:
            logging.error("Failed to create system tray icon")
            return False

        try:
            self.running = True
            logging.info("Starting system tray...")

            # Start pystray in separate thread (Qt must be in main thread on macOS)
            self.start_pystray_thread()

            # Main thread loop: process Qt events and window requests
            logging.info("Starting Qt event loop in main thread...")
            while self.running:
                if not self.process_window_requests():
                    break
                # Small delay to prevent busy waiting
                import time
                time.sleep(0.01)

            logging.info("✓ System tray stopped")
            return True

        except Exception as e:
            logging.error(f"✗ Failed to run system tray: {e}")
            import traceback
            logging.error(f"Traceback: {traceback.format_exc()}")
            return False

    