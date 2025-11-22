import tkinter as tk
from tkinter import ttk, messagebox
from src.core.data_manager import DataManager
import logging
import threading
import queue

class SearchWindow:
    def __init__(self, data_manager, parent_root=None):
        self.data_manager = data_manager
        self.current_source = None
        self.fixed_position = None

        # Create main window - use Toplevel if parent is provided, otherwise Tk
        if parent_root:
            self.root = tk.Toplevel(parent_root)
        else:
            self.root = tk.Tk()
        self.root.withdraw()  # Hide initially

        # Configure window
        self.root.overrideredirect(True)  # Frameless window
        self.root.attributes('-topmost', True)  # Stay on top

        # Dynamic sizing like macOS Spotlight
        self.base_width = 800
        self.min_height = 100  # Height with just input (no results)
        self.max_height = 600  # Maximum height to avoid going off screen

        self.setup_styles()
        self.create_widgets()
        self.setup_bindings()

        # Command queue for thread-safe operations
        self.command_queue = queue.Queue()
        self.process_queue()

    def setup_styles(self):
        """Configure ttk styles for dark theme"""
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

        # Configure dark theme colors
        bg_color = '#2b2b2b'
        fg_color = 'white'
        select_color = '#007acc'
        button_color = '#3b3b3b'

        # Configure styles
        self.style.configure('Dark.TFrame', background=bg_color)
        self.style.configure('Dark.TLabel', background=bg_color, foreground=select_color, font=('Helvetica', 10, 'bold'))
        self.style.configure('Dark.TButton', background=button_color, foreground='#888', borderwidth=0, focuscolor='none')
        self.style.map('Dark.TButton', background=[('active', button_color)], foreground=[('active', 'white')])

        # Configure Treeview (table)
        self.style.configure('Dark.Treeview', background=bg_color, foreground=fg_color, fieldbackground=bg_color,
                            borderwidth=0, font=('Helvetica', 12))
        self.style.configure('Dark.Treeview.Heading', background=button_color, foreground=select_color,
                            font=('Helvetica', 10, 'bold'))
        self.style.map('Dark.Treeview', background=[('selected', select_color)], foreground=[('selected', 'white')])

        # Configure Entry
        self.style.configure('Dark.TEntry', fieldbackground=button_color, foreground=fg_color,
                            borderwidth=0, insertcolor='white', font=('Helvetica', 16))

    def create_widgets(self):
        """Create all UI widgets"""
        # Main frame with rounded corners effect
        self.main_frame = ttk.Frame(self.root, style='Dark.TFrame')
        self.main_frame.pack(fill='both', expand=True, padx=1, pady=1)

        # Container for content with padding
        self.container = ttk.Frame(self.main_frame, style='Dark.TFrame')
        self.container.pack(fill='both', expand=True, padx=20, pady=20)

        # Search layout
        search_frame = ttk.Frame(self.container, style='Dark.TFrame')
        search_frame.pack(fill='x', pady=(0, 10))

        # Source label
        self.source_label = ttk.Label(search_frame, text="", style='Dark.TLabel')
        self.source_label.pack(side='left', padx=(0, 10))

        # Search entry
        self.search_entry = ttk.Entry(search_frame, style='Dark.TEntry')
        self.search_entry.pack(side='left', fill='x', expand=True)

        # Settings button
        self.settings_btn = ttk.Button(search_frame, text="⚙️", style='Dark.TButton', command=self.open_settings, width=3)
        self.settings_btn.pack(side='left', padx=(10, 5))

        # Close button
        self.close_btn = ttk.Button(search_frame, text="✕", style='Dark.TButton', command=self.hide_window, width=3)
        self.close_btn.pack(side='left')

        # Results table (Treeview)
        self.create_table()

    def create_table(self):
        """Create the results table"""
        # Create Treeview with scrollbar
        table_frame = ttk.Frame(self.container, style='Dark.TFrame')
        table_frame.pack(fill='both', expand=True)

        # Treeview with columns
        self.tree = ttk.Treeview(table_frame, style='Dark.Treeview', selectmode='browse')

        # Configure columns
        self.tree['columns'] = ('file', 'row', 'content')
        self.tree.column('#0', width=0, stretch=False)  # Hide the first column
        self.tree.column('file', width=120, minwidth=100)
        self.tree.column('row', width=60, minwidth=50)
        self.tree.column('content', width=500, minwidth=200, stretch=True)

        # Configure headings
        self.tree.heading('#0', text='', anchor='w')
        self.tree.heading('file', text='File', anchor='w')
        self.tree.heading('row', text='Row', anchor='center')
        self.tree.heading('content', text='Content', anchor='w')

        # Scrollbar
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)

        # Pack table and scrollbar
        self.tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

    def setup_bindings(self):
        """Setup keyboard and mouse bindings"""
        # Search bindings
        self.search_entry.bind('<KeyRelease>', self.on_search_key_release)
        self.search_entry.bind('<Return>', self.on_enter)
        self.search_entry.bind('<Escape>', lambda e: self.hide_window())
        self.search_entry.bind('<Tab>', self.on_tab)

        # Treeview bindings
        self.tree.bind('<Double-Button-1>', self.on_double_click)
        self.tree.bind('<Return>', self.on_enter)
        self.tree.bind('<Escape>', lambda e: self.hide_window())

        # Window bindings
        self.root.bind('<FocusOut>', self.on_focus_out)
        self.root.bind('<Button-1>', self.on_window_click)

        # Make window draggable
        self.search_entry.bind('<Button-1>', self.start_drag)
        self.search_entry.bind('<B1-Motion>', self.on_drag)

    def start_drag(self, event):
        """Start dragging the window"""
        self.drag_start_x = event.x_root - self.root.winfo_x()
        self.drag_start_y = event.y_root - self.root.winfo_y()

    def on_drag(self, event):
        """Handle window dragging"""
        x = event.x_root - self.drag_start_x
        y = event.y_root - self.drag_start_y
        self.root.geometry(f'+{x}+{y}')

    def on_search_key_release(self, event):
        """Handle search input with debouncing"""
        if event.keysym == 'Tab':
            return  # Let tab handler deal with it

        # Start a timer to perform search after user stops typing
        self.root.after(300, self.perform_search)  # 300ms debounce

    def on_tab(self, event):
        """Handle tab completion"""
        search_text = self.search_entry.get().strip()
        if not search_text or search_text.endswith('> '):
            return

        # Get source aliases for completion
        aliases = self.data_manager.get_source_aliases()
        matching_aliases = [alias for alias in aliases if alias.startswith(search_text.lower())]

        if matching_aliases:
            # Use the first match
            completed = f"{matching_aliases[0]} > "
            self.search_entry.delete(0, 'end')
            self.search_entry.insert(0, completed)
            self.current_source = matching_aliases[0]
            self.update_source_label()

        return 'break'  # Prevent default tab behavior

    def on_enter(self, event=None):
        """Handle Enter key - copy and close"""
        selection = self.tree.selection()
        if selection:
            self.copy_selection(selection[0])
        self.hide_window()

    def on_double_click(self, event):
        """Handle double click - copy without closing"""
        selection = self.tree.selection()
        if selection:
            self.copy_selection(selection[0])

    def on_focus_out(self, event):
        """Handle focus out - hide window if focus is not on our widgets"""
        # Check if focus moved to another window
        if event.widget and event.widget != self.root:
            # Small delay to allow focus to settle
            self.root.after(100, self.check_focus)

    def check_focus(self):
        """Check if any of our widgets have focus"""
        focused_widget = self.root.focus_get()
        if focused_widget is None or not str(focused_widget).startswith(str(self.root)):
            self.hide_window()

    def on_window_click(self, event):
        """Handle window click to prevent losing focus"""
        # Make sure search entry stays focused when clicking in window
        if event.widget != self.search_entry:
            self.search_entry.focus_set()

    def copy_selection(self, item_id):
        """Copy selected item content to clipboard"""
        try:
            values = self.tree.item(item_id)['values']
            if values:
                content = values[2]  # Content column
                self.root.clipboard_clear()
                self.root.clipboard_append(content)
                logging.info(f"Copied to clipboard: {content[:50]}...")
        except Exception as e:
            logging.error(f"Failed to copy to clipboard: {e}")

    def show_search(self, search_text=""):
        """Show the search window"""
        logging.info("Search window show_search called")

        # Center on screen or use last position
        if self.fixed_position:
            x, y = self.fixed_position
        else:
            # Center on screen
            screen_width = self.root.winfo_screenwidth()
            screen_height = self.root.winfo_screenheight()
            x = (screen_width - self.base_width) // 2
            y = (screen_height - self.min_height) // 2

        self.root.geometry(f'{self.base_width}x{self.min_height}+{x}+{y}')
        self.root.deiconify()
        logging.info(f"Window deiconified at position {x},{y}")

        # Aggressive focus management for macOS
        self.root.lift()
        self.root.attributes('-topmost', True)
        self.root.focus_force()

        # Make sure window is visible
        self.root.after(100, self._ensure_visible)
        self.root.after(500, self._ensure_visible)

        # Set search text and focus
        self.search_entry.delete(0, 'end')
        self.search_entry.insert(0, search_text)
        self.search_entry.focus_set()
        logging.info(f"Search text set to: '{search_text}'")

        # Extract source if search text contains it
        if ' > ' in search_text:
            self.current_source = search_text.split(' > ')[0]

        logging.info("Search window displayed successfully")

    def _ensure_visible(self):
        """Ensure window is visible and focused"""
        try:
            self.root.lift()
            self.root.attributes('-topmost', True)
            self.root.focus_force()
            self.root.after(100, lambda: self.root.attributes('-topmost', False))
        except Exception as e:
            logging.error(f"Error in _ensure_visible: {e}")

    def update_source_label(self):
        """Update source label display"""
        if self.current_source:
            self.source_label.config(text=f"Source: {self.current_source}")
        else:
            self.source_label.config(text="")

    def hide_window(self):
        """Hide the search window"""
        # Store current position for next time
        self.fixed_position = (self.root.winfo_x(), self.root.winfo_y())
        self.root.withdraw()
        logging.info("Search window hidden")

    def update_source_label(self):
        """Update the source label"""
        if self.current_source:
            self.source_label.config(text=f"📁 {self.current_source}")
        else:
            self.source_label.config(text="")

    def perform_search(self):
        """Perform search in a separate thread"""
        search_text = self.search_entry.get()

        # Extract source and query
        if ' > ' in search_text:
            source = search_text.split(' > ')[0]
            query = search_text.split(' > ', 1)[1].strip()
        else:
            source = None
            query = search_text.strip()

        self.current_source = source
        self.update_source_label()

        if not query:
            self.clear_results()
            return

        # Perform search in background thread
        def search_thread():
            try:
                results = self.data_manager.search_data(source, query)
                # Queue UI update for main thread
                self.command_queue.put(('update_results', results))
            except Exception as e:
                logging.error(f"Search error: {e}")
                self.command_queue.put(('update_results', []))

        threading.Thread(target=search_thread, daemon=True).start()

    def process_queue(self):
        """Process commands from background threads"""
        try:
            while True:
                command, data = self.command_queue.get_nowait()
                if command == 'update_results':
                    self.update_results(data)
        except queue.Empty:
            pass

        # Schedule next check
        self.root.after(50, self.process_queue)

    def update_results(self, results):
        """Update results table"""
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)

        if not results:
            # Set minimum height when no results
            self.root.geometry(f'{self.base_width}x{self.min_height}')
            return

        # Add results
        row_count = 0
        for row_data in results[:50]:  # Limit to 50 results for performance
            file_name = row_data.get('source', '')
            row_num = str(row_data.get('row', ''))
            content = row_data.get('content', '')

            # Insert into treeview
            item_id = self.tree.insert('', 'end', values=(file_name, row_num, content))
            row_count += 1

        # Calculate required height
        row_height = 30  # Approximate row height in pixels
        header_height = 40
        padding = 80  # Extra padding for margins and search area
        required_height = min(self.min_height + (row_count * row_height), self.max_height)

        # Update window size
        self.root.geometry(f'{self.base_width}x{required_height}')

        logging.info(f"Displayed {row_count} results")

    def clear_results(self):
        """Clear all results"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        self.root.geometry(f'{self.base_width}x{self.min_height}')

    def open_settings(self):
        """Open settings window (signal for main app)"""
        # This will be handled by the main application
        if hasattr(self, 'settings_callback'):
            self.settings_callback()
        logging.info("Settings requested from search window")