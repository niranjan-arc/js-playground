var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

c.width = document.documentElement.clientWidth;
c.height = document.documentElement.clientHeight;

class Snake {
	constructor(color, food, direction, position) {
		this.curDir = 0;//direction; //left/right/top/down :: 1/2/3/4
		this.pos = [position];

		let pos2, pos3;
		if(direction == 1) {
			pos2 = {x: position.x + 10, y: position.y};
			pos3 = {x: position.x + 20, y: position.y};
		}
		else {
			pos2 = {x: position.x - 10, y: position.y};
			pos3 = {x: position.x - 20, y: position.y};
		}
		this.pos.push(pos2);
		this.pos.push(pos3);

		this.score = 0;
		this.alive = true;
		this.food = food;
		this.color = color;
	}

	show() {
		if (!this.alive)
			return;
		this.food.show();
		ctx.fillStyle = this.color;
		// console.log(this.pos);
		for (var i = 0; i < this.pos.length; ++i) {
			ctx.fillRect(this.pos[i].x, this.pos[i].y, 10, 10);
		}
	}

	move(dir) {
		if (!this.alive)
			return;
		//console.log(this.pos[0]);
		if (this.pos[0].x < 0 || this.pos[0].x > (c.width - 10) || this.pos[0].y < 0 || this.pos[0].y > (c.height - 10)) {
			this.alive = false;
		}
		//check auto-hit
		if (autohit) {
			var front = this.pos[0];
			for (var i = this.pos.length - 1; i > 0; --i) {
				var pos = this.pos[i];
				if (front.x == pos.x && front.y == pos.y) {
					this.alive = false;
				}
			}
		}
		this.curDir = dir;
		var p = { x: this.pos[0].x, y: this.pos[0].y };
		switch (dir) {
			case 1:
				p.x -= 10;
				break;
			case 2:
				p.x += 10;
				break;
			case 3:
				p.y -= 10;
				break;
			case 4:
				p.y += 10;
				break;
		}
		if (this.pos[0].x == this.food.x && this.pos[0].y == this.food.y) {
			this.pos.splice(0, 0, p);
			this.score++;
			this.food.reset();
		}
		else if(dir>0){
			for (var i = this.pos.length - 1; i > 0; --i) {
				this.pos[i].x = this.pos[i - 1].x;
				this.pos[i].y = this.pos[i - 1].y;
			}
			this.pos[0] = p;
		}
	}
}

class Food {
	constructor(color){
		this.color = color;
		this.reset();
	}

	show() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, 10, 10); 
	}
	
	reset() {
		let x = Math.floor(Math.random() * c.width);
		let y = Math.floor(Math.random() * c.height);
		
		this.x = x - (x % 10);
		this.y = y - (y % 10);
	}
}

addEventListener('keydown', function(event) {
	switch(event.keyCode) {
		case 37: dir = 1; break;
		case 38: dir = 3; break;
		case 39: dir = 2; break;
		case 40: dir = 4; break;
		default:
			switch(event.key) {
				case 'a': dir1 = 1; break;
				case 'w': dir1 = 3; break;
				case 'd': dir1 = 2; break;
				case 's': dir1 = 4; break;
			}
	}
});

let chkbxFoodType = document.getElementById('foodtype');
let chkbxAutoHit = document.getElementById('autohit');
let chkbxKillMode = document.getElementById('killmode');
let autohit = false;
let foodtype = "normal";
let killmode = false;
let dir = 0;
let dir1 = 0;
let snake, snake1;

function start() {
	let x = c.width / 2 - (0.2 * c.width);
	let x1 = c.width / 2 + (0.2 * c.width);
	let y = c.height / 2;

	let position = {
		x: x - (x%10),
		y: y - (y%10)
	},
	position1 = {
		x: x1 - (x1%10),
		y: y - (y%10)
	};

	if(chkbxFoodType.checked) {
		foodtype = "single";
		var food = new Food("magenta");
		snake = new Snake("red", food, 2, position);
		snake1 = new Snake("blue", food, 1, position1);
	}
	else {
		var food = new Food("red");
		var food1 =  new Food("blue");
		snake = new Snake("red", food, 2, position);
		snake1 = new Snake("blue", food1, 1, position1);
	}
	autohit = chkbxAutoHit.checked
	killmode = chkbxKillMode.checked;
	draw();
}

function draw(timestamp) {
	requestAnimationFrame(draw);
	ctx.clearRect(0, 0, c.width, c.height);
	snake.show();
	snake.move(dir);
	snake1.show();
	snake1.move(dir1);
}

start();