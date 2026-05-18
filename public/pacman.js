const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const winModal = document.getElementById("winModal");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let gameOver = false;
let gameWon = false;

// Basic maze (1 = wall, 0 = pellet, 2 = empty, 3 = pacman start, 4 = ghost start)
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,4,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,4,4,4,1,2,2,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,3,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let TILE_SIZE = 24;
let COLS = map[0].length;
let ROWS = map.length;

function resizeCanvas() {
  const wrapper = document.querySelector('.canvas-wrapper');
  const maxWidth = wrapper.clientWidth;
  
  // Calculate tile size to fit within max width while keeping aspect ratio
  // Base tile size is 24, but scale down if needed
  TILE_SIZE = Math.min(24, Math.floor(maxWidth / COLS));
  
  canvas.width = COLS * TILE_SIZE;
  canvas.height = ROWS * TILE_SIZE;
}

window.addEventListener('resize', resizeCanvas);

let pacman = { x: 0, y: 0, vx: 0, vy: 0, speed: 0.1, px: 0, py: 0, angle: 0 };
let ghosts = [];
let pellets = 0;
let gameMap = [];

function initGame() {
  resizeCanvas();
  gameMap = [];
  ghosts = [];
  pellets = 0;
  score = 0;
  gameOver = false;
  gameWon = false;
  scoreEl.innerText = score;
  winModal.classList.remove('show');
  
  for(let r=0; r<ROWS; r++){
    gameMap[r] = [];
    for(let c=0; c<COLS; c++){
      let v = map[r][c];
      if (v === 0) pellets++;
      if (v === 3) {
        pacman.x = c; pacman.y = r;
        pacman.px = c; pacman.py = r;
        pacman.vx = 0; pacman.vy = 0;
        v = 2;
      }
      if (v === 4) {
        ghosts.push({x: c, y: r, px: c, py: r, vx: 1, vy: 0, speed: 0.08, color: ['#ff0000', '#ffb8ff', '#00ffff'][ghosts.length%3]});
        v = 2;
      }
      gameMap[r][c] = v;
    }
  }
}

// Input handling
let nextVx = 0;
let nextVy = 0;

function setDirection(dx, dy) {
  nextVx = dx; nextVy = dy;
}

window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
  if (e.key === "ArrowUp") setDirection(0, -1);
  if (e.key === "ArrowDown") setDirection(0, 1);
  if (e.key === "ArrowLeft") setDirection(-1, 0);
  if (e.key === "ArrowRight") setDirection(1, 0);
});

// Mobile Controls
document.getElementById('btnUp')?.addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(0, -1); });
document.getElementById('btnDown')?.addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(0, 1); });
document.getElementById('btnLeft')?.addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(-1, 0); });
document.getElementById('btnRight')?.addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(1, 0); });
// Add mouse support for D-pad testing on desktop
document.getElementById('btnUp')?.addEventListener('mousedown', () => setDirection(0, -1));
document.getElementById('btnDown')?.addEventListener('mousedown', () => setDirection(0, 1));
document.getElementById('btnLeft')?.addEventListener('mousedown', () => setDirection(-1, 0));
document.getElementById('btnRight')?.addEventListener('mousedown', () => setDirection(1, 0));

restartBtn.addEventListener('click', () => {
  initGame();
});

function isWall(x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  return gameMap[y][x] === 1;
}

function updateEntity(ent, isPacman) {
  // If centered on a tile
  if (Math.abs(ent.px - ent.x) < 0.05 && Math.abs(ent.py - ent.y) < 0.05) {
    ent.px = ent.x; ent.py = ent.y;
    
    if (isPacman) {
      // Try to turn
      if ((nextVx !== 0 || nextVy !== 0) && !isWall(ent.x + nextVx, ent.y + nextVy)) {
        ent.vx = nextVx; ent.vy = nextVy;
      }
      // Stop if wall ahead
      if (isWall(ent.x + ent.vx, ent.y + ent.vy)) {
        ent.vx = 0; ent.vy = 0;
      }
      
      // Collect pellet
      if (gameMap[ent.y][ent.x] === 0) {
        gameMap[ent.y][ent.x] = 2; // set to empty
        score += 10;
        scoreEl.innerText = score;
        pellets--;
        if (pellets === 0) {
          gameWon = true;
          winModal.classList.add('show');
        }
      }
    } else {
      // Ghost AI: Random movement if at intersection or wall
      let options = [];
      if (!isWall(ent.x+1, ent.y) && !(ent.vx===-1 && ent.vy===0)) options.push({vx:1, vy:0});
      if (!isWall(ent.x-1, ent.y) && !(ent.vx===1 && ent.vy===0)) options.push({vx:-1, vy:0});
      if (!isWall(ent.x, ent.y+1) && !(ent.vx===0 && ent.vy===-1)) options.push({vx:0, vy:1});
      if (!isWall(ent.x, ent.y-1) && !(ent.vx===0 && ent.vy===1)) options.push({vx:0, vy:-1});
      
      if (options.length === 0) { // Dead end
        ent.vx *= -1; ent.vy *= -1;
      } else if (isWall(ent.x + ent.vx, ent.y + ent.vy) || Math.random() < 0.2) {
        // Change direction if hitting wall or randomly at intersection
        let opt = options[Math.floor(Math.random() * options.length)];
        ent.vx = opt.vx; ent.vy = opt.vy;
      }
    }
  }
  
  // Move
  ent.px += ent.vx * ent.speed;
  ent.py += ent.vy * ent.speed;
  
  // Update logical grid position
  ent.x = Math.round(ent.px);
  ent.y = Math.round(ent.py);

  // Wrap around tunnel
  if (ent.x < 0) { ent.px = COLS-1; ent.x = COLS-1; }
  if (ent.x >= COLS) { ent.px = 0; ent.x = 0; }
  
  if (isPacman) {
    if (ent.vx === 1) ent.angle = 0;
    if (ent.vx === -1) ent.angle = Math.PI;
    if (ent.vy === 1) ent.angle = Math.PI/2;
    if (ent.vy === -1) ent.angle = -Math.PI/2;
  }
}

