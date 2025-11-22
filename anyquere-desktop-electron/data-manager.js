const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { parse } = require('csv-parse/sync');

class DataManager {
    constructor() {
        this.configPath = path.join(__dirname, '../config.json');
        this.config = {};
        this.dataCache = new Map(); // Cache loaded data
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(data);
            // Ensure settings structure exists
            if (!this.config.settings) {
                this.config.settings = {
                    autoStart: false,
                    showOnStartup: false,
                    globalShortcut: "auto",
                    theme: "dark"
                };
                await this.saveConfig();
            }
        } catch (error) {
            console.log('Config file not found or invalid, creating new one');
            this.config = {
                settings: {
                    autoStart: false,
                    showOnStartup: false,
                    globalShortcut: "auto",
                    theme: "dark"
                },
                sources: []
            };
            await this.saveConfig();
        }
    }

    async saveConfig() {
        try {
            await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 4));
        } catch (error) {
            console.error('Failed to save config:', error);
            throw error;
        }
    }

    getSettings() {
        return this.config.settings || {};
    }

    getSources() {
        return this.config.sources || [];
    }

    getSourceAliases() {
        return this.getSources().map(source => source.alias);
    }

    getAllSources() {
        const sources = {};
        this.getSources().forEach(source => {
            sources[source.alias] = source;
        });
        return sources;
    }

    addSource(sourceConfig) {
        // Remove existing source with same alias
        this.config.sources = this.config.sources.filter(s => s.alias !== sourceConfig.alias);

        // Add new source with defaults
        const source = {
            alias: sourceConfig.alias,
            type: sourceConfig.type,
            path: sourceConfig.path,
            searchCol: sourceConfig.searchCol || 0,
            resultCols: sourceConfig.resultCols || [],
            headerRow: sourceConfig.headerRow || 1,
            maxResults: sourceConfig.maxResults || 10,
            ...sourceConfig
        };

        this.config.sources.push(source);

        // Clear cache for this source
        this.dataCache.delete(sourceConfig.alias);

        return this.saveConfig();
    }

    removeSource(alias) {
        this.config.sources = this.config.sources.filter(s => s.alias !== alias);
        this.dataCache.delete(alias);
        return this.saveConfig();
    }

    clearCache(alias = null) {
        if (alias) {
            // Clear cache for specific source
            this.dataCache.delete(alias);
        } else {
            // Clear all cache
            this.dataCache.clear();
        }
    }

    async updateSettings(newSettings) {
        this.config.settings = { ...this.config.settings, ...newSettings };
        return this.saveConfig();
    }

    async loadData(alias) {
        // Check cache first
        if (this.dataCache.has(alias)) {
            return this.dataCache.get(alias);
        }

        const source = this.getSources().find(s => s.alias === alias);
        if (!source) {
            throw new Error(`Source not found: ${alias}`);
        }

        let data;
        try {
            if (source.type === 'local') {
                data = await this.loadLocalFile(source.path, source.headerRow);
            } else if (source.type === 'google') {
                data = await this.loadGoogleSheet(source.path, source.headerRow);
            } else {
                throw new Error(`Unsupported source type: ${source.type}`);
            }

            // Clean data (replace null/undefined with empty string)
            data = data.map(row => {
                const cleanRow = {};
                for (const [key, value] of Object.entries(row)) {
                    cleanRow[key] = (value === null || value === undefined) ? '' : String(value);
                }
                return cleanRow;
            });

            // Cache the data
            this.dataCache.set(alias, data);
            return data;

        } catch (error) {
            console.error(`Failed to load data for ${alias}:`, error);
            throw error;
        }
    }

    async loadLocalFile(filePath, headerRow = 1) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return this.parseCsv(content, headerRow);
        } catch (error) {
            throw new Error(`Failed to load local file: ${error.message}`);
        }
    }

    async loadGoogleSheet(url, headerRow = 1) {
        try {
            // Convert to CSV export URL
            const csvUrl = url.replace('/edit', '/export?format=csv');

            const response = await axios.get(csvUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'anyquereDesktop/1.0.0'
                }
            });

            return this.parseCsv(response.data, headerRow);
        } catch (error) {
            throw new Error(`Failed to load Google Sheet: ${error.message}`);
        }
    }

    parseCsv(csvContent, headerRow = 1) {
        try {
            const records = parse(csvContent, {
                columns: headerRow <= 1 ? true : false,
                skip_empty_lines: true,
                trim: true,
                encoding: 'utf8'
            });

            if (headerRow > 1) {
                // Skip header rows if specified
                return records.slice(headerRow - 1);
            }

            return records;
        } catch (error) {
            throw new Error(`Failed to parse CSV: ${error.message}`);
        }
    }

    async search(alias, query) {
        try {
            const data = await this.loadData(alias);
            const source = this.getSources().find(s => s.alias === alias);

            if (!source) {
                return [];
            }

            const searchCol = source.searchCol || 0;
            const maxResults = source.maxResults || 10;
            const resultCols = source.resultCols || [];

            // Get column names
            const columns = Object.keys(data[0] || {});
            const searchColumnName = columns[searchCol] || columns[0];

            if (!searchColumnName) {
                console.error(`No search column found for source: ${alias}`);
                return [];
            }

            // Perform case-insensitive search
            const results = data
                .filter(row => {
                    const value = String(row[searchColumnName] || '');
                    return value.toLowerCase().includes(query.toLowerCase());
                })
                .slice(0, maxResults)
                .map(row => {
                    // Determine which columns to show in results
                    const displayCols = resultCols.length > 0
                        ? resultCols.map(colIndex => columns[colIndex]).filter(col => col && col !== searchColumnName)
                        : columns.filter(col => col !== searchColumnName);

                    // Create result details
                    const details = displayCols
                        .map(col => `${col}: ${row[col] || ''}`)
                        .join(' | ');

                    return {
                        primary: String(row[searchColumnName] || ''),
                        details: details,
                        fullRow: row
                    };
                });

            return results;

        } catch (error) {
            console.error(`Search error for ${alias}:`, error);
            return [];
        }
    }

    // Backward compatibility methods
    async searchData(query, sourceName = null, limit = null) {
        if (!sourceName) {
            return [];
        }

        const sources = this.getAllSources();
        if (sourceName in sources) {
            if (limit) {
                const originalMax = sources[sourceName].maxResults || 10;
                sources[sourceName].maxResults = limit;
                try {
                    const results = await this.search(sourceName, query);
                    sources[sourceName].maxResults = originalMax;
                    return results;
                } catch (error) {
                    sources[sourceName].maxResults = originalMax;
                    throw error;
                }
            }
            return await this.search(sourceName, query);
        }

        return [];
    }

    async getDataFrame(alias) {
        return await this.loadData(alias);
    }
}

module.exports = DataManager;