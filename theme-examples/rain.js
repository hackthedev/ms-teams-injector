// Create canvas and append to body
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// Set styles to make the canvas cover the entire viewport
Object.assign(canvas.style, {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  display: 'block',
  zIndex: '-1'
});

const ctx = canvas.getContext('2d');

// Resize canvas when window resizes
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Create array to store rain drops
let drops = [];

// Function to create rain drops
function createRain() {
  for (let i = 0; i < 300; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 6 + 2
    });
  }
}

// Function to draw rain effect
function drawRain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#9fc9e9';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  drops.forEach(drop => {
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x, drop.y + drop.length);
    ctx.stroke();
    
    // Update drop position
    drop.y += drop.speed;
    if (drop.y > canvas.height) {
      drop.y = -drop.length; // Reset when out of view
      drop.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(drawRain);
}

// Start rain effect
createRain();
drawRain();
