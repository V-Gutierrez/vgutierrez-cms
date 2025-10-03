const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Flag file to track if browser was already opened in this session
const BROWSER_FLAG_FILE = path.join(__dirname, '..', '..', '.browser-opened');

/**
 * Checks if browser should be opened (only on first server start)
 * @returns {boolean} - True if browser should open, false otherwise
 */
function shouldOpenBrowser() {
  try {
    // If flag file exists, browser was already opened
    if (fs.existsSync(BROWSER_FLAG_FILE)) {
      return false;
    }

    // Create flag file to prevent opening on subsequent reloads
    fs.writeFileSync(BROWSER_FLAG_FILE, Date.now().toString());
    return true;
  } catch (error) {
    console.log('Warning: Could not check browser flag:', error.message);
    return true; // Default to opening browser if flag check fails
  }
}

/**
 * Opens a URL in the default browser
 * @param {string} url - The URL to open
 */
function openBrowser(url) {
  // Only open browser on first start, not on hot reloads
  if (!shouldOpenBrowser()) {
    return;
  }

  const platform = process.platform;
  let command;

  switch (platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${url}"`;
      break;
    case 'linux': // Linux
      command = `xdg-open "${url}" || sensible-browser "${url}"`;
      break;
    default:
      console.log(`Platform ${platform} not supported for auto-opening browser`);
      return;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`Could not open browser automatically: ${error.message}`);
      console.log(`Please open manually: ${url}`);
    } else {
      console.log(`🌐 Browser opened: ${url}`);
    }
  });
}

/**
 * Cleans up the browser flag file
 */
function cleanupBrowserFlag() {
  try {
    if (fs.existsSync(BROWSER_FLAG_FILE)) {
      fs.unlinkSync(BROWSER_FLAG_FILE);
    }
  } catch (error) {
    // Ignore errors on cleanup
  }
}

module.exports = { openBrowser, cleanupBrowserFlag };
