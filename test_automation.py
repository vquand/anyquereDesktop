#!/usr/bin/env python3
"""
Automated testing system for anyquereDesktop UI components.
Tests window opening, functionality, and user interactions.
"""

import sys
import os
import time
import logging
import threading
import queue
from typing import Optional, List, Dict, Any
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('test_automation.log')
    ]
)

class AutomatedTester:
    """Automated testing system for anyquereDesktop"""

    def __init__(self):
        self.results = []
        self.current_test = None
        self.tray_app = None
        self.test_queue = queue.Queue()

    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log a test result"""
        result = {
            'test': test_name,
            'status': status,
            'details': details,
            'timestamp': time.time()
        }
        self.results.append(result)

        status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        logging.info(f"{status_symbol} {test_name}: {status} - {details}")

    def test_data_manager(self) -> bool:
        """Test DataManager functionality"""
        try:
            logging.info("Testing DataManager...")
            from src.core.data_manager import DataManager

            # Create DataManager
            dm = DataManager()
            self.log_test("DataManager Creation", "PASS", "DataManager created successfully")

            # Test basic methods
            sources = dm.get_all_sources()
            self.log_test("DataManager.get_all_sources", "PASS", f"Found {len(sources)} sources")

            # Test source aliases
            aliases = dm.get_source_aliases()
            self.log_test("DataManager.get_source_aliases", "PASS", f"Found {len(aliases)} aliases")

            # Test search functionality
            results = dm.search_data("test", source_name=None)
            self.log_test("DataManager.search_data", "PASS", f"Search returned {len(results)} results")

            return True

        except Exception as e:
            self.log_test("DataManager", "FAIL", str(e))
            return False

    def test_search_window_creation(self) -> bool:
        """Test SearchWindow creation and basic functionality"""
        try:
            logging.info("Testing SearchWindow creation...")
            from src.ui.search_window_tkinter import SearchWindow
            from src.core.data_manager import DataManager

            # Create DataManager
            dm = DataManager()

            # Create SearchWindow
            search_window = SearchWindow(dm)
            self.log_test("SearchWindow Creation", "PASS", "SearchWindow created successfully")

            # Test window attributes
            assert hasattr(search_window, 'root'), "SearchWindow missing root attribute"
            assert hasattr(search_window, 'search_entry'), "SearchWindow missing search_entry"
            self.log_test("SearchWindow Attributes", "PASS", "All required attributes present")

            # Test window show/hide
            search_window.show_search("test query")
            self.log_test("SearchWindow Show", "PASS", "Window shown with test query")

            # Wait a moment for window to appear
            time.sleep(0.5)

            # Test window hide
            search_window.hide_window()
            self.log_test("SearchWindow Hide", "PASS", "Window hidden successfully")

            # Clean up
            try:
                search_window.root.destroy()
            except:
                pass

            return True

        except Exception as e:
            self.log_test("SearchWindow Creation", "FAIL", str(e))
            import traceback
            logging.error(f"SearchWindow test error: {traceback.format_exc()}")
            return False

    def test_settings_window_creation(self) -> bool:
        """Test SettingsWindow creation and basic functionality"""
        try:
            logging.info("Testing SettingsWindow creation...")
            from src.ui.settings_window_tkinter import SettingsWindow
            from src.core.data_manager import DataManager

            # Create DataManager
            dm = DataManager()

            # Create SettingsWindow
            settings_window = SettingsWindow(dm)
            self.log_test("SettingsWindow Creation", "PASS", "SettingsWindow created successfully")

            # Test window attributes
            assert hasattr(settings_window, 'root'), "SettingsWindow missing root attribute"
            self.log_test("SettingsWindow Attributes", "PASS", "All required attributes present")

            # Test window show/hide
            settings_window.show()
            self.log_test("SettingsWindow Show", "PASS", "Settings window shown")

            # Wait a moment for window to appear
            time.sleep(0.5)

            # Test window hide
            settings_window.hide()
            self.log_test("SettingsWindow Hide", "PASS", "Settings window hidden")

            # Clean up
            try:
                settings_window.root.destroy()
            except:
                pass

            return True

        except Exception as e:
            self.log_test("SettingsWindow Creation", "FAIL", str(e))
            import traceback
            logging.error(f"SettingsWindow test error: {traceback.format_exc()}")
            return False

    def test_tray_app_creation(self) -> bool:
        """Test SystemTrayApp creation"""
        try:
            logging.info("Testing SystemTrayApp creation...")
            from src.ui.tray import SystemTrayApp

            # Create tray app
            tray_app = SystemTrayApp()
            self.log_test("SystemTrayApp Creation", "PASS", "Tray app created successfully")

            # Test tray app attributes
            assert hasattr(tray_app, 'icon'), "Tray app missing icon attribute"
            assert hasattr(tray_app, 'data_manager'), "Tray app missing data_manager"
            assert tray_app.icon is not None, "Tray icon is None"
            self.log_test("SystemTrayApp Attributes", "PASS", "All required attributes present")

            # Test menu callbacks exist
            assert hasattr(tray_app, 'show_search'), "Tray app missing show_search method"
            assert hasattr(tray_app, 'show_settings'), "Tray app missing show_settings method"
            assert hasattr(tray_app, 'quit_app'), "Tray app missing quit_app method"
            self.log_test("SystemTrayApp Methods", "PASS", "All required methods present")

            self.tray_app = tray_app
            return True

        except Exception as e:
            self.log_test("SystemTrayApp Creation", "FAIL", str(e))
            import traceback
            logging.error(f"Tray app test error: {traceback.format_exc()}")
            return False

    def test_tray_menu_callbacks(self) -> bool:
        """Test tray menu callbacks without actually showing windows"""
        try:
            if not self.tray_app:
                self.log_test("Tray Menu Callbacks", "SKIP", "No tray app available")
                return False

            logging.info("Testing tray menu callbacks...")

            # Test show_search callback (just call the method, don't wait for window)
            try:
                self.tray_app.show_search()
                # Wait a moment to see if any errors occur
                time.sleep(1)
                self.log_test("Tray show_search Callback", "PASS", "show_search method executed")
            except Exception as e:
                self.log_test("Tray show_search Callback", "FAIL", f"show_search failed: {e}")

            # Test show_settings callback
            try:
                self.tray_app.show_settings()
                # Wait a moment to see if any errors occur
                time.sleep(1)
                self.log_test("Tray show_settings Callback", "PASS", "show_settings method executed")
            except Exception as e:
                self.log_test("Tray show_settings Callback", "FAIL", f"show_settings failed: {e}")

            return True

        except Exception as e:
            self.log_test("Tray Menu Callbacks", "FAIL", str(e))
            return False

    def test_automated_tray_interaction(self) -> bool:
        """Test automated tray interaction by simulating menu clicks"""
        try:
            if not self.tray_app:
                self.log_test("Automated Tray Interaction", "SKIP", "No tray app available")
                return False

            logging.info("Testing automated tray interaction...")

            # Simulate clicking search menu item
            logging.info("Simulating Search menu click...")
            self.tray_app.show_search()

            # Wait and check for any window creation
            time.sleep(2)

            # Check if search window was created
            if hasattr(self.tray_app, 'search_window') and self.tray_app.search_window:
                self.log_test("Automated Search Click", "PASS", "Search window created successfully")
            else:
                self.log_test("Automated Search Click", "FAIL", "Search window was not created")

            # Simulate clicking settings menu item
            logging.info("Simulating Settings menu click...")
            self.tray_app.show_settings()

            # Wait and check for any window creation
            time.sleep(2)

            # Check if settings window was created
            if hasattr(self.tray_app, 'settings_window') and self.tray_app.settings_window:
                self.log_test("Automated Settings Click", "PASS", "Settings window created successfully")
            else:
                self.log_test("Automated Settings Click", "FAIL", "Settings window was not created")

            return True

        except Exception as e:
            self.log_test("Automated Tray Interaction", "FAIL", str(e))
            import traceback
            logging.error(f"Automated interaction error: {traceback.format_exc()}")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return results"""
        logging.info("Starting comprehensive automated testing...")

        # Test individual components
        self.test_data_manager()
        self.test_search_window_creation()
        self.test_settings_window_creation()
        self.test_tray_app_creation()
        self.test_tray_menu_callbacks()
        self.test_automated_tray_interaction()

        # Calculate summary
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if r['status'] == 'PASS'])
        failed_tests = len([r for r in self.results if r['status'] == 'FAIL'])
        skipped_tests = len([r for r in self.results if r['status'] == 'SKIP'])

        summary = {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'skipped': skipped_tests,
            'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            'results': self.results
        }

        logging.info(f"Testing completed: {passed_tests}/{total_tests} passed ({summary['success_rate']:.1f}%)")

        return summary

    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print("\n" + "="*60)
        print("🧪 AUTOMATED TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {summary['total']}")
        print(f"✅ Passed: {summary['passed']}")
        print(f"❌ Failed: {summary['failed']}")
        print(f"⚠️  Skipped: {summary['skipped']}")
        print(f"📊 Success Rate: {summary['success_rate']:.1f}%")
        print("="*60)

        if summary['failed'] > 0:
            print("\n❌ FAILED TESTS:")
            for result in summary['results']:
                if result['status'] == 'FAIL':
                    print(f"   • {result['test']}: {result['details']}")

        print("\n📋 DETAILED RESULTS:")
        for result in summary['results']:
            if result['status'] == 'PASS':
                status_symbol = "✅"
            elif result['status'] == 'FAIL':
                status_symbol = "❌"
            else:
                status_symbol = "⚠️"
            print(f"   {status_symbol} {result['test']}: {result['details']}")


def main():
    """Main test runner"""
    print("🚀 Starting anyquereDesktop Automated Testing...")

    tester = AutomatedTester()

    try:
        summary = tester.run_all_tests()
        tester.print_summary(summary)

        # Exit with appropriate code
        if summary['failed'] > 0:
            sys.exit(1)
        else:
            sys.exit(0)

    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Testing failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()