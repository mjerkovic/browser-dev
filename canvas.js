var entities = [];

function canvasClick(ev) {
	var x = ev.clientX - canvas.offsetLeft;
	var y = ev.clientY - canvas.offsetTop;
	console.log(x, y, ev.clientX, ev.clientY, canvas.offsetLeft, canvas.offsetTop);	
}

function startGame() {
	var singleImage = new Image();
	singleImage.src = 'images/tankbrigade.png';
	var canvas = document.getElementById("canvas");
	canvas.addEventListener('click', canvasClick, false);
	var ctx = canvas.getContext("2d");
	var tank1 = new Tank(100, 100, 1, 0);
	var tank2 = new Tank(300, 300, 0, 1);
	var tank3 = new Tank(300, 100, -1, 1);
	entities.push(tank1, tank2, tank3);
	var renderer1 = new TankRenderer(tank1);
	var renderer2 = new TankRenderer(tank2);
	var renderer3 = new TankRenderer(tank3);
	var gameRenderer = new GameRenderer(ctx, singleImage, [renderer1, renderer2, renderer3]);
	setInterval(function() {
		update();
		render(ctx, gameRenderer);
	}, 100);
}

function update() {
	this.entities.map(function(entity) {
		//entity.move();
	});
}

function render(ctx, gameRenderer) {
		ctx.clearRect(0, 0, canvas.height, canvas.width);
		gameRenderer.render(ctx);	
}