// ============================================
// CONSTELLATION BACKGROUND WITH MOUSE REVEAL
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  const constellationCanvas = document.getElementById("animation-canvas");
  const ctx = constellationCanvas.getContext("2d");

  let mouse = {
    x: null,
    y: null,
    radius: 150,
  };

  // Track mouse across entire viewport
  window.addEventListener("mousemove", function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("mouseout", function () {
    mouse.x = null;
    mouse.y = null;
  });

  // Canvas fills the full viewport
  function resizeCanvas() {
    constellationCanvas.width = window.innerWidth;
    constellationCanvas.height = window.innerHeight;
    constellationCanvas.style.width = "100%";
    constellationCanvas.style.height = "100%";
  }

  resizeCanvas();
  window.addEventListener("resize", function () {
    resizeCanvas();
    init();
  });

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = 2;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 30 + 1;
    }

    draw() {
      ctx.fillStyle = "rgba(99, 0, 16, 0.8)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {}
  }

  let particlesArray = [];

  function init() {
    particlesArray = [];
    let numberOfParticles =
      (constellationCanvas.width * constellationCanvas.height) / 6000;
    for (let i = 0; i < numberOfParticles; i++) {
      let x = Math.random() * constellationCanvas.width;
      let y = Math.random() * constellationCanvas.height;
      particlesArray.push(new Particle(x, y));
    }
  }

  init();

  function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          let distanceToMouseA = Math.sqrt(
            Math.pow(mouse.x - particlesArray[a].x, 2) +
              Math.pow(mouse.y - particlesArray[a].y, 2),
          );
          let distanceToMouseB = Math.sqrt(
            Math.pow(mouse.x - particlesArray[b].x, 2) +
              Math.pow(mouse.y - particlesArray[b].y, 2),
          );
          if (
            distanceToMouseA < mouse.radius ||
            distanceToMouseB < mouse.radius
          ) {
            opacityValue = 1 - distance / 100;
            ctx.strokeStyle = `rgba(99, 0, 16, ${opacityValue})`;
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

  function drawParticles() {
    for (let i = 0; i < particlesArray.length; i++) {
      let dx = mouse.x - particlesArray[i].x;
      let dy = mouse.y - particlesArray[i].y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, constellationCanvas.width, constellationCanvas.height);
    drawParticles();
    connect();
    requestAnimationFrame(animate);
  }

  animate();
});
