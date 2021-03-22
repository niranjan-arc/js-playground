const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.fillStyle = "black";

var bricks = [1, 1, 1, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1];

var paddle = {
	x: canvas.width / 2 - 50,
	y: canvas.height - 20,
	width: 100,
	height: 20,
	draw: function() {
		context.fillStyle = "black";
		context.fillRect(this.x, this.y, this.width, this.height);
	}
};


var colors = ["green", "yellow", "red"];

var ball = {
	x: canvas.width / 2,
	y: canvas.height / 2,
	xVel: 0,
	yVel: 0,
	radius: 8,
	draw: function() {
		context.fillStyle = "blue";
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
		context.fill();
	},

	initVel: function() {
		this.xVel = (Math.random() * 4) - 2;
		this.yVel = 5;
	},

	move: function() {
		this.x += this.xVel;
		this.y += this.yVel;
	},

	update: function() {
		if( this.x >= paddle.x && this.x <= paddle.x+paddle.width &&
			this.y >= paddle.y && this.y <= paddle.y+paddle.height){
			//this.xVel *= (-1);
			this.yVel *= (-1);
			var dist = paddle.x - this.x;
			this.xVel += (dist * 2 / paddle.width);
		}
		else if(this.x < 0 || this.x > canvas.width){
			this.xVel *= (-1);
		}
		else if(this.y < 0){
			this.yVel *= (-1);
		}
		else{
			var x = 10;
			var y = 100;
			var width = 100;
			var height = 20;
			for(var i = bricks.length - 1; i >= 0; --i){
				if(bricks[i] > 0){
					if( this.x >= x + (width+2)*i && this.x <= x + (width+2)*i + 100 &&
						this.y >= y && this.y <= y+height){
						//this.xVel *= (-1);
						this.yVel *= (-1);
						bricks[i]--;
					}
				}
			}
		}
	}
};



function drawBricks() {
	var x = 10;
	var y = 100;
	var width = 100;
	var height = 20;
	for(var i = 0; i < bricks.length; ++i) {
		if(bricks[i] > 0){
			context.fillStyle = colors[bricks[i] - 1];
			context.fillRect(x + (width+2)*i, y, width, height);
		}
	}
}


function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBricks();
	paddle.draw();
	ball.draw();
	ball.move();
	ball.update();
	requestAnimationFrame(draw);
}


function constrain(val, min, max) {
	if(val < min)
		return min;
	else if(val > max)
		return max;
	else
		return val;
}


addEventListener("mousemove", function(event) {
	paddle.x = constrain(event.x, paddle.widht / 2, canvas.width - paddle.width);
});

ball.initVel();
draw();