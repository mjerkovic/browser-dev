function startGame() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var world = new World(ctx);
    canvas.addEventListener('mousedown', function(ev) {
        var pos = posFromMouseEvent(ev);
        ev.preventDefault();
        fireMirv = ev.ctrlKey;
        switch (ev.which) {
            case 1: world.movePlayerTankTo(pos);
                break;
            case 3: world.fireMissile();
                break;
        }
        return false;
    }, false);
    canvas.addEventListener('mousemove', function(ev) {
        world.aimAt(posFromMouseEvent(ev));
    }, false);
    canvas.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
    }, false);
    canvas.addEventListener('mousewheel', function(ev) {
        ev.preventDefault();
        world.adjustFiringAngle((ev.wheelDelta / 120) * 5);
    }, false);
	setInterval(function() {
		world.update();
		world.render();
	}, 100);
}

var fireMirv = false;

function posFromMouseEvent(ev) {
    var x = ev.pageX - canvas.offsetLeft;
    var y = ev.pageY - canvas.offsetTop;
    return { "x": x, "y": y };
}
