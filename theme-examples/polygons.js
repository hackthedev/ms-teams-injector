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
let polygons = [];

// Resize canvas when window resizes
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Create floating polygons
function createPolygon() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    sides: Math.floor(Math.random() * 5 + 3), // 3 to 7 sides
    radius: Math.random() * 30 + 20,
    speedX: Math.random() * 0.5 - 0.25,
    speedY: Math.random() * 0.5 - 0.25,
    rotation: 0,
    rotationSpeed: Math.random() * 0.02 + 0.01
  };
}

for (let i = 0; i < 20; i++) {
  polygons.push(createPolygon());
}

// Draw floating polygons
function drawPolygons() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  polygons.forEach(polygon => {
    ctx.save();
    ctx.translate(polygon.x, polygon.y);
    ctx.rotate(polygon.rotation);
    ctx.beginPath();
    for (let i = 0; i < polygon.sides; i++) {
      const angle = (i / polygon.sides) * Math.PI * 2;
      const x = Math.cos(angle) * polygon.radius;
      const y = Math.sin(angle) * polygon.radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Update polygon position and rotation
    polygon.x += polygon.speedX;
    polygon.y += polygon.speedY;
    polygon.rotation += polygon.rotationSpeed;

    // Wrap around edges
    if (polygon.x > canvas.width) polygon.x = 0;
    if (polygon.x < 0) polygon.x = canvas.width;
    if (polygon.y > canvas.height) polygon.y = 0;
    if (polygon.y < 0) polygon.y = canvas.height;
  });

  requestAnimationFrame(drawPolygons);
}

// Start the polygon animation
drawPolygons();
