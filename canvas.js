var FRAMES_PER_SECOND = 10;

function startGame() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var world = new World(ctx);
    canvas.addEventListener('mousedown', function(ev) {
        ev.preventDefault();
        var pos = posFromMouseEvent(ev);
        switch (ev.which) {
            case 1: {
                world.addUserEvent({ fire: function() {
                    world.performAction(pos);
                }});
                break;
            }
            case 3: {
                //console.log("Shoot 3");
                world.addUserEvent({ fire: function() {
                    world.fireMissile(pos);
                }});
                break;
            }
        }
        fireMirv = ev.ctrlKey;
        return false;
    }, false);
    canvas.addEventListener('mousemove', function(ev) {
        ev.preventDefault();
        world.addUserEvent({ fire: function() {
            world.aimAt(posFromMouseEvent(ev));
        }});
    }, false);
    canvas.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
    }, false);
    canvas.addEventListener('mousewheel', function(ev) {
        ev.preventDefault();
        world.addUserEvent({ fire: function() {
            world.adjustFiringAngle((ev.wheelDelta / 120) * 5);
        }});
    }, false);
    document.addEventListener('keydown', function(ev) {
        //ev.preventDefault();
        if (ev.keyCode == 70) {  // F
            showFeelers = !showFeelers;
        }
    }, false);
	setInterval(function() {
		world.update();
		world.render();
	}, 1000 / FRAMES_PER_SECOND);
}

var fireMirv = false;
var showFeelers = false;

function posFromMouseEvent(ev) {
    var x = ev.pageX - canvas.offsetLeft;
    var y = ev.pageY - canvas.offsetTop;
    return { "x": x, "y": y };
}
