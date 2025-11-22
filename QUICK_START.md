# Quick Start Guide - Enhanced Anyquere Desktop

## New Features You Can Use Now

After cloning features from the browser extension, here's what you can do:

---

## 1. 📤 Export Your Configuration

**Why?** Backup your settings, share with team members, or move to another computer.

**How:**
1. Open Settings Window
2. Click "📤 Export Configuration" (top right)
3. Choose save location
4. File is saved as `anyquere-config-YYYYMMDD.json`

**What's exported:**
- All data sources
- Search configurations
- Column settings
- Everything except the actual data files

---

## 2. 📥 Import Configuration

**Why?** Restore from backup, use someone else's setup, or clone to another machine.

**How:**
1. Open Settings Window
2. Click "📥 Import Configuration" (top right)
3. Select a JSON file
4. Choose import mode:
   - **Replace**: Remove all current sources, use imported ones
   - **Merge**: Keep current sources, add imported ones

**Conflict Resolution:**
If a source with the same alias exists:
- You'll be asked whether to overwrite it
- Choose Yes to replace, No to keep existing

---

## 3. ✏️ Advanced Source Configuration

**Why?** Fine-tune exactly how search works for each data source.

**How:**
1. Open Settings Window → Data Sources tab
2. Double-click any source (or select & click "Edit Configuration")
3. Use the 3-tab dialog:

### Tab 1: 📁 Basic Info
- **Alias**: Short name for quick access (e.g., "cdn", "products")
- **Type**: Local CSV or Google Sheets
- **Path/URL**: File location or Google Sheets URL

### Tab 2: 🔍 Search Settings
- **Header Row**: Which row has column names (usually 1)
- **Search Column**: Which column to search in
- **Result Columns**: Check which columns to show in results
- **Max Results**: Limit how many results to show

### Tab 3: 👁️ Data Preview
- See first 10 rows of your data
- Verify everything looks correct
- Check row and column counts

---

## 4. 🔄 Refresh Data

**Why?** If your CSV changed or you updated Google Sheets.

**How:**
1. Select a source in the table
2. Click "🔄 Refresh Data"
3. Data is reloaded from file/URL

---

## Example Workflow

### Setting Up a New Source with Advanced Config

```
1. Click "➕ Add Source"
2. Enter basic info:
   - Alias: "customers"
   - Type: "local"
   - Path: (Browse to customers.csv)
3. Click "Advanced Options..."
4. In Search Settings tab:
   - Header Row: 1
   - Search Column: "Email" (Column 2)
   - Result Columns: ✓ Name, ✓ Email, ✓ Status
   - Max Results: 20
5. Switch to Preview tab to verify
6. Click "Save Configuration"
```

Now when you search, it will:
- Look for matches in the Email column
- Show Name, Email, and Status in results
- Limit to 20 results max

---

## Configuration File Format

Your settings are saved in `config.json`:

```json
{
  "sources": [
    {
      "alias": "customers",
      "type": "local",
      "path": "/path/to/customers.csv",
      "search_col": 1,
      "result_cols": [0, 1, 3],
      "header_row": 1,
      "max_results": 20
    }
  ]
}
```

**New fields** (from browser extension):
- `header_row`: Which row has headers (1-indexed)
- `max_results`: Limit results returned
- `search_col`: Column index to search (0-indexed)
- `result_cols`: Column indices to display (0-indexed)

---

## Tips & Tricks

### 🎯 Best Practices

1. **Use meaningful aliases**: "cdn" instead of "content_delivery_network"
2. **Configure result columns**: Only show what's useful
3. **Limit max results**: 10-20 is usually enough
4. **Export regularly**: Backup your configuration weekly

### 🚨 Common Issues

**Q: Import says "invalid format"**
- Make sure JSON file has a "sources" array
- Check file isn't corrupted

**Q: Search returns no results**
- Check search column is configured
- Verify data was loaded (look at status)

**Q: Google Sheets not loading**
- Must be published: File → Share → Publish to web
- Use CSV export URL, not sharing URL

### 🔧 Troubleshooting

**Clear cache and reload:**
1. Select source
2. Click Delete
3. Re-add with import or manual config

**Reset to defaults:**
1. Export current config (backup)
2. Delete config.json
3. Restart app
4. Re-import if needed

---

## Keyboard Shortcuts

_(Coming soon)_

Currently you can:
- Double-click source to edit
- Press Enter in dialogs to save

---

## What's Next?

Features NOT yet implemented but possible:
- [ ] Drag & drop file upload
- [ ] Icon picker for sources
- [ ] Edit data inline
- [ ] Auto-refresh Google Sheets
- [ ] Global keyboard shortcuts
- [ ] Dark theme

See `CLONED_FEATURES.md` for full list.

---

## Quick Reference Card

| Action | Steps |
|--------|-------|
| Export config | Settings → "📤 Export Configuration" |
| Import config | Settings → "📥 Import Configuration" |
| Add source | Settings → "➕ Add Source" |
| Edit source | Settings → Double-click source |
| Delete source | Settings → Select → "🗑️ Delete" |
| Refresh data | Settings → Select → "🔄 Refresh Data" |

---

## Support

- See `CLONED_FEATURES.md` for detailed feature docs
- See `MIGRATION_SUMMARY.md` for technical details
- Run `python3 test_enhanced_features.py` to verify installation

---

**Enjoy your enhanced Anyquere Desktop!** 🎉
