# Chrome Screenshot Extension

A modern Chrome extension built with **Manifest V3** that allows you to capture, preview, and manage screenshots of the currently active tab.

## Features

- 📸 **One-click screenshot capture** of the active tab
- 🖼️ **Live preview** of captured screenshots
- 💾 **Download** screenshots with automatic timestamped filenames
- 📋 **Copy to clipboard** functionality
- 🔗 **Open in new tab** for full-size viewing
- ⌨️ **Keyboard shortcuts** for quick access
- 🎨 **Modern, responsive UI** with smooth animations
- 🔒 **Minimal permissions** - only `activeTab` and `downloads`

## Installation Instructions

### Step 1: Enable Developer Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **"Developer mode"** ON in the top-right corner
3. You should now see three new buttons: "Load unpacked", "Pack extension", and "Update"

### Step 2: Load the Extension

1. Click **"Load unpacked"** button
2. Navigate to and select the `chrome-screenshot-extension` folder
3. The extension should now appear in your extensions list
4. You'll see the camera icon in your Chrome toolbar

### Step 3: Pin the Extension (Optional)

1. Click the puzzle piece icon (Extensions) in the Chrome toolbar
2. Find "Screenshot Capture" in the list
3. Click the pin icon to keep it visible in the toolbar

## How to Use

### Taking a Screenshot

1. **Click the extension icon** in the toolbar, or
2. **Use keyboard shortcut**: `Ctrl+S` (or `Cmd+S` on Mac) while the popup is open

### Managing Screenshots

Once a screenshot is captured, you can:

- **Download**: Save to your default downloads folder
- **Copy**: Copy the image to your clipboard
- **Open in Tab**: View the full-size image in a new browser tab
- **Clear**: Remove the current screenshot and start over

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Capture screenshot
- `Ctrl/Cmd + D`: Download current screenshot
- `Ctrl/Cmd + C`: Copy current screenshot to clipboard
- `Escape`: Clear current screenshot

## File Structure

```
chrome-screenshot-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html            # Popup interface structure
├── popup.css             # Popup styling and animations
├── popup.js              # Popup functionality and UI logic
├── background.js         # Service worker for downloads and messaging
├── icons/                # Extension icons
│   ├── icon16.png        # 16x16 toolbar icon
│   ├── icon32.png        # 32x32 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon for Chrome Web Store
└── README.md             # This documentation
```

## Technical Details

### Manifest V3 Features

- **Service Worker**: Uses `background.js` as a service worker instead of background pages
- **Minimal Permissions**: Only requests `activeTab` and `downloads` permissions
- **Modern APIs**: Uses `chrome.tabs.captureVisibleTab()` for screenshot capture

### Browser Compatibility

- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Version 88+ (Chromium-based)
- **Other Chromium browsers**: Should work with Manifest V3 support

### Permissions Explained

- `activeTab`: Allows capturing screenshots of the currently active tab only
- `downloads`: Enables automatic file downloads to the user's download folder

## Troubleshooting

### Common Issues and Solutions

#### Extension doesn't appear after loading
- **Solution**: Make sure Developer mode is enabled in `chrome://extensions/`
- **Check**: Verify all files are present in the extension folder
- **Try**: Refresh the extensions page and reload the extension

#### Screenshot capture fails
- **Cause**: May occur on special Chrome pages (chrome://, chrome-extension://, etc.)
- **Solution**: Try capturing screenshots on regular web pages (http:// or https://)
- **Note**: Chrome security restrictions prevent capturing certain internal pages

#### Download doesn't work
- **Check**: Ensure the Downloads permission is granted
- **Verify**: Check if Chrome's download settings allow automatic downloads
- **Try**: Manually save the image by right-clicking the preview

#### Copy to clipboard fails
- **Cause**: Clipboard API requires user interaction and secure context
- **Solution**: Make sure you're clicking the copy button (don't use keyboard shortcut immediately)
- **Fallback**: The extension will try to copy as text if image copy fails

#### Popup doesn't open
- **Check**: Verify the extension is enabled in `chrome://extensions/`
- **Try**: Disable and re-enable the extension
- **Reload**: Click the refresh icon on the extension card

### Error Messages

- **"No active tab found"**: Switch to a regular web page tab
- **"Failed to capture screenshot"**: Try refreshing the page and capturing again
- **"Download failed"**: Check Chrome's download settings and available disk space

## Development

### Making Changes

1. Edit the source files as needed
2. Go to `chrome://extensions/`
3. Click the **refresh icon** on the Screenshot Capture extension card
4. Test your changes

### Adding Features

The extension is designed to be easily extensible:

- **UI Changes**: Modify `popup.html` and `popup.css`
- **Functionality**: Update `popup.js` for UI logic
- **Background Tasks**: Edit `background.js` for downloads and messaging
- **Permissions**: Update `manifest.json` if new permissions are needed

## Security & Privacy

- **No data collection**: The extension doesn't collect or transmit any user data
- **Local processing**: All screenshots are processed locally on your device
- **Minimal permissions**: Only requests necessary permissions for core functionality
- **No external connections**: Doesn't communicate with external servers

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify you're using a supported Chrome version (88+)
3. Try disabling other extensions that might conflict
4. Check the browser console for error messages (`F12` → Console tab)

---

**Version**: 1.0.0  
**Manifest Version**: 3  
**Last Updated**: September 2025

