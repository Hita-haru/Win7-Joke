function initNotepad(windowFrame, fileContent = null) {
  console.log('initNotepad called with windowFrame:', windowFrame);
  const textarea = windowFrame.querySelector('#notepad-textarea');

  if (fileContent !== null) {
    textarea.value = fileContent;
  }

  // Functions for file operations
  async function saveFile() {
    const filePath = await window.electronAPI.showSaveDialog();
    if (filePath) {
      const content = textarea.value;
      const result = await window.electronAPI.saveFile(filePath, content);
      if (result.success) {
        alert('File saved successfully!');
      } else {
        alert(`Error saving file: ${result.error}`);
      }
    }
  }

  async function openFile() {
    const filePath = await window.electronAPI.showOpenDialog();
    if (filePath) {
      const result = await window.electronAPI.openFile(filePath);
      if (result.success) {
        textarea.value = result.content;
      } else {
        alert(`Error opening file: ${result.error}`);
      }
    }
  }

  function newFile() {
    textarea.value = '';
    alert('New file created.');
  }

  // Attach functions to windowFrame for external access (e.g., from renderer.js for shortcuts)
  windowFrame.notepadFunctions = {
    saveFile: saveFile,
    openFile: openFile,
    newFile: newFile
  };

  // Event Listeners for menu items
  const saveFileBtn = windowFrame.querySelector('#save-file');
  const openFileBtn = windowFrame.querySelector('#open-file');
  const newFileBtn = windowFrame.querySelector('#new-file');
  const exitAppBtn = windowFrame.querySelector('#exit-app');

  if (saveFileBtn) {
    saveFileBtn.addEventListener('click', saveFile);
  }

  if (openFileBtn) {
    openFileBtn.addEventListener('click', openFile);
  }

  if (newFileBtn) {
    newFileBtn.addEventListener('click', newFile);
  }

  if (exitAppBtn) {
    exitAppBtn.addEventListener('click', () => {
      windowFrame.remove(); // Close the notepad window
    });
  }
}