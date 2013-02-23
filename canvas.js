function startGame() {
	var singleImage = new Image();
	singleImage.src = 'images/tankbrigade.png';
    var canvas = document.getElementById("canvas");
    var tank1 = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0});
    canvas.addEventListener('click', function(ev) {
        var x = ev.pageX - canvas.offsetLeft;
        var y = ev.pageY - canvas.offsetTop;
        tank1.pointTo({"x": x, "y": y});
        console.log("Click ", {"x": ev.pageX, "y": ev.pageY}, " Offsets", {"x": canvas.offsetLeft, "y": canvas.offsetTop });
    }, false);
    var ctx = canvas.getContext("2d");
	//var tank2 = new Tank({posX: 300, posY: 300, headingX: 0, headingY: 1});
	//var tank3 = new Tank({posX: 300, posY: 100, headingX: -1, headingY: 1});
	var entities = [tank1];//, tank2, tank3];
	var renderer1 = new TankRenderer(tank1);
	//var renderer2 = new TankRenderer(tank2);
	//var renderer3 = new TankRenderer(tank3);
    var worldRenderer = new WorldRenderer();
	var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, singleImage, [renderer1, worldRenderer]);//, renderer2, renderer3]);
	setInterval(function() {
		update(entities);
		render(gameRenderer);
	}, 100);
}

function update(entities) {
	entities.map(function(entity) {
		//entity.move();
	});
}

function render(gameRenderer) {
		gameRenderer.render();	
}