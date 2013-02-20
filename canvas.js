var frame = 0;
var frames = [];
var assets = ['images/robowalk00.png',
			  'images/robowalk01.png',
			  'images/robowalk02.png',
			  'images/robowalk03.png',
			  'images/robowalk04.png',
			  'images/robowalk05.png',
			  'images/robowalk06.png',
			  'images/robowalk07.png',
			  'images/robowalk08.png',
			  'images/robowalk09.png',
			  'images/robowalk10.png',
			  'images/robowalk11.png',
			  'images/robowalk12.png',
			  'images/robowalk13.png',
			  'images/robowalk14.png',
			  'images/robowalk15.png',
			  'images/robowalk16.png',
			  'images/robowalk17.png',
			  'images/robowalk18.png'
			 ];
var tanks = [
			 new Tank(726),
			 new Tank(693),
			 new Tank(660),
			 new Tank(627),
			 new Tank(594),
			 new Tank(562),
			 new Tank(528),
			 new Tank(495)
			];			 
var canvas;
var ctx;
var xPos = 0;
var angle = 0.1;
var animate = function() {
	ctx.clearRect(0, 0, canvas.height, canvas.width);
	xPos = (xPos + 2) % 600;
    ctx.drawImage(frames[frame % 18], xPos, 0);
	frame = frame + 1;    
};

function Tank(posX) {
	var x = posX;
	var y = 34;
	var w = 30;
	var h = 31;
	
	this.x = function() {
		return x;
	},

	this.y = function() {
		return y;
	},

	this.w = function() {
		return w;
	},

	this.h = function() {
		return h;
	}
}

function moveImage() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	assets.map(function(imgSrc) {
		    var img = new Image();
		    img.src = imgSrc
		    frames.push(img);
	});
    setInterval(animate, 33);
}

function canvasClick(ev) {
	var x = ev.clientX - canvas.offsetLeft;
	var y = ev.clientY - canvas.offsetTop;
	console.log("Clicked on: " + x + ", " + y);	
}

function rotateImage() {
	var singleImage = new Image();
	singleImage.src = 'images/tankbrigade.png';
	canvas = document.getElementById("canvas");
	canvas.addEventListener('click', canvasClick, false);
	ctx = canvas.getContext("2d");
	setInterval(function() {
		ctx.clearRect(0, 0, canvas.height, canvas.width);
		draw(ctx, singleImage, angle, 100, 100, tanks);
		draw(ctx, singleImage, angle, 300, 300, tanks);
		frame = (frame == tanks.length - 1) ? 0 : frame + 1;			
		//ctx.save();
		//ctx.translate(100, 100);
		//ctx.rotate(angle);
		//ctx.drawImage(singleImage, 495, 34, 30, 31, -16, -15, 30, 31);
		//ctx.restore();		
/*		ctx.save();
		ctx.translate(300, 300);
		ctx.rotate(angle);
		ctx.drawImage(singleImage, 495, 34, 30, 31, -16, -15, 30, 31);
		ctx.restore();		
*/		angle = angle + 0.1;
	}, 100);
}

function draw(ctx, img, angle, posX, posY, obj) {
		ctx.save();
		ctx.translate(posX, posY);
		ctx.rotate(angle);
		ctx.drawImage(img, obj[frame % tanks.length].x(), obj[frame % tanks.length].y(), 30, 31, -16, -15, 30, 31);
		ctx.restore();
}

function setup() {
	//moveImage();
	rotateImage();
}

