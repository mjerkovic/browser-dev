function startGame() {
	var singleImage = new Image();
	singleImage.src = 'images/tankbrigade.png';
    var canvas = document.getElementById("canvas");
    var tank1 = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0});
    canvas.addEventListener('click', function(ev) {
        var x = ev.pageX - canvas.offsetLeft;
        var y = ev.pageY - canvas.offsetTop;
        var pos = { "x": x, "y": y };
        //tank1.pointTo(pos);
        tank1.seekTo(pos);
        //tank1.arriveAt(pos);
    }, false);
    var ctx = canvas.getContext("2d");
	var entities = [tank1];
	var renderer1 = new TankRenderer(tank1);
    var worldRenderer = new WorldRenderer();
	var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, singleImage, [renderer1]);
	setInterval(function() {
		update(entities);
		render(gameRenderer);
	}, 100);
}

function update(entities) {
	entities.map(function(entity) {
		entity.update();
	});
}

function render(gameRenderer) {
		gameRenderer.render();	
}