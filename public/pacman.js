const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const stageEl = document.getElementById("stage");
const highScoreEl = document.getElementById("highScore");
const heartsEl = document.getElementById("hearts");
const startScreen = document.getElementById("startScreen");
const winModal = document.getElementById("winModal");
const loseModal = document.getElementById("loseModal");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const retryBtn = document.getElementById("retryBtn");

let score = 0;
let currentStage = 1;
let highScore = localStorage.getItem('pacmanHighScore') || 0;
let lives = 3;
let gameState = 'MENU'; // MENU, PLAYING, WON, GAME_OVER

// Basic maze (1 = wall, 0 = pellet, 2 = empty, 3 = pacman start, 4 = ghost start)
// Row 9 is the tunnel row, so ends are open
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [2,2,2,2,0,1,2,1,1,1,2,2,2,2,2,1,1,1,2,1,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,0,0,1,2,4,4,4,4,4,4,4,2,1,0,0,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let TILE_SIZE = 24;
let COLS = map[0].length;
let ROWS = map.length;

function resizeCanvas() {
  const wrapper = document.querySelector('.canvas-wrapper');
  const maxWidth = wrapper.clientWidth;
  TILE_SIZE = Math.min(24, Math.floor(maxWidth / COLS));
  canvas.width = COLS * TILE_SIZE;
  canvas.height = ROWS * TILE_SIZE;
}

window.addEventListener('resize', resizeCanvas);

let pacman = { x: 0, y: 0, vx: 0, vy: 0, speed: 0.1, px: 0, py: 0, angle: 0 };
let ghosts = [];
let pellets = 0;
let gameMap = [];

function updateHearts() {
  let html = '';
  for(let i=0; i<3; i++) {
    html += `<i class="fas fa-heart ${i >= lives ? 'empty' : ''}"></i>`;
  }
  heartsEl.innerHTML = html;
}

function resetPositions() {
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      if (map[r][c] === 3) {
        pacman.x = c; pacman.y = r;
        pacman.px = c; pacman.py = r;
      }
    }
  }
  pacman.vx = 0; pacman.vy = 0;
  nextVx = 0; nextVy = 0;
  
  // reset ghosts
  let gIdx = 0;
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      if (map[r][c] === 4 && gIdx < ghosts.length) {
        ghosts[gIdx].x = c; ghosts[gIdx].y = r;
        ghosts[gIdx].px = c; ghosts[gIdx].py = r;
        ghosts[gIdx].vx = 1; ghosts[gIdx].vy = 0;
        gIdx++;
      }
    }
  }
}

