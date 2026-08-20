// Full Maze Chase — A complete maze game
// Entry point: game.js

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// --- Constants ---
const TILE = 30; // pixel size of each tile
const COLS = 20;
const ROWS = 20;
const WALL = 1;
const PATH = 0;
const DOT = 2;
const PLAYER = 3;
const EXIT = 4;

// Colors
const WALL_COLOR = '#2a2a6e';
const PATH_COLOR = '#000';
const DOT_COLOR = '#fff';
const PLAYER_COLOR = '#ffcc00';
const EXIT_COLOR = '#00ff88';
const TEXT_COLOR = '#aaa';

// Maze layout — 20x20 grid
// 1 = wall, 0 = path, 2 = dot, 3 = player start, 4 = exit
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,0,2,0,0,0,2,0,0,2,0,0,0,2,0,2,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,2,2,0,0,0,2,2,0,0,2,2,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,2,0,0,0,0,0,0,0,0,0,2,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,2,0,0,1,0,2,2,2,0,0,2,2,0,1,0,0,0,2,1],
  [1,0,1,0,1,0,2,0,0,0,0,0,2,0,1,0,1,0,0,1],
  [1,0,1,0,2,0,2,0,1,1,1,0,2,0,2,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,1,4,1,0,0,0,0,0,0,0,2,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,0,1],
  [1,0,2,0,0,0,1,0,0,2,0,0,1,0,0,0,2,0,1,1],
  [1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,0,2,1],
  [1,2,0,0,0,2,2,0,0,0,0,0,2,2,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
  [1,0,2,2,0,0,0,2,2,0,0,2,2,0,0,2,0,2,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Game state
let playerRow = -1, playerCol = -1;
let score = 0;
let totalDots = 0;
let gameOver = false;
let won = false;
let moveCount = 0;

// --- Initialize ---
function init() {
  // Find player start and count dots
  totalDots = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === PLAYER) {
        playerRow = r;
        playerCol = c;
        MAZE[r][c] = PATH; // clear to path
      } else if (MAZE[r][c] === DOT) {
        totalDots++;
      }
    }
  }
  score = 0;
  gameOver = false;
  won = false;
  moveCount = 0;
  draw();
}

// --- Drawing ---
function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw maze
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = MAZE[r][c];
      const x = c * TILE;
      const y = r * TILE;

      if (tile === WALL) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x, y, TILE, TILE);
        // Add subtle border
        ctx.strokeStyle = '#3a3a8e';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      } else {
        ctx.fillStyle = PATH_COLOR;
        ctx.fillRect(x, y, TILE, TILE);
      }

      if (tile === DOT) {
        ctx.fillStyle = DOT_COLOR;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (tile === EXIT) {
        ctx.fillStyle = EXIT_COLOR;
        ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, TILE - 8, TILE - 8);
      }
    }
  }

  // Draw player
  const px = playerCol * TILE + TILE / 2;
  const py = playerRow * TILE + TILE / 2;
  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(px, py, TILE / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, TILE / 2 - 4, -0.3, 0.3);
  ctx.stroke();

  // HUD
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = '16px Courier New';
  ctx.fillText('Score: ' + score + '/' + totalDots, 10, 20);
  ctx.fillText('Moves: ' + moveCount, canvas.width - 120, 20);

  // Win/Lose message
  if (won) {
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '18px Courier New';
    ctx.fillText('Score: ' + score + '  Moves: ' + moveCount, canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  } else if (gameOver) {
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '18px Courier New';
    ctx.fillText('Score: ' + score + '  Moves: ' + moveCount, canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }
}

// --- Movement ---
function movePlayer(dr, dc) {
  if (gameOver || won) return;

  const newRow = playerRow + dr;
  const newCol = playerCol + dc;

  // Check bounds and walls
  if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) return;
  if (MAZE[newRow][newCol] === WALL) return;

  playerRow = newRow;
  playerCol = newCol;
  moveCount++;

  // Check what's at the new tile
  const tile = MAZE[newRow][newCol];
  if (tile === DOT) {
    score++;
    MAZE[newRow][newCol] = PATH; // remove dot
    if (score >= totalDots) {
      won = true;
    }
  }
  if (tile === EXIT) {
    won = true;
  }

  draw();
}

// --- Input ---
document.addEventListener('keydown', function(e) {
  switch (e.key) {
    case 'ArrowUp':    e.preventDefault(); movePlayer(-1, 0); break;
    case 'ArrowDown':  e.preventDefault(); movePlayer(1, 0); break;
    case 'ArrowLeft':  e.preventDefault(); movePlayer(0, -1); break;
    case 'ArrowRight': e.preventDefault(); movePlayer(0, 1); break;
    case 'r': case 'R': init(); break;
  }
});

// --- Start ---
init();
