function WorldRenderer(playerTank) {

    this.render = function(ctx, img) {
        ctx.save();
        for (var x=0; x < 26; x = x + 1) {
            for (var y=0; y < 23; y = y + 1) {
                ctx.drawImage(img, 165, 132, 31, 31, x*31, y*31, 31, 31);
            }
        }
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.fillText(playerTank.firingAngle(), 750, 15);
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

function ExplosionRenderer(explosions) {

    var frames = [{"x": 33, "y": 31}, {"x": 66, "y": 31}, {"x": 99, "y": 30}];

    this.render = function(ctx, img) {
        explosions.forEach(function(explosion) {
            var frame = explosion.currentFrame();
            ctx.save();
            ctx.translate(explosion.x, explosion.y);
            ctx.drawImage(img, frames[frame].x, 33, frames[frame].y, 32, -16, -16, 33, 32);
            ctx.restore();
            explosion.finish(frames.length);
        });
    }
}

function MissileRenderer(missiles) {

    var imgX = imgY = 30;

    this.render = function(ctx, img) {
        missiles.forEach(function(missile) {
            ctx.save();
            ctx.translate(missile.position().X(), missile.position().Y());
            ctx.rotate(angleFrom(missile.heading()));
            var scale = Math.max(1, (missile.currentHeight() / missile.maxHeight() * 4));
            var scaledImgX = imgX * scale;
            var scaledImgY = imgY * scale;
            ctx.drawImage(img, 132, 33, 30, 30, -scaledImgX / 2, -scaledImgY / 2, scaledImgX, scaledImgY);
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