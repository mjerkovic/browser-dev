function WorldRenderer() {

    this.render = function(ctx, img) {
        ctx.save();
        for (var x=0; x < 26; x = x + 1) {
            for (var y=0; y < 23; y = y + 1) {
                ctx.drawImage(img, 165, 132, 31, 31, x*31, y*31, 31, 31);
            }
        }
        ctx.restore();
    }

}

function Renderable() {
    angleFrom = function(vector) {
        var result = vector.angleFrom($V([0, -1, 0]));
        return (vector.X() < 0) ? -result : result;

    }
}

function TankRenderer(tank) {
	
	var frame = 0;
	var tankImgPos = [726, 693, 660, 627, 594, 561, 528, 495];

	this.render = function(ctx, img) {
		ctx.save();
		//ctx.translate(0, canvas.height);
		//ctx.scale(1.0, -1.0);
		ctx.translate(tank.position().X(), tank.position().Y());
		ctx.rotate(angleFrom(tank.heading()));
		ctx.drawImage(img, tankImgPos[frame % tankImgPos.length], 34, 30, 31, -16, -15, 30, 31);
        ctx.restore();
		frame = (frame == tankImgPos.length - 1) ? 0 : frame + 1;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "#00EE00";
        var startX = tank.position().X() + (tank.aim().X() * 50);
        var startY = tank.position().Y() + (tank.aim().Y() * 50);
        ctx.moveTo(startX - 5, startY);
        ctx.lineTo(startX + 5, startY);
        ctx.moveTo(startX, startY - 5);
        ctx.lineTo(startX, startY + 5);
        ctx.stroke();
        ctx.restore();
	}
	
}

TankRenderer.prototype = new Renderable();

function ExplosionRenderer() {

    var frame = 0;
    var frames = [{"x": 33, "y": 31}, {"x": 66, "y": 31}, {"x": 99, "y": 30}];

    this.render = function(ctx, img) {
        ctx.save();
        ctx.translate(400, 400);
        ctx.drawImage(img, frames[frame % frames.length].x, 33, frames[frame % frames.length].y, 33, -20, -20, 40, 40);
        ctx.restore();
        frame = (frame == frames.length - 1) ? 0 : frame + 1;
    }
}

function MissileRenderer(missiles) {

    var missileArray = missiles;

    this.render = function(ctx) {
        missileArray.forEach(function(missile) {
            ctx.save();
            ctx.translate(missile.position().X(), missile.position().Y());
            ctx.rotate(angleFrom(missile.heading()));
            ctx.beginPath();
            ctx.lineTo(10, 10);
            ctx.stroke();
            ctx.restore();
        });

    }

}

MissileRenderer.prototype = new Renderable();

function GameRenderer(ctx, width, height, img, renderers) {
	this.render = function() {
		ctx.clearRect(0, 0, height, width);		
		renderers.forEach(function(renderer) {
			renderer.render(ctx, img);
		});
	}
}