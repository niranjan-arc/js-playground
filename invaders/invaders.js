const canvas = document.getElementById('invaders-canvas');
const context = canvas.getContext('2d');

const W = canvas.width = 640;
const H = canvas.height = 480;
var shipImage = new Image();
var invaderImage = new Image();

shipImage.src = 'ship.png';
invaderImage.src = 'invader.png';
//
function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
//

function Bullet(x, y){
	this.w = 4;
	this.h = 4;
	this.radius = 3;
	this.x = x - 2;
	this.y = y;
	this.speed = -2;
	this.toKill = false;

	this.draw = function() {
		// context.beginPath();
		// context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		// context.closePath();
		// context.stroke();
		// context.fill();
		context.fillRect(this.x, this.y, this.w, this.h);
	}

	this.collide = function(invader) {
		var dist = distance(this.x, this.y, invader.x, invader.y);
		// console.log(dist);
		if(dist <= (this.radius + invader.radius)){
			console.log(dist);
			return true;
		}
		return false;
	}

	this.move = function() {
		this.y += this.speed;
		if(this.y + this.radius <= 0) {
			this.toKill = true;
		}
	}
}

function Invader(x, y) {
	this.w = invaderImage.width;
	this.h = invaderImage.height;
	this.radius = 15;
	this.x = x;
	this.y = y;
	this.speedX = 2;
	this.speedY = 5;
	this.health = 1;

	this.draw = function() {
		// context.beginPath();
		// context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		// context.closePath();
		// context.fill();
		context.drawImage(invaderImage, this.x, this.y);
	}
	
	this.move = function(moveDown) {
		if(moveDown) {
			this.y += this.speedY;
			this.speedX *= (-1);
		}
		this.x += this.speedX;
	}
}

function Ship() {
	this.w = 32;
	this.h = 32;
	this.x = W / 2 - this.w / 2;
	this.y = H - this.h;
	this.speed = 0;

	this.draw = function() {
		//context.fillRect(this.x, this.y, this.w, this.h);
		context.drawImage(shipImage, this.x, this.y);
	}

	this.move = function() {
		this.x += this.speed;
		if(this.x < 0) {
			this.x = 0;
		}
		else if(this.x > (W - this.w)) {
			this.x = W - this.w;
		}
	}

	this.setSpeed = function(speed) {
		this.speed = speed;
	}

	this.shoot = function() {
		return new Bullet(this.x + this.w / 2, this.y);
	}
}

//
var moveDown = false;
var ship = new Ship();
var bullets = [];
var invaders = [];

for(var i = 0; i < 18; i ++) {
	invaders.push(new Invader(16 + i * 34, 25));
}

//
function draw() {
	context.clearRect(0, 0, W, H);
	//ship
	context.fillStyle = '#0346aa';
	context.shadowBlur = 0;
	ship.draw();
	//invaders
	context.fillStyle = '#f44a41';
	for(var i = 0; i < invaders.length; ++i) {
		invaders[i].draw();
	}
	//bullets
	context.fillStyle = '#f44a41';//'#4286f4'; 
	context.shadowColor = 'red'; //#4286f4';
	context.shadowBlur = 10;
	context.strokeStyle = '#0346aa';
	for(var i = 0; i < bullets.length; ++i) {
		bullets[i].draw();
	}

	//reset blur
	context.shadowBlur = 0;
}

function update() {
	ship.move();
	for(var i = invaders.length - 1; i >= 0; --i) {
		if(invaders[i].x < 0 || (invaders[i].x + invaders[i].w) > W) {
			moveDown = true;
		}
	}
	for(var i = invaders.length - 1; i >= 0; --i) {
		invaders[i].move(moveDown);
	}
	moveDown = false;
	for(var i = bullets.length - 1; i >= 0; --i) {
		bullets[i].move();
		for(var j = 0; j < invaders.length; ++j) {
			if(bullets[i].collide(invaders[j]) === true) {
				invaders[j].health--;
				// console.log('invader hit');
				bullets[i].toKill = true;
			}
		}
		if(bullets[i].toKill === true) {
			bullets.splice(i, 1);
		}
	}
	for(var i = invaders.length - 1; i >= 0; --i) {
		if(invaders[i].health < 0) {
			invaders.splice(i, 1);
		}
	}
}

function animate() {
	draw();
	update();
	requestAnimationFrame(animate);
}


//event handlers
addEventListener('keydown', function(event) {
	switch(event.keyCode) {
		case 37: //left key
			ship.setSpeed(-1);
			break;

		case 38: //up key
			bullets.push(ship.shoot());
			break;

		case 39: //right key
			ship.setSpeed(1);
			break;
	}
});

addEventListener('keyup', function(event) {
	if(event.keyCode === 37 || event.keyCode === 39) {
		ship.setSpeed(0);
	}
});


//
invaderImage.onload = function(){
	animate();
}
//document.getElementById('text-content').innerHTML = "width: " + W + ", Height: " + H;