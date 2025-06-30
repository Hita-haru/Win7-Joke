function initMinesweeper(windowFrame) {
  console.log('initMinesweeper called with windowFrame:', windowFrame);
  const boardElement = windowFrame.querySelector('#game-board');
  const minesLeftElement = windowFrame.querySelector('#mines-left');
  const resetButton = windowFrame.querySelector('#reset-button');
  const timerElement = windowFrame.querySelector('#timer');

  const BOARD_SIZE = 10;
  const NUM_MINES = 15;
  let board = [];
  let mines = [];
  let revealedCells = 0;
  let gameEnded = false;
  let timerInterval;
  let timeElapsed = 0;

  function createBoard() {
    console.log('Creating new Minesweeper board...');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill({ isMine: false, isRevealed: false, isFlagged: false, count: 0 }));
    mines = [];
    revealedCells = 0;
    gameEnded = false;
    timeElapsed = 0;
    minesLeftElement.textContent = NUM_MINES;
    timerElement.textContent = 0;
    clearInterval(timerInterval);

    placeMines();
    calculateNumbers();
    renderBoard();
    startTimer();
  }

  function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (!board[row][col].isMine) {
        board[row][col] = { ...board[row][col], isMine: true };
        mines.push({ row, col });
        minesPlaced++;
      }
    }
  }

  function calculateNumbers() {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c].isMine) continue;

        let mineCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc].isMine) {
              mineCount++;
            }
          }
        }
        board[r][c] = { ...board[r][c], count: mineCount };
      }
    }
  }

  function renderBoard() {
    boardElement.innerHTML = ''; // Clear existing cells
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.row = r;
        cellElement.dataset.col = c;

        if (board[r][c].isRevealed) {
          cellElement.classList.add('revealed');
          if (board[r][c].isMine) {
            cellElement.classList.add('mine');
            cellElement.textContent = '💣';
          } else if (board[r][c].count > 0) {
            cellElement.textContent = board[r][c].count;
            cellElement.classList.add(`number-${board[r][c].count}`);
          }
        } else if (board[r][c].isFlagged) {
          cellElement.classList.add('flagged');
        }

        // Attach event listeners to the cell element itself
        cellElement.addEventListener('click', (e) => handleClick(r, c, e));
        cellElement.addEventListener('contextmenu', (e) => handleRightClick(r, c, e));
        boardElement.appendChild(cellElement);
      }
    }
  }

  function handleClick(row, col, e) {
    if (gameEnded || board[row][col].isRevealed || board[row][col].isFlagged) return;

    if (board[row][col].isMine) {
      revealMines();
      endGame(false);
    } else {
      revealCell(row, col);
      checkWin();
    }
    renderBoard(); // Re-render the board after each click
  }

  function handleRightClick(row, col, e) {
    e.preventDefault();
    if (gameEnded || board[row][col].isRevealed) return;

    board[row][col] = { ...board[row][col], isFlagged: !board[row][col].isFlagged };
    minesLeftElement.textContent = NUM_MINES - board.flat().filter(cell => cell.isFlagged).length;
    renderBoard(); // Re-render the board after each right-click
  }

  function revealCell(row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE || board[row][col].isRevealed || board[row][col].isMine) return;

    board[row][col] = { ...board[row][col], isRevealed: true };
    revealedCells++;

    if (board[row][col].count === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(row + dr, col + dc);
        }
      }
    }
  }

  function revealMines() {
    mines.forEach(mine => {
      board[mine.row][mine.col] = { ...board[mine.row][mine.col], isRevealed: true };
    });
  }

  function checkWin() {
    if (revealedCells === BOARD_SIZE * BOARD_SIZE - NUM_MINES) {
      endGame(true);
    }
  }

  function endGame(win) {
    gameEnded = true;
    clearInterval(timerInterval);
    resetButton.textContent = win ? '😎' : '😵';
    if (win) {
      alert('You win!');
    } else {
      alert('Game Over!');
    }
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeElapsed++;
      timerElement.textContent = timeElapsed;
    }, 1000);
  }

  resetButton.addEventListener('click', createBoard);

  createBoard();
}
