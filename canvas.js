function startGame() {
	var singleImage = new Image();
	singleImage.src = 'images/tankbrigade.png';
    var canvas = document.getElementById("canvas");
    var tank1 = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0});
    var missiles = [];
    var entities = [tank1];
    canvas.addEventListener('mousedown', function(ev) {
        var pos = posFromMouseEvent(ev);
        ev.preventDefault();
        switch (ev.which) {
            case 1: tank1.seekTo(pos);
                break;
            case 3: var missile = new Missile(tank1.fire());
                missiles.push(missile);
                entities.push(missile);
                break;
        }
        return false;
    }, false);
    canvas.addEventListener('mousemove', function(ev) {
        tank1.aimAt(posFromMouseEvent(ev));
    }, false);
    canvas.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
    }, false);
    var ctx = canvas.getContext("2d");
	var renderer1 = new TankRenderer(tank1);
    var worldRenderer = new WorldRenderer();
    var missileRenderer = new MissileRenderer(missiles);
	var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, singleImage,
        [worldRenderer, renderer1, missileRenderer]);
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