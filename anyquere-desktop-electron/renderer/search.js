const { ipcRenderer } = require('electron');

console.log('search.js - File loading started');

class SearchWindow {
    constructor() {
        this.currentSource = null;
        this.sources = [];
        this.debounceTimer = null;
        this.autocompleteSuggestions = [];
        this.selectedSuggestionIndex = -1;
        this.isEditingSource = true; // Whether user is editing source or query part

        console.log('SearchWindow constructor starting...');
        this.initElements();
        this.initEventListeners();
        this.loadSources();
        console.log('SearchWindow constructor completed');
    }

    initElements() {
        this.searchInput = document.getElementById('searchInput');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.noResults = document.getElementById('noResults');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeBtn = document.getElementById('closeBtn');
    }

    initEventListeners() {
        console.log('Setting up search input event listeners...');

        // Search input
        this.searchInput.addEventListener('input', (e) => {
            console.log('Input event triggered, value:', e.target.value);
            this.handleInputChange(e.target.value);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // Control buttons
        this.settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });

        this.closeBtn.addEventListener('click', () => {
            this.hideWindow();
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
                this.searchInput.select();
            }
        });

        // Prevent window close on click outside
        document.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    async loadSources() {
        try {
            this.sources = await ipcRenderer.invoke('get-sources');
            console.log('Loaded sources:', this.sources);

            if (this.sources.length > 0) {
                // Start with empty input to show source list immediately
                this.searchInput.value = '';
                this.searchInput.focus();
                // Show all available sources
                this.autocompleteSuggestions = [...this.sources];
                this.selectedSuggestionIndex = 0;
                this.displayAutocompleteSuggestions();
                this.showMessage('Select a data source or start typing...');
            } else {
                this.searchInput.placeholder = 'No sources configured. Click settings to add sources.';
                this.showMessage('No data sources configured. Click the gear icon to add sources.');
            }
        } catch (error) {
            console.error('Failed to load sources:', error);
            this.showMessage('Failed to load data sources. Please check your settings.');
        }

        // Set window height to half screen after loading sources
        this.resizeWindow();
    }

    handleInputChange(value) {
        const cursorPosition = this.searchInput.selectionStart;
        const parsed = this.parseInputByCursor(value, cursorPosition);
        console.log('Cursor-based input:', parsed);

        // Determine which mode we're in based on cursor position
        if (parsed.isCursorInQueryPart) {
            // Cursor is after >, we're in search mode
            this.handleSearchMode(parsed.sourcePart, parsed.queryPart);
        } else {
            // Cursor is before >, we're in source selection mode
            this.handleSourceSelectionMode(parsed.currentSourceText);
        }
    }

    parseInputByCursor(value, cursorPosition) {
        const trimmedValue = value.trim();

        // Find the separator position
        const separatorMatch = trimmedValue.match(/[>|]/);
        const separatorPos = separatorMatch ? separatorMatch.index : -1;

        // Determine which part cursor is in
        const isCursorInQueryPart = separatorPos !== -1 && cursorPosition > separatorPos;

        if (separatorPos === -1) {
            // No separator, everything is source part
            return {
                sourcePart: trimmedValue,
                queryPart: '',
                hasSeparator: false,
                isCursorInQueryPart: false,
                currentSourceText: trimmedValue,
                separatorPos: -1
            };
        } else {
            // Has separator, split into parts
            const sourcePart = trimmedValue.substring(0, separatorPos).trim();
            const queryPart = trimmedValue.substring(separatorPos + 1).trim();

            return {
                sourcePart: sourcePart,
                queryPart: queryPart,
                hasSeparator: true,
                isCursorInQueryPart: isCursorInQueryPart,
                currentSourceText: sourcePart,
                separatorPos: separatorPos
            };
        }
    }

    handleSourceSelectionMode(currentSourceText) {
        console.log('Source selection mode:', currentSourceText);

        // Show autocomplete suggestions for sources
        if (currentSourceText === '') {
            // Show all available sources
            this.autocompleteSuggestions = [...this.sources];
            this.selectedSuggestionIndex = this.sources.length > 0 ? 0 : -1;
            this.showMessage('Select a data source...');
        } else {
            // Show filtered sources
            this.autocompleteSuggestions = this.sources.filter(source =>
                source.alias.toLowerCase().includes(currentSourceText.toLowerCase())
            );
            this.selectedSuggestionIndex = this.autocompleteSuggestions.length > 0 ? 0 : -1;
        }

        this.displayAutocompleteSuggestions();
    }

