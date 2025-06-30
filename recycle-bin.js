function initRecycleBin(windowFrame) {
  console.log('initRecycleBin called with windowFrame:', windowFrame);
  const recycleBinList = windowFrame.querySelector('#recycle-bin-list');
  const emptyRecycleBinBtn = windowFrame.querySelector('#empty-recycle-bin');
  const exitAppBtn = windowFrame.querySelector('#exit-app');

  async function refreshRecycleBinList() {
    // Electron's shell.trashItem doesn't provide a direct way to list trash contents.
    // This would require platform-specific implementations or external libraries.
    // For now, we'll display a placeholder message.
    recycleBinList.innerHTML = '<li>(Cannot list trash contents directly)</li>';
    const result = await window.electronAPI.listTrash();
    if (result.success && result.items) {
      recycleBinList.innerHTML = '';
      if (result.items.length === 0) {
        recycleBinList.innerHTML = '<li>Recycle Bin is empty.</li>';
      } else {
        result.items.forEach(item => {
          const listItem = document.createElement('li');
          listItem.textContent = item.name; // Assuming item has a name property
          // TODO: Add restore functionality
          recycleBinList.appendChild(listItem);
        });
      }
    } else if (result.error) {
      recycleBinList.innerHTML = `<li>Error: ${result.error}</li>`;
    }
  }

  if (emptyRecycleBinBtn) {
    emptyRecycleBinBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to empty the Recycle Bin?')) {
        const result = await window.electronAPI.emptyTrash();
        if (result.success) {
          alert('Recycle Bin emptied successfully!');
          refreshRecycleBinList();
        } else {
          alert(`Error emptying Recycle Bin: ${result.error}`);
        }
      }
    });
  }

  if (exitAppBtn) {
    exitAppBtn.addEventListener('click', () => {
      windowFrame.remove();
    });
  }

  // Initial load
  refreshRecycleBinList();
}
