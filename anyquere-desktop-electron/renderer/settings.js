const { ipcRenderer } = require('electron');

class SettingsWindow {
    constructor() {
        this.sources = [];
        this.selectedSource = null;
        this.timeSettings = this.loadTimeSettings();

        this.initElements();
        this.initEventListeners();
        this.loadSources();
        this.initTimeSettings();
        this.initIPCListeners();
    }

    initElements() {
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Sources tab
        this.sourcesTableBody = document.getElementById('sourcesTableBody');
        this.addSourceBtn = document.getElementById('addSourceBtn');
        this.removeSourceBtn = document.getElementById('removeSourceBtn');
        this.testSourceBtn = document.getElementById('testSourceBtn');
        // Note: previewSourceBtn removed from HTML as we now have inline preview buttons

        // Debug: Check if elements are found
        console.log('Elements found:', {
            addSourceBtn: !!this.addSourceBtn,
            addSourceModal: !!document.getElementById('addSourceModal'),
            saveSourceBtn: !!document.getElementById('saveSourceBtn'),
            cancelSourceBtn: !!document.getElementById('cancelSourceBtn'),
            browseBtn: !!document.getElementById('browseBtn'),
            sourcesTableBody: !!this.sourcesTableBody,
            dataPreviewModal: !!document.getElementById('dataPreviewModal')
        });

        // Data Preview Modal
        this.dataPreviewModal = document.getElementById('dataPreviewModal');
        this.previewSourceName = document.getElementById('previewSourceName');
        this.previewSourceType = document.getElementById('previewSourceType');
        this.previewSourcePath = document.getElementById('previewSourcePath');
        this.previewRows = document.getElementById('previewRows');
        this.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
        this.exportPreviewBtn = document.getElementById('exportPreviewBtn');
        this.previewLoading = document.getElementById('previewLoading');
        this.previewError = document.getElementById('previewError');
        this.previewErrorText = document.getElementById('previewErrorText');
        this.previewTableContainer = document.getElementById('previewTableContainer');
        this.previewTable = document.getElementById('previewTable');
        this.previewTableHead = document.getElementById('previewTableHead');
        this.previewTableBody = document.getElementById('previewTableBody');
        this.previewStats = document.getElementById('previewStats');
        this.totalRows = document.getElementById('totalRows');
        this.totalColumns = document.getElementById('totalColumns');
        this.lastLoaded = document.getElementById('lastLoaded');
        this.previewInfo = document.getElementById('previewInfo');
        this.closePreviewModal = document.getElementById('closePreviewModal');
        this.closePreviewFooterBtn = document.getElementById('closePreviewFooterBtn');

        // Footer buttons
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');

        // Modal elements
        this.addSourceModal = document.getElementById('addSourceModal');
        this.sourceForm = document.getElementById('sourceForm');
        this.modalClose = document.querySelector('.modal-close');
        this.saveSourceBtn = document.getElementById('saveSourceBtn');
        this.cancelSourceBtn = document.getElementById('cancelSourceBtn');
        this.testNewSourceBtn = document.getElementById('testNewSourceBtn');
        this.browseBtn = document.getElementById('browseBtn');

        // Form inputs
        this.sourceAlias = document.getElementById('sourceAlias');
        this.sourceType = document.getElementById('sourceType');
        this.sourcePath = document.getElementById('sourcePath');
        this.searchCol = document.getElementById('searchCol');
        this.headerRow = document.getElementById('headerRow');
        this.maxResults = document.getElementById('maxResults');
        this.resultCols = document.getElementById('resultCols');

        // Time converter tab elements
        this.timezoneList = document.getElementById('timezoneList');
        this.customTimezone = document.getElementById('customTimezone');
        this.addTimezoneBtn = document.getElementById('addTimezoneBtn');

        // Format options
        this.showISO8601 = document.getElementById('showISO8601');
        this.showUnixTimestamp = document.getElementById('showUnixTimestamp');
        this.showRFC2822 = document.getElementById('showRFC2822');
        this.showLocalFormat = document.getElementById('showLocalFormat');
        this.showDateOnly = document.getElementById('showDateOnly');
        this.showTimeOnly = document.getElementById('showTimeOnly');

        // Behavior settings
        this.autoDetectTime = document.getElementById('autoDetectTime');
        this.showQuickExamples = document.getElementById('showQuickExamples');
        this.copyOnClick = document.getElementById('copyOnClick');
        this.defaultInputFormat = document.getElementById('defaultInputFormat');
        this.timeZoneDisplayFormat = document.getElementById('timeZoneDisplayFormat');

        // Shortcuts
        this.timeShortcut = document.getElementById('timeShortcut');
        this.showCurrentTimeQuick = document.getElementById('showCurrentTimeQuick');
        this.enableClipboardDetection = document.getElementById('enableClipboardDetection');
    }

