let projects = [];
let gravity = 0;
let restitution = 0.85;
let floorY;
let wallsX;
let hoveredProject = null;
let selectedProject = null;
let container;
let ballsReleased = false;
let isdragging=false
let isHoveringAny=false

const projectData = [
  {
    id: 1,
    title: "Bookflix",
    link: "bookflix.html",
  },
  {
    id: 2,
    title: "Tessera",
    link: "Tessera.html",
  },
  {
    id: 3,
    title: "Rant it out",
    link: "rantitout.html",
  },
  {
    id: 4,
    title: "Friends and Foes",
    link: "friendsandfoes.html",
  },
  {
    id: 5,
    title: "One Chorus Bot",
    link: "chorus.html",
  },
  // {
  //   id: 6,
  //   title: "Task Manager",
  //   link: "https://your-project-link-6.com",
  // }
];

function setup() {
  // Get the container div
  container = select('#projects-container');
  
  let canvas = createCanvas(container.width, container.height);
  canvas.parent('projects-container');
  
  floorY = height - 50;
  wallsX = 50;
  
  // Initialize projects
  projectData.forEach((project, index) => {
    createProject(project, index);
  });
}

function checkHeaderAndRelease() {
  // once the height is reached, this function is called from html and balls realse becomes true
  const header = document.querySelector('header');
  if (header && header.classList.contains('at-top') && !ballsReleased) {
    ballsReleased = true;
    gravity = 0.4;
  }
}

function createProject(data) {
  let radius = 150 + random(-30, 20); 

  let project = {
    id: data.id,
    x: random(wallsX + radius, width - wallsX - radius),
    y: random(150, 300),
    vx: (random() - 0.5) * 1.5,
    vy: 0,
    radius: radius,
    color: '#630010D1',
    title: data.title,
    shortTitle: data.title.length > 15 ? data.title.substring(0, 15) + "..." : data.title,
    link: data.link,
    isHovered: false,
    isSelected: false
  };
  
  projects.push(project);
}

function draw() {
  background(255, 255, 255);
  
  checkHeaderAndRelease();

  // Update and draw projects
  hoveredProject = null;
  
  for (let project of projects) {
    project.isHovered = false;
    
    // Check if mouse is over this project
    let d = dist(mouseX, mouseY, project.x, project.y);
    if (d < project.radius) {
      project.isHovered = true;
      hoveredProject = project;
      isHoveringAny = true;
    }
    if (isHoveringAny) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
    
    if (ballsReleased && !project.isSelected) {
      project.vy += gravity;
      project.x += project.vx;
      project.y += project.vy;
      
      // Floor collision
      if (project.y + project.radius > floorY) {
        project.y = floorY - project.radius;
        project.vy *= -restitution;
        project.vx *= 0.98;
      }
      
      // Wall collisions
      if (project.x - project.radius < wallsX) {
        project.x = wallsX + project.radius;
        project.vx *= -restitution;
      }
      
      if (project.x + project.radius > width - wallsX) {
        project.x = width - wallsX - project.radius;
        project.vx *= -restitution;
      }
    }
    
    // Draw project ball with title
    drawProjectBallWithTitle(project);
  }
  
  // Reset cursor if not hovering
  if (!hoveredProject) {
    cursor(ARROW);
  }
    
  // Draw UI elements
  drawUI();
}

function drawProjectBallWithTitle(project) {
  push();
  
  if (project.isHovered || project.isSelected) {
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(99, 0, 16, 0.9)'; // Match your color
  }
  
  // Draw ball
  fill(project.color);
  noStroke();
  ellipse(project.x, project.y, project.radius * 2);
  
  // Draw project title on ball
  fill(255, 255, 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  
  // Title with wrapping
  let titleSize = project.radius * 0.18;
  textSize(titleSize);
  
  // Split title if it's too long
  let titleLines = [];
  let words = project.title.split(' ');
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
  
  // Draw title lines
  let lineHeight = titleSize * 1.2;
  let startY = project.y - ((titleLines.length - 1) * lineHeight) / 2;
  
  for (let i = 0; i < titleLines.length; i++) {
    text(titleLines[i], project.x, startY + (i * lineHeight));
  }
    
  pop();
}

function drawUI() {
  // Draw instructions (only visible when needed)
  if (hoveredProject || selectedProject) {
    fill(0, 0, 0, 200);
    noStroke();
    rect(0, height - 40, width, 40);
    
    fill(255, 255, 255);
    textSize(12);
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);
    text("Click to open project • Drag to reposition • Space to reset", 20, height - 20);
    
    textAlign(RIGHT, CENTER);
    text(`Gravity: ${gravity.toFixed(2)} • Bounce: ${restitution.toFixed(2)}`, width - 20, height - 20);
  }
}

function mousePressed() {
  if (hoveredProject) {
    // Deselect all others
    projects.forEach(p => p.isSelected = false);
    // Select clicked project
    hoveredProject.isSelected = true;
    selectedProject = hoveredProject;
    isdragging=true
    
    // Open project link when clicked
    if (hoveredProject.link && hoveredProject.link !== "#") {
      window.open(hoveredProject.link, '_self');
    }
  } else {
    // Deselect if clicking empty space
    projects.forEach(p => p.isSelected = false);
    selectedProject = null;
  }
}

function mouseDragged() {
  if (selectedProject && isdragging) {
    selectedProject.x = mouseX;
    selectedProject.y = mouseY;
    selectedProject.vx = 0;
    selectedProject.vy = 0;
  }
}

function mouseReleased(){
  selectedProject=null
  isdragging=false
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    gravity = min(gravity + 0.05, 1);
  } else if (keyCode === DOWN_ARROW) {
    gravity = max(gravity - 0.05, 0);
  } else if (keyCode === LEFT_ARROW) {
    restitution = max(restitution - 0.05, 0.1);
  } else if (keyCode === RIGHT_ARROW) {
    restitution = min(restitution + 0.05, 0.95);
  } else if (key === ' ') {
    // Reset all projects
    projects.forEach(p => {
      p.x = random(wallsX + p.radius, width - wallsX - p.radius);
      p.y = random(150, 300);
      p.vx = (random() - 0.5) * 1.5;
      p.vy = 0;
      p.isSelected = false;
    });
    selectedProject = null;
  } else if (key === 'r' || key === 'R') {
    gravity = 0.4;
    restitution = 0.85;
  }
}

function windowResized() {
  resizeCanvas(container.width, container.height);
  floorY = height - 50;
  wallsX = 50;
}

function toggleMenu(x) {
  // Toggle the animation class on the hamburger icon
  x.classList.toggle("change");
  
  // Get the menu items container
  var menuItems = document.getElementById("menuItems");
  
  // Simple toggle without animation
  if (menuItems.style.display === "block") {
    menuItems.style.display = "none";
  } else {
    menuItems.style.display = "block";
  }
}

