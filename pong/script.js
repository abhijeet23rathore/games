document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const playerScoreEl = document.getElementById('playerScore');
    const aiScoreEl = document.getElementById('aiScore');
    const messageElement = document.getElementById('message');

    // Game constants
    const paddleWidth = 10, paddleHeight = 100, ballRadius = 10;
    const winningScore = 5;
    const paddleSpeed = 8;

    // Game state
    let playerY, aiY, ballX, ballY, ballSpeedX, ballSpeedY;
    let playerScore = 0;
    let aiScore = 0;
    const initialBallSpeed = 7; // Increased initial speed
    const initialAiSpeed = 6;
    let isGameOver = false;
    let animationFrameId;
    let upPressed = false;
    let downPressed = false;

    function resetBall(direction) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        // Difficulty increase: ball gets faster after each point
        const currentSpeed = initialBallSpeed + (playerScore + aiScore) * 0.75; // Steeper difficulty curve
        ballSpeedX = currentSpeed * direction;
        ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 2);
    }

    function startGame() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        isGameOver = false;
        messageElement.classList.add('hidden');
        messageElement.classList.remove('game-over');

        playerScore = 0;
        aiScore = 0;
        playerScoreEl.textContent = playerScore;
        aiScoreEl.textContent = aiScore;
        playerY = (canvas.height - paddleHeight) / 2;
        aiY = (canvas.height - paddleHeight) / 2;
        resetBall(Math.random() > 0.5 ? 1 : -1);
        gameLoop();
    }

    function gameOver(message, cssClass) {
        isGameOver = true;
        messageElement.innerHTML = message;
        messageElement.classList.remove('hidden');
        if (cssClass) {
            messageElement.classList.add(cssClass);
        }
    }

    function moveEverything() {
        if (isGameOver) return;

        // Player paddle keyboard movement
        if (upPressed && playerY > 0) {
            playerY -= paddleSpeed;
        }
        if (downPressed && playerY < canvas.height - paddleHeight) {
            playerY += paddleSpeed;
        }

        // Ball movement
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Ball collision with top/bottom walls
        if (ballY < ballRadius || ballY > canvas.height - ballRadius) {
            ballSpeedY = -ballSpeedY;
        }

        // Ball collision with paddles
        // Player paddle
        if (ballX < paddleWidth + ballRadius && ballX > ballRadius && ballY > playerY && ballY < playerY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
            let deltaY = ballY - (playerY + paddleHeight / 2);
            ballSpeedY = deltaY * 0.35; // Add spin
        }
        // AI paddle
        if (ballX > canvas.width - paddleWidth - ballRadius && ballX < canvas.width - ballRadius && ballY > aiY && ballY < aiY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
        }

        // Scoring
        if (ballX < 0) {
            aiScore++;
            aiScoreEl.textContent = aiScore;
            if (aiScore >= winningScore) {
                gameOver("AI Wins!<br><small>Press 'R' to Play Again</small>", 'game-over');
            } else {
                resetBall(1);
            }
        } else if (ballX > canvas.width) {
            playerScore++;
            playerScoreEl.textContent = playerScore;
            if (playerScore >= winningScore) {
                gameOver("You Win!<br><small>Press 'R' to Play Again</small>");
            } else {
                resetBall(-1);
            }
        }

        // AI movement
        const currentAiSpeed = initialAiSpeed + (playerScore + aiScore) * 0.4; // AI gets faster too
        const aiCenter = aiY + (paddleHeight / 2);
        if (aiCenter < ballY - 35) {
            aiY += currentAiSpeed;
        } else if (aiCenter > ballY + 35) {
            aiY -= currentAiSpeed;
        }
    }

    function drawEverything() {
        // Black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center line
        ctx.fillStyle = '#48dbfb';
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
        }

        // Player paddle
        ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
        // AI paddle
        ctx.fillRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight);
        // Ball
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, true);
        ctx.fill();
    }

    function gameLoop() {
        moveEverything();
        drawEverything();
        if (!isGameOver) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // Event Listeners
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        playerY = e.clientY - rect.top - (paddleHeight / 2);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') upPressed = true;
        else if (e.key === 'ArrowDown') downPressed = true;
        else if (e.key.toLowerCase() === 'r' && isGameOver) {
            startGame();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp') upPressed = false;
        else if (e.key === 'ArrowDown') downPressed = false;
    });

    startGame();
});