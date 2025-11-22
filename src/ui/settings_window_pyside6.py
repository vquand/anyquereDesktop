import sys
import logging
import json
from datetime import datetime
import pandas as pd
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                                     QHBoxLayout, QPushButton, QLabel, QTextEdit,
                                     QTableWidget, QTableWidgetItem, QHeaderView,
                                     QFileDialog, QAbstractItemView, QMessageBox,
                                     QComboBox, QLineEdit, QGroupBox, QCheckBox,
                                     QProgressBar, QTabWidget)
from PySide6.QtCore import Qt, QTimer, Signal
from PySide6.QtGui import QFont

class SettingsWindow(QMainWindow):
    """PySide6-based settings window (replaces tkinter version)"""

    def __init__(self, data_manager):
        super().__init__()
        self.data_manager = data_manager

        self.setup_ui()
        self.setup_styles()
        self.setup_connections()

        self.load_data()

        logging.info("PySide6 SettingsWindow created successfully")

    def setup_ui(self):
        """Setup the user interface"""
        self.setWindowTitle("anyquereDesktop Settings")
        self.setGeometry(200, 150, 900, 700)

        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main layout
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)

        # Create tab widget
        self.tab_widget = QTabWidget()
        main_layout.addWidget(self.tab_widget)

        # Create tabs
        self.create_sources_tab()
        self.create_data_tab()
        self.create_about_tab()

        # Bottom buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch()

        self.save_btn = QPushButton("Save Settings")
        self.save_btn.clicked.connect(self.save_settings)
        button_layout.addWidget(self.save_btn)

        self.close_btn = QPushButton("Close")
        self.close_btn.clicked.connect(self.hide)
        button_layout.addWidget(self.close_btn)

        main_layout.addLayout(button_layout)

    def create_sources_tab(self):
        """Create the sources configuration tab"""
        sources_tab = QWidget()
        layout = QVBoxLayout(sources_tab)

        # Sources group
        sources_group = QGroupBox("Data Sources")
        sources_layout = QVBoxLayout(sources_group)

        # Sources table
        self.sources_table = QTableWidget()
        self.sources_table.setColumnCount(4)
        self.sources_table.setHorizontalHeaderLabels(["Source", "Type", "Status", "Actions"])
        self.sources_table.setSelectionBehavior(QAbstractItemView.SelectRows)

        # Configure table
        header = self.sources_table.horizontalHeader()
        header.setStretchLastSection(True)
        header.setSectionResizeMode(0, QHeaderView.Stretch)
        header.setSectionResizeMode(1, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(2, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(3, QHeaderView.Fixed)
        header.resizeSection(3, 100)

        sources_layout.addWidget(self.sources_table)

        # Buttons
        btn_layout = QHBoxLayout()
        self.add_source_btn = QPushButton("Add Source")
        self.add_source_btn.clicked.connect(self.add_source)
        btn_layout.addWidget(self.add_source_btn)

        self.remove_source_btn = QPushButton("Remove Source")
        self.remove_source_btn.clicked.connect(self.remove_source)
        btn_layout.addWidget(self.remove_source_btn)

        self.refresh_sources_btn = QPushButton("Refresh")
        self.refresh_sources_btn.clicked.connect(self.load_sources)
        btn_layout.addWidget(self.refresh_sources_btn)

        sources_layout.addLayout(btn_layout)
        layout.addWidget(sources_group)

        self.tab_widget.addTab(sources_tab, "Sources")

    def create_data_tab(self):
        """Create the data management tab"""
        data_tab = QWidget()
        layout = QVBoxLayout(data_tab)

        # Import/Export group
        io_group = QGroupBox("Import / Export Data")
        io_layout = QVBoxLayout(io_group)

        # Import section
        import_layout = QHBoxLayout()
        import_layout.addWidget(QLabel("Import from:"))
        self.import_file_btn = QPushButton("Choose File")
        self.import_file_btn.clicked.connect(self.import_data)
        import_layout.addWidget(self.import_file_btn)
        import_layout.addStretch()
        io_layout.addLayout(import_layout)

        # Export section
        export_layout = QHBoxLayout()
        export_layout.addWidget(QLabel("Export to:"))
        self.export_file_btn = QPushButton("Choose File")
        self.export_file_btn.clicked.connect(self.export_data)
        export_layout.addWidget(self.export_file_btn)
        export_layout.addStretch()
        io_layout.addLayout(export_layout)

        layout.addWidget(io_group)

        # Statistics group
        stats_group = QGroupBox("Data Statistics")
        stats_layout = QVBoxLayout(stats_group)

        self.stats_label = QLabel("Loading statistics...")
        stats_layout.addWidget(self.stats_label)

        self.refresh_stats_btn = QPushButton("Refresh Statistics")
        self.refresh_stats_btn.clicked.connect(self.update_statistics)
        stats_layout.addWidget(self.refresh_stats_btn)

        layout.addWidget(stats_group)

        self.tab_widget.addTab(data_tab, "Data Management")

    def create_about_tab(self):
        """Create the about tab"""
        about_tab = QWidget()
        layout = QVBoxLayout(about_tab)

        # About group
        about_group = QGroupBox("About anyquereDesktop")
        about_layout = QVBoxLayout(about_group)

        title_label = QLabel("anyquereDesktop")
        title_label.setFont(QFont("Arial", 16, QFont.Bold))
        title_label.setAlignment(Qt.AlignCenter)
        about_layout.addWidget(title_label)

        version_label = QLabel("Version 1.0.0")
        version_label.setAlignment(Qt.AlignCenter)
        about_layout.addWidget(version_label)

        description_label = QLabel("A powerful desktop search tool for developers")
        description_label.setAlignment(Qt.AlignCenter)
        description_label.setWordWrap(True)
        about_layout.addWidget(description_label)

        about_layout.addStretch()

        # Info
        info_text = QTextEdit()
        info_text.setReadOnly(True)
        info_text.setMaximumHeight(200)
        info_text.setText("""
Features:
• Search across multiple file types
• Fast and accurate results
• Customizable data sources
• Simple and intuitive interface

Requirements:
• Python 3.7+
• PySide6
• pandas for data handling
        """)
        about_layout.addWidget(info_text)

        layout.addWidget(about_group)

        self.tab_widget.addTab(about_tab, "About")

    def setup_styles(self):
        """Setup styles"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f0f0f0;
            }
            QTabWidget::pane {
                border: 1px solid #d0d0d0;
            }
            QTabBar::tab {
                background-color: #e0e0e0;
                padding: 8px 16px;
                margin-right: 2px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            QTabBar::tab:selected {
                background-color: #007acc;
                color: white;
            }
            QPushButton {
                background-color: #007acc;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #005a9e;
            }
            QPushButton:pressed {
                background-color: #004d80;
            }
            QGroupBox {
                font-weight: bold;
                border: 2px solid #d0d0d0;
                border-radius: 6px;
                padding-top: 10px;
            }
            QLineEdit, QComboBox, QTableWidget, QTextEdit {
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                padding: 4px;
                background-color: white;
            }
            QTableWidget {
                gridline-color: #e0e0e0;
            }
        """)

    def setup_connections(self):
        """Setup signal connections"""
        pass

    def load_data(self):
        """Load settings and data"""
        self.load_sources()
        self.update_statistics()

    def load_sources(self):
        """Load sources into table"""
        try:
            sources = self.data_manager.get_all_sources()

            self.sources_table.setRowCount(len(sources))
            self.sources_table.blockSignals(True)

            for row, source in enumerate(sources):
                self.sources_table.setItem(row, 0, QTableWidgetItem(source.get('name', 'Unknown')))
                self.sources_table.setItem(row, 1, QTableWidgetItem(source.get('type', 'File')))
                self.sources_table.setItem(row, 2, QTableWidgetItem(source.get('status', 'Active')))

                # Actions button
                actions_btn = QPushButton("Configure")
                actions_btn.clicked.connect(lambda checked, r=row: self.configure_source(r))
                self.sources_table.setCellWidget(row, 3, actions_btn)

            self.sources_table.blockSignals(False)

        except Exception as e:
            logging.error(f"Error loading sources: {e}")

    def update_statistics(self):
        """Update data statistics"""
        try:
            sources = self.data_manager.get_all_sources()
            aliases = self.data_manager.get_source_aliases()

            stats_text = f"""
Total Sources: {len(sources)}
Total Aliases: {len(aliases)}
Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Source Types:
{', '.join(sorted(set(source.get('type', 'Unknown') for source in sources)))}
            """

            self.stats_label.setText(stats_text)

        except Exception as e:
            logging.error(f"Error updating statistics: {e}")

    def add_source(self):
        """Add a new data source"""
        try:
            file_path, _ = QFileDialog.getOpenFileName(
                self,
                "Add Data Source",
                "",
                "CSV Files (*.csv);JSON Files (*.json);All Files (*)"
            )

            if file_path:
                # Here you would add the source to the data manager
                self.data_manager.add_source(file_path)
                self.load_sources()
                self.update_statistics()
                QMessageBox.information(self, "Success", "Data source added successfully!")

        except Exception as e:
            logging.error(f"Error adding source: {e}")
            QMessageBox.critical(self, "Error", f"Failed to add source: {e}")

    def remove_source(self):
        """Remove selected data source"""
        try:
            current_row = self.sources_table.currentRow()
            if current_row >= 0:
                source_name = self.sources_table.item(current_row, 0).text()

                reply = QMessageBox.question(
                    self, "Confirm Removal",
                    f"Are you sure you want to remove '{source_name}'?",
                    QMessageBox.Yes | QMessageBox.No
                )

                if reply == QMessageBox.Yes:
                    # Here you would remove the source from the data manager
                    self.data_manager.remove_source(source_name)
                    self.load_sources()
                    self.update_statistics()

        except Exception as e:
            logging.error(f"Error removing source: {e}")

    def configure_source(self, row):
        """Configure a specific source"""
        try:
            source_name = self.sources_table.item(row, 0).text()
            # Here you would open a configuration dialog
            QMessageBox.information(self, "Configure", f"Configuration for '{source_name}' would be opened here.")

        except Exception as e:
            logging.error(f"Error configuring source: {e}")

    def import_data(self):
        """Import data from file"""
        try:
            file_path, _ = QFileDialog.getOpenFileName(
                self,
                "Import Data",
                "",
                "CSV Files (*.csv);JSON Files (*.json);All Files (*)"
            )

            if file_path:
                # Here you would handle the import logic
                QMessageBox.information(self, "Import", f"Data would be imported from {file_path}")

        except Exception as e:
            logging.error(f"Error importing data: {e}")

    def export_data(self):
        """Export data to file"""
        try:
            file_path, _ = QFileDialog.getSaveFileName(
                self,
                "Export Data",
                "",
                "CSV Files (*.csv);JSON Files (*.json);All Files (*)"
            )

            if file_path:
                # Here you would handle the export logic
                QMessageBox.information(self, "Export", f"Data would be exported to {file_path}")

        except Exception as e:
            logging.error(f"Error exporting data: {e}")

    def save_settings(self):
        """Save current settings"""
        try:
            # Here you would save the configuration
            QMessageBox.information(self, "Success", "Settings saved successfully!")

        except Exception as e:
            logging.error(f"Error saving settings: {e}")
            QMessageBox.critical(self, "Error", f"Failed to save settings: {e}")

    def show(self):
        """Show the settings window"""
        self.show()
        self.raise_()
        self.activateWindow()
        self.load_data()  # Refresh data when showing