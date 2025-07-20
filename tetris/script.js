document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 24;

    ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

    let board = createBoard();
    let score = 0;

    const COLORS = [
        null, '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#f368e0', '#00d2d3'
    ];

    const SHAPES = [
        [],
        [[1, 1, 1, 1]], // I
        [[2, 2], [2, 2]],   // O
        [[0, 3, 0], [3, 3, 3]], // T
        [[4, 4, 0], [0, 4, 4]], // S
        [[0, 5, 5], [5, 5, 0]], // Z
        [[6, 0, 0], [6, 6, 6]], // J
        [[0, 0, 7], [7, 7, 7]]  // L
    ];

    let piece = {
        x: 0,
        y: 0,
        shape: null
    };

    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(board, { x: 0, y: 0 });
        drawMatrix(piece.shape, { x: piece.x, y: piece.y });
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    ctx.fillStyle = COLORS[value];
                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function resetPiece() {
        const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
        piece.shape = SHAPES[typeId];
        piece.y = 0;
        piece.x = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
        if (collide()) {
            board = createBoard();
            score = 0;
        }
    }

    function drop() {
        piece.y++;
        if (collide()) {
            piece.y--;
            merge();
            resetPiece();
            sweep();
        }
        updateScore();
    }

    function collide() {
        const [shape, offset] = [piece.shape, piece];
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0 &&
                    (board[y + offset.y] && board[y + offset.y][x + offset.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function merge() {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + piece.y][x + piece.x] = value;
                }
            });
        });
    }

    function rotate() {
        const shape = piece.shape;
        const newShape = shape[0].map((_, colIndex) => shape.map(row => row[colIndex]).reverse());
        const posX = piece.x;
        let offset = 1;
        piece.shape = newShape;

        while (collide()) {
            piece.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > piece.shape[0].length) {
                piece.shape = shape; // revert
                piece.x = posX;
                return;
            }
        }
    }

    function sweep() {
        let rowCount = 1;
        outer: for (let y = board.length - 1; y > 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;
            score += rowCount * 10;
            rowCount *= 2;
        }
    }

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            drop();
            dropCounter = 0;
        }
        draw();
        requestAnimationFrame(update);
    }

    function updateScore() {
        scoreElement.innerText = score;
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            piece.x--;
            if (collide()) piece.x++;
        } else if (event.key === 'ArrowRight') {
            piece.x++;
            if (collide()) piece.x--;
        } else if (event.key === 'ArrowDown') {
            drop();
        } else if (event.key === 'ArrowUp') {
            rotate();
        }
    });

    resetPiece();
    updateScore();
    update();
});