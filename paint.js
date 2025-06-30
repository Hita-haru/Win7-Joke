function initPaint(windowFrame) {
  console.log('initPaint called with windowFrame:', windowFrame);
  const canvas = windowFrame.querySelector('#paint-canvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = windowFrame.querySelector('#color-picker');
  const brushSize = windowFrame.querySelector('#brush-size');
  const toolPencil = windowFrame.querySelector('#tool-pencil');
  const toolEraser = windowFrame.querySelector('#tool-eraser');

  let painting = false;
  let currentTool = 'pencil';

  // Set canvas size to fill parent
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  // Use windowFrame for resize listener if canvas is within it
  // For now, keep window for simplicity, but ideally this should be handled by windowFrame resize observer
  window.addEventListener('resize', resizeCanvas);

  function startPosition(e) {
    painting = true;
    draw(e);
  }

  function endPosition() {
    painting = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!painting) return;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';

    if (currentTool === 'pencil') {
      ctx.strokeStyle = colorPicker.value;
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = 'white'; // Eraser color
    }

    ctx.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
  }

  // Event Listeners
  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);

  toolPencil.addEventListener('click', () => {
    currentTool = 'pencil';
    toolPencil.classList.add('active');
    toolEraser.classList.remove('active');
  });

  toolEraser.addEventListener('click', () => {
    currentTool = 'eraser';
    toolEraser.classList.add('active');
    toolPencil.classList.remove('active');
  });
}