    handleSearchMode(sourcePart, queryPart) {
        console.log('Search mode:', sourcePart, queryPart);

        // Find and set the current source
        const detectedSource = this.sources.find(s =>
            s.alias.toLowerCase() === sourcePart.toLowerCase()
        );

        if (!detectedSource) {
            this.showMessage('Invalid data source');
            return;
        }

        this.currentSource = detectedSource;

        // If there's a query, search immediately
        if (queryPart && queryPart.trim()) {
            this.debounceSearch(queryPart);
        } else {
            this.showMessage(`Ready to search in ${sourcePart}. Type your query...`);
        }
    }

    handleKeyDown(e) {
        const cursorPosition = this.searchInput.selectionStart;
        const parsed = this.parseInputByCursor(this.searchInput.value, cursorPosition);
        const isInSourceMode = !parsed.isCursorInQueryPart;

        if (e.key === 'Escape') {
            this.hideWindow();
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            if (isInSourceMode && this.autocompleteSuggestions.length > 0) {
                this.selectSuggestion();
            } else if (isInSourceMode) {
                // No suggestions, cycle to next source
                this.cycleToNextSource();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (isInSourceMode && this.autocompleteSuggestions.length > 0) {
                this.navigateSuggestions(1);
            } else if (!isInSourceMode) {
                this.navigateResults(1);
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isInSourceMode && this.autocompleteSuggestions.length > 0) {
                this.navigateSuggestions(-1);
            } else if (!isInSourceMode) {
                this.navigateResults(-1);
            }
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (isInSourceMode && this.autocompleteSuggestions.length > 0) {
                this.selectSuggestion();
            } else if (!isInSourceMode) {
                // Open first result if available
                const firstResult = document.querySelector('.result-item');
                if (firstResult) {
                    firstResult.click();
                }
            }
            return;
        }

        // Handle > or space when in source mode to add separator
        if (isInSourceMode && (e.key === '>' || e.key === ' ')) {
            const sourceName = parsed.currentSourceText.trim();
            if (sourceName && this.sources.find(s => s.alias.toLowerCase() === sourceName.toLowerCase())) {
                e.preventDefault();
                // Add the > separator and move cursor to query position
                this.searchInput.value = `${sourceName} > `;
                this.setCursorPosition(this.searchInput.value.length);
                this.currentSource = this.sources.find(s => s.alias.toLowerCase() === sourceName.toLowerCase());
                this.showMessage(`Ready to search in ${sourceName}. Type your query...`);
            }
        }
    }

    handleTab() {
        if (this.isEditingSource && this.autocompleteSuggestions.length > 0) {
            this.selectSuggestion();
        } else if (!this.isEditingSource) {
            // Switch back to source editing
            this.switchToSourceMode();
        } else {
            // Cycle through sources
            this.cycleToNextSource();
        }
    }

    cycleToNextSource() {
        if (this.sources.length === 0) return;

        const currentIndex = this.sources.findIndex(s => s === this.currentSource);
        const nextIndex = (currentIndex + 1) % this.sources.length;
        this.currentSource = this.sources[nextIndex];
        this.updateInputDisplay();
    }

    handleSourceEdit(sourcePart) {
        const trimmedSource = sourcePart.trim();
        console.log('Handling source edit:', trimmedSource);

        if (trimmedSource === '') {
            this.autocompleteSuggestions = [];
            this.selectedSuggestionIndex = -1;
            this.showMessage('Type a data source name...');
            return;
        }

        // Find matching sources (case-insensitive)
        this.autocompleteSuggestions = this.sources.filter(source =>
            source.alias.toLowerCase().startsWith(trimmedSource.toLowerCase())
        );

        this.selectedSuggestionIndex = this.autocompleteSuggestions.length > 0 ? 0 : -1;
        this.displayAutocompleteSuggestions();
    }

    handleQueryEdit(sourcePart, queryPart) {
        console.log('Handling query edit:', sourcePart, queryPart);

        // Source is already validated and set in handleInputChange
        // Just check if we have a query to search for
        if (!queryPart || !queryPart.trim()) {
            this.showMessage(`Ready to search in ${this.currentSource.alias}. Type your query...`);
            return;
        }

        // Perform search
        this.debounceSearch(queryPart);
    }

    parseInput(value) {
        const trimmedValue = value.trim();

        // Split on > or |
        const match = trimmedValue.match(/^([^>|]+)[>|]\s*(.*)$/);

        if (match) {
            return {
                sourcePart: match[1].trim(),
                queryPart: match[2].trim(),
                hasSeparator: true
            };
        } else {
            return {
                sourcePart: trimmedValue,
                queryPart: '',
                hasSeparator: false
            };
        }
    }

    updateInputDisplay() {
        if (this.currentSource) {
            this.searchInput.value = `${this.currentSource.alias} > `;
            this.setCursorPosition(this.searchInput.value.length);
        } else {
            this.searchInput.value = '';
        }
    }

    setCursorPosition(position) {
        setTimeout(() => {
            this.searchInput.setSelectionRange(position, position);
        }, 0);
    }

    switchToQueryMode() {
        this.isEditingSource = false;
        this.autocompleteSuggestions = [];
        this.selectedSuggestionIndex = -1;

        // Ensure input has proper format
        const parsed = this.parseInput(this.searchInput.value);
        if (!parsed.hasSeparator && this.currentSource) {
            this.searchInput.value = `${this.currentSource.alias} > `;
        }
        this.setCursorPosition(this.searchInput.value.length);
        this.showMessage('Type your search query...');
    }

    switchToSourceMode() {
        this.isEditingSource = true;
        const parsed = this.parseInput(this.searchInput.value);
        this.searchInput.value = parsed.sourcePart;
        this.setCursorPosition(this.searchInput.value.length);
        this.showMessage('Type a data source name...');
    }

    debounceSearch(query) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    async performSearch(query) {
        console.log('PerformSearch called with query:', JSON.stringify(query), 'currentSource:', this.currentSource);

        if (!this.currentSource) {
            console.log('No current source, showing message');
            this.showMessage('Please select a data source first');
            return;
        }

        if (!query || !query.trim()) {
            console.log('Empty query, showing message');
            this.showMessage('Type to search your data');
            return;
        }

        this.showLoading();

        try {
            console.log('Calling IPC search with:', this.currentSource.alias, query);
            const results = await ipcRenderer.invoke('search', this.currentSource.alias, query);
            console.log('Search results:', results);
            this.displayResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            this.showMessage('Search failed. Please try again.');
        }
    }

      async displayResults(results) {
        this.resultsContainer.innerHTML = '';

        console.log('Display results called with:', results.length, 'results');

        if (results.length === 0) {
            this.showMessage('No results found');
            // Window resized to half screen - no dynamic resizing needed
            return;
        }

        // Get source configuration to determine result columns
        const sources = await ipcRenderer.invoke('get-sources');
        const currentAlias = this.currentSource ? this.currentSource.alias : null;
        const sourceConfig = sources.find(s => s.alias === currentAlias);

        console.log('Source config:', sourceConfig);
        console.log('Current alias:', currentAlias);

        // Create table
        const table = document.createElement('table');
        table.className = 'results-table';

        if (results.length > 0 && results[0].fullRow) {
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            // Determine which columns to display
            const allColumns = Object.keys(results[0].fullRow);
            let displayColumns;

            if (sourceConfig && sourceConfig.resultCols && sourceConfig.resultCols.length > 0) {
                // Use configured result columns + search column
                displayColumns = new Set();
                // Always include search column first
                const searchColumnIndex = sourceConfig.searchCol || 0;
                displayColumns.add(allColumns[searchColumnIndex]);

                // Add configured result columns
                sourceConfig.resultCols.forEach(colIndex => {
                    if (colIndex >= 0 && colIndex < allColumns.length) {
                        displayColumns.add(allColumns[colIndex]);
                    }
                });

                // Convert Set to Array
                displayColumns = Array.from(displayColumns);
            } else {
                // Default: show all columns
                displayColumns = allColumns;
            }

            // Create headers
            displayColumns.forEach(column => {
                const th = document.createElement('th');
                th.textContent = column;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create body
            const tbody = document.createElement('tbody');

            results.forEach(result => {
                const row = document.createElement('tr');
                row.className = 'result-row';

                displayColumns.forEach(column => {
                    const td = document.createElement('td');
                    td.textContent = result.fullRow[column] || '';
                    row.appendChild(td);
                });

                // Add click handler to the row
                row.addEventListener('click', () => {
                    this.selectResult(result);
                });

                tbody.appendChild(row);
            });

            table.appendChild(tbody);
        }

        this.resultsContainer.appendChild(table);

        // Resize window to fit content
        // Window resized to half screen - no dynamic resizing needed
    }

    async resizeWindow() {
        try {
            // Set window height to exactly 1/2 of the screen height
            const { screen } = require('electron');
            const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
            const halfScreenHeight = Math.floor(screenHeight * 0.5);

            console.log('Setting window height to 1/2 screen:', halfScreenHeight);

            // Resize the window through IPC to 1/2 screen height
            await ipcRenderer.invoke('resize-search-window', 800, halfScreenHeight);
        } catch (error) {
            console.error('Failed to resize window:', error);
        }
    }

    selectResult(result) {
        // Copy primary text to clipboard
        const { clipboard } = require('electron');
        clipboard.writeText(result.primary);

        // Show success feedback
        this.showMessage('Copied to clipboard!', 2000);

        // Optionally hide window after selection
        setTimeout(() => {
            this.hideWindow();
        }, 1000);
    }

    showMessage(message, duration = 0) {
        this.resultsContainer.innerHTML = `
            <div class="no-results">${message}</div>
        `;

        // Resize window for minimal content
        // Window resized to half screen - no dynamic resizing needed

        if (duration > 0) {
            setTimeout(() => {
                if (this.resultsContainer.querySelector('.no-results')?.textContent === message) {
                    this.showMessage('Type to search your data sources');
                }
            }, duration);
        }
    }

    showLoading() {
        this.resultsContainer.innerHTML = `
            <div class="loading">Searching...</div>
        `;
    }

    displayAutocompleteSuggestions() {
        if (this.autocompleteSuggestions.length === 0) {
            this.showMessage('No matching data sources');
            return;
        }

        let html = '<div class="autocomplete-header">Data Sources:</div>';
        this.autocompleteSuggestions.forEach((source, index) => {
            const isSelected = index === this.selectedSuggestionIndex;
            const className = `suggestion-item ${isSelected ? 'selected' : ''}`;
            html += `
                <div class="${className}" data-index="${index}">
                    <div class="suggestion-alias">${source.alias}</div>
                    <div class="suggestion-type">(${source.type})</div>
                </div>
            `;
        });

        this.resultsContainer.innerHTML = html;
        // Window resized to half screen - no dynamic resizing needed

        // Add click handlers to suggestions
        document.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectedSuggestionIndex = index;
                this.selectSuggestion();
            });
        });
    }

    selectSuggestion() {
        if (this.selectedSuggestionIndex < 0 || this.selectedSuggestionIndex >= this.autocompleteSuggestions.length) {
            return;
        }

        const selectedSource = this.autocompleteSuggestions[this.selectedSuggestionIndex];
        this.currentSource = selectedSource;

        // Update input and switch to query mode
        this.searchInput.value = `${selectedSource.alias} > `;
        this.autocompleteSuggestions = [];
        this.selectedSuggestionIndex = -1;
        this.setCursorPosition(this.searchInput.value.length);
        this.showMessage(`Ready to search in ${selectedSource.alias}. Type your query...`);
    }

    navigateSuggestions(direction) {
        if (this.autocompleteSuggestions.length === 0) return;

        // Remove previous selection
        const prevSelected = document.querySelector('.suggestion-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // Update index
        this.selectedSuggestionIndex += direction;
        if (this.selectedSuggestionIndex < 0) {
            this.selectedSuggestionIndex = this.autocompleteSuggestions.length - 1;
        } else if (this.selectedSuggestionIndex >= this.autocompleteSuggestions.length) {
            this.selectedSuggestionIndex = 0;
        }

        // Add new selection
        const newSelected = document.querySelector(`.suggestion-item[data-index="${this.selectedSuggestionIndex}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
            newSelected.scrollIntoView({ block: 'nearest' });
        }
    }

    navigateResults(direction) {
        const results = document.querySelectorAll('.result-item');
        if (results.length === 0) return;

        // Find current selection
        let currentSelected = document.querySelector('.result-item.selected');
        let currentIndex = -1;

        if (currentSelected) {
            currentIndex = Array.from(results).indexOf(currentSelected);
            currentSelected.classList.remove('selected');
        }

        // Calculate new index
        currentIndex += direction;
        if (currentIndex < 0) {
            currentIndex = results.length - 1;
        } else if (currentIndex >= results.length) {
            currentIndex = 0;
        }

        // Select new item
        results[currentIndex].classList.add('selected');
        results[currentIndex].scrollIntoView({ block: 'nearest' });
    }

    async hideWindow() {
        await ipcRenderer.invoke('close-search');
    }

    async openSettings() {
        // Close search window and open settings
        await this.hideWindow();
        await ipcRenderer.invoke('open-settings');
    }
}

// Initialize search window when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Search.js - DOM Content Loaded, initializing SearchWindow');
    new SearchWindow();
    console.log('Search.js - SearchWindow initialized');
});