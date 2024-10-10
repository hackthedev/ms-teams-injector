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

// Matrix effect setup
const characters = '0123456789ABCDEF'; // The characters that will "fall"
const fontSize = 16;                   // Font size for the falling characters
const columns = Math.floor(window.innerWidth / fontSize); // Number of columns
const drops = Array(columns).fill(0);  // Initialize drops for each column

// Function to draw the matrix effect
function drawMatrix() {
  // Set the background with a slight transparency for trail effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set the text color and font
  ctx.fillStyle = '#00FF00';
  ctx.font = `${fontSize}px monospace`;

  // Loop over drops and draw each character
  drops.forEach((y, i) => {
    const text = characters[Math.floor(Math.random() * characters.length)];
    const x = i * fontSize;

    // Draw the character
    ctx.fillText(text, x, y * fontSize);

    // Randomly reset drops after they hit the bottom
    if (y * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    // Increment the Y coordinate for the drop
    drops[i]++;
  });

  // Repeat the animation
  requestAnimationFrame(drawMatrix);
}

// Start the matrix animation
drawMatrix();
