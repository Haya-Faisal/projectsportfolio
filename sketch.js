let projects = [];
let gravity = 0;
let gravityTarget = 0.4;
const GRAVITY_MAX = 1.0;
let restitution = 0.85;
let floorY;
let wallsX;
let hoveredProject = null;
let selectedProject = null;
let container;
let ballsReleased = false;
let isdragging = false;
let isHoveringAny = false;

let needleVal    = 0.4;
let needleTarget = 0.4;

let hintAlpha = 200;
let hintTimer = 0;
const HINT_HOLD = 180;
const HINT_FADE = 90;

const projectData = [
  { id: 1, title: "Bookflix",        link: "bookflix.html"       },
  { id: 2, title: "Tessera",         link: "tessera.html"        },
  { id: 3, title: "Rant it out",     link: "rantitout.html"      },
  { id: 4, title: "Friends and Foes",link: "friendsandfoes.html" },
  { id: 5, title: "One Chorus Bot",  link: "chorus.html"         },
];

function setup() {
  container = select('#projects-container');
  let canvas = createCanvas(container.width, container.height);
  canvas.parent('projects-container');

  floorY = height - 50;
  wallsX = 50;

  projectData.forEach((project, index) => {
    createProject(project, index);
  });

  textFont('Crimson Pro');
  drawingContext.letterSpacing = '1px'
}

function checkHeaderAndRelease() {
  const header = document.querySelector('header');
  if (header && header.classList.contains('at-top') && !ballsReleased) {
    ballsReleased = true;
    gravityTarget = 0.4;
    needleTarget  = 0.4;
  }
}

function createProject(data) {
  let radius = 150 + random(-30, 20);

  let project = {
    id:         data.id,
    x:          random(wallsX + radius, width - wallsX - radius),
    y:          random(150, 300),
    vx:         (random() - 0.5) * 1.5,
    vy:         0,
    radius:     radius,
    color:      '#630010D1',
    title:      data.title,
    shortTitle: data.title.length > 15 ? data.title.substring(0, 15) + "..." : data.title,
    link:       data.link,
    isHovered:  false,
    isSelected: false
  };

  projects.push(project);
}

function draw() {
  background(255, 255, 255);

  checkHeaderAndRelease();

  // Smoothly lerp gravity and needle toward their targets
  gravity   = lerp(gravity,   gravityTarget, 0.08);
  needleVal = lerp(needleVal, needleTarget,  0.08);

  hoveredProject = null;
  isHoveringAny  = false;

  for (let project of projects) {
    project.isHovered = false;

    // Hover detection
    let d = dist(mouseX, mouseY, project.x, project.y);
    if (d < project.radius) {
      project.isHovered = true;
      hoveredProject    = project;
      isHoveringAny     = true;
    }

    // Physics
    if (ballsReleased && !project.isSelected) {

      // Zero-G drift — random nudge when gravity is near zero
      if (gravity < 0.05) {
        project.vx += random(-0.09, 0.09);
        project.vy += random(-0.09, 0.09);

        // Cap speed so balls don't rocket off
        let speed = sqrt(project.vx * project.vx + project.vy * project.vy);
        if (speed > 1.5) {
          project.vx = (project.vx / speed) * 1.5;
          project.vy = (project.vy / speed) * 1.5;
        }
      }

      project.vy += gravity;
      project.x  += project.vx;
      project.y  += project.vy;

      // Floor
      if (project.y + project.radius > floorY) {
        project.y   = floorY - project.radius;
        project.vy *= -restitution;
        project.vx *= 0.98;
      }

      // Ceiling
      if (project.y - project.radius < 0) {
        project.y   = project.radius;
        project.vy *= -restitution;
      }

      // Left wall
      if (project.x - project.radius < wallsX) {
        project.x   = wallsX + project.radius;
        project.vy *= -restitution;
      }

      // Right wall
      if (project.x + project.radius > width - wallsX) {
        project.x   = width - wallsX - project.radius;
        project.vy *= -restitution;
      }
    }

    drawProjectBallWithTitle(project);
  }

  // Cursor
  if (isHoveringAny) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }

  drawSpeedometer(80, 120, 70);
  drawKeyboardHint(50, 145,70)
}

function drawKeyboardHint(cx, cy, r) {
  push();
  
  // Left arrow
  let leftX = cx -20;
  let leftY = cy;
  let leftSize = 30;
  
  // Check if mouse is hovering over left arrow
  let hoverLeft = dist(mouseX, mouseY, leftX, leftY) < leftSize / 2;
  
  // Background circle
  if (hoverLeft) {
    fill(97, 0, 16);
    cursor(HAND);
  } else {
    fill(255, 255, 255);
  }
  stroke(97, 0, 16);
  strokeWeight(1.5);
  circle(leftX, leftY, leftSize);
  
  // Arrow symbol
  fill(hoverLeft ? 255 : color(97, 0, 16));
  noStroke();
  textSize(20);
  textAlign(CENTER, CENTER);
  text('←', leftX, leftY);
  
  // Right arrow
  let rightX = cx + r + 20;
  let rightY = cy;
  let rightSize = 30;
  
  // Check if mouse is hovering over right arrow
  let hoverRight = dist(mouseX, mouseY, rightX, rightY) < rightSize / 2;
  
  // Background circle
  if (hoverRight) {
    fill(97, 0, 16);
    cursor(HAND);
  } else {
    fill(255, 255, 255);
  }
  stroke(97, 0, 16);
  strokeWeight(1.5);
  circle(rightX, rightY, rightSize);
  
  // Arrow symbol
  fill(hoverRight ? 255 : color(97, 0, 16));
  noStroke();
  textSize(20);
  textAlign(CENTER, CENTER);
  text('→', rightX, rightY);
  
  pop();
}

