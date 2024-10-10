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
  background: 'black' // Dark background for contrast
});

const ctx = canvas.getContext('2d');
let particles = [];

// Resize canvas when window resizes
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Custom words to display
const customWords = ['BLACK', 'OPS', 'DATA', 'ENCRYPT', 'ACCESS', 'PROTOCOL', '193785', '886179'];

// Generate random letters and numbers
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Create particles with both random characters and custom words
function createParticles() {
  const particleCount = 100; // Change this value to adjust the number of particles
  for (let i = 0; i < particleCount; i++) {
    const isCustomWord = Math.random() < 0.05; // 5% chance of custom word (appears less often)
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      char: isCustomWord ? customWords[Math.floor(Math.random() * customWords.length)] : chars.charAt(Math.floor(Math.random() * chars.length)), // Random or custom
      isCustom: isCustomWord, // Track if it's a custom word
      size: Math.random() * 20 + 10, // Initial size
      maxSize: Math.random() * 100 + 50, // Final size as they "approach"
      speed: Math.random() * 1 + 0.5, // Speed at which they grow
      opacity: Math.random() * 0.6 + 0.4, // Random initial opacity
      blur: Math.random() * 15 + 5, // Random blur for glow effect
      flickerTime: Math.random() * 100 + 100, // Flicker duration before respawn
      changeInterval: Math.floor(Math.random() * 100) + 30 // Interval before changing
    });
  }
}

// Draw particles with changing characters
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle, index) => {
    ctx.save();
    
    // Apply blur effect for glow
    ctx.shadowBlur = particle.blur;
    ctx.shadowColor = `rgba(255, 0, 0, ${particle.opacity})`;

    // Set the font size based on particle size
    ctx.font = `${particle.size}px monospace`;

    // Apply red color with opacity for the numbers/letters
    ctx.fillStyle = `rgba(255, 0, 0, ${particle.opacity})`;

    // Draw the character or word at its current size and position
    ctx.fillText(particle.char, particle.x, particle.y);

    // Grow the character and reduce opacity slightly for fading
    particle.size += particle.speed;
    particle.opacity -= 0.01;

    // Change the character randomly during its lifetime
    if (!particle.isCustom && particle.changeInterval > 0) {
      particle.changeInterval--;
    } else if (!particle.isCustom && particle.changeInterval <= 0) {
      // Change to a new random character after interval
      particle.char = chars.charAt(Math.floor(Math.random() * chars.length));
      particle.changeInterval = Math.floor(Math.random() * 100) + 30; // Reset interval
    }

    // Respawn particle when it fades out or grows too large
    if (particle.size >= particle.maxSize || particle.opacity <= 0) {
      const isCustomWord = Math.random() < 0.01; // 5% chance of custom word
      particles[index] = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: isCustomWord ? customWords[Math.floor(Math.random() * customWords.length)] : chars.charAt(Math.floor(Math.random() * chars.length)),
        isCustom: isCustomWord,
        size: Math.random() * 20 + 10,
        maxSize: Math.random() * 100 + 50,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.6 + 0.4,
        blur: Math.random() * 15 + 5,
        flickerTime: Math.random() * 100 + 100,
        changeInterval: Math.floor(Math.random() * 100) + 30
      };
    }

    ctx.restore();
  });

  requestAnimationFrame(drawParticles);
}

// Start the effect
createParticles();
drawParticles();
