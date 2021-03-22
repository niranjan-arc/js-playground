const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const RADIUS = 70;
class Point {
    constructor(x, y) {
        this.x = x * RADIUS + canvas.width / 2;
        this.y = y * RADIUS + canvas.height / 2;
    }
}

function getPointPolar(r, theta) {
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    return new Point(x, y);
}

function calculatePoint(theta) {
    let p1 = Math.pow(Math.abs(Math.cos(m1.value * theta * 0.25)/a.value), n2.value);
    let p2 = Math.pow(Math.abs(Math.sin(m2.value * theta * 0.25)/b.value), n3.value);
    r = Math.pow(p1 + p2, -1/n1.value);
    return getPointPolar(r, theta);
}

let N = 1000;
let delta = (Math.PI * 2) / N;

let phi = 0;
function update() {
    // m1 = m2 = Math.sin(phi);
    // phi += 0.01;

    a.innerHTML = a.value.toString().substring(0, 5);
    b.innerHTML = b.value.toString().substring(0, 5);
    n1.innerHTML = n1.value.toString().substring(0, 5);
    n2.innerHTML = n2.value.toString().substring(0, 5);
    n3.innerHTML = n3.value.toString().substring(0, 5);
    m1.innerHTML = m1.value.toString().substring(0, 5);
    m2.innerHTML = m2.value.toString().substring(0, 5);
}

function draw() {
    context.fillStyle = "#000000";
    let point = calculatePoint(0);
    context.strokeRect(point.x, point.y, 1, 1);
    for(let i = 0, theta = 0; i < 1000; i++, theta += delta) {
        point = calculatePoint(theta);
        context.fillRect(point.x, point.y, 1, 1);
    }
}

function mainLoop(timestamp) {
    if(!stop) {
        window.requestAnimationFrame(mainLoop);
    }
    // clear screen
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    draw();
    update();
}

let stop = false;
let a = document.getElementById('valueA');
let b = document.getElementById('valueB');
let n1 = document.getElementById('valueN1');
let n2 = document.getElementById('valueN2');
let n3 = document.getElementById('valueN3');
let m1 = document.getElementById('valueM1');
let m2 = document.getElementById('valueM2');

a.value = 1;
b.value = 1;
n1.value = 1;
n2.value = 1;
n3.value = 1;
m1.value = 1;
m2.value = 1;

$(document).click('minusBtn, plusBtn', function(event) {
    const change = $(event.target).is('.minusBtn') ? -0.5 : +0.5
    const current = parseFloat($(event.target).siblings('.value').val())
    $(event.target).siblings('.value').val(current + change)
})

mainLoop();