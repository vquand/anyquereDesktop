const { ipcRenderer, dialog } = require('electron');

class SettingsWindow {
    constructor() {
        this.sources = [];
        this.selectedSource = null;

        this.initElements();
        this.initEventListeners();
        this.loadSources();
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

        // Data preview tab
        this.previewSourceSelect = document.getElementById('previewSourceSelect');
        this.loadPreviewBtn = document.getElementById('loadPreviewBtn');
        this.previewContent = document.getElementById('previewContent');

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
    }

    initEventListeners() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Sources tab
        this.addSourceBtn.addEventListener('click', () => {
            this.showAddSourceModal();
        });

        this.removeSourceBtn.addEventListener('click', () => {
            this.removeSelectedSource();
        });

        this.testSourceBtn.addEventListener('click', () => {
            this.testSelectedSource();
        });

        // Data preview tab
        this.loadPreviewBtn.addEventListener('click', () => {
            this.loadPreview();
        });

        // Footer buttons
        this.saveSettingsBtn.addEventListener('click', () => {
            this.saveSettings();
        });

        this.closeSettingsBtn.addEventListener('click', () => {
            this.closeWindow();
        });

        // Modal events
        this.modalClose.addEventListener('click', () => {
            this.hideAddSourceModal();
        });

        this.cancelSourceBtn.addEventListener('click', () => {
            this.hideAddSourceModal();
        });

        this.saveSourceBtn.addEventListener('click', () => {
            this.addSource();
        });

        this.testNewSourceBtn.addEventListener('click', () => {
            this.testNewSource();
        });

        this.browseBtn.addEventListener('click', () => {
            this.browseForFile();
        });

        // Form type change
        this.sourceType.addEventListener('change', () => {
            this.updatePathPlaceholder();
        });

        // Close modal on background click
        this.addSourceModal.addEventListener('click', (e) => {
            if (e.target === this.addSourceModal) {
                this.hideAddSourceModal();
            }
        });

        // Sources table click events
        this.sourcesTableBody.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row) {
                this.selectSource(row);
            }
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

        // Update preview sources when switching to data tab
        if (tabName === 'data') {
            this.updatePreviewSources();
        }
    }

    async loadSources() {
        try {
            this.sources = await ipcRenderer.invoke('get-sources');
            this.updateSourcesTable();
        } catch (error) {
            console.error('Failed to load sources:', error);
            this.showError('Failed to load data sources');
        }
    }

    updateSourcesTable() {
        this.sourcesTableBody.innerHTML = '';

        if (this.sources.length === 0) {
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
                    <button class="btn btn-danger" onclick="settingsWindow.deleteSource('${source.alias}')">Delete</button>
                </td>
            `;

            this.sourcesTableBody.appendChild(row);
        });

        // Hide the old remove selected button since we now have inline delete buttons
        this.removeSourceBtn.style.display = 'none';
        this.testSourceBtn.style.display = 'none';
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
            const result = await dialog.showOpenDialog({
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

    updatePreviewSources() {
        this.previewSourceSelect.innerHTML = '<option value="">Select a source...</option>';

        this.sources.forEach(source => {
            const option = document.createElement('option');
            option.value = source.alias;
            option.textContent = `${source.alias} (${source.type})`;
            this.previewSourceSelect.appendChild(option);
        });
    }

    async loadPreview() {
        const selectedAlias = this.previewSourceSelect.value;
        if (!selectedAlias) {
            this.showError('Please select a data source');
            return;
        }

        this.loadPreviewBtn.disabled = true;
        this.loadPreviewBtn.textContent = 'Loading...';
        this.previewContent.innerHTML = '<div class="loading">Loading data...</div>';

        try {
            const data = await ipcRenderer.invoke('load-data', selectedAlias);
            if (data && data.length > 0) {
                this.displayDataPreview(data, selectedAlias);
            } else {
                this.previewContent.innerHTML = '<div class="no-data">No data found</div>';
            }
        } catch (error) {
            console.error('Load preview error:', error);
            this.previewContent.innerHTML = `<div class="error">Failed to load data: ${error.message}</div>`;
        } finally {
            this.loadPreviewBtn.disabled = false;
            this.loadPreviewBtn.textContent = 'Load Preview';
        }
    }

    displayDataPreview(data, sourceAlias) {
        const source = this.sources.find(s => s.alias === sourceAlias);
        const maxRows = 100; // Limit preview rows
        const previewData = data.slice(0, maxRows);

        if (previewData.length === 0) {
            this.previewContent.innerHTML = '<div class="no-data">No data to display</div>';
            return;
        }

        const columns = Object.keys(previewData[0]);

        let html = `
            <div style="margin-bottom: 15px;">
                <strong>Source:</strong> ${sourceAlias} |
                <strong>Total Rows:</strong> ${data.length.toLocaleString()} |
                <strong>Showing:</strong> ${Math.min(previewData.length, data.length)} rows
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
        `;

        // Add header row with column info
        columns.forEach((col, index) => {
            const isSearchCol = source && source.searchCol === index;
            const isResultCol = source && source.resultCols && source.resultCols.includes(index);
            html += `<th>${col} ${isSearchCol ? '(search)' : ''} ${isResultCol ? '(result)' : ''}</th>`;
        });

        html += `
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Add data rows
        previewData.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col] || '';
                html += `<td title="${value}">${value}</td>`;
            });
            html += '</tr>';
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        if (data.length > maxRows) {
            html += `<div style="margin-top: 15px; text-align: center; color: #666;">
                Showing first ${maxRows} rows of ${data.length.toLocaleString()} total rows
            </div>`;
        }

        this.previewContent.innerHTML = html;
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
}

// Make settingsWindow available globally for onclick handlers
let settingsWindow;

document.addEventListener('DOMContentLoaded', () => {
    settingsWindow = new SettingsWindow();
});