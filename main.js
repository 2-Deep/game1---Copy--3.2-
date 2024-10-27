// Select the canvas and set up the context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define player and initial enemy objects
const player = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    color: 'blue',
    speed: 5
};

let enemies = [
    { x: 400, y: 300, width: 50, height: 50, color: 'red' } // Initial enemy
];

// Define the green dot
const greenDot = {
    x: 0,
    y: 0,
    size: 20,
    visible: false
};

// Track keyboard input
let keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Variables to manage the game state
let score = 0;
let gameOver = false;
let gameTime = 0; // Timer to track elapsed time
let previousScores = []; // Array to store scores from previous rounds

// Function to get a random position for an object on the canvas
function getRandomPosition(objectWidth, objectHeight) {
    const x = Math.random() * (canvas.width - objectWidth);
    const y = Math.random() * (canvas.height - objectHeight);
    return { x, y };
}

// Function to show the green dot for 1.3 seconds
function showGreenDot() {
    const position = getRandomPosition(greenDot.size, greenDot.size);
    greenDot.x = position.x;
    greenDot.y = position.y;
    greenDot.visible = true;

    setTimeout(() => {
        greenDot.visible = false; // Hide the dot after 1.3 seconds
    }, 1300);
}

// Call showGreenDot every 3 seconds
setInterval(showGreenDot, 3000);

// Function to spawn a new enemy at a random position
function spawnEnemy() {
    const position = getRandomPosition(50, 50); // Random position for the new enemy
    const newEnemy = {
        x: position.x,
        y: position.y,
        width: 50,
        height: 50,
        color: 'red'
    };
    enemies.push(newEnemy);
}

// Function to update game state
function update() {
    if (!gameOver) {
        gameTime += 1 / 60; // Increment time (assuming 60 FPS)

        // Every 30 seconds, spawn a new enemy
        if (Math.floor(gameTime) % 30 === 0 && gameTime > 0) {
            spawnEnemy();
            gameTime += 1; // Prevent multiple spawns at the exact 30-second mark
        }

        // Move player based on key input
        if (keys['ArrowUp']) player.y -= player.speed;
        if (keys['ArrowDown']) player.y += player.speed;
        if (keys['ArrowLeft']) player.x -= player.speed;
        if (keys['ArrowRight']) player.x += player.speed;

        // Boundary detection for player
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

        // Check for collision with any enemy
        for (const enemy of enemies) {
            if (detectCollision(player, enemy)) {
                gameOver = true;
                previousScores.push(score); // Save score to scoreboard on game over
                console.log('Game Over!');
                break;
            }
        }

        // Check for collision with green dot
        if (greenDot.visible && detectCollision(player, {
            x: greenDot.x,
            y: greenDot.y,
            width: greenDot.size,
            height: greenDot.size
        })) {
            score += 1; // Increase score when the dot is collected
            greenDot.visible = false; // Hide the dot immediately upon collection
            console.log('Collected a dot! Score: ' + score);
        }
    }
}

// Function to draw everything on the canvas
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw all enemies
    for (const enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // Draw the green dot if it's visible
    if (greenDot.visible) {
        ctx.fillStyle = 'green';
        ctx.fillRect(greenDot.x, greenDot.y, greenDot.size, greenDot.size);
    }

    // Draw the score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);

    // Draw the timer (minutes and seconds)
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60).toString().padStart(2, '0');
    ctx.fillText('Time: ' + minutes + ':' + seconds, canvas.width - 100, 20);

    // Draw the scoreboard
    ctx.fillText('Scoreboard:', 10, 50);
    previousScores.forEach((prevScore, index) => {
        ctx.fillText(`Game ${index + 1}: ${prevScore}`, 10, 70 + index * 20);
    });

    // Display Game Over message
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
    }
}

// Function to detect collision between two rectangles
function detectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Restart the game
function restartGame() {
    gameOver = false;
    score = 0;
    gameTime = 0;
    enemies = [{ x: 400, y: 300, width: 50, height: 50, color: 'red' }]; // Reset to initial enemy
    player.x = 100;
    player.y = 100;
    gameLoop();
}

// Add a restart button
const restartButton = document.createElement('button');
restartButton.innerText = 'Restart Game';
restartButton.style.position = 'absolute';
restartButton.style.top = '10px';
restartButton.style.left = '10px';
restartButton.onclick = restartGame;
document.body.appendChild(restartButton);

// Main game loop
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop); // Continue the loop if game is not over
    }
}

// Start the game loop
gameLoop();