document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const messageElement = document.getElementById('message');

    // Game constants
    const bird = {
        x: 50,
        y: 150,
        width: 34,
        height: 24,
        gravity: 0.4,
        lift: -7,
        velocity: 0
    };
    const birdSprite = '🐦'; // Using an emoji for the bird

    let pipes = [];
    let score = 0;
    let level = 1;
    let isGameOver = false;
    let animationFrameId;

    // Pipe settings that change with levels
    let pipeGap = 120;
    let pipeSpeed = 2;
    let pipeFrequency = 90; // frames between new pipes
    let frameCount = 0;

    function flap() {
        if (isGameOver) {
            startGame();
        } else {
            bird.velocity = bird.lift;
        }
    }

    function startGame() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        isGameOver = false;
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        level = 1;
        pipeGap = 120;
        pipeSpeed = 2;
        pipeFrequency = 90;
        frameCount = 0;
        scoreDisplay.textContent = score;
        messageElement.classList.add('hidden');
        gameLoop();
    }

    function levelUp() {
        level++;
        pipeGap = Math.max(80, pipeGap - 5); // Pipes get closer
        pipeSpeed += 0.2; // Pipes get faster
        pipeFrequency = Math.max(60, pipeFrequency - 3); // Pipes appear more often
    }

    function drawBird() {
        ctx.save();
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        ctx.rotate(Math.min(bird.velocity / 10, Math.PI / 6)); // Tilt based on velocity
        ctx.font = '30px sans-serif';
        ctx.fillText(birdSprite, -bird.width / 2, bird.height / 2);
        ctx.restore();
    }

    function drawPipes() {
        ctx.fillStyle = '#74BF2E'; // Green pipes
        ctx.strokeStyle = '#548729';
        ctx.lineWidth = 2;
        pipes.forEach(pipe => {
            // Top pipe
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.y + pipeGap, pipe.width, canvas.height - (pipe.y + pipeGap));
        });
    }

    function gameOver() {
        isGameOver = true;
        messageElement.innerHTML = `GAME OVER<br><small>Click to Restart</small>`;
        messageElement.classList.remove('hidden');
    }

    function gameLoop() {
        // Update game state
        frameCount++;
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Clear canvas and redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBird();
        drawPipes();

        // Pipe logic
        if (frameCount % pipeFrequency === 0) {
            const pipeY = Math.floor(Math.random() * (canvas.height - pipeGap - 150)) + 75;
            pipes.push({
                x: canvas.width,
                y: pipeY,
                width: 52,
                passed: false
            });
        }

        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
        });

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

        // Collision detection
        // With top/bottom of canvas
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            gameOver();
        }

        // With pipes
        pipes.forEach(pipe => {
            if (
                bird.x < pipe.x + pipe.width &&
                bird.x + bird.width > pipe.x &&
                (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap)
            ) {
                gameOver();
            }

            // Score
            if (pipe.x + pipe.width < bird.x && !pipe.passed) {
                score++;
                pipe.passed = true;
                scoreDisplay.textContent = score;
                if (score > 0 && score % 5 === 0) { // Level up every 5 points
                    levelUp();
                }
            }
        });
        
        if (!isGameOver) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === 'ArrowUp') {
            flap();
        }
    });
    canvas.addEventListener('click', flap);

    startGame();
});