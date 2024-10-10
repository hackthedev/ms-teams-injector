// Create a div element for the background
const background = document.createElement('div');
document.body.appendChild(background);

// Set styles to make the background cover the entire viewport
Object.assign(background.style, {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  display: 'block',
  zIndex: '-1',
  transition: 'background 0.1s ease' // Fast transitions for smooth effect
});

// Variables to hold the RGB values for two colors in the gradient
let r1 = 255, g1 = 0, b1 = 0; // First color
let r2 = 0, g2 = 0, b2 = 255; // Second color

// Variables to control the direction of color change for both colors
let phase1 = 0;
let phase2 = 3; // Start with a different phase for second color

// Function to update the RGB values for a smooth rainbow transition
function updateColor() {
  // Transition for the first color
  if (phase1 === 0) {
    g1 += 1; if (g1 >= 255) phase1 = 1;
  } else if (phase1 === 1) {
    r1 -= 1; if (r1 <= 0) phase1 = 2;
  } else if (phase1 === 2) {
    b1 += 1; if (b1 >= 255) phase1 = 3;
  } else if (phase1 === 3) {
    g1 -= 1; if (g1 <= 0) phase1 = 4;
  } else if (phase1 === 4) {
    r1 += 1; if (r1 >= 255) phase1 = 5;
  } else if (phase1 === 5) {
    b1 -= 1; if (b1 <= 0) phase1 = 0;
  }

  // Transition for the second color (same logic, different phase)
  if (phase2 === 0) {
    g2 += 1; if (g2 >= 255) phase2 = 1;
  } else if (phase2 === 1) {
    r2 -= 1; if (r2 <= 0) phase2 = 2;
  } else if (phase2 === 2) {
    b2 += 1; if (b2 >= 255) phase2 = 3;
  } else if (phase2 === 3) {
    g2 -= 1; if (g2 <= 0) phase2 = 4;
  } else if (phase2 === 4) {
    r2 += 1; if (r2 >= 255) phase2 = 5;
  } else if (phase2 === 5) {
    b2 -= 1; if (b2 <= 0) phase2 = 0;
  }

  // Update the background gradient with the two colors
  background.style.background = `linear-gradient(135deg, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`;

  // Call this function on the next animation frame for a smooth transition
  requestAnimationFrame(updateColor);
}

// Start the color update loop
updateColor();
