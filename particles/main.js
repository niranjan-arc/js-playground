// class: Color
class Color {
    constructor(r, g, b) {
        this.r = r; this.g = g; this.b = b;
    }

    get rgb() {
        return this.r + "," + this.g + "," + this.b;
    }

    get color() {
        return "rgb("+ this.rgb + ")";
    }

    gradualShift(direction) {
        this.r = Math.floor(Math.abs(Math.cos(direction * 0.75) * 256));
        this.g = Math.floor(Math.abs(Math.sin(direction * 0.25) * 256));
        this.b = Math.floor(Math.abs(Math.sin(direction * 0.5) * 256));
    }
}

// class: Particle
class Particle {
    constructor(x, y, rgb, radius) {
        this.radius = radius != undefined ? radius : 10;
        this.reset(x, y, rgb);
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = "rgba(" + this.rgb + "," + this.alpha + ")";
        context.fill();
        context.closePath();
    }

    reset(x, y, rgb) {
        this.x = x;
        this.y = y;
        this.rgb = rgb;
        this.alpha = 1;
        this.vx = Math.random() * 1 - 0.5;
        this.vy = Math.random() * 1 - 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.01;
    }

    get isAlive() {
        return this.alpha > 0;
    }
}

// global constants
const context = document.getElementById('canvas').getContext('2d', { alpha:false });
const p = document.getElementById('p');

// global variables
var pool = [];
var particles = [];
var direction = 0;
var color = new Color(0, 0, 0);
var pointer = { x: 0, y: 0, down: false };

// handlers
function handleMouse(event) {
    event.preventDefault();
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    switch(event.type) {
        case "mousedown":
            pointer.down = true;
            break;
        
        case "mouseup":
            pointer.down = false;
    }
}

function resize(event) {
    context.canvas.height = document.documentElement.clientHeight - 16;
    context.canvas.width  = document.documentElement.clientWidth  - 16;
}

// functions
function addParticle() {
    var count = 2;
    for(var index = 0; index < count; ++index) {
        var particle = pool.pop();
        if(particle != undefined) {
            particle.reset(pointer.x, pointer.y, color.rgb);
            particles.push(particle);
        }
        else {
            particles.push(new Particle(pointer.x, pointer.y, color.rgb));
        }
    }
}

function draw() {
    // context.fillStyle = color.color;
    for(index = 0; index < particles.length; ++index) {
        particle = particles[index];
        particle.draw();
    }
}

function update() {
    for(var index = particles.length - 1; index > -1; --index) {
        particle = particles[index];
        particle.update();
        if(!particle.isAlive) {
            pool.push(particles.splice(index, 1)[0]);
        }
    }
    if(pointer.down) {
        addParticle();
    }
}

// main
function mainLoop(timestamp) {
    window.requestAnimationFrame(mainLoop);
    // clear screen
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // update DOM
    document.body.style.backgroundColor = color.color;
    p.style.color = color.color;
    p.innerHTML = "Pool: " + pool.length + "<br>Particles: " + particles.length;

    draw();
    update();

    // shift color
    direction += 0.01;
    color.gradualShift(direction);
}

// Start
window.addEventListener("mousedown", handleMouse);
window.addEventListener("mousemove", handleMouse);
window.addEventListener("mouseup", handleMouse);
window.addEventListener("resize", resize);

resize();
mainLoop();
