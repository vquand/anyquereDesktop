# -*- mode: python ; coding: utf-8 -*-

import sys
import os
from pathlib import Path

# Get the project root directory
ROOT_DIR = Path(SPECPATH)

block_cipher = None

# Build the data files list dynamically
datas_list = [
    # Include the src directory
    (str(ROOT_DIR / 'src'), 'src'),
]

# Include the config.json file if it exists
if (ROOT_DIR / 'config.json').exists():
    datas_list.append((str(ROOT_DIR / 'config.json'), '.'))

# Main application analysis
a = Analysis(
    ['main.py'],  # Use the tkinter version
    pathex=[str(ROOT_DIR)],
    binaries=[],
    datas=datas_list,
    hiddenimports=[
        # tkinter is built-in, but make sure it's included
        'tkinter',
        'tkinter.ttk',
        'tkinter.messagebox',
        'tkinter.filedialog',
        'tkinter.simpledialog',
        'tkinter.scrolledtext',
        'tkinter.font',
        'tkinter.colorchooser',
        'tkinter.commondialog',
        # pystray dependencies
        'pystray',
        'PIL',
        'PIL.Image',
        'PIL.ImageDraw',
        'PIL.ImageFont',
        'pyobjc-core',
        'pyobjc-framework-Cocoa',
        'pyobjc-framework-Quartz',
        # Data processing
        'pandas',
        'pandas._libs',
        'pandas._libs.tslibs',
        'requests',
        'urllib3',
        'certifi',
        # Standard library modules that might be missed
        'json',
        'csv',
        'logging',
        'pathlib',
        'threading',
        'queue',
        'webbrowser',
        'subprocess',
        'platform',
        'sys',
        'os',
        'time',
        'datetime',
        're',
        'collections',
        'itertools',
        'functools',
        'operator',
        'typing',
        'contextlib',
        'io',
        'enum',
        'copy',
        'hashlib',
        'base64',
        'uuid',
        'random',
        'string',
        'math',
        'decimal',
        'fractions',
        'statistics',
        'numbers',
        'unicodedata',
        'codecs',
        'encodings',
        'encodings.utf_8',
        'encodings.latin_1',
        'encodings.cp1252',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude unnecessary modules to reduce size
        'matplotlib',
        'scipy',
        'IPython',
        'jupyter',
        'notebook',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# PYZ compression
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# Create the executable bundle
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='anyquereDesktop',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Set to False for GUI application
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=str(ROOT_DIR / 'assets' / 'icon.icns') if (ROOT_DIR / 'assets' / 'icon.icns').exists() else None,
)

# Create macOS app bundle
app = BUNDLE(
    exe,
    name='anyquereDesktop.app',
    icon=str(ROOT_DIR / 'assets' / 'icon.icns') if (ROOT_DIR / 'assets' / 'icon.icns').exists() else None,
    bundle_identifier='com.anyquere.desktop',
    version='1.0.0',
    info_plist={
        'CFBundleName': 'anyquereDesktop',
        'CFBundleDisplayName': 'Anyquere Desktop',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
        'CFBundleIdentifier': 'com.anyquere.desktop',
        'CFBundleExecutable': 'anyquereDesktop',
        'CFBundlePackageType': 'APPL',
        'CFBundleSignature': '????',
        'CFBundleInfoDictionaryVersion': '6.0',
        'CFBundleSupportedPlatforms': ['macOS'],
        'LSMinimumSystemVersion': '10.15',  # macOS Catalina minimum
        'NSHighResolutionCapable': True,
        'LSUIElement': True,  # Run as menu bar app (no dock icon)
        'NSRequiresAquaSystemAppearance': False,
        'NSAppleScriptEnabled': False,
        'NSPrincipalClass': 'NSApplication',
    },
)