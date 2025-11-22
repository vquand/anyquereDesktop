import sys
import logging
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                                     QHBoxLayout, QLineEdit, QTextEdit, QPushButton,
                                     QLabel, QFrame, QTreeWidget, QTreeWidgetItem,
                                     QHeaderView, QAbstractItemView)
from PySide6.QtCore import Qt, QTimer, Signal, QObject
from PySide6.QtGui import QFont, QIcon, QKeySequence, QShortcut

class SearchWindow(QMainWindow):
    """PySide6-based search window (replaces tkinter version)"""

    # Custom signal to communicate back to tray
    settings_requested = Signal()
    window_closed = Signal()

    def __init__(self, data_manager):
        super().__init__()
        self.data_manager = data_manager
        self.current_source = None
        self.fixed_position = None
        self.settings_callback = None

        # Style configuration
        self.base_width = 800
        self.base_height = 100
        self.max_height = 600

        self.setup_ui()
        self.setup_styles()
        self.setup_shortcuts()

        # Position window like macOS Spotlight (center top)
        self.center_top()

        logging.info("PySide6 SearchWindow created successfully")

    def setup_ui(self):
        """Setup the user interface"""
        self.setWindowTitle("anyquereDesktop - Search")
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)
        self.setGeometry(100, 100, self.base_width, self.base_height)

        # Remove window decorations
        self.setAttribute(Qt.WA_TranslucentBackground)

        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main layout
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(10)

        # Search bar
        search_layout = QHBoxLayout()
        search_layout.setSpacing(10)

        # Source label
        self.source_label = QLabel()
        self.source_label.setStyleSheet("color: #007acc; font-weight: bold; font-size: 12px;")
        search_layout.addWidget(self.source_label)

        # Search input
        self.search_entry = QLineEdit()
        self.search_entry.setPlaceholderText("Search your code...")
        self.search_entry.textChanged.connect(self.on_search_text_changed)
        self.search_entry.returnPressed.connect(self.on_search_enter)
        search_layout.addWidget(self.search_entry, 1)

        # Settings button
        self.settings_btn = QPushButton("⚙️")
        self.settings_btn.setFixedSize(30, 30)
        self.settings_btn.clicked.connect(self.on_settings_clicked)
        self.settings_btn.setStyleSheet("""
            QPushButton {
                background-color: #3b3b3b;
                color: #888;
                border: none;
                border-radius: 4px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #555;
                color: white;
            }
        """)
        search_layout.addWidget(self.settings_btn)

        # Close button
        self.close_btn = QPushButton("✕")
        self.close_btn.setFixedSize(30, 30)
        self.close_btn.clicked.connect(self.hide_window)
        self.close_btn.setStyleSheet("""
            QPushButton {
                background-color: #3b3b3b;
                color: #888;
                border: none;
                border-radius: 4px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #555;
                color: white;
            }
        """)
        search_layout.addWidget(self.close_btn)

        main_layout.addLayout(search_layout)

        # Results tree widget
        self.results_tree = QTreeWidget()
        self.results_tree.setHeaderHidden(True)
        self.results_tree.setAlternatingRowColors(True)
        self.results_tree.setRootIsDecorated(False)
        self.results_tree.setItemsExpandable(False)
        self.results_tree.setSelectionMode(QAbstractItemView.SingleSelection)
        self.results_tree.itemDoubleClicked.connect(self.on_item_double_clicked)

        # Configure columns
        self.results_tree.setColumnCount(3)
        self.results_tree.setHeaderLabels(["File", "Line", "Content"])

        # Set column widths
        header = self.results_tree.header()
        header.resizeSection(0, 150)  # File
        header.resizeSection(1, 60)   # Line
        header.resizeSection(2, 400)  # Content
        header.setStretchLastSection(True)

        # Style the tree widget
        self.results_tree.setStyleSheet("""
            QTreeWidget {
                background-color: #2b2b2b;
                color: white;
                border: 1px solid #444;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 12px;
                outline: none;
            }
            QTreeWidget::item {
                padding: 5px;
                border-bottom: 1px solid #333;
            }
            QTreeWidget::item:selected {
                background-color: #007acc;
                color: white;
            }
            QTreeWidget::item:hover {
                background-color: #444;
            }
            QHeaderView::section {
                background-color: #3b3b3b;
                color: #888;
                border: none;
                padding: 5px;
                font-weight: bold;
            }
        """)

        main_layout.addWidget(self.results_tree)

        # Hide results initially
        self.results_tree.hide()

    def setup_styles(self):
        """Setup dark theme styles"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #2b2b2b;
                color: white;
            }
            QLineEdit {
                background-color: #1e1e1e;
                color: white;
                border: 1px solid #444;
                border-radius: 6px;
                padding: 8px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border-color: #007acc;
            }
        """)

    def setup_shortcuts(self):
        """Setup keyboard shortcuts"""
        # Escape to close
        self.escape_shortcut = QShortcut(QKeySequence(Qt.Key_Escape), self)
        self.escape_shortcut.activated.connect(self.hide_window)

        # Command+W to close
        self.close_shortcut = QShortcut(QKeySequence("Ctrl+W"), self)
        self.close_shortcut.activated.connect(self.hide_window)

    def center_top(self):
        """Center window at top of screen like macOS Spotlight"""
        screen = QApplication.primaryScreen()
        screen_geometry = screen.geometry()

        x = (screen_geometry.width() - self.base_width) // 2
        y = screen_geometry.height() // 4  # Top quarter

        self.move(x, y)

    def show_search(self, query=""):
        """Show the search window with optional initial query"""
        self.search_entry.setText(query)
        self.search_entry.setFocus()
        self.show()
        self.raise_()
        self.activateWindow()

        # Reset window size
        self.resize(self.base_width, self.base_height)
        self.results_tree.hide()

    def hide_window(self):
        """Hide the search window"""
        self.hide()
        self.window_closed.emit()

    def on_search_text_changed(self, text):
        """Handle search text changes"""
        if text.strip():
            self.perform_search(text)
        else:
            self.clear_results()

    def on_search_enter(self):
        """Handle Enter key in search"""
        if self.results_tree.topLevelItemCount() > 0:
            # Select first result
            first_item = self.results_tree.topLevelItem(0)
            self.results_tree.setCurrentItem(first_item)
            self.on_item_double_clicked(first_item, 0)

    def perform_search(self, query):
        """Perform the actual search"""
        try:
            # Use data manager to search
            results = self.data_manager.search_data(query)

            self.clear_results()

            if results:
                self.show_results(results)
            else:
                self.show_no_results()

        except Exception as e:
            logging.error(f"Search error: {e}")

    def show_results(self, results):
        """Display search results"""
        self.results_tree.clear()

        for result in results[:20]:  # Limit to 20 results
            file_name = result.get('file', 'Unknown')
            line_num = result.get('row', '0')
            content = result.get('content', '')[:100]  # Truncate long content

            item = QTreeWidgetItem([file_name, str(line_num), content])
            self.results_tree.addTopLevelItem(item)

        self.results_tree.show()
        self.adjust_window_size()

    def show_no_results(self):
        """Show no results message"""
        self.results_tree.clear()
        item = QTreeWidgetItem(["No results found", "", ""])
        self.results_tree.addTopLevelItem(item)
        self.results_tree.show()
        self.adjust_window_size()

    def clear_results(self):
        """Clear search results"""
        self.results_tree.clear()
        self.results_tree.hide()
        self.resize(self.base_width, self.base_height)

    def adjust_window_size(self):
        """Adjust window size based on results"""
        if self.results_tree.isVisible():
            # Calculate needed height
            item_height = 25
            visible_items = min(self.results_tree.topLevelItemCount(), 10)
            new_height = self.base_height + (visible_items * item_height)
            new_height = min(new_height, self.max_height)

            self.resize(self.base_width, new_height)

    def on_item_double_clicked(self, item, column):
        """Handle double-click on result item"""
        file_name = item.text(0)
        line_num = int(item.text(1)) if item.text(1).isdigit() else 0

        # Here you would normally open the file at the specific line
        # For now, just log it
        logging.info(f"Open file: {file_name} at line {line_num}")

        # Copy content to clipboard
        import subprocess
        content = item.text(2)
        subprocess.run(['pbcopy'], input=content.encode(), check=False)

        self.hide_window()

    def on_settings_clicked(self):
        """Handle settings button click"""
        self.hide_window()
        self.settings_requested.emit()

    def set_settings_callback(self, callback):
        """Set the settings callback"""
        self.settings_callback = callback

    def closeEvent(self, event):
        """Handle window close event"""
        super().closeEvent(event)
        self.window_closed.emit()