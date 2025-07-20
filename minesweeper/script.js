document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('game-board');
    const messageElement = document.getElementById('message');
    const difficultySelect = document.getElementById('difficulty');
    const restartBtn = document.getElementById('restartBtn');
    const minesCountElement = document.getElementById('mines-count');

    const difficulties = {
        easy: { rows: 9, cols: 9, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 }
    };

    let rows, cols, minesCount;
    let board = [];
    let isGameOver = false;
    let flagsPlaced = 0;
    let revealedCells = 0;

    function createBoard() {
        const difficulty = difficulties[difficultySelect.value];
        rows = difficulty.rows;
        cols = difficulty.cols;
        minesCount = difficulty.mines;
        revealedCells = 0;
        flagsPlaced = 0;
        isGameOver = false;

        messageElement.classList.add('hidden');
        minesCountElement.textContent = minesCount;
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${cols}, 25px)`;

        // Initialize board
        board = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            }))
        );

        // Create cell elements
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('contextmenu', handleRightClick);
                boardElement.appendChild(cell);
            }
        }
    }

    function placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);

            // Check if the cell is not already a mine AND is outside the 3x3 area of the first click
            const isSafeZone = Math.abs(r - firstClickRow) <= 1 && Math.abs(c - firstClickCol) <= 1;

            if (!board[r][c].isMine && !isSafeZone) {
                board[r][c].isMine = true;
                minesPlaced++;
            }
        }
        calculateAdjacentMines();
    }

    function calculateAdjacentMines() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isMine) continue;
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newR = r + i;
                        const newC = c + j;
                        if (newR >= 0 && newR < rows && newC >= 0 && newC < cols && board[newR][newC].isMine) {
                            count++;
                        }
                    }
                }
                board[r][c].adjacentMines = count;
            }
        }
    }

    function handleCellClick(event) {
        if (isGameOver) return;
        const cellElement = event.target;
        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);
        const cell = board[row][col];

        if (cell.isFlagged || cell.isRevealed) return;

        // First click logic
        if (revealedCells === 0) {
            placeMines(row, col);
        }

        revealCell(row, col);
    }

    function handleRightClick(event) {
        event.preventDefault();
        if (isGameOver) return;
        const cellElement = event.target;
        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);
        const cell = board[row][col];

        if (cell.isRevealed) return;

        cell.isFlagged = !cell.isFlagged;
        cellElement.classList.toggle('flagged', cell.isFlagged);
        flagsPlaced += cell.isFlagged ? 1 : -1;
        minesCountElement.textContent = minesCount - flagsPlaced;
    }

    function revealCell(r, c) {
        const cell = board[r][c];
        if (r < 0 || r >= rows || c < 0 || c >= cols || cell.isRevealed || cell.isFlagged) {
            return;
        }

        cell.isRevealed = true;
        revealedCells++;
        const cellElement = boardElement.children[r * cols + c];
        cellElement.classList.add('revealed');

        if (cell.isMine) {
            gameOver(false);
            cellElement.innerHTML = '💣';
            cellElement.classList.add('mine');
            return;
        }

        if (cell.adjacentMines > 0) {
            cellElement.textContent = cell.adjacentMines;
            cellElement.dataset.mines = cell.adjacentMines;
        } else {
            // Flood fill for empty cells
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    revealCell(r + i, c + j);
                }
            }
        }

        checkWinCondition();
    }
    
    function gameOver(isWin) {
        isGameOver = true;
        if (isWin) {
            messageElement.textContent = 'You Win!';
            messageElement.classList.add('win');
        } else {
            messageElement.textContent = 'Game Over!';
            messageElement.classList.remove('win');
            // Reveal all mines
            board.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell.isMine) {
                        const cellElement = boardElement.children[r * cols + c];
                        cellElement.classList.add('revealed', 'mine');
                        cellElement.innerHTML = '💣';
                    }
                });
            });
        }
        messageElement.classList.remove('hidden');
    }

    function checkWinCondition() {
        if (revealedCells === rows * cols - minesCount) {
            gameOver(true);
        }
    }

    difficultySelect.addEventListener('change', createBoard);
    restartBtn.addEventListener('click', createBoard);

    createBoard();
});