function drawMap() {
  ctx.fillStyle = "#0f1525"; // var(--bg2)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      if (gameMap[r][c] === 1) {
        ctx.fillStyle = "#1e2d4a"; // var(--border)
        ctx.fillRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        // Inner border for cool look
        ctx.strokeStyle = "#3b82f6"; // var(--blue)
        ctx.lineWidth = 1.5;
        ctx.strokeRect(c*TILE_SIZE+2, r*TILE_SIZE+2, TILE_SIZE-4, TILE_SIZE-4);
      } else if (gameMap[r][c] === 0) {
        ctx.fillStyle = "#e2e8f0"; // var(--text)
        ctx.beginPath();
        ctx.arc(c*TILE_SIZE + TILE_SIZE/2, r*TILE_SIZE + TILE_SIZE/2, TILE_SIZE/6, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
}

let mouthOpen = 0;
let mouthDir = 1;

function drawPacman() {
  mouthOpen += 0.1 * mouthDir;
  if (mouthOpen >= 0.5 || mouthOpen <= 0) mouthDir *= -1;
  
  ctx.save();
  ctx.translate(pacman.px * TILE_SIZE + TILE_SIZE/2, pacman.py * TILE_SIZE + TILE_SIZE/2);
  ctx.rotate(pacman.angle);
  
  ctx.fillStyle = "#fbbf24"; // Yellow
  ctx.beginPath();
  let startAngle = mouthOpen * Math.PI;
  let endAngle = (2 - mouthOpen) * Math.PI;
  ctx.arc(0, 0, TILE_SIZE/2 - 2, startAngle, endAngle);
  ctx.lineTo(0,0);
  ctx.fill();
  ctx.restore();
}

function drawGhosts() {
  ghosts.forEach(g => {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    let cx = g.px * TILE_SIZE + TILE_SIZE/2;
    let cy = g.py * TILE_SIZE + TILE_SIZE/2;
    let r = TILE_SIZE/2 - 2;
    
    // Ghost body
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.lineTo(cx + r, cy + r);
    
    // Squiggly bottom
    ctx.lineTo(cx + r/3, cy + r - 3);
    ctx.lineTo(cx - r/3, cy + r);
    ctx.lineTo(cx - r, cy + r - 3);
    ctx.closePath();
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(cx - r/2.5, cy - r/4, r/3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r/2.5, cy - r/4, r/3, 0, Math.PI*2); ctx.fill();
    
    // Pupils
    ctx.fillStyle = "blue";
    ctx.beginPath(); ctx.arc(cx - r/2.5 + g.vx*2, cy - r/4 + g.vy*2, r/6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r/2.5 + g.vx*2, cy - r/4 + g.vy*2, r/6, 0, Math.PI*2); ctx.fill();
  });
}

function checkCollision() {
  ghosts.forEach(g => {
    let dx = pacman.px - g.px;
    let dy = pacman.py - g.py;
    if (Math.sqrt(dx*dx + dy*dy) < 0.8) {
      // Pacman dies (simplification: just reset pacman position to start)
      pacman.px = 9; pacman.py = 11; pacman.x = 9; pacman.y = 11;
      pacman.vx = 0; pacman.vy = 0;
      nextVx = 0; nextVy = 0;
      // Lose points
      score = Math.max(0, score - 50);
      scoreEl.innerText = score;
    }
  });
}

function loop() {
  if (!gameWon && !gameOver) {
    updateEntity(pacman, true);
    ghosts.forEach(g => updateEntity(g, false));
    checkCollision();
  }
  
  drawMap();
  drawPacman();
  drawGhosts();
  
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
