// Canvas setup and error checking
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas element not found!');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    console.error('Could not get 2D context!');
}

// Set canvas size
canvas.width = 400;
canvas.height = 600;

console.log('Canvas initialized:', canvas.width, 'x', canvas.height);

const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// Game variables
let gameLoop;
let isGameRunning = false;
let score = 0;
let gravity = 0.35;  // Reduced gravity for smoother falling
let panda = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,
    jump: -7    // Slightly reduced jump power
};

let pipes = [];
const PIPE_SPACING = 200;
const PIPE_GAP = 150;

// Load panda image
const pandaImg = new Image();
pandaImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZD0iTTI1IDVDMTIuMyA1IDIgMTUuMyAyIDI4YzAgMTIuNyAxMC4zIDIzIDIzIDIzczIzLTEwLjMgMjMtMjNDNDggMTUuMyAzNy43IDUgMjUgNXptMCA0MGMtOS40IDAtMTctNy42LTE3LTE3czguNi0xNyAxNy0xNyAxNyA3LjYgMTcgMTctNy42IDE3LTE3IDE3eiIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjE4IiBjeT0iMjIiIHI9IjMiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjIyIiByPSIzIi8+PGVsbGlwc2UgY3g9IjI1IiBjeT0iMzAiIHJ4PSI0IiByeT0iMyIvPjwvc3ZnPg==';

// Initialize the game
function init() {
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
    panda.y = canvas.height / 2;
    panda.velocity = 0;
    generatePipe();
}

// Generate a new pipe
function generatePipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    
    pipes.push({
        x: canvas.width,
        y: 0,
        width: 50,
        height: height,
        passed: false
    });
    
    pipes.push({
        x: canvas.width,
        y: height + PIPE_GAP,
        width: 50,
        height: canvas.height - height - PIPE_GAP
    });
}

// Draw a pipe
function drawPipe(pipe) {
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
    ctx.strokeStyle = '#2c5530';
    ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
}

// Draw the panda
function drawPanda() {
    ctx.save();
    ctx.translate(panda.x + panda.width / 2, panda.y + panda.height / 2);
    ctx.rotate(panda.velocity * 0.05);
    ctx.drawImage(pandaImg, -panda.width / 2, -panda.height / 2, panda.width, panda.height);
    ctx.restore();
}

// Check for collisions with a small forgiveness margin
function checkCollision() {
    const margin = 5; // Forgiveness margin for collisions
    
    if (panda.y < 0 || panda.y + panda.height > canvas.height) {
        return true;
    }
    
    for (let pipe of pipes) {
        if (panda.x + panda.width - margin > pipe.x &&
            panda.x + margin < pipe.x + pipe.width &&
            panda.y + margin < pipe.y + pipe.height &&
            panda.y + panda.height - margin > pipe.y) {
            return true;
        }
    }
    return false;
}

// Update game state
function update() {
    panda.velocity += gravity;
    // Limit falling speed
    if (panda.velocity > 10) {
        panda.velocity = 10;
    }
    panda.y += panda.velocity;
    
    // Update pipes with slightly slower speed
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 1.5;  // Reduced pipe speed
        
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            continue;
        }
        
        if (!pipes[i].passed && pipes[i].x + pipes[i].width < panda.x) {
            pipes[i].passed = true;
            score += 0.5;
            scoreElement.textContent = Math.floor(score);
        }
    }
    
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - PIPE_SPACING) {
        generatePipe();
    }
    
    if (checkCollision()) {
        console.log('Game over! Final score:', Math.floor(score));
        gameOver();
    }
}

// Draw game state
function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pipes
    pipes.forEach(drawPipe);
    
    // Draw panda
    drawPanda();
}

let lastFrameTime = 0;
const FPS = 60;
const frameInterval = 1000 / FPS;

// Game loop
function loop(timestamp) {
    if (!isGameRunning) return;
    
    // Calculate time since last frame
    const deltaTime = timestamp - lastFrameTime;
    
    // Only update if enough time has passed
    if (deltaTime >= frameInterval) {
        lastFrameTime = timestamp;
        update();
        draw();
        
        if (panda.velocity !== 0) {
            console.log('Panda position:', Math.round(panda.y), 'velocity:', Math.round(panda.velocity));
        }
    }
    
    gameLoop = requestAnimationFrame(loop);
}

// Game over
function gameOver() {
    isGameRunning = false;
    startButton.textContent = 'Play Again';
    startButton.style.display = 'block';
    cancelAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    console.log('Starting game...');
    init();
    isGameRunning = true;
    startButton.style.display = 'none';
    console.log('Game state initialized, requesting animation frame...');
    gameLoop = requestAnimationFrame(loop);
    console.log('Animation frame requested:', gameLoop);
}

// Event listeners
startButton.addEventListener('click', startGame);

// Prevent space bar scrolling globally
document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.code);
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling for all space bar presses
        console.log('Space pressed, game running:', isGameRunning);
        if (isGameRunning) {
            console.log('Jumping! Current velocity:', panda.velocity);
            panda.velocity = panda.jump;
        }
    }
});

// Add touch support for mobile devices
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isGameRunning) {
        panda.velocity = panda.jump;
    }
});

// Initialize game when image is loaded
pandaImg.onload = () => {
    init();
    draw();
};