function drawSpeedometer(cx, cy, r) {
  
  push();
  translate(cx, cy);

  const startAngle = PI;
  const endAngle   = TWO_PI;
  const totalArc   = PI;

  // Outer arc
  noFill();
  let col = lerpColor(
    color(222, 148, 160),
    color(97,0,16),
    needleVal
  );
  stroke(col);
  strokeWeight(1);
  arc(0, 0, r * 2, r * 2, startAngle, endAngle);

  // Tick marks
  const ticks = 10;
  for (let i = 0; i <= ticks; i++) {
    let t       = i / ticks;
    let angle   = startAngle + t * totalArc;
    let isMajor = (i % 5 === 0);
    let inner   = isMajor ? r - 14 : r - 8;
    let x1 = cos(angle) * inner;
    let y1 = sin(angle) * inner;
    let x2 = cos(angle) * r;
    let y2 = sin(angle) * r;

    stroke(col, isMajor ? 200 : 90);
    strokeWeight(isMajor ? 1.5 : 0.8);
    line(x1, y1, x2, y2);
  }

  // Needle
  let needleAngle = startAngle + needleVal * totalArc;
  let nx = cos(needleAngle) * (r - 10);
  let ny = sin(needleAngle) * (r - 10);

  stroke(97,0,16);
  strokeWeight(1.5);
  line(0, 0, nx, ny);

  // Pivot dot
  fill(255);
  noStroke();
  circle(0, 0, 6);

  // Gravity value
  fill(97,0,16);
  noStroke();
  textSize(24);
  textAlign(CENTER, CENTER);
  text(nf(gravity, 1, 2), 0, 28);

  // Label
  fill(97,0,16);
  textSize(24);
  text('GRAVITY', 0, -85);
  

  pop();
}

function drawProjectBallWithTitle(project) {
  push();

  if (project.isHovered || project.isSelected) {
    drawingContext.shadowBlur  = 20;
    drawingContext.shadowColor = 'rgba(99, 0, 16, 0.9)';
  }

  fill(project.color);
  noStroke();
  ellipse(project.x, project.y, project.radius * 2);

  fill(255, 255, 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  let titleSize = project.radius * 0.18;
  textSize(titleSize);

  let titleLines  = [];
  let words       = project.title.split(' ');
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    let testLine = currentLine + ' ' + words[i];
    if (textWidth(testLine) < project.radius * 1.2) {
      currentLine = testLine;
    } else {
      titleLines.push(currentLine);
      currentLine = words[i];
    }
  }
  titleLines.push(currentLine);

  let lineHeight = titleSize * 1.2;
  let startY     = project.y - ((titleLines.length - 1) * lineHeight) / 2;

  for (let i = 0; i < titleLines.length; i++) {
    text(titleLines[i], project.x, startY + i * lineHeight);
  }

  pop();
}

function mousePressed() {
  if (hoveredProject) {
    projects.forEach(p => p.isSelected = false);
    hoveredProject.isSelected = true;
    selectedProject           = hoveredProject;
    isdragging                = true;

    if (hoveredProject.link && hoveredProject.link !== "#") {
      window.open(hoveredProject.link, '_self');
    }
  } else {
    projects.forEach(p => p.isSelected = false);
    selectedProject = null;
  }

  let keyboardCx = 50;
  let keyboardCy = 145;
  let keyboardR = 70;
  
  let leftX = keyboardCx - 20;
  let leftY = keyboardCy;
  
  let rightX = keyboardCx + keyboardR + 20;
  let rightY = keyboardCy;
  
  // Click left arrow
  if (dist(mouseX, mouseY, leftX, leftY) < 15) {
    gravityTarget = max(gravityTarget - 0.05, 0);
    needleTarget  = gravityTarget / GRAVITY_MAX;
    return; // don't process ball clicks if we clicked an arrow
  }
  
  // Click right arrow
  if (dist(mouseX, mouseY, rightX, rightY) < 15) {
    gravityTarget = min(gravityTarget + 0.05, GRAVITY_MAX);
    needleTarget  = gravityTarget / GRAVITY_MAX;
    return; // don't process ball clicks if we clicked an arrow
  }
}

function mouseDragged() {
  if (selectedProject && isdragging) {
    selectedProject.x  = mouseX;
    selectedProject.y  = mouseY;
    selectedProject.vx = 0;
    selectedProject.vy = 0;
  }
}

function mouseReleased() {
  selectedProject = null;
  isdragging      = false;
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    gravityTarget = min(gravityTarget + 0.05, GRAVITY_MAX);
    needleTarget  = gravityTarget / GRAVITY_MAX;
    hintTimer     = 0;  // keep hint visible while user is playing

  } else if (keyCode === LEFT_ARROW) {
    gravityTarget = max(gravityTarget - 0.05, 0);
    needleTarget  = gravityTarget / GRAVITY_MAX;
    hintTimer     = 0;

  } else if (key === ' ') {
    projects.forEach(p => {
      p.x  = random(wallsX + p.radius, width - wallsX - p.radius);
      p.y  = random(150, 300);
      p.vx = (random() - 0.5) * 1.5;
      p.vy = 0;
      p.isSelected = false;
    });
    selectedProject = null;

  } else if (key === 'r' || key === 'R') {
    gravityTarget = 0.4;
    needleTarget  = 0.4;
  }
}

function windowResized() {
  resizeCanvas(container.width, container.height);
  floorY = height - 50;
  wallsX = 50;
}

function toggleMenu(x) {
  x.classList.toggle("change");
  var menuItems = document.getElementById("menuItems");
  if (menuItems.style.display === "block") {
    menuItems.style.display = "none";
  } else {
    menuItems.style.display = "block";
  }
}
