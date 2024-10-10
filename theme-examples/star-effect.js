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
  zIndex: '-1',
  background: 'black'
});

const ctx = canvas.getContext('2d');
const stars = [];

// Resize canvas when window resizes
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Create stars
function createStars() {
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      radius: Math.random() * 1.5,
      speed: Math.random() * 2 + 0.5
    });
  }
}

// Draw stars moving towards the viewer
function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    // Move stars towards viewer
    star.z -= star.speed;

    if (star.z <= 0) {
      star.z = canvas.width;
      star.x = Math.random() * canvas.width;
      star.y = Math.random() * canvas.height;
    }

    star.x += (star.x - canvas.width / 2) * (star.speed / 100);
    star.y += (star.y - canvas.height / 2) * (star.speed / 100);
  });

  requestAnimationFrame(drawStars);
}

// Start starfield animation
createStars();
drawStars();
