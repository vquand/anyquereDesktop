import sys
import argparse
import logging
import os
import threading
import queue

# Import tkinter components (built into Python)
from src.ui.tray import SystemTrayApp

def setup_logging(debug_mode):
    if debug_mode:
        debug_dir = os.path.join(os.path.dirname(__file__), 'debug')
        os.makedirs(debug_dir, exist_ok=True)
        log_file = os.path.join(debug_dir, 'app.log')

        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        logging.info("Debug mode enabled")
    else:
        logging.basicConfig(level=logging.WARNING)

def main():
    parser = argparse.ArgumentParser(description="Anyquere Desktop")
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    args = parser.parse_args()

    setup_logging(args.debug)

    logging.info("Starting anyquereDesktop...")

    try:
        # Create system tray app
        logging.info("Creating SystemTrayApp...")
        tray = SystemTrayApp()
        logging.info("SystemTrayApp created successfully")

        # Run the system tray
        logging.info("Starting system tray...")
        success = tray.run()

        if success:
            logging.info("System tray completed successfully")
        else:
            logging.error("System tray failed")
            sys.exit(1)

    except KeyboardInterrupt:
        logging.info("anyquereDesktop stopped by user")
        sys.exit(0)
    except Exception as e:
        logging.error(f"Failed to start anyquereDesktop: {e}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        sys.exit(1)

if __name__ == "__main__":
    main()