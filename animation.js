// ============================================
// CONSTELLATION BACKGROUND WITH MOUSE REVEAL
// Modified for header-only display
// ============================================

// Wait for DOM to be ready before running
document.addEventListener('DOMContentLoaded', function() {

// Get the canvas element and set up 2D context
const constellationCanvas = document.getElementById('animation-canvas');
const ctx = constellationCanvas.getContext('2d');

// Get the header element to constrain the canvas
const header = document.querySelector('header');

// Store mouse position
let mouse = {
    x: null,
    y: null,
    radius: 150 // How far from mouse the effect reveals (adjust this!)
};

// Track mouse movement
window.addEventListener('mousemove', function(event) {
    // Get header's position and dimensions
    const headerRect = header.getBoundingClientRect();
    
    // Only track mouse if it's inside the header area
    if (event.clientY >= headerRect.top && 
        event.clientY <= headerRect.bottom &&
        event.clientX >= headerRect.left && 
        event.clientX <= headerRect.right) {
        
        // Convert mouse coordinates to be relative to the canvas/header
        mouse.x = event.clientX - headerRect.left;
        mouse.y = event.clientY - headerRect.top;
    } else {
        mouse.x = null;
        mouse.y = null;
    }
});

// Reset mouse position when it leaves the window
window.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
});

// Make canvas match header size
function resizeCanvas() {
    const headerRect = header.getBoundingClientRect();
    constellationCanvas.width = headerRect.width;
    constellationCanvas.height = headerRect.height;
    
    // Set canvas to fill the header
    constellationCanvas.style.width = '100%';
    constellationCanvas.style.height = '100%';
}

// Call resize on load and when window resizes
resizeCanvas();
window.addEventListener('resize', function() {
    resizeCanvas();
    init(); // Regenerate particles when window resizes
});

// Also resize when scrolling (since header moves)
let resizeTimeout;
window.addEventListener('scroll', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

// ============================================
// PARTICLE/NODE CLASS
// ============================================
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 2; // Size of each dot/node
        this.baseX = this.x; // Store original position
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1; // For subtle floating effect
    }

    // Draw the particle
    draw() {
        // Use your accent color with some transparency
        ctx.fillStyle = 'rgba(99, 0, 16, 0.8)'; // Matches your --accent color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    // Update particle position (optional - adds subtle floating)
    update() {
        // Optional: Make particles drift slightly
        // Uncomment below for subtle floating effect
        /*
        this.x += Math.sin(Date.now() * 0.001 + this.density) * 0.3;
        this.y += Math.cos(Date.now() * 0.001 + this.density) * 0.3;
        */
    }
}

// ============================================
// INITIALIZE PARTICLES
// ============================================
let particlesArray = [];

function init() {
    particlesArray = [];
    
    // Calculate how many particles based on header size
    // Using smaller divisor since header is smaller than full screen
    let numberOfParticles = (constellationCanvas.width * constellationCanvas.height) / 6000; // Adjust density here!
    
    // Create particles at random positions within the canvas
    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * constellationCanvas.width;
        let y = Math.random() * constellationCanvas.height;
        particlesArray.push(new Particle(x, y));
    }
}

init();

// ============================================
// CONNECT PARTICLES WITH LINES
// ============================================
function connect() {
    let opacityValue = 1;
    
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            // Calculate distance between two particles
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only connect if particles are close enough
            if (distance < 100) { // Max connection distance - adjust this!
                
                // Check if either particle is near the mouse
                let distanceToMouseA = Math.sqrt(
                    Math.pow(mouse.x - particlesArray[a].x, 2) + 
                    Math.pow(mouse.y - particlesArray[a].y, 2)
                );
                let distanceToMouseB = Math.sqrt(
                    Math.pow(mouse.x - particlesArray[b].x, 2) + 
                    Math.pow(mouse.y - particlesArray[b].y, 2)
                );
                
                // Only draw connection if near mouse
                if (distanceToMouseA < mouse.radius || distanceToMouseB < mouse.radius) {
                    opacityValue = 1 - (distance / 100);
                    
                    // Draw the connecting line - using your accent color
                    ctx.strokeStyle = `rgba(99, 0, 16, ${opacityValue})`; // Line color matches your theme
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }
}

// ============================================
// DRAW PARTICLES NEAR MOUSE
// ============================================
function drawParticles() {
    for (let i = 0; i < particlesArray.length; i++) {
        // Calculate distance from particle to mouse
        let dx = mouse.x - particlesArray[i].x;
        let dy = mouse.y - particlesArray[i].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only draw particles near the mouse
        if (distance < mouse.radius) {
            particlesArray[i].draw();
            particlesArray[i].update();
        }
    }
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    // Clear the canvas
    ctx.clearRect(0, 0, constellationCanvas.width, constellationCanvas.height);
    
    // Draw particles and connections only where mouse is
    drawParticles();
    connect();
    
    // Keep the animation running
    requestAnimationFrame(animate);
}

// Start the animation
animate();

}); // Close DOMContentLoaded

// ============================================
// CUSTOMIZATION GUIDE
// ============================================
/*
EASY TWEAKS YOU CAN MAKE:

1. REVEAL RADIUS (line 16):
   mouse.radius = 150; 
   - Increase for bigger reveal area
   - Decrease for smaller spotlight effect

2. PARTICLE DENSITY (line 109):
   numberOfParticles = (canvas.width * canvas.height) / 6000;
   - Smaller divisor = more particles (try 4000 for denser)
   - Larger divisor = fewer particles (try 8000 for sparser)

3. CONNECTION DISTANCE (line 136):
   if (distance < 100)
   - Increase to connect particles farther apart
   - Decrease for shorter connections

4. NODE COLOR (line 90):
   ctx.fillStyle = 'rgba(99, 0, 16, 0.8)';
   - Currently matches your --accent color (#630010)
   - Change RGB values for different color
   - Last number (0.8) is opacity

5. LINE COLOR (line 153):
   ctx.strokeStyle = `rgba(99, 0, 16, ${opacityValue})`;
   - Currently matches your --accent color
   - Change RGB values for different line color

6. NODE SIZE (line 83):
   this.size = 2;
   - Increase for bigger dots

7. ENABLE FLOATING (line 97-100):
   - Uncomment those lines for gentle drift effect

ALTERNATIVE COLOR IDEAS:
- Lighter burgundy: rgba(150, 30, 50, 0.8)
- Gold accent: rgba(218, 165, 32, 0.8)
- White/silver: rgba(255, 255, 255, 0.6)
*/