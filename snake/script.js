document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('gameOver');
    const levelElement = document.getElementById('level');
    const scoreTargetElement = document.getElementById('scoreTarget');
    const levelUpMessageElement = document.getElementById('levelUpMessage');

    const gridSize = 20;
    const canvasSize = canvas.width;
    const tileCount = canvasSize / gridSize;

    const foodEmojis = ['🍎', '🍕', '🍔', '🍟', '🍩', '🍦', '🍭', '🌮', '🍇', '🍉', '🍓', '🍒'];
    const snakeColors = ['#6cff5c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1'];

    let snake = [];
    let food = {};
    let direction = { x: 0, y: 0 };
    let currentSnakeColorIndex = 0;
    let score = 0;
    let level = 1;
    let scoreToNextLevel = 10;
    let isGameOver = false;
    const initialGameSpeed = 120;
    let gameSpeed = initialGameSpeed;
    let gameLoopTimeoutId = null;

    function initialDraw() {
        clearScreen();
        drawFood();
        drawSnake();
    }

    function startGame() {
        if (gameLoopTimeoutId) {
            clearTimeout(gameLoopTimeoutId);
        }
        snake = [
            { x: 12, y: 10 }, // Head
            { x: 11, y: 10 },
            { x: 10, y: 10 }  // Tail
        ];
        currentSnakeColorIndex = 0;
        level = 1;
        scoreToNextLevel = 10;
        gameSpeed = initialGameSpeed;
        direction = { x: 0, y: 0 };
        score = 0;
        isGameOver = false;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        gameOverElement.classList.add('hidden');
        levelUpMessageElement.classList.add('hidden');
        scoreTargetElement.textContent = scoreToNextLevel;
        generateFood();
        initialDraw(); // Draw the initial state, but don't start the loop
    }

    function levelUp() {
        level++;
        scoreToNextLevel += 10;
        levelElement.textContent = level;
        scoreTargetElement.textContent = scoreToNextLevel;

        // Decrease gameSpeed to increase snake speed, with a max speed (minimum delay of 40ms)
        gameSpeed = Math.max(40, initialGameSpeed - (level * 10));

        // Flash the border to indicate a level up
        canvas.style.boxShadow = '0 0 35px #fff, 0 0 45px #fff inset';
        setTimeout(() => { canvas.style.boxShadow = '0 0 20px #6cff5c, 0 0 30px #6cff5c inset'; }, 250);

        // Show level up message
        levelUpMessageElement.textContent = `Level ${level}! Speed Increased!`;
        levelUpMessageElement.classList.remove('hidden');
        setTimeout(() => {
            levelUpMessageElement.classList.add('hidden');
        }, 2000); // Message disappears after 2 seconds
    }

    function mainLoop() {
        if (isGameOver) {
            gameOverElement.classList.remove('hidden');
            return;
        }

        gameLoopTimeoutId = setTimeout(() => {
            clearScreen();
            moveSnake();
            drawFood();
            drawSnake();
            checkCollision();
            mainLoop();
        }, gameSpeed);
    }

    function clearScreen() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    function moveSnake() {
        const oldHead = snake[0];
        const newHead = {
            x: oldHead.x + direction.x,
            y: oldHead.y + direction.y,
        };
        snake.unshift(newHead);

        // Check if snake ate food
        if (newHead.x === food.x && newHead.y === food.y) {
            score++;
            scoreElement.textContent = score;
            // Change snake color on eating
            currentSnakeColorIndex = (currentSnakeColorIndex + 1) % snakeColors.length;

            if (score >= scoreToNextLevel) {
                levelUp();
            }
            generateFood();
        } else {
            snake.pop();
        }
    }

    function drawSnake() {
        ctx.fillStyle = snakeColors[currentSnakeColorIndex];
        snake.forEach(part => {
            // Draw each part as a rectangle, slightly smaller than the grid cell for a segmented look
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }

    function generateFood() {
        let foodPositionValid = false;
        while (!foodPositionValid) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount),
                char: foodEmojis[Math.floor(Math.random() * foodEmojis.length)]
            };

            const collisionWithSnake = snake.some(part => part.x === food.x && part.y === food.y);

            if (!collisionWithSnake) {
                foodPositionValid = true;
            }
        }
    }

    function drawFood() {
        ctx.font = `${gridSize}px 'Press Start 2P'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const x = food.x * gridSize + gridSize / 2;
        const y = food.y * gridSize + gridSize / 2;
        ctx.fillText(food.char, x, y);
    }

    function checkCollision() {
        const head = snake[0];

        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            isGameOver = true;
            return;
        }

        // Self collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                isGameOver = true;
                return;
            }
        }
    }

    function handleDirectionChange(newDirectionKey) {
        const isGameReadyToStart = direction.x === 0 && direction.y === 0;
        let proposedDirection = null;

        switch (newDirectionKey) {
            case 'ArrowUp': case 'up':
                if (direction.y === 0) proposedDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown': case 'down':
                if (direction.y === 0) proposedDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft': case 'left':
                if (direction.x === 0) proposedDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight': case 'right':
                if (direction.x === 0) proposedDirection = { x: 1, y: 0 };
                break;
        }

        if (proposedDirection) {
            direction = proposedDirection;
            // If this is the first valid move, kick off the game loop.
            if (isGameReadyToStart && !isGameOver) {
                mainLoop();
            }
        }
    }

    function handleCanvasTap(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const dx = x - centerX;
        const dy = y - centerY;

        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal tap is stronger
            handleDirectionChange(dx > 0 ? 'right' : 'left');
        } else {
            // Vertical tap is stronger
            handleDirectionChange(dy > 0 ? 'down' : 'up');
        }
    }

    document.addEventListener('keydown', e => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            handleDirectionChange(e.key);
        } else if (e.key.toLowerCase() === 'r' && isGameOver) {
            startGame();
        }
    });

    canvas.addEventListener('click', handleCanvasTap);

    startGame();
});