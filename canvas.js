function startGame() {
	var singleImage = new Image();
	singleImage.src = 'images/tankbrigade.png';
    var canvas = document.getElementById("canvas");
    var tank1 = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0});
    canvas.addEventListener('mousedown', function(ev) {
        var pos = posFromMouseEvent(ev);
        ev.preventDefault();
        switch (ev.which) {
            case 1: tank1.seekTo(pos);
                break;
            case 3: tank1.aimAt(pos);
                break;
        }
        return false;
    }, false);
    canvas.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
        return false;
    }, false);
    var ctx = canvas.getContext("2d");
	var entities = [tank1];
	var renderer1 = new TankRenderer(tank1);
    var worldRenderer = new WorldRenderer();
	var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, singleImage, [worldRenderer, renderer1]);
	setInterval(function() {
		update(entities);
		render(gameRenderer);
	}, 100);
}

function posFromMouseEvent(ev) {
    var x = ev.pageX - canvas.offsetLeft;
    var y = ev.pageY - canvas.offsetTop;
    return { "x": x, "y": y };
}

function update(entities) {
	entities.map(function(entity) {
		entity.update();
	});
}

function render(gameRenderer) {
		gameRenderer.render();	
}