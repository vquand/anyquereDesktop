import tkinter as tk
from tkinter import ttk, filedialog, messagebox, simpledialog
import json
from datetime import datetime
import pandas as pd
from src.core.data_manager import DataManager
import logging

class SettingsWindow:
    def __init__(self, data_manager, parent_root=None):
        self.data_manager = data_manager

        # Create main window - use Toplevel if parent is provided, otherwise Tk
        if parent_root:
            self.root = tk.Toplevel(parent_root)
        else:
            self.root = tk.Tk()
        self.root.title("anyquereDesktop Settings")
        self.root.geometry("900x700")

        # Initially hide the window (will be shown when show() is called)
        self.root.withdraw()

        self.setup_styles()
        self.create_widgets()
        self.load_data()

        logging.info("SettingsWindow created successfully")

    def setup_styles(self):
        """Configure styles"""
        self.style = ttk.Style()

        # Use a theme that's available on the current platform
        available_themes = self.style.theme_names()
        if 'clam' in available_themes:
            self.style.theme_use('clam')
        elif 'alt' in available_themes:
            self.style.theme_use('alt')
        elif 'default' in available_themes:
            self.style.theme_use('default')
        else:
            # Use the first available theme as fallback
            self.style.theme_use(available_themes[0])

        # Configure colors
        bg_color = '#f0f0f0'
        accent_color = '#007acc'

        # Configure styles
        self.style.configure('Settings.TFrame', background=bg_color)
        self.style.configure('Settings.TLabel', background=bg_color, font=('Helvetica', 10))
        self.style.configure('Title.TLabel', background=bg_color, font=('Helvetica', 14, 'bold'))
        self.style.configure('Settings.TButton', font=('Helvetica', 10))
        self.style.configure('Accent.TButton', font=('Helvetica', 10, 'bold'))

        # Configure Treeview
        self.style.configure('Settings.Treeview', font=('Helvetica', 10))
        self.style.configure('Settings.Treeview.Heading', font=('Helvetica', 10, 'bold'))

    def create_widgets(self):
        """Create all widgets"""
        # Main container
        main_container = ttk.Frame(self.root, style='Settings.TFrame')
        main_container.pack(fill='both', expand=True, padx=20, pady=20)

        # Title
        title_label = ttk.Label(main_container, text="anyquereDesktop Settings", style='Title.TLabel')
        title_label.pack(pady=(0, 20))

        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_container)
        self.notebook.pack(fill='both', expand=True)

        # Create tabs
        self.create_sources_tab()
        self.create_import_tab()
        self.create_about_tab()

        # Button frame
        button_frame = ttk.Frame(main_container, style='Settings.TFrame')
        button_frame.pack(fill='x', pady=(20, 0))

        ttk.Button(button_frame, text="Save Settings", command=self.save_settings, style='Accent.TButton').pack(side='right', padx=(10, 0))
        ttk.Button(button_frame, text="Close", command=self.close).pack(side='right')

    def create_sources_tab(self):
        """Create sources management tab"""
        sources_frame = ttk.Frame(self.notebook, style='Settings.TFrame')
        self.notebook.add(sources_frame, text="📁 Data Sources")

        # Container
        container = ttk.Frame(sources_frame, style='Settings.TFrame')
        container.pack(fill='both', expand=True, padx=10, pady=10)

        # Sources list
        list_frame = ttk.Frame(container, style='Settings.TFrame')
        list_frame.pack(fill='both', expand=True)

        # Treeview for sources
        columns = ('alias', 'file', 'type', 'last_updated')
        self.sources_tree = ttk.Treeview(list_frame, columns=columns, show='headings', style='Settings.Treeview')

        # Configure columns
        self.sources_tree.heading('alias', text='Alias')
        self.sources_tree.heading('file', text='File/URL')
        self.sources_tree.heading('type', text='Type')
        self.sources_tree.heading('last_updated', text='Last Updated')

        self.sources_tree.column('alias', width=100)
        self.sources_tree.column('file', width=300)
        self.sources_tree.column('type', width=100)
        self.sources_tree.column('last_updated', width=150)

        # Scrollbars
        y_scrollbar = ttk.Scrollbar(list_frame, orient='vertical', command=self.sources_tree.yview)
        x_scrollbar = ttk.Scrollbar(list_frame, orient='horizontal', command=self.sources_tree.xview)
        self.sources_tree.configure(yscrollcommand=y_scrollbar.set, xscrollcommand=x_scrollbar.set)

        # Pack
        self.sources_tree.grid(row=0, column=0, sticky='nsew')
        y_scrollbar.grid(row=0, column=1, sticky='ns')
        x_scrollbar.grid(row=1, column=0, sticky='ew')

        list_frame.grid_rowconfigure(0, weight=1)
        list_frame.grid_columnconfigure(0, weight=1)

        # Buttons
        button_frame = ttk.Frame(container, style='Settings.TFrame')
        button_frame.pack(fill='x', pady=(10, 0))

        ttk.Button(button_frame, text="Add CSV File", command=self.add_csv_file).pack(side='left', padx=(0, 10))
        ttk.Button(button_frame, text="Add Google Sheet", command=self.add_google_sheet).pack(side='left', padx=(0, 10))
        ttk.Button(button_frame, text="Edit Selected", command=self.edit_selected).pack(side='left', padx=(0, 10))
        ttk.Button(button_frame, text="Remove Selected", command=self.remove_selected).pack(side='left')

    def create_import_tab(self):
        """Create import/export tab"""
        import_frame = ttk.Frame(self.notebook, style='Settings.TFrame')
        self.notebook.add(import_frame, text="📥 Import/Export")

        container = ttk.Frame(import_frame, style='Settings.TFrame')
        container.pack(fill='both', expand=True, padx=10, pady=10)

        # Import section
        import_section = ttk.LabelFrame(container, text="Import Configuration", style='Settings.TFrame')
        import_section.pack(fill='x', pady=(0, 20))

        ttk.Button(import_section, text="Import from File", command=self.import_config).pack(anchor='w', padx=10, pady=5)

        # Export section
        export_section = ttk.LabelFrame(container, text="Export Configuration", style='Settings.TFrame')
        export_section.pack(fill='x')

        ttk.Button(export_section, text="Export to File", command=self.export_config).pack(anchor='w', padx=10, pady=5)

    def create_about_tab(self):
        """Create about tab"""
        about_frame = ttk.Frame(self.notebook, style='Settings.TFrame')
        self.notebook.add(about_frame, text="ℹ️ About")

        container = ttk.Frame(about_frame, style='Settings.TFrame')
        container.pack(fill='both', expand=True, padx=10, pady=10)

        # About info
        about_text = """
anyquereDesktop

A powerful desktop search application for CSV files and Google Sheets.

Features:
• Fast search across multiple data sources
• Tab completion for source aliases
• French character support
• Multi-line text display
• System tray integration

Version: 1.0.0
Built with: tkinter, pandas, requests
        """

        about_label = ttk.Label(container, text=about_text.strip(), style='Settings.TLabel', justify='left')
        about_label.pack(pady=20)

    def load_data(self):
        """Load sources data"""
        self.sources_tree.delete(*self.sources_tree.get_children())

        sources = self.data_manager.get_all_sources()
        for alias, config in sources.items():
            file_path = config.get('file', config.get('url', ''))
            source_type = config.get('type', 'unknown')
            last_updated = config.get('last_updated', 'Unknown')

            self.sources_tree.insert('', 'end', values=(alias, file_path, source_type, last_updated))

    def add_csv_file(self):
        """Add a CSV file"""
        file_path = filedialog.askopenfilename(
            title="Select CSV file",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )

        if file_path:
            alias = simpledialog.askstring("Add Source", "Enter alias for this file:")
            if alias:
                try:
                    # Test file reading
                    df = pd.read_csv(file_path, nrows=5)
                    self.data_manager.add_csv_source(alias, file_path)
                    self.load_data()
                    messagebox.showinfo("Success", f"Added '{alias}' successfully!")
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to add file: {e}")

    def add_google_sheet(self):
        """Add a Google Sheet"""
        url = simpledialog.askstring("Add Google Sheet", "Enter Google Sheet URL:")
        if url:
            alias = simpledialog.askstring("Add Source", "Enter alias for this sheet:")
            if alias:
                try:
                    # Test URL access
                    sheet_id = url.split('/d/')[1].split('/')[0] if '/d/' in url else url
                    self.data_manager.add_google_sheet_source(alias, url)
                    self.load_data()
                    messagebox.showinfo("Success", f"Added '{alias}' successfully!")
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to add Google Sheet: {e}")

    def edit_selected(self):
        """Edit selected source"""
        selection = self.sources_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a source to edit.")
            return

        item = self.sources_tree.item(selection[0])
        values = item['values']
        alias = values[0]

        self.show_edit_dialog(alias)

    def remove_selected(self):
        """Remove selected source"""
        selection = self.sources_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a source to remove.")
            return

        item = self.sources_tree.item(selection[0])
        values = item['values']
        alias = values[0]

        if messagebox.askyesno("Confirm", f"Remove source '{alias}'?"):
            try:
                self.data_manager.remove_source(alias)
                self.load_data()
                messagebox.showinfo("Success", f"Removed '{alias}' successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to remove source: {e}")

    def show_edit_dialog(self, alias):
        """Show edit dialog for source"""
        config = self.data_manager.config['data_sources'].get(alias, {})

        dialog = tk.Toplevel(self.root)
        dialog.title(f"Edit Source: {alias}")
        dialog.geometry("500x400")

        # Create edit form
        form_frame = ttk.Frame(dialog, style='Settings.TFrame')
        form_frame.pack(fill='both', expand=True, padx=20, pady=20)

        # Basic info
        ttk.Label(form_frame, text="Alias:").grid(row=0, column=0, sticky='w', pady=5)
        alias_var = tk.StringVar(value=alias)
        ttk.Entry(form_frame, textvariable=alias_var, width=40).grid(row=0, column=1, pady=5)

        ttk.Label(form_frame, text="File/URL:").grid(row=1, column=0, sticky='w', pady=5)
        file_var = tk.StringVar(value=config.get('file', config.get('url', '')))
        ttk.Entry(form_frame, textvariable=file_var, width=40).grid(row=1, column=1, pady=5)

        ttk.Label(form_frame, text="Type:").grid(row=2, column=0, sticky='w', pady=5)
        type_var = tk.StringVar(value=config.get('type', 'csv'))
        type_combo = ttk.Combobox(form_frame, textvariable=type_var, values=['csv', 'google_sheet'], state='readonly')
        type_combo.grid(row=2, column=1, pady=5)

        # Search column
        ttk.Label(form_frame, text="Search Column:").grid(row=3, column=0, sticky='w', pady=5)
        search_var = tk.StringVar(value=str(config.get('search_column', 0)))
        ttk.Entry(form_frame, textvariable=search_var, width=10).grid(row=3, column=1, sticky='w', pady=5)

        # Preview data
        ttk.Label(form_frame, text="Data Preview:").grid(row=4, column=0, sticky='nw', pady=(20, 5))

        preview_frame = ttk.Frame(form_frame, style='Settings.TFrame')
        preview_frame.grid(row=5, column=0, columnspan=2, sticky='ew', pady=5)

        try:
            # Load preview data
            df = self.data_manager.get_data_frame(alias)
            preview_text = tk.Text(preview_frame, height=10, width=60)
            preview_text.pack(side='left', fill='both', expand=True)

            scrollbar = ttk.Scrollbar(preview_frame, orient='vertical', command=preview_text.yview)
            scrollbar.pack(side='right', fill='y')
            preview_text.configure(yscrollcommand=scrollbar.set)

            # Insert data
            preview_text.insert('1.0', df.head().to_string())
            preview_text.configure(state='disabled')

        except Exception as e:
            ttk.Label(preview_frame, text=f"Preview error: {e}").pack()

        # Buttons
        button_frame = ttk.Frame(dialog, style='Settings.TFrame')
        button_frame.pack(fill='x', padx=20, pady=(0, 20))

        def save_changes():
            try:
                # Update config
                new_config = config.copy()
                new_config['file'] = file_var.get()
                new_config['url'] = file_var.get() if type_var.get() == 'google_sheet' else ''
                new_config['type'] = type_var.get()
                new_config['search_column'] = int(search_var.get())

                # Update data manager
                self.data_manager.config['data_sources'][alias_var.get()] = new_config
                self.data_manager.save_config()

                self.load_data()
                dialog.destroy()
                messagebox.showinfo("Success", "Source updated successfully!")

            except Exception as e:
                messagebox.showerror("Error", f"Failed to update source: {e}")

        ttk.Button(button_frame, text="Save", command=save_changes).pack(side='right', padx=(10, 0))
        ttk.Button(button_frame, text="Cancel", command=dialog.destroy).pack(side='right')

    def import_config(self):
        """Import configuration from file"""
        file_path = filedialog.askopenfilename(
            title="Import Configuration",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )

        if file_path:
            try:
                with open(file_path, 'r') as f:
                    imported_config = json.load(f)

                # Merge with existing config
                if 'data_sources' in imported_config:
                    self.data_manager.config['data_sources'].update(imported_config['data_sources'])
                    self.data_manager.save_config()
                    self.load_data()
                    messagebox.showinfo("Success", "Configuration imported successfully!")

            except Exception as e:
                messagebox.showerror("Error", f"Failed to import configuration: {e}")

    def export_config(self):
        """Export configuration to file"""
        file_path = filedialog.asksaveasfilename(
            title="Export Configuration",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )

        if file_path:
            try:
                export_data = {
                    'data_sources': self.data_manager.config.get('data_sources', {}),
                    'exported_at': datetime.now().isoformat(),
                    'version': '1.0.0'
                }

                with open(file_path, 'w') as f:
                    json.dump(export_data, f, indent=2)

                messagebox.showinfo("Success", "Configuration exported successfully!")

            except Exception as e:
                messagebox.showerror("Error", f"Failed to export configuration: {e}")

    def save_settings(self):
        """Save all settings"""
        try:
            self.data_manager.save_config()
            messagebox.showinfo("Success", "Settings saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save settings: {e}")

    def close(self):
        """Close settings window"""
        self.root.destroy()

    def show(self):
        """Show settings window"""
        logging.info("Settings window show called")

        # Center on screen
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        window_width = 900
        window_height = 700
        x = (screen_width - window_width) // 2
        y = (screen_height - window_height) // 2

        self.root.geometry(f'{window_width}x{window_height}+{x}+{y}')
        self.root.deiconify()
        logging.info(f"Settings window deiconified at position {x},{y}")

        # Aggressive focus management for macOS
        self.root.lift()
        self.root.attributes('-topmost', True)
        self.root.focus_force()

        # Make sure window is visible
        self.root.after(100, self._ensure_visible)
        self.root.after(500, self._ensure_visible)

        logging.info("Settings window displayed successfully")

    def _ensure_visible(self):
        """Ensure window is visible and focused"""
        try:
            self.root.lift()
            self.root.attributes('-topmost', True)
            self.root.focus_force()
            self.root.after(100, lambda: self.root.attributes('-topmost', False))
        except Exception as e:
            logging.error(f"Error in settings _ensure_visible: {e}")

    def hide(self):
        """Hide settings window"""
        self.root.withdraw()