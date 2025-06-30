function initExplorer(windowFrame, createApplicationWindow) {
  console.log('initExplorer called with windowFrame:', windowFrame);
  const pathInput = windowFrame.querySelector('#path-input');
  const goButton = windowFrame.querySelector('#go-button');
  const upButton = windowFrame.querySelector('#up-button');
  const fileList = windowFrame.querySelector('#file-list');

  const MY_COMPUTER_PATH = 'My Computer';

  async function listDrives() {
    const result = await window.electronAPI.listDrives();
    if (result.success) {
      fileList.innerHTML = '';
      pathInput.value = MY_COMPUTER_PATH;

      result.drives.forEach(drive => {
        const listItem = document.createElement('li');
        listItem.textContent = drive;
        listItem.classList.add('directory'); // Treat drives as directories
        listItem.addEventListener('dblclick', () => {
          readDirectory(drive);
        });
        fileList.appendChild(listItem);
      });
    } else {
      alert(`Error listing drives: ${result.error}`);
    }
  }

  async function readDirectory(dirPath) {
    console.log('readDirectory called with dirPath:', dirPath); // Added log
    if (dirPath === MY_COMPUTER_PATH) {
      listDrives();
      return;
    }

    const result = await window.electronAPI.readDirectory(dirPath);
    if (result.success) {
      fileList.innerHTML = ''; // Clear current list
      pathInput.value = dirPath; // Update path input

      result.files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        if (file.isDirectory) {
          listItem.classList.add('directory');
          listItem.addEventListener('dblclick', () => {
            readDirectory(`${dirPath}\\${file.name}`);
          });
        } else {
          listItem.classList.add('file');
          listItem.addEventListener('dblclick', async () => {
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            let appName = '';
            let appHtml = '';
            let appWidth = 600;
            let appHeight = 400;

            if (fileExtension === 'txt') {
              appName = 'Notepad';
              appHtml = 'notepad.html';
            } else if (fileExtension === 'html') {
              appName = 'Web Browser';
              appHtml = 'browser.html';
              appWidth = 1000;
              appHeight = 700;
            }

            if (appName && appHtml) {
              try {
                const response = await fetch(appHtml);
                const appContentHTML = await response.text();

                // Read the content of the actual file being opened
                const filePathToOpen = `${dirPath}\\${fileName}`;
                console.log('Double-clicked file name:', fileName); // Added log
                console.log('Attempting to open file path:', filePathToOpen); // Added log
                const fileReadResult = await window.electronAPI.openFile(filePathToOpen);

                if (fileReadResult.success) {
                  createApplicationWindow(appName, appContentHTML, appWidth, appHeight, fileReadResult.content);
                } else {
                  alert(`Error reading file ${fileName}: ${fileReadResult.error}`);
                }
              } catch (error) {
                console.error(`Failed to open ${appName} for ${fileName}:`, error);
                alert(`Could not open ${fileName} with ${appName}.`);
              }
            } else {
              alert(`No application associated with .${fileExtension} files.`);
            }
          });
        }
        fileList.appendChild(listItem);
      });
    } else {
      alert(`Error reading directory: ${result.error}`);
      listDrives(); // Go back to My Computer if directory read fails
    }
  }

  // Initial load: Show drives
  listDrives();

  goButton.addEventListener('click', () => {
    readDirectory(pathInput.value);
  });

  upButton.addEventListener('click', () => {
    const currentPath = pathInput.value;
    if (currentPath === MY_COMPUTER_PATH) {
      alert('Already at My Computer.');
      return;
    }

    const lastSlashIndex = currentPath.lastIndexOf('\\');
    if (lastSlashIndex > 0) {
      const parentPath = currentPath.substring(0, lastSlashIndex);
      // Check if we are at a drive root (e.g., C:\) and go to My Computer
      if (parentPath.match(/^[A-Z]:$/i)) {
        listDrives();
      } else {
        readDirectory(parentPath);
      }
    } else {
      // If no slash, it's likely a drive letter (e.g., C:), go to My Computer
      listDrives();
    }
  });
}