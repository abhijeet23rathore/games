document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const messageElement = document.getElementById('message');

    // Ball properties
    const ballRadius = 10;
    let x, y, dx, dy;

    // Paddle properties
    const paddleHeight = 10;
    const paddleWidth = 75;
    let paddleX;

    // Controls
    let rightPressed = false;
    let leftPressed = false;

    // Brick properties
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    let bricks = [];
    let brickCount;

    // Game state
    let score = 0;
    let level = 1;
    let isGameOver = false;
    let animationFrameId;

    function setupBricks() {
        bricks = [];
        brickCount = brickRowCount * brickColumnCount;
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
    }

    function resetBallAndPaddle() {
        x = canvas.width / 2;
        y = canvas.height - 30;
        // Set speed based on level
        const speedMultiplier = 1 + (level - 1) * 0.2;
        dx = 2 * speedMultiplier;
        dy = -2 * speedMultiplier;
        paddleX = (canvas.width - paddleWidth) / 2;
    }

    function startGame() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        isGameOver = false;
        score = 0;
        level = 1;
        updateUI();
        messageElement.classList.add('hidden');
        messageElement.classList.remove('game-over');
        setupBricks();
        resetBallAndPaddle();
        draw();
    }

    function levelUp() {
        level++;
        updateUI();
        showMessage(`Level ${level}!`);
        setupBricks();
        resetBallAndPaddle();
    }
    
    function gameOver() {
        isGameOver = true;
        messageElement.innerHTML = `GAME OVER<br><small>Press 'R' to Restart</small>`;
        messageElement.classList.remove('hidden');
        messageElement.classList.add('game-over');
    }

    function showMessage(msg) {
        messageElement.textContent = msg;
        messageElement.classList.remove('hidden');
        messageElement.classList.remove('game-over');
        setTimeout(() => messageElement.classList.add('hidden'), 1500);
    }

    function updateUI() {
        scoreElement.textContent = score;
        levelElement.textContent = level;
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);

    function keyDownHandler(e) {
        if (e.key == "Right" || e.key == "ArrowRight") rightPressed = true;
        else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = true;
        else if (e.key.toLowerCase() === 'r' && isGameOver) {
            startGame();
        }
    }

    function keyUpHandler(e) {
        if (e.key == "Right" || e.key == "ArrowRight") rightPressed = false;
        else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = false;
    }

    function mouseMoveHandler(e) {
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        if (relativeX > paddleWidth / 2 && relativeX < canvas.width - paddleWidth / 2) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }

    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if (b.status == 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score++;
                        brickCount--;
                        updateUI();
                        if (brickCount === 0) {
                            levelUp();
                        }
                    }
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#eee";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#ff6b6b";
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status == 1) {
                    const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = "#ff6b6b";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function draw() {
        if (isGameOver) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
        
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                gameOver();
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
        else if (leftPressed && paddleX > 0) paddleX -= 7;

        x += dx;
        y += dy;
        animationFrameId = requestAnimationFrame(draw);
    }

    startGame();
});