// DOM elements
const captureBtn = document.getElementById('captureBtn');
const previewSection = document.getElementById('previewSection');
const previewImg = document.getElementById('previewImg');
const actionsSection = document.getElementById('actionsSection');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const openTabBtn = document.getElementById('openTabBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');

// Global variables
let currentScreenshotDataUrl = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showStatus('Click "Take Screenshot" to capture the current tab', 'info');
});

// Setup event listeners
function setupEventListeners() {
    captureBtn.addEventListener('click', captureScreenshot);
    downloadBtn.addEventListener('click', downloadScreenshot);
    copyBtn.addEventListener('click', copyScreenshot);
    openTabBtn.addEventListener('click', openScreenshotInNewTab);
    clearBtn.addEventListener('click', clearScreenshot);
}

// Capture screenshot function
async function captureScreenshot() {
    try {
        showStatus('Capturing screenshot...', 'info');
        setCaptureButtonLoading(true);

        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Capture the visible tab
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: 'png',
            quality: 100
        });

        if (!dataUrl) {
            throw new Error('Failed to capture screenshot');
        }

        // Store the screenshot data
        currentScreenshotDataUrl = dataUrl;

        // Display the preview
        displayPreview(dataUrl);
        
        showStatus('Screenshot captured successfully!', 'success');
        
    } catch (error) {
        console.error('Screenshot capture failed:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        setCaptureButtonLoading(false);
    }
}

// Display preview function
function displayPreview(dataUrl) {
    previewImg.src = dataUrl;
    previewSection.classList.remove('hidden');
    actionsSection.classList.remove('hidden');
}

// Download screenshot function
async function downloadScreenshot() {
    if (!currentScreenshotDataUrl) {
        showStatus('No screenshot to download', 'error');
        return;
    }

    try {
        showStatus('Preparing download...', 'info');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot-${timestamp}.png`;

        // Send message to background script to handle download
        await chrome.runtime.sendMessage({
            action: 'download',
            dataUrl: currentScreenshotDataUrl,
            filename: filename
        });
        
    } catch (error) {
        console.error('Download failed:', error);
        showStatus(`Download failed: ${error.message}`, 'error');
    }
}

// Copy screenshot to clipboard function
async function copyScreenshot() {
    if (!currentScreenshotDataUrl) {
        showStatus('No screenshot to copy', 'error');
        return;
    }

    try {
        showStatus('Copying to clipboard...', 'info');

        // Convert data URL to blob
        const response = await fetch(currentScreenshotDataUrl);
        const blob = await response.blob();

        // Copy to clipboard using the Clipboard API
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);

        showStatus('Screenshot copied to clipboard!', 'success');
        
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        
        // Fallback: try to copy the data URL as text
        try {
            await navigator.clipboard.writeText(currentScreenshotDataUrl);
            showStatus('Screenshot data copied as text', 'success');
        } catch (fallbackError) {
            showStatus('Failed to copy to clipboard', 'error');
        }
    }
}

// Open screenshot in new tab function
async function openScreenshotInNewTab() {
    if (!currentScreenshotDataUrl) {
        showStatus('No screenshot to open', 'error');
        return;
    }

    try {
        showStatus('Opening in new tab...', 'info');

        // Create a new tab with the screenshot data URL
        await chrome.tabs.create({
            url: currentScreenshotDataUrl,
            active: true
        });

        showStatus('Screenshot opened in new tab!', 'success');
        
        // Close the popup after a short delay
        setTimeout(() => {
            window.close();
        }, 1000);
        
    } catch (error) {
        console.error('Open in new tab failed:', error);
        showStatus(`Failed to open in new tab: ${error.message}`, 'error');
    }
}

// Clear screenshot function
function clearScreenshot() {
    currentScreenshotDataUrl = null;
    previewImg.src = '';
    previewSection.classList.add('hidden');
    actionsSection.classList.add('hidden');
    showStatus('Click "Take Screenshot" to capture the current tab', 'info');
}

// Set capture button loading state
function setCaptureButtonLoading(isLoading) {
    const buttonIcon = captureBtn.querySelector('svg');
    const buttonText = captureBtn.querySelector('span');
    
    if (isLoading) {
        captureBtn.disabled = true;
        buttonIcon.classList.add('loading');
        buttonText.textContent = 'Capturing...';
    } else {
        captureBtn.disabled = false;
        buttonIcon.classList.remove('loading');
        buttonText.textContent = 'Take Screenshot';
    }
}

// Show status message function
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    // Auto-hide success and info messages after 3 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (statusMessage.textContent === message) {
                statusMessage.textContent = '';
                statusMessage.className = 'status-message';
            }
        }, 3000);
    }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'downloadComplete') {
        showStatus('Download completed!', 'success');
    } else if (message.action === 'downloadError') {
        showStatus(`Download failed: ${message.error}`, 'error');
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + S to capture screenshot
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        captureScreenshot();
    }
    
    // Escape to clear screenshot
    if (event.key === 'Escape' && currentScreenshotDataUrl) {
        clearScreenshot();
    }
    
    // Ctrl/Cmd + D to download (when screenshot exists)
    if ((event.ctrlKey || event.metaKey) && event.key === 'd' && currentScreenshotDataUrl) {
        event.preventDefault();
        downloadScreenshot();
    }
    
    // Ctrl/Cmd + C to copy (when screenshot exists)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && currentScreenshotDataUrl) {
        event.preventDefault();
        copyScreenshot();
    }
});

