const { exec } = require('child_process');

/**
 * Opens a URL in the default browser
 * @param {string} url - The URL to open
 */
function openBrowser(url) {
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

module.exports = { openBrowser };
