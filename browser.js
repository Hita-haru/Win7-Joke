function initBrowser(windowFrame, fileContent = null) {
  console.log('initBrowser called with windowFrame:', windowFrame);
  const urlInput = windowFrame.querySelector('#url-input');
  const goButton = windowFrame.querySelector('#go-button');
  const backButton = windowFrame.querySelector('#back-button');
  const forwardButton = windowFrame.querySelector('#forward-button');
  const webview = windowFrame.querySelector('#browser-webview');

  if (fileContent !== null) {
    // If fileContent is provided, assume it's HTML and load it directly
    webview.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fileContent));
    urlInput.value = ''; // Clear URL input as it's not a URL
  } else {
    // Default navigation if no fileContent
    // Function to navigate
    function navigate() {
      let url = urlInput.value;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url; // Prepend http:// if missing
      }
      webview.loadURL(url);
    }
    // Event Listeners
    goButton.addEventListener('click', navigate);
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        navigate();
      }
    });
  }

  backButton.addEventListener('click', () => {
    if (webview.canGoBack()) {
      webview.goBack();
    }
  });

  forwardButton.addEventListener('click', () => {
    if (webview.canGoForward()) {
      webview.goForward();
    }
  });

  // Update URL input when webview navigates
  webview.addEventListener('did-finish-load', () => {
    if (webview.getURL().startsWith('data:text/html')) {
      urlInput.value = ''; // Don't show data URL
    } else {
      urlInput.value = webview.getURL();
    }
  });
}