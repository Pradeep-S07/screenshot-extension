// Background service worker for Chrome Screenshot Extension

// Install event - runs when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Screenshot Extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        // Show welcome notification or setup
        console.log('Welcome to Screenshot Extension!');
    }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    switch (message.action) {
        case 'download':
            handleDownload(message.dataUrl, message.filename, sendResponse);
            return true; // Keep message channel open for async response
            
        case 'captureTab':
            handleCaptureTab(message.tabId, sendResponse);
            return true;
            
        default:
            console.warn('Unknown message action:', message.action);
            sendResponse({ error: 'Unknown action' });
    }
});

// Handle download requests
async function handleDownload(dataUrl, filename, sendResponse) {
    console.log('handleDownload called with filename:', filename);
    try {
        console.log('Starting download:', filename);
        
        // Validate data URL
        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            throw new Error('Invalid image data');
        }
        
        // Validate filename
        if (!filename || typeof filename !== 'string') {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `screenshot-${timestamp}.png`;
        }
        
        // Ensure filename has .png extension
        if (!filename.endsWith('.png')) {
            filename += '.png';
        }
        
        // Use Chrome downloads API to save the file
        const downloadId = await chrome.downloads.download({
            url: dataUrl,
            filename: filename,
            saveAs: false, // Don't show save dialog, use default download location
            conflictAction: 'uniquify' // Automatically rename if file exists
        });
        
        console.log('Download started with ID:', downloadId);
        
        // Listen for download completion
        const downloadListener = (downloadDelta) => {
            if (downloadDelta.id === downloadId) {
                if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                    console.log('Download completed:', downloadId);
                    chrome.downloads.onChanged.removeListener(downloadListener);
                    
                    // Notify popup of successful download
                    chrome.runtime.sendMessage({
                        action: 'downloadComplete',
                        downloadId: downloadId,
                        filename: filename
                    }).catch(err => {
                        // Popup might be closed, ignore error
                        console.log('Could not notify popup (likely closed):', err.message);
                    });
                    
                } else if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
                    console.error('Download interrupted:', downloadId);
                    chrome.downloads.onChanged.removeListener(downloadListener);
                    
                    // Notify popup of download error
                    chrome.runtime.sendMessage({
                        action: 'downloadError',
                        error: 'Download was interrupted'
                    }).catch(err => {
                        console.log('Could not notify popup (likely closed):', err.message);
                    });
                }
            }
        };
        
        chrome.downloads.onChanged.addListener(downloadListener);
        
        // Send immediate response
        sendResponse({ 
            success: true, 
            downloadId: downloadId,
            filename: filename 
        });
        
    } catch (error) {
        console.error('Download failed:', error);
        
        // Notify popup of error
        chrome.runtime.sendMessage({
            action: 'downloadError',
            error: error.message
        }).catch(err => {
            console.log('Could not notify popup (likely closed):', err.message);
        });
        
        sendResponse({ 
            success: false, 
            error: error.message 
        });
    }
}

// Handle tab capture requests (alternative method)
async function handleCaptureTab(tabId, sendResponse) {
    try {
        console.log('Capturing tab:', tabId);
        
        // Get tab info
        const tab = await chrome.tabs.get(tabId);
        
        if (!tab) {
            throw new Error('Tab not found');
        }
        
        // Capture the visible area of the tab
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: 'png',
            quality: 100
        });
        
        if (!dataUrl) {
            throw new Error('Failed to capture tab');
        }
        
        console.log('Tab captured successfully');
        sendResponse({ 
            success: true, 
            dataUrl: dataUrl,
            tabInfo: {
                title: tab.title,
                url: tab.url
            }
        });
        
    } catch (error) {
        console.error('Tab capture failed:', error);
        sendResponse({ 
            success: false, 
            error: error.message 
        });
    }
}

// Handle extension icon click (optional - could trigger screenshot)
chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked for tab:', tab.id);
    
    // This would only fire if no popup is defined in manifest
    // Since we have a popup, this won't normally execute
    // But it's here as a fallback or for future features
});

// Handle keyboard shortcuts (if defined in manifest)
/* chrome.commands.onCommand.addListener(async (command) => {
    console.log('Command received:', command);
    
    switch (command) {
        case 'capture-screenshot':
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                // Could trigger screenshot capture here
                console.log('Screenshot shortcut triggered for tab:', tab.id);
            }
            break;
            
        default:
            console.warn('Unknown command:', command);
    }
}); */

// Cleanup on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
    console.log('Extension is being suspended');
    // Cleanup any ongoing operations
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
});

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in background script:', event.reason);
});

// Utility function to convert data URL to blob (if needed for future features)
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
}

// Utility function to generate unique filename
function generateUniqueFilename(baseName = 'screenshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseName}-${timestamp}-${randomSuffix}.png`;
}
