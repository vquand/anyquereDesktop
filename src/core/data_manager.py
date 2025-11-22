import json
import os
import pandas as pd
import requests
import io
import logging

CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'config.json')

class DataManager:
    def __init__(self):
        self.config = self.load_config()
        self.data_cache = {} # Cache loaded dataframes: {alias: dataframe}

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logging.error(f"Failed to load config: {e}")
                return {"sources": []}
        return {"sources": []}

    def save_config(self):
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f, indent=4)
        except Exception as e:
            logging.error(f"Failed to save config: {e}")

    def add_source(self, alias, type, path, search_col=None, result_cols=None, header_row=1, max_results=10):
        source = {
            "alias": alias,
            "type": type,
            "path": path,
            "search_col": search_col,
            "result_cols": result_cols or [],
            "header_row": header_row,
            "max_results": max_results
        }
        # Remove existing if alias matches
        self.config["sources"] = [s for s in self.config["sources"] if s["alias"] != alias]
        self.config["sources"].append(source)
        self.save_config()

    def remove_source(self, alias):
        self.config["sources"] = [s for s in self.config["sources"] if s["alias"] != alias]
        self.save_config()
        if alias in self.data_cache:
            del self.data_cache[alias]

    def get_sources(self):
        return self.config.get("sources", [])

    def get_source_aliases(self):
        """Get list of source aliases for quick access"""
        sources = self.config.get("sources", [])
        return [source["alias"] for source in sources if "alias" in source]

    def get_all_sources(self):
        """Get all sources as a dictionary with alias as key"""
        sources = self.config.get("sources", [])
        return {source["alias"]: source for source in sources if "alias" in source}

    def load_data(self, alias):
        """Loads data for a given alias into cache if not already loaded."""
        if alias in self.data_cache:
            return self.data_cache[alias]

        source = next((s for s in self.config["sources"] if s["alias"] == alias), None)
        if not source:
            logging.error(f"Source not found: {alias}")
            return None

        try:
            if source["type"] == "local":
                # Try UTF-8 encoding first (most common for French/international content)
                try:
                    df = pd.read_csv(source["path"], encoding='utf-8')
                except UnicodeDecodeError:
                    try:
                        # Fallback to latin-1 (common for Windows CSV with French characters)
                        df = pd.read_csv(source["path"], encoding='latin-1')
                    except UnicodeDecodeError:
                        # Last resort: try cp1252 (Windows Western European)
                        df = pd.read_csv(source["path"], encoding='cp1252')

            elif source["type"] == "google":
                response = requests.get(source["path"])
                response.raise_for_status()
                # Google Sheets CSV is typically UTF-8, but handle encoding issues
                try:
                    # Ensure response text is properly decoded
                    response.encoding = 'utf-8'
                    df = pd.read_csv(io.StringIO(response.text), encoding='utf-8')
                except UnicodeDecodeError:
                    # Fallback for unexpected encoding
                    df = pd.read_csv(io.StringIO(response.text))
            else:
                return None

            # Basic cleaning
            df = df.fillna("")
            self.data_cache[alias] = df
            return df
        except Exception as e:
            logging.error(f"Failed to load data for {alias}: {e}")
            return None

    def search(self, alias, query):
        """Searches for query in the configured column of the source."""
        df = self.load_data(alias)
        if df is None:
            return []

        source = next((s for s in self.config["sources"] if s["alias"] == alias), None)
        search_col = source.get("search_col")
        header_row = source.get("header_row", 1)
        max_results = source.get("max_results", 10)
        result_cols = source.get("result_cols", [])
        
        # Adjust for header row (skip rows before it)
        # If header_row is 1, we use the first row as headers (default pandas behavior)
        # If header_row > 1, we need to skip rows
        if header_row > 1:
            # Re-load with proper header
            try:
                if source["type"] == "local":
                    # Apply same encoding handling as initial load
                    try:
                        df = pd.read_csv(source["path"], header=header_row-1, encoding='utf-8')
                    except UnicodeDecodeError:
                        try:
                            df = pd.read_csv(source["path"], header=header_row-1, encoding='latin-1')
                        except UnicodeDecodeError:
                            df = pd.read_csv(source["path"], header=header_row-1, encoding='cp1252')

                elif source["type"] == "google":
                    response = requests.get(source["path"])
                    response.raise_for_status()
                    response.encoding = 'utf-8'
                    try:
                        df = pd.read_csv(io.StringIO(response.text), header=header_row-1, encoding='utf-8')
                    except UnicodeDecodeError:
                        df = pd.read_csv(io.StringIO(response.text), header=header_row-1)

                df = df.fillna("")
            except Exception as e:
                logging.error(f"Failed to reload data with header_row {header_row}: {e}")
                # Fall back to default
        
        # If no search column configured, use first column
        if search_col is None or search_col >= len(df.columns):
            search_col = 0
        
        # Get actual column name
        search_col_name = df.columns[search_col]

        if search_col_name not in df.columns:
             logging.error(f"Search column {search_col_name} not found in {alias}")
             return []

        # Case-insensitive partial match
        mask = df[search_col_name].astype(str).str.contains(query, case=False, na=False)
        results_df = df[mask]

        # Format results
        results = []
        
        # Determine which columns to show
        if result_cols:
            display_cols = [df.columns[i] for i in result_cols if i < len(df.columns)]
        else:
            display_cols = df.columns.tolist()

        for _, row in results_df.iterrows():
            # Create a clean result display
            result_parts = []
            for col in display_cols:
                if col in df.columns and col != search_col_name:
                    result_parts.append(f"{col}: {row[col]}")
            
            item = {
                "primary": str(row[search_col_name]),
                "details": " | ".join(result_parts) if result_parts else ""
            }
            results.append(item)
            
            # Respect max_results limit
            if len(results) >= max_results:
                break
        
        return results

    # Compatibility methods for existing code
    def search_data(self, query, source_name=None, limit=None):
        """Alias for search method for backward compatibility"""
        # Support both parameter names for compatibility
        source = source_name if source_name is not None else None
        if source is None:
            return []
        if limit:
            # Temporarily set max_results if provided
            sources = self.get_all_sources()
            if source in sources:
                original_max = sources[source].get('max_results', 10)
                sources[source]['max_results'] = limit
                try:
                    results = self.search(source, query)
                finally:
                    sources[source]['max_results'] = original_max
                return results
        return self.search(source, query)

    def add_csv_source(self, alias, file_path):
        """Helper method to add CSV source"""
        self.add_source(alias, "local", file_path)

    def add_google_sheet_source(self, alias, url):
        """Helper method to add Google Sheet source"""
        self.add_source(alias, "google", url)

    # remove_source method already exists above

    def get_data_frame(self, alias):
        """Get the pandas DataFrame for a source"""
        return self.load_data(alias)
