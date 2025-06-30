document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const desktop = document.getElementById('desktop');
  const taskbarApps = document.getElementById('taskbar-apps');

  // Start Button and Menu Logic
  startButton.addEventListener('click', (event) => {
    event.stopPropagation();
    startMenu.classList.toggle('hidden');
    console.log('Start button clicked. Start menu hidden state:', startMenu.classList.contains('hidden'));
  });

  document.getElementById('desktop').addEventListener('click', () => {
    if (!startMenu.classList.contains('hidden')) {
      startMenu.classList.add('hidden');
    }
  });

  // Start Menu Item Click Logic
  startMenu.addEventListener('click', async (event) => {
    const target = event.target.closest('.start-menu-item');
    if (target) {
      const appName = target.dataset.app;
      let contentHTML = '';
      if (appName === 'Notepad') {
        const response = await fetch('notepad.html');
        contentHTML = await response.text();
      } else if (appName === 'Paint') {
        const response = await fetch('paint.html');
        contentHTML = await response.text();
      } else if (appName === 'Web Browser') {
        const response = await fetch('browser.html');
        contentHTML = await response.text();
      } else if (appName === 'Computer') {
        const response = await fetch('explorer.html');
        contentHTML = await response.text();
      } else if (appName === 'Minesweeper') {
        const response = await fetch('minesweeper.html');
        contentHTML = await response.text();
      }
      createApplicationWindow(appName, contentHTML);
      startMenu.classList.add('hidden'); // Hide menu after launching app
    }
  });

  // Application Window Management
  let zIndexCounter = 100;
  let activeAppWindow = null; // To track the currently active app window

  function createApplicationWindow(appName, contentHTML, width = 600, height = 400, fileContent = null) {
    console.log(`Attempting to create window for app: ${appName}`);
    console.log('Content HTML received:', contentHTML.substring(0, 200) + '...'); // Log first 200 chars

    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHTML, 'text/html');
    const windowFrame = doc.body.querySelector('.window-frame');

    if (!windowFrame) {
      console.error(`Error: .window-frame not found in ${appName}.html. Full content:`, contentHTML);
      return;
    }

    console.log('Window frame found. Appending to desktop.');
    // Set initial position, size, and z-index for the windowFrame
    windowFrame.style.position = 'absolute';
    windowFrame.style.width = `${width}px`;
    windowFrame.style.height = `${height}px`;
    windowFrame.style.zIndex = ++zIndexCounter;
    windowFrame.style.left = `${(window.innerWidth - width) / 2}px`;
    windowFrame.style.top = `${(window.innerHeight - height) / 2 - 20}px`; // Adjust for taskbar

    desktop.appendChild(windowFrame);

    // Add to taskbar
    const taskbarItem = document.createElement('div');
    taskbarItem.classList.add('taskbar-app-item');
    taskbarItem.innerHTML = `<img src="${appName === 'Web Browser' ? 'browser.ico' : appName.toLowerCase() + '.ico'}" onerror="this.onerror=null;this.src='browser.ico';"><span>${appName}</span>`;
    taskbarApps.appendChild(taskbarItem);

    // Handle taskbar item click
    taskbarItem.addEventListener('click', () => {
      if (windowFrame.classList.contains('minimized')) {
        windowFrame.classList.remove('minimized');
        windowFrame.style.zIndex = ++zIndexCounter;
        activeAppWindow = windowFrame;
      } else if (activeAppWindow === windowFrame) {
        windowFrame.classList.add('minimized');
        activeAppWindow = null;
      } else {
        windowFrame.style.zIndex = ++zIndexCounter;
        activeAppWindow = windowFrame;
      }
      // Update active state in taskbar
      document.querySelectorAll('.taskbar-app-item').forEach(item => item.classList.remove('active'));
      if (activeAppWindow === windowFrame && !windowFrame.classList.contains('minimized')) {
        taskbarItem.classList.add('active');
      }
    });

    // Append styles from the parsed HTML's head to the main document's head
    doc.head.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = link.href;
      document.head.appendChild(newLink);
    });

    // Execute scripts from the parsed HTML's body
    doc.body.querySelectorAll('script').forEach(script => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
        newScript.onload = () => {
          console.log(`Script loaded: ${script.src}`);
          // Call the initialization function if it exists
          if (script.src.includes('notepad.js') && typeof initNotepad === 'function') {
            initNotepad(windowFrame, fileContent);
          } else if (script.src.includes('browser.js') && typeof initBrowser === 'function') {
            initBrowser(windowFrame, fileContent);
          } else if (script.src.includes('explorer.js') && typeof initExplorer === 'function') {
            initExplorer(windowFrame, createApplicationWindow);
          } else if (script.src.includes('minesweeper.js') && typeof initMinesweeper === 'function') {
            console.log('Calling initMinesweeper');
            initMinesweeper(windowFrame);
          }
        };
        newScript.onerror = (e) => {
          console.error(`Error loading script ${script.src}:`, e);
        };
      } else {
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
    });

    // Bring to front on click anywhere on the window and set as active
    windowFrame.addEventListener('mousedown', () => {
      windowFrame.style.zIndex = ++zIndexCounter;
      activeAppWindow = windowFrame; // Set this window as active
      document.querySelectorAll('.taskbar-app-item').forEach(item => item.classList.remove('active'));
      taskbarItem.classList.add('active');
    });

    // Now, attach event listeners for window controls within the app's own HTML
    const titleBar = windowFrame.querySelector('.title-bar');
    const minimizeBtn = windowFrame.querySelector('.minimize-btn');
    const maximizeRestoreBtn = windowFrame.querySelector('.maximize-restore-btn');
    const closeBtn = windowFrame.querySelector('.close-btn');

    // Make window draggable
    let isDragging = false;
    let offsetX, offsetY;

    if (titleBar) {
      titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - windowFrame.getBoundingClientRect().left;
        offsetY = e.clientY - windowFrame.getBoundingClientRect().top;
        windowFrame.style.zIndex = ++zIndexCounter; // Bring to front on click
        activeAppWindow = windowFrame; // Set this window as active
        document.querySelectorAll('.taskbar-app-item').forEach(item => item.classList.remove('active'));
        taskbarItem.classList.add('active');
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      windowFrame.style.left = `${e.clientX - offsetX}px`;
      windowFrame.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Window controls
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        windowFrame.remove();
        taskbarItem.remove(); // Remove from taskbar
        if (activeAppWindow === windowFrame) {
          activeAppWindow = null; // Clear active window if closed
        }
      });
    }

    let originalWidth, originalHeight, originalLeft, originalTop;

    if (maximizeRestoreBtn) {
      maximizeRestoreBtn.addEventListener('click', () => {
        if (windowFrame.classList.contains('maximized')) {
          // Restore
          windowFrame.style.width = `${originalWidth}px`;
          windowFrame.style.height = `${originalHeight}px`;
          windowFrame.style.left = `${originalLeft}px`;
          windowFrame.style.top = `${originalTop}px`;
          windowFrame.classList.remove('maximized');
        } else {
          // Maximize
          originalWidth = windowFrame.offsetWidth;
          originalHeight = windowFrame.offsetHeight;
          originalLeft = windowFrame.offsetLeft;
          originalTop = windowFrame.offsetTop;

          windowFrame.style.width = '100%';
          windowFrame.style.height = 'calc(100% - 40px)'; // Account for taskbar
          windowFrame.style.left = '0';
          windowFrame.style.top = '0';
          windowFrame.classList.add('maximized');
        }
      });
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        windowFrame.classList.add('minimized');
        taskbarItem.classList.remove('active');
        activeAppWindow = null;
      });
    }

    // Menu dropdown logic (common for all apps with menus)
    const menuButtons = windowFrame.querySelectorAll('.menu-bar button[data-target]');
    menuButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const targetDropdownId = button.dataset.target;
        const dropdown = windowFrame.querySelector(`#${targetDropdownId}`);

        if (dropdown) {
          // Close other open dropdowns in this window
          windowFrame.querySelectorAll('.dropdown-content').forEach(d => {
            if (d !== dropdown) d.classList.add('hidden');
          });
          dropdown.classList.toggle('hidden');
        }
      });
    });

    // Close dropdowns when clicking anywhere else in the window
    windowFrame.addEventListener('click', (event) => {
      windowFrame.querySelectorAll('.dropdown-content').forEach(dropdown => {
        // Check if the click was outside the dropdown and its associated button
        const menuButton = dropdown.previousElementSibling; // Assuming menu button is previous sibling
        if (dropdown && menuButton && !menuButton.contains(event.target) && !dropdown.contains(event.target)) {
          dropdown.classList.add('hidden');
        }
      });
    });
  }

  // Desktop Icon Double Click Logic
  desktopIcons.forEach(icon => {
    icon.addEventListener('dblclick', async () => {
      const appName = icon.querySelector('span').textContent;
      let contentHTML = '';

      // Load content based on appName
      if (appName === 'Computer') {
        const response = await fetch('explorer.html');
        contentHTML = await response.text();
        createApplicationWindow(appName, contentHTML, 800, 600);
      } else if (appName === 'Recycle Bin') {
        const response = await fetch('recycle-bin.html');
        contentHTML = await response.text();
        createApplicationWindow(appName, contentHTML, 600, 500);
      } else if (appName === 'Notepad') {
        // For Notepad, we'll load the notepad.html content
        const response = await fetch('notepad.html');
        contentHTML = await response.text();
        createApplicationWindow(appName, contentHTML, 600, 400);
      } else if (appName === 'Paint') {
        const response = await fetch('paint.html');
        contentHTML = await response.text();
        createApplicationWindow(appName, contentHTML, 800, 600);
      } else if (appName === 'Web Browser') {
        const response = await fetch('browser.html');
        contentHTML = await response.text();
        createApplicationWindow(appName, contentHTML, 1000, 700);
      } else if (appName === 'Minesweeper') {
        const response = await fetch('minesweeper.html');
        contentHTML = await response.text();
        createApplicationWindow(appName, contentHTML, 400, 500);
      }
    });
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      if (activeAppWindow && activeAppWindow.notepadFunctions) { // Check if Notepad is active
        if (e.key === 's') {
          e.preventDefault();
          activeAppWindow.notepadFunctions.saveFile();
        } else if (e.key === 'o') {
          e.preventDefault();
          activeAppWindow.notepadFunctions.openFile();
        } else if (e.key === 'n') {
          e.preventDefault();
          activeAppWindow.notepadFunctions.newFile();
        }
      } else if (activeAppWindow && activeAppWindow.paintFunctions) { // Check if Paint is active
        if (e.key === 's') {
          e.preventDefault();
          // activeAppWindow.paintFunctions.saveFile(); // Implement save for paint
        }
      }
    }
  });

  // Shutdown button logic
  const shutdownButton = document.getElementById('shutdown-button');
  if (shutdownButton) {
    shutdownButton.addEventListener('click', () => {
      window.electronAPI.quitApp(); // Call the IPC function to quit the app
    });
  }
});