    initEventListeners() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Sources tab
        if (this.addSourceBtn) {
            this.addSourceBtn.addEventListener('click', () => {
                this.showAddSourceModal();
            });
        }

        if (this.removeSourceBtn) {
            this.removeSourceBtn.addEventListener('click', () => {
                this.removeSelectedSource();
            });
        }

        if (this.testSourceBtn) {
            this.testSourceBtn.addEventListener('click', () => {
                this.testSelectedSource();
            });
        }

        
        // Footer buttons
        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => {
                this.closeWindow();
            });
        }

        // Modal events
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => {
                this.hideAddSourceModal();
            });
        }

        if (this.cancelSourceBtn) {
            this.cancelSourceBtn.addEventListener('click', () => {
                this.hideAddSourceModal();
            });
        }

        if (this.saveSourceBtn) {
            this.saveSourceBtn.addEventListener('click', () => {
                this.addSource();
            });
        }

        if (this.testNewSourceBtn) {
            this.testNewSourceBtn.addEventListener('click', () => {
                this.testNewSource();
            });
        }

        if (this.browseBtn) {
            this.browseBtn.addEventListener('click', () => {
                this.browseForFile();
            });
        }

        // Data preview modal events
        if (this.closePreviewModal) {
            this.closePreviewModal.addEventListener('click', () => {
                this.hideDataPreviewModal();
            });
        }

        if (this.refreshPreviewBtn) {
            this.refreshPreviewBtn.addEventListener('click', () => {
                this.refreshPreview();
            });
        }

        if (this.exportPreviewBtn) {
            this.exportPreviewBtn.addEventListener('click', () => {
                this.exportPreviewData();
            });
        }

        if (this.closePreviewFooterBtn) {
            this.closePreviewFooterBtn.addEventListener('click', () => {
                this.hideDataPreviewModal();
            });
        }

        // Form change events
        if (this.sourceType) {
            this.sourceType.addEventListener('change', () => {
                this.updatePathPlaceholder();
            });
        }

        // Close modal on background click
        if (this.addSourceModal) {
            this.addSourceModal.addEventListener('click', (e) => {
                if (e.target === this.addSourceModal) {
                    this.hideAddSourceModal();
                }
            });
        }

        
        // Sources table click events
        if (this.sourcesTableBody) {
            this.sourcesTableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (row) {
                    this.selectSource(row);
                }
            });
        }

        // Time converter event listeners
        if (this.addTimezoneBtn) {
            this.addTimezoneBtn.addEventListener('click', () => {
                this.addCustomTimezone();
            });
        }

        if (this.customTimezone) {
            this.customTimezone.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addCustomTimezone();
                }
            });
        }

        // Format change listeners
        [this.showISO8601, this.showUnixTimestamp, this.showRFC2822, this.showLocalFormat, this.showDateOnly, this.showTimeOnly].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.saveTimeSettings();
                });
            }
        });

        // Behavior change listeners
        [this.autoDetectTime, this.showQuickExamples, this.copyOnClick].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.saveTimeSettings();
                });
            }
        });

        [this.defaultInputFormat, this.timeZoneDisplayFormat, this.timeShortcut].forEach(select => {
            if (select) {
                select.addEventListener('change', () => {
                    this.saveTimeSettings();
                });
            }
        });

        // Timezone checkbox listeners
        if (this.timezoneList) {
            this.timezoneList.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox' && e.target.dataset.timezone) {
                    this.saveTimeSettings();
                }
            });
        }
    }

    initIPCListeners() {
        // Listen for focus tab messages from main process
        ipcRenderer.on('focus-tab', (event, tabName) => {
            console.log('Received focus tab request:', tabName);
            this.switchTab(tabName);
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    async loadSources() {
        try {
            console.log('Settings: loadSources called');
            this.sources = await ipcRenderer.invoke('get-sources');
            console.log('Settings: received sources:', this.sources.length, this.sources);
            this.updateSourcesTable();
            console.log('Settings: updateSourcesTable completed');
        } catch (error) {
            console.error('Settings: Failed to load sources:', error);
            this.showError('Failed to load data sources');
        }
    }

    updateSourcesTable() {
        console.log('Settings: updateSourcesTable called with', this.sources.length, 'sources');
        this.sourcesTableBody.innerHTML = '';

        if (this.sources.length === 0) {
            console.log('Settings: No sources to display');
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" style="text-align: center; color: #666;">No data sources configured</td>';
            this.sourcesTableBody.appendChild(row);
            return;
        }

        this.sources.forEach(source => {
            const row = document.createElement('tr');
            row.dataset.alias = source.alias;

            const statusClass = this.getStatusClass(source);
            const statusText = this.getStatusText(source);

            row.innerHTML = `
                <td>${source.alias}</td>
                <td>${source.type}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="actions-cell">
                    <button class="btn btn-secondary" onclick="settingsWindow.editSource('${source.alias}')">Edit</button>
                    <button class="btn btn-secondary" onclick="settingsWindow.testSource('${source.alias}')">Test</button>
                    <button class="btn btn-secondary" onclick="settingsWindow.previewSource('${source.alias}')">Preview</button>
                    <button class="btn btn-danger" onclick="settingsWindow.deleteSource('${source.alias}')">Delete</button>
                </td>
            `;

            this.sourcesTableBody.appendChild(row);
        });

        // Hide the old remove selected button since we now have inline delete buttons
        if (this.removeSourceBtn) {
            this.removeSourceBtn.style.display = 'none';
        }
        if (this.testSourceBtn) {
            this.testSourceBtn.style.display = 'none';
        }
    }

    getStatusClass(source) {
        // For now, assume all sources are connected unless they have an error
        return source.error ? 'error' : 'connected';
    }

    getStatusText(source) {
        return source.error ? 'Error' : 'Connected';
    }

    selectSource(row) {
        // Remove previous selection
        this.sourcesTableBody.querySelectorAll('tr').forEach(tr => {
            tr.classList.remove('selected');
        });

        // Add selection to clicked row
        row.classList.add('selected');
        this.selectedSource = row.dataset.alias;

        // Enable action buttons
        this.removeSourceBtn.disabled = false;
        this.testSourceBtn.disabled = false;
    }

    async removeSelectedSource() {
        if (!this.selectedSource) {
            return;
        }

        if (!confirm(`Are you sure you want to remove the data source "${this.selectedSource}"?`)) {
            return;
        }

        try {
            const result = await ipcRenderer.invoke('remove-source', this.selectedSource);
            if (result.success) {
                this.selectedSource = null;
                this.removeSourceBtn.disabled = true;
                this.testSourceBtn.disabled = true;
                await this.loadSources();
                this.showSuccess('Data source removed successfully');
            } else {
                this.showError(result.error || 'Failed to remove data source');
            }
        } catch (error) {
            console.error('Remove source error:', error);
            this.showError('Failed to remove data source');
        }
    }

    async testSelectedSource() {
        if (!this.selectedSource) {
            return;
        }

        const source = this.sources.find(s => s.alias === this.selectedSource);
        if (!source) {
            return;
        }

        await this.testSourceConnection(source);
    }

    async testSource(alias) {
        const source = this.sources.find(s => s.alias === alias);
        if (source) {
            await this.testSourceConnection(source);
        }
    }

    async previewSource(alias) {
        const source = this.sources.find(s => s.alias === alias);
        if (!source) {
            this.showError('Source not found');
            return;
        }

        this.previewSourceName.textContent = source.alias;
        this.dataPreviewModal.classList.add('show');
        await this.refreshPreviewForSource(source);
    }

    async refreshPreviewForSource(source) {
        const maxRows = parseInt(this.previewRows.value) || 10;

        // Update preview info using the span elements
        if (this.previewSourceName) this.previewSourceName.textContent = source.alias;
        if (this.previewSourceType) this.previewSourceType.textContent = source.type;
        if (this.previewSourcePath) this.previewSourcePath.textContent = source.path;

        // Show loading state
        if (this.previewLoading) {
            this.previewLoading.style.display = 'flex';
        }
        if (this.previewError) {
            this.previewError.style.display = 'none';
        }
        if (this.previewTableContainer) {
            this.previewTableContainer.style.display = 'none';
        }

        try {
            const data = await ipcRenderer.invoke('load-data', source.alias);
            if (data && data.length > 0) {
                this.displayPreviewData(data, source, maxRows);
            } else {
                this.showPreviewError('No data found in this source');
            }
        } catch (error) {
            console.error('Preview load error:', error);
            this.showPreviewError(`Failed to load data: ${error.message}`);
        } finally {
            if (this.previewLoading) {
                this.previewLoading.style.display = 'none';
            }
        }
    }

    async editSource(alias) {
        const source = this.sources.find(s => s.alias === alias);
        if (!source) {
            this.showError('Source not found');
            return;
        }

        // Populate the form with existing source data
        this.sourceAlias.value = source.alias;
        this.sourceType.value = source.type;
        this.sourcePath.value = source.path;
        this.searchCol.value = source.searchCol || 0;
        this.headerRow.value = source.headerRow || 1;
        this.maxResults.value = source.maxResults || 10;

        // Update path placeholder based on type
        this.updatePathPlaceholder();

        // Load data to populate column selector
        try {
            const data = await ipcRenderer.invoke('load-data', alias);
            if (data && data.length > 0) {
                await this.populateColumnSelector(data, source.resultCols || []);
            } else {
                // Fallback to empty selector if no data
                this.resultCols.innerHTML = '<option value="">No data available</option>';
            }
        } catch (error) {
            console.error('Failed to load data for column selector:', error);
            this.resultCols.innerHTML = '<option value="">Failed to load columns</option>';
        }

        // Change modal title and button text for edit mode
        document.querySelector('.modal-header h2').textContent = 'Edit Data Source';
        this.saveSourceBtn.textContent = 'Update Source';

        // Store the original alias for reference
        this.editingSourceAlias = alias;

        // Show the modal
        this.addSourceModal.classList.add('show');
        this.sourceAlias.focus();
    }

    async deleteSource(alias) {
        if (!confirm(`Are you sure you want to delete the data source "${alias}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await ipcRenderer.invoke('remove-source', alias);
            if (result.success) {
                this.showSuccess(`Data source "${alias}" deleted successfully`);
                await this.loadSources();
            } else {
                this.showError(result.error || 'Failed to delete data source');
            }
        } catch (error) {
            console.error('Delete source error:', error);
            this.showError('Failed to delete data source');
        }
    }

    async testSourceConnection(source) {
        // Update status to testing
        const statusBadge = document.querySelector(`tr[data-alias="${source.alias}"] .status-badge`);
        const originalClass = statusBadge.className;
        const originalText = statusBadge.textContent;

        statusBadge.className = 'status-badge testing';
        statusBadge.textContent = 'Testing...';

        try {
            const data = await ipcRenderer.invoke('load-data', source.alias);
            if (data && data.length > 0) {
                statusBadge.className = 'status-badge connected';
                statusBadge.textContent = 'Connected';
                this.showSuccess(`Successfully connected to ${source.alias} (${data.length} rows)`);
            } else {
                statusBadge.className = 'status-badge error';
                statusBadge.textContent = 'No Data';
                this.showError(`No data found in ${source.alias}`);
            }
        } catch (error) {
            statusBadge.className = 'status-badge error';
            statusBadge.textContent = 'Error';
            this.showError(`Failed to connect to ${source.alias}: ${error.message}`);
        }
    }

    showAddSourceModal() {
        this.addSourceModal.classList.add('show');
        this.sourceForm.reset();

        // Reset editing state
        this.editingSourceAlias = undefined;

        // Reset modal title and button text to default
        document.querySelector('.modal-header h2').textContent = 'Add Data Source';
        this.saveSourceBtn.textContent = 'Add Source';

        this.sourceAlias.focus();
    }

    hideAddSourceModal() {
        this.addSourceModal.classList.remove('show');
        // Clear editing state
        this.editingSourceAlias = undefined;
    }

    updatePathPlaceholder() {
        const type = this.sourceType.value;
        if (type === 'local') {
            this.sourcePath.placeholder = '/path/to/your/file.csv';
            this.browseBtn.style.display = 'block';
        } else if (type === 'google') {
            this.sourcePath.placeholder = 'https://docs.google.com/spreadsheets/d/...';
            this.browseBtn.style.display = 'none';
        }
    }

    async browseForFile() {
        try {
            const result = await ipcRenderer.invoke('show-open-dialog', {
                properties: ['openFile'],
                filters: [
                    { name: 'CSV Files', extensions: ['csv'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
                this.sourcePath.value = result.filePaths[0];
            }
        } catch (error) {
            console.error('File dialog error:', error);
            this.showError('Failed to open file dialog');
        }
    }

    async addSource() {
        const formData = this.getSourceFormData();
        if (!formData) {
            return;
        }

        const isEditing = this.editingSourceAlias !== undefined;
        const action = isEditing ? 'update' : 'add';

        try {
            if (isEditing) {
                // If editing, remove the old source first, then add the updated one
                if (formData.alias !== this.editingSourceAlias) {
                    // Alias changed, remove old one
                    await ipcRenderer.invoke('remove-source', this.editingSourceAlias);
                }
            }

            const result = await ipcRenderer.invoke('add-source', formData);
            if (result.success) {
                // Clear cache for this source to refresh column display
                await ipcRenderer.invoke('clear-cache', formData.alias);

                this.hideAddSourceModal();
                await this.loadSources();
                this.showSuccess(`Data source ${action}d successfully`);
            } else {
                this.showError(result.error || `Failed to ${action} data source`);
            }
        } catch (error) {
            console.error(`${action} source error:`, error);
            this.showError(`Failed to ${action} data source`);
        }
    }

    async testNewSource() {
        const formData = this.getSourceFormData();
        if (!formData) {
            return;
        }

        this.testNewSourceBtn.disabled = true;
        this.testNewSourceBtn.textContent = 'Testing...';

        try {
            // Temporarily add source to test
            const addResult = await ipcRenderer.invoke('add-source', formData);
            if (addResult.success) {
                const data = await ipcRenderer.invoke('load-data', formData.alias);
                if (data && data.length > 0) {
                    // Populate column selector with actual headers
                    await this.populateColumnSelector(data);
                    this.showSuccess(`Test successful! Found ${data.length} rows in ${formData.alias}`);
                } else {
                    this.showError(`Test completed but no data found in ${formData.alias}`);
                }
                // Remove the temporary source
                await ipcRenderer.invoke('remove-source', formData.alias);
            } else {
                this.showError(addResult.error || 'Failed to test connection');
            }
        } catch (error) {
            console.error('Test connection error:', error);
            this.showError(`Failed to test connection: ${error.message}`);
        } finally {
            this.testNewSourceBtn.disabled = false;
            this.testNewSourceBtn.textContent = 'Test Connection';
        }
    }

    async populateColumnSelector(data, selectedCols = []) {
        if (!data || data.length === 0) return;

        const columns = Object.keys(data[0]);
        const searchColValue = parseInt(this.searchCol.value) || 0;

        // Clear existing options
        this.resultCols.innerHTML = '';

        // Add column options
        columns.forEach((column, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${column} (column ${index})`;

            // Select if it's in the selectedCols array
            if (selectedCols.includes(index)) {
                option.selected = true;
            }

            this.resultCols.appendChild(option);
        });
    }

    getSourceFormData() {
        if (!this.sourceForm.checkValidity()) {
            this.sourceForm.reportValidity();
            return null;
        }

        // Get selected columns from multi-select
        const selectedOptions = Array.from(this.resultCols.selectedOptions);
        const resultCols = selectedOptions.map(option => parseInt(option.value));

        return {
            alias: this.sourceAlias.value.trim(),
            type: this.sourceType.value,
            path: this.sourcePath.value.trim(),
            searchCol: parseInt(this.searchCol.value) || 0,
            headerRow: parseInt(this.headerRow.value) || 1,
            maxResults: parseInt(this.maxResults.value) || 10,
            resultCols: resultCols
        };
    }

    // Data Preview Modal Methods
    async showDataPreview() {
        const selectedSource = this.getSelectedSource();
        if (!selectedSource) {
            this.showError('Please select a data source to preview');
            return;
        }

        this.previewSourceName.textContent = selectedSource.alias;
        this.dataPreviewModal.classList.add('show');
        await this.refreshPreview();
    }

    hideDataPreviewModal() {
        this.dataPreviewModal.classList.remove('show');
    }

    showPreviewError(message) {
        if (this.previewError && this.previewErrorText) {
            this.previewErrorText.textContent = message;
            this.previewError.style.display = 'block';
        }
        if (this.previewTableContainer) {
            this.previewTableContainer.style.display = 'none';
        }
    }

    getSelectedSource() {
        const selectedRow = this.sourcesTable.querySelector('tr.selected');
        if (!selectedRow) {
            return null;
        }

        const alias = selectedRow.dataset.alias;
        return this.sources.find(source => source.alias === alias);
    }

    async refreshPreview() {
        const selectedSource = this.getSelectedSource();
        if (!selectedSource) {
            this.hideDataPreviewModal();
            return;
        }

        await this.refreshPreviewForSource(selectedSource);
    }

    displayPreviewData(data, source, maxRows) {
        const previewData = data.slice(0, maxRows);

        if (previewData.length === 0) {
            this.showPreviewError('No data to display');
            return;
        }

        const columns = Object.keys(previewData[0]);

        // Hide error and loading states
        if (this.previewError) {
            this.previewError.style.display = 'none';
        }
        if (this.previewLoading) {
            this.previewLoading.style.display = 'none';
        }

        // Show table container
        if (this.previewTableContainer) {
            this.previewTableContainer.style.display = 'block';
        }

        // Update preview info using span elements (already set in refreshPreviewForSource)
        // Update table head
        if (this.previewTableHead) {
            const headerRow = this.previewTableHead.querySelector('tr');
            headerRow.innerHTML = '';

            columns.forEach((col, index) => {
                const isSearchCol = source.searchCol === index;
                const isResultCol = source.resultCols && source.resultCols.includes(index);
                let colTitle = col;
                if (isSearchCol) colTitle += ' 🔍';
                if (isResultCol) colTitle += ' 📋';
                const th = document.createElement('th');
                th.textContent = colTitle;
                th.title = `${col}${isSearchCol ? ' (Search Column)' : ''}${isResultCol ? ' (Result Column)' : ''}`;
                headerRow.appendChild(th);
            });
        }

        // Update table body
        if (this.previewTableBody) {
            this.previewTableBody.innerHTML = '';

            previewData.forEach(row => {
                const tr = document.createElement('tr');
                columns.forEach(col => {
                    const value = row[col] || '';
                    const td = document.createElement('td');
                    td.textContent = value;
                    td.title = value;
                    tr.appendChild(td);
                });
                this.previewTableBody.appendChild(tr);
            });
        }

        // Update preview stats
        if (this.previewStats) {
            this.previewStats.innerHTML = `
                <p><strong>Total Columns:</strong> ${columns.length}</p>
                <p><strong>Preview Rows:</strong> ${previewData.length}</p>
                <p><strong>Search Column:</strong> ${columns[source.searchCol] || 'N/A'}</p>
            `;
        }
    }

    async exportPreviewData() {
        const selectedSource = this.getSelectedSource();
        if (!selectedSource) {
            this.showError('No source selected for export');
            return;
        }

        try {
            const data = await ipcRenderer.invoke('load-data', selectedSource.alias);
            if (data && data.length > 0) {
                // Create CSV content
                const columns = Object.keys(data[0]);
                let csvContent = columns.join(',') + '\n';

                data.forEach(row => {
                    const values = columns.map(col => {
                        const value = row[col] || '';
                        // Escape quotes and wrap in quotes if contains comma or quote
                        if (value.includes(',') || value.includes('"')) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    });
                    csvContent += values.join(',') + '\n';
                });

                // Create download link
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedSource.alias}_export.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                this.showSuccess(`Exported ${data.length} rows from ${selectedSource.alias}`);
            } else {
                this.showError('No data available to export');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export data');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async saveSettings() {
        // Settings are automatically saved when sources are added/removed
        this.showSuccess('Settings saved successfully');
    }

    async closeWindow() {
        await ipcRenderer.invoke('close-settings');
    }

    showError(message) {
        // Simple error notification
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // Simple success notification
        alert(`Success: ${message}`);
    }

    // Time converter methods
    loadTimeSettings() {
        const defaultSettings = {
            timezones: ['auto', 'UTC', 'America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'America/Los_Angeles', 'America/Chicago', 'Asia/Dubai'],
            formats: {
                showISO8601: true,
                showUnixTimestamp: true,
                showRFC2822: true,
                showLocalFormat: true,
                showDateOnly: true,
                showTimeOnly: true
            },
            behavior: {
                autoDetectTime: true,
                showQuickExamples: true,
                copyOnClick: true,
                defaultInputFormat: 'auto',
                timeZoneDisplayFormat: 'abbreviation'
            },
            shortcuts: {
                timeShortcut: '',
                showCurrentTimeQuick: true,
                enableClipboardDetection: true
            }
        };

        try {
            const saved = localStorage.getItem('anyquere-time-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading time settings:', error);
            return defaultSettings;
        }
    }

    saveTimeSettings() {
        try {
            const settings = {
                timezones: this.getSelectedTimezones(),
                formats: {
                    showISO8601: this.showISO8601.checked,
                    showUnixTimestamp: this.showUnixTimestamp.checked,
                    showRFC2822: this.showRFC2822.checked,
                    showLocalFormat: this.showLocalFormat.checked,
                    showDateOnly: this.showDateOnly.checked,
                    showTimeOnly: this.showTimeOnly.checked
                },
                behavior: {
                    autoDetectTime: this.autoDetectTime.checked,
                    showQuickExamples: this.showQuickExamples.checked,
                    copyOnClick: this.copyOnClick.checked,
                    defaultInputFormat: this.defaultInputFormat.value,
                    timeZoneDisplayFormat: this.timeZoneDisplayFormat.value
                },
                shortcuts: {
                    timeShortcut: this.timeShortcut.value,
                    showCurrentTimeQuick: this.showCurrentTimeQuick.checked,
                    enableClipboardDetection: this.enableClipboardDetection.checked
                }
            };

            localStorage.setItem('anyquere-time-settings', JSON.stringify(settings));
            this.timeSettings = settings;
        } catch (error) {
            console.error('Error saving time settings:', error);
            this.showError('Failed to save time settings');
        }
    }

    getSelectedTimezones() {
        const checkboxes = this.timezoneList.querySelectorAll('input[type="checkbox"][data-timezone]');
        return Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.dataset.timezone);
    }

    initTimeSettings() {
        // Set timezone checkboxes
        this.timeSettings.timezones.forEach(timezone => {
            const checkbox = this.timezoneList.querySelector(`input[data-timezone="${timezone}"]`);
            if (checkbox) {
                checkbox.checked = true;
            } else if (!['auto', 'UTC'].includes(timezone)) {
                this.addTimezoneCheckbox(timezone);
            }
        });

        // Set format checkboxes
        Object.keys(this.timeSettings.formats).forEach(format => {
            const checkbox = document.getElementById(`show${format}`);
            if (checkbox) {
                checkbox.checked = this.timeSettings.formats[format];
            }
        });

        // Set behavior settings
        this.autoDetectTime.checked = this.timeSettings.behavior.autoDetectTime;
        this.showQuickExamples.checked = this.timeSettings.behavior.showQuickExamples;
        this.copyOnClick.checked = this.timeSettings.behavior.copyOnClick;
        this.defaultInputFormat.value = this.timeSettings.behavior.defaultInputFormat;
        this.timeZoneDisplayFormat.value = this.timeSettings.behavior.timeZoneDisplayFormat;

        // Set shortcut settings
        this.timeShortcut.value = this.timeSettings.shortcuts.timeShortcut;
        this.showCurrentTimeQuick.checked = this.timeSettings.shortcuts.showCurrentTimeQuick;
        this.enableClipboardDetection.checked = this.timeSettings.shortcuts.enableClipboardDetection;
    }

    addCustomTimezone() {
        const timezone = this.customTimezone.value.trim();
        if (!timezone) {
            this.showError('Please enter a timezone');
            return;
        }

        if (this.timezoneList.querySelector(`input[data-timezone="${timezone}"]`)) {
            this.showError('This timezone is already added');
            return;
        }

        this.addTimezoneCheckbox(timezone);
        this.customTimezone.value = '';
        this.saveTimeSettings();
        this.showSuccess(`Added timezone: ${timezone}`);
    }

    addTimezoneCheckbox(timezone) {
        const item = document.createElement('div');
        item.className = 'timezone-item';

        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" checked data-timezone="${timezone}">
            <span>${timezone}</span>
        `;

        item.appendChild(label);
        this.timezoneList.appendChild(item);

        // Add remove functionality
        label.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Remove timezone "${timezone}"?`)) {
                item.remove();
                this.saveTimeSettings();
            }
        });
    }
}

// Make settingsWindow available globally for onclick handlers
let settingsWindow;

document.addEventListener('DOMContentLoaded', () => {
    settingsWindow = new SettingsWindow();
});