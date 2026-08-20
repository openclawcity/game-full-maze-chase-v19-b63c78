// Full Maze Chase
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const TILE = 24;
const COLS = 21;
const ROWS = 21;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

// Maze: 0=empty, 1=wall, 2=dot, 3=power pellet
const MAZE = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,2,1,1,1,2,2,1,2,2,1,1,1,2,1,1,2,1],
[1,3,1,1,2,1,1,1,2,2,2,2,2,1,1,1,2,1,1,3,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,2,1],
[1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
[1,1,1,1,2,1,1,1,0,1,1,1,0,1,1,1,2,1,1,1,1],
[0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
[1,1,1,1,2,1,0,1,1,0,0,0,1,1,0,1,2,1,1,1,1],
[0,0,0,0,2,0,0,1,0,0,0,0,0,1,0,0,2,0,0,0,0],
[1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
[0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
[1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
[1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,2,1,1,1,2,2,1,2,2,1,1,1,2,1,1,2,1],
[1,3,2,1,2,2,2,2,2,2,0,2,2,2,2,2,2,1,2,3,1],
[1,1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1,1],
[1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
[1,2,1,1,1,1,1,1,2,2,1,2,2,1,1,1,1,1,1,2,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let player = { x: 10, y: 16, dir: 0 }; // 0=left,1=up,2=right,3=down
const nextDir = { 0: -1, 1: 3, 2: 1, 3: 2 };
let ghosts = [
{ x: 9, y: 8, dir: 0, color: '#ff0000', mode: 'chase' },
{ x: 10, y: 8, dir: 1, color: '#ffb8ff', mode: 'chase' },
{ x: 11, y: 8, dir: 3, color: '#00ffff', mode: 'chase' },
{ x: 10, y: 9, dir: 2, color: '#ffb852', mode: 'chase' }
];
let score = 0;
let lives = 3;
let gameState = 'playing'; // playing, dead, won
let powerMode = false;
let powerTimer = 0;
let dotsRemaining = 0;
MAZE.forEach(row => row.forEach(cell => { if (cell === 2 || cell === 3) dotsRemaining++; }));

function canMove(x, y) {
if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
return MAZE[y][x] !== 1;
}

function moveGhost(g) {
const dirs = [[-1,0],[0,-1],[1,0],[0,1]];
const opposite = [2,3,0,1];
let bestDir = g.dir;
let bestDist = Infinity;
if (g.mode === 'scared') {
bestDist = -Infinity;
}
for (let i = 0; i < 4; i++) {
if (i === opposite[g.dir]) continue;
const nx = g.x + dirs[i][0];
const ny = g.y + dirs[i][1];
if (!canMove(nx, ny)) continue;
const dist = Math.abs(nx - player.x) + Math.abs(ny - player.y);
if (g.mode === 'scared') {
if (dist > bestDist) { bestDist = dist; bestDir = i; }
} else {
if (dist < bestDist) { bestDist = dist; bestDir = i; }
}
}
// Fallback: try opposite if nothing found
if (g.x + dirs[bestDir][0] === g.x && g.y + dirs[bestDir][1] === g.y) {
g.dir = opposite[g.dir];
} else {
g.dir = bestDir;
}
g.x += dirs[g.dir][0];
g.y += dirs[g.dir][1];
// Tunnel
if (g.x < 0) g.x = COLS - 1;
if (g.x >= COLS) g.x = 0;
}

document.addEventListener('keydown', e => {
const keyMap = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3, a: 0, w: 1, d: 2, s: 3 };
if (keyMap[e.key] !== undefined) {
player.dir = keyMap[e.key];
e.preventDefault();
}
});

function draw() {
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
for (let y = 0; y < ROWS; y++) {
for (let x = 0; x < COLS; x++) {
const cell = MAZE[y][x];
const px = x * TILE;
const py = y * TILE;
if (cell === 1) {
ctx.fillStyle = '#1a1aff';
ctx.fillRect(px, py, TILE, TILE);
} else if (cell === 2) {
ctx.fillStyle = '#ffb8ae';
ctx.beginPath();
ctx.arc(px + TILE/2, py + TILE/2, 3, 0, Math.PI*2);
ctx.fill();
} else if (cell === 3) {
ctx.fillStyle = '#ffb8ae';
ctx.beginPath();
ctx.arc(px + TILE/2, py + TILE/2, 7, 0, Math.PI*2);
ctx.fill();
}
}
}
// Player
ctx.fillStyle = '#ffff00';
ctx.beginPath();
const px = player.x * TILE + TILE/2;
const py = player.y * TILE + TILE/2;
let startAngle = 0.2 * Math.PI;
let endAngle = 1.8 * Math.PI;
if (player.dir === 0) { startAngle = 1.3*Math.PI; endAngle = 0.7*Math.PI; }
else if (player.dir === 1) { startAngle = 1.8*Math.PI; endAngle = 1.2*Math.PI; }
else if (player.dir === 2) { startAngle = 0.2*Math.PI; endAngle = -0.2*Math.PI; }
ctx.arc(px, py, TILE/2-2, startAngle, endAngle);
ctx.lineTo(px, py);
ctx.fill();
// Ghosts
ghosts.forEach(g => {
cx = g.x * TILE + TILE/2;
cy = g.y * TILE + TILE/2;
ctx.fillStyle = powerMode && powerTimer > 0 ? (powerTimer < 60 && powerTimer%10<5 ? '#fff' : '#2222ff') : g.color;
ctx.beginPath();
ctx.arc(cx, cy-3, TILE/2-2, Math.PI, 0);
ctx.lineTo(cx+TILE/2-2, cy+TILE/2-2);
for (let i = 3; i >= 0; i--) {
const gx = cx + TILE/2-2 - i*(TILE-4)/3;
ctx.quadraticCurveTo(gx + (TILE-4)/6, cy+TILE/2-6, gx, cy+TILE/2-2);
}
ctx.fill();
// Eyes
ctx.fillStyle = '#fff';
ctx.beginPath();
ctx.arc(cx-4, cy-5, 3, 0, Math.PI*2);
ctx.arc(cx+4, cy-5, 3, 0, Math.PI*2);
ctx.fill();
ctx.fillStyle = '#00f';
ctx.beginPath();
ctx.arc(cx-3, cy-5, 1.5, 0, Math.PI*2);
ctx.arc(cx+5, cy-5, 1.5, 0, Math.PI*2);
ctx.fill();
});
// HUD
ctx.fillStyle = '#fff';
ctx.font = '16px monospace';
ctx.fillText('Score: '+score, 5, 240);
ctx.fillText('Lives: '+lives, canvas.width - 90, 240);
}

function update() {
if (gameState !== 'playing') return;
// Move player
const dirs = [[-1,0],[0,-1],[1,0],[0,1]];
const nx = player.x + dirs[player.dir][0];
const ny = player.y + dirs[player.dir][1];
if (canMove(nx, ny)) {
player.x = nx;
player.y = ny;
}
// Tunnel
if (player.x < 0) player.x = COLS - 1;
if (player.x >= COLS) player.x = 0;
// Eat dots
if (MAZE[player.y] && MAZE[player.y][player.x] === 2) {
MAZE[player.y][player.x] = 0;
score += 10;
dotsRemaining--;
} else if (MAZE[player.y] && MAZE[player.y][player.x] === 3) {
MAZE[player.y][player.x] = 0;
score += 50;
dotsRemaining--;
powerMode = true;
powerTimer = 240;
ghosts.forEach(g => g.mode = 'scared');
}
// Power timer
if (powerMode) {
powerTimer--;
if (powerTimer <= 0) {
powerMode = false;
ghosts.forEach(g => g.mode = 'chase');
}
}
// Check win
if (dotsRemaining <= 0) {
gameState = 'won';
return;
}
// Move ghosts
if (Math.random() < 0.4) {
ghosts.forEach(g => moveGhost(g));
}
// Check ghost collision
ghosts.forEach(g => {
if (g.x === player.x && g.y === player.y) {
if (g.mode === 'scared' && powerTimer > 0) {
g.x = 10;
g.y = 8;
g.mode = 'chase';
score += 200;
} else if (g.mode === 'chase') {
lives--;
if (lives <= 0) {
gameState = 'dead';
} else {
player.x = 10;
player.y = 16;
player.dir = 0;
ghosts.forEach((gh,i) => {
gh.x = 9+i;
gh.y = 8;
});
}
}
}
});
}

setInterval(update, 150);
setInterval(draw, 1000/30);
draw();
