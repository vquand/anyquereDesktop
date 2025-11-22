#!/bin/bash

# Build script that always creates DMG with Applications folder
# Author: Claude Code Assistant
# Usage: ./build_dmg.sh

set -e

echo "🚀 Building anyquereDesktop DMG with Applications folder..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# App info
APP_NAME="anyquereDesktop"
VERSION="1.0.0"
SPEC_FILE="anyquereDesktop.spec"

echo -e "${BLUE}Building ${APP_NAME} v${VERSION} with tkinter...${NC}"

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf build/ dist/*.dmg dist/dmg_temp

# Build the app
echo -e "${YELLOW}Building app with PyInstaller...${NC}"
python3 -m PyInstaller --clean --noconfirm "$SPEC_FILE"

if [ ! -d "dist/${APP_NAME}.app" ]; then
    echo -e "${RED}❌ Build failed - app bundle not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ App built successfully${NC}"

# Create DMG with Applications folder
echo -e "${YELLOW}Creating DMG with Applications folder...${NC}"

# Create temp directory
TEMP_DIR="dist/dmg_temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy app
cp -R "dist/${APP_NAME}.app" "$TEMP_DIR/"

# Create Applications symlink
ln -s /Applications "$TEMP_DIR/Applications"

# Create DMG
DMG_NAME="${APP_NAME}-${VERSION}-macOS"
DMG_PATH="dist/${DMG_NAME}.dmg"

echo -e "${YELLOW}Creating DMG: ${DMG_PATH}${NC}"
hdiutil create -volname "$APP_NAME" \
    -srcfolder "$TEMP_DIR" \
    -ov -format UDZO \
    -imagekey zlib-level=9 \
    "$DMG_PATH"

# Clean up temp directory
rm -rf "$TEMP_DIR"

if [ -f "$DMG_PATH" ]; then
    DMG_SIZE=$(du -h "$DMG_PATH" | cut -f1)
    echo -e "${GREEN}✅ DMG created successfully!${NC}"
    echo -e "${GREEN}📦 DMG: $DMG_PATH (${DMG_SIZE})${NC}"
    echo -e "${BLUE}📋 Features:${NC}"
    echo -e "   • Full tkinter UI with search window"
    echo -e "   • Settings window for data source management"
    echo -e "   • Applications folder for drag-and-drop installation"
    echo -e "   • All bug fixes applied"
else
    echo -e "${RED}❌ DMG creation failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Build completed successfully!${NC}"