function initGame(isRestart = true) {
  if (isRestart instanceof Event) isRestart = true;
  
  resizeCanvas();
  gameMap = [];
  ghosts = [];
  pellets = 0;
  
  if (isRestart) {
    score = 0;
    lives = 3;
    currentStage = 1;
  }
  
  gameState = 'PLAYING';
  
  highScoreEl.innerText = highScore;
  scoreEl.innerText = score;
  if (stageEl) stageEl.innerText = currentStage;
  updateHearts();
  startScreen.classList.remove('show');
  winModal.classList.remove('show');
  loseModal.classList.remove('show');
  
  let targetGhosts = 2;
  let initialSpeed = 0.05;
  if (currentStage === 2) {
    targetGhosts = 4;
    initialSpeed = 0.07;
  } else if (currentStage >= 3) {
    targetGhosts = 6;
    initialSpeed = 0.09;
  }
  
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
        if (ghosts.length < targetGhosts) {
          let colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852', '#00ff00', '#ff00ff'];
          ghosts.push({
            x: c, y: r, px: c, py: r, vx: 1, vy: 0, 
            speed: initialSpeed, 
            color: colors[ghosts.length % colors.length]
          });
        }
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
  if (gameState !== 'PLAYING') return;
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
document.getElementById('btnUp')?.addEventListener('mousedown', () => setDirection(0, -1));
document.getElementById('btnDown')?.addEventListener('mousedown', () => setDirection(0, 1));
document.getElementById('btnLeft')?.addEventListener('mousedown', () => setDirection(-1, 0));
document.getElementById('btnRight')?.addEventListener('mousedown', () => setDirection(1, 0));

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
retryBtn.addEventListener('click', initGame);

function isWall(x, y) {
  // Allow tunnel pass-through
  if (x < 0 || x >= COLS) return false; 
  if (y < 0 || y >= ROWS) return true;
  return gameMap[y][x] === 1;
}

function getLineOfSight(ghost) {
  if (ghost.y === pacman.y) {
    let minX = Math.min(ghost.x, pacman.x);
    let maxX = Math.max(ghost.x, pacman.x);
    let clear = true;
    for(let x = minX; x <= maxX; x++) {
      if (isWall(x, ghost.y)) { clear = false; break; }
    }
    if (clear) return { vx: Math.sign(pacman.x - ghost.x), vy: 0 };
  }
  if (ghost.x === pacman.x) {
    let minY = Math.min(ghost.y, pacman.y);
    let maxY = Math.max(ghost.y, pacman.y);
    let clear = true;
    for(let y = minY; y <= maxY; y++) {
      if (isWall(ghost.x, y)) { clear = false; break; }
    }
    if (clear) return { vx: 0, vy: Math.sign(pacman.y - ghost.y) };
  }
  return null;
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
      if (gameMap[ent.y] && gameMap[ent.y][ent.x] === 0) {
        gameMap[ent.y][ent.x] = 2; // set to empty
        score += 10;
        scoreEl.innerText = score;
        if (score > highScore) {
          highScore = score;
          highScoreEl.innerText = highScore;
          localStorage.setItem('pacmanHighScore', highScore);
        }
        pellets--;
        if (pellets === 0) {
          if (currentStage >= 3) {
            gameState = 'WON';
            winModal.classList.add('show');
          } else {
            currentStage++;
            initGame(false);
          }
        }
      }
    } else {
      // Ghost AI: Check Line of Sight
      let los = getLineOfSight(ent);
      let chase = false;
      
      let options = [];
      if (!isWall(ent.x+1, ent.y) && !(ent.vx===-1 && ent.vy===0)) options.push({vx:1, vy:0});
      if (!isWall(ent.x-1, ent.y) && !(ent.vx===1 && ent.vy===0)) options.push({vx:-1, vy:0});
      if (!isWall(ent.x, ent.y+1) && !(ent.vx===0 && ent.vy===-1)) options.push({vx:0, vy:1});
      if (!isWall(ent.x, ent.y-1) && !(ent.vx===0 && ent.vy===1)) options.push({vx:0, vy:-1});
      
      if (los) {
        // Only chase if the LOS direction is a valid move (not turning 180 directly unless dead end)
        let isValid = options.find(o => o.vx === los.vx && o.vy === los.vy);
        if (isValid) {
          ent.vx = los.vx; ent.vy = los.vy;
          chase = true;
        }
      }
      
      if (!chase) {
        if (options.length === 0) { // Dead end
          ent.vx *= -1; ent.vy *= -1;
        } else if (isWall(ent.x + ent.vx, ent.y + ent.vy) || Math.random() < 0.25) {
          // Change direction if hitting wall or randomly at intersection
          let smartChance = currentStage === 2 ? 0.4 : (currentStage >= 3 ? 0.7 : 0);
          let opt;
          if (Math.random() < smartChance) {
             opt = options.reduce((best, curr) => {
                 let currDist = Math.hypot(ent.x + curr.vx - pacman.x, ent.y + curr.vy - pacman.y);
                 let bestDist = Math.hypot(ent.x + best.vx - pacman.x, ent.y + best.vy - pacman.y);
                 return currDist < bestDist ? curr : best;
             });
          } else {
             opt = options[Math.floor(Math.random() * options.length)];
          }
          ent.vx = opt.vx; ent.vy = opt.vy;
        }
      }
    }
  }
  
  // Move
  ent.px += ent.vx * ent.speed;
  ent.py += ent.vy * ent.speed;
  
  // Wrap around tunnel
  if (ent.px < -0.5) { ent.px = COLS - 0.5; }
  if (ent.px > COLS - 0.5) { ent.px = -0.5; }
  
  // Update logical grid position
  ent.x = Math.round(ent.px);
  ent.y = Math.round(ent.py);

  // Wrap around logical
  if (ent.x < 0) ent.x = COLS - 1;
  if (ent.x >= COLS) ent.x = 0;
  
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
    if(!gameMap[r]) continue;
    for(let c=0; c<COLS; c++){
      if (gameMap[r][c] === 1) {
        ctx.fillStyle = "#1e2d4a"; // var(--border)
        ctx.fillRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);
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
  // If in menu, don't animate mouth
  if (gameState === 'PLAYING') {
    mouthOpen += 0.1 * mouthDir;
    if (mouthOpen >= 0.5 || mouthOpen <= 0) mouthDir *= -1;
  }
  
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
    
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.lineTo(cx + r, cy + r);
    
    ctx.lineTo(cx + r/3, cy + r - 3);
    ctx.lineTo(cx - r/3, cy + r);
    ctx.lineTo(cx - r, cy + r - 3);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(cx - r/2.5, cy - r/4, r/3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r/2.5, cy - r/4, r/3, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = "blue";
    ctx.beginPath(); ctx.arc(cx - r/2.5 + g.vx*2, cy - r/4 + g.vy*2, r/6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r/2.5 + g.vx*2, cy - r/4 + g.vy*2, r/6, 0, Math.PI*2); ctx.fill();
  });
}

function checkCollision() {
  ghosts.forEach(g => {
    // If distance is small enough
    let dx = pacman.px - g.px;
    let dy = pacman.py - g.py;
    // Handle tunnel wrapping distance
    if (Math.abs(dx) > COLS/2) dx = COLS - Math.abs(dx);
    
    if (Math.sqrt(dx*dx + dy*dy) < 0.8) {
      lives--;
      updateHearts();
      if (lives > 0) {
        resetPositions();
      } else {
        gameState = 'GAME_OVER';
        loseModal.classList.add('show');
      }
    }
  });
}

function loop() {
  if (gameState === 'PLAYING') {
    updateEntity(pacman, true);
    ghosts.forEach(g => {
      // Stage 1 ghosts speed up over time
      if (currentStage === 1 && g.speed < 0.12) {
        g.speed += 0.00001; 
      }
      updateEntity(g, false);
    });
    checkCollision();
  }
  
  // We still draw if MENU, WON, or GAME_OVER to keep background
  if (gameMap.length > 0) {
    drawMap();
    drawPacman();
    drawGhosts();
  }
  
  requestAnimationFrame(loop);
}

// Prepare background for menu
for(let r=0; r<ROWS; r++){
  gameMap[r] = [];
  for(let c=0; c<COLS; c++){
    gameMap[r][c] = map[r][c];
  }
}
for(let r=0; r<ROWS; r++){
  for(let c=0; c<COLS; c++){
    if (map[r][c] === 3) {
      pacman.x = c; pacman.y = r; pacman.px = c; pacman.py = r;
    }
    if (map[r][c] === 4) {
      let colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
      ghosts.push({x: c, y: r, px: c, py: r, vx: 1, vy: 0, speed: 0.08, color: colors[ghosts.length%4]});
    }
  }
}

resizeCanvas();
updateHearts();
highScoreEl.innerText = highScore;
requestAnimationFrame(loop);
