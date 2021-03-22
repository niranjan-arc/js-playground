// Globals
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

var circleOrgMaxRadius = 3;
var circleMaxRadius = 100;
var colorArray = [
	"#004358",
	"#1F8A70",
	"#BEDB39",
	"#FFE11A",
	"#FD7400"
];

var mouse = {
	x: undefined,
	y: undefined
};

var circles = [];

// Classes
function Circle(){
	this.radius = Math.floor(Math.random() * circleOrgMaxRadius) + 1;
	
	this.x = Math.random() * (window.innerWidth - this.radius * 2) + this.radius;
	this.y = Math.random() * (window.innerHeight - this.radius * 2) + this.radius;
	
	this.dx = (Math.random() - 0.5) * 4;
	this.dy = (Math.random() - 0.5) * 4;
	
	this.orgRadius = this.radius;
	this.color = colorArray[Math.floor(Math.random() * colorArray.length)];
	
	this.draw = function(){
		context.beginPath();
		context.strokeStyle = this.color;
		context.fillStyle = this.color;
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		context.stroke();
		context.fill();
	}
	
	this.update = function(){
		if(this.x - this.radius < 0 || this.x + this.radius > window.innerWidth)
			this.dx = -this.dx;
		if(this.y - this.radius < 0 || this.y + this.radius > window.innerHeight)
			this.dy = -this.dy;
		
		this.x += this.dx;
		this.y += this.dy;
		this.draw();
	}
}

// Functions
function init(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	circles = [];
	for(var i = 0; i < 800; i++){
		var circle = new Circle();
		circles.push(circle);
		
		circle.draw();
	}
}

function animate(){
	requestAnimationFrame(animate);
	context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	
	for(var i = 0; i < circles.length; i++){
		circles[i].update();
	}
}


// Event listeners
window.addEventListener('mousemove',
	function(event){
		mouse.x = event.x;
		mouse.y = event.y;
		
		for(var i = 0; i < circles.length; i++){
			var circle = circles[i];
			if((circle.x - (circle.radius + 20)) < mouse.x && (circle.x + (circle.radius + 20)) > mouse.x &&
			   (circle.y - (circle.radius + 20)) < mouse.y && (circle.y + (circle.radius + 20)) > mouse.y){
				if(circle.radius < circleMaxRadius)
					circle.radius += 1;
			}
			else if(circle.radius > circle.orgRadius){
				circle.radius -= 1;
			}
		}
	}
);

window.addEventListener('resize',
	function(){
		init();
	}
);

// main
init();
animate();