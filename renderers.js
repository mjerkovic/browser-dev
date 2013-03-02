function WorldRenderer(playerTank, craters) {

    this.render = function(ctx, img) {

        function drawBackground() {
            ctx.save();
            for (var x=0; x < 26; x = x + 1) {
                for (var y=0; y < 23; y = y + 1) {
                    ctx.drawImage(img, 165, 132, 31, 31, x*31, y*31, 31, 31);
                }
            }
            ctx.restore();
        }

        function drawCraters() {
            ctx.save();
            craters.forEach(function(crater) {
                ctx.drawImage(img, 264, 165, 31, 31, crater.x - 15, crater.y - 15, 31, 31);
            });
            ctx.restore();
        }

        function sidePanel() {
            ctx.save();
            ctx.fillRect(805, 0, 195, 700);
            ctx.fillStyle = "FFFF00";
            ctx.strokeStyle = "FFFF00";
            ctx.strokeRect(805, 0, 195, 102);
            ctx.translate(805, 100);
            ctx.rotate((Math.PI / 180) * -playerTank.firingAngle());
            ctx.fillRect(0, 0, 100, 2);
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "yellow";
            ctx.font = "bold 48px Arial";
            ctx.fillText(playerTank.firingAngle(), 920, 65);
            ctx.restore();
            ctx.save();
            ctx.translate(805, 102);
            var missileX = 0;
            var missileY = 0;
            for (var i = 0; i < playerTank.missiles(); i++) {
                ctx.drawImage(img, 132, 33, 30, 30, missileX, missileY, 60, 60);
                if  (missileX == 120) {
                    missileX = 0;
                    missileY = missileY + 60;
                } else {
                    missileX = missileX + 60;
                }
            }
            ctx.restore();
        }

        drawBackground();
        drawCraters();
        sidePanel();
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

        var fillColour;
        if (tank.power() <= 0.33) {
            fillColour = "FF0000";
        } else if (tank.power() <= 0.66) {
            fillColour = "FFFF00";
        } else {
            fillColour = "00EE00";
        }
        ctx.save();
        ctx.fillStyle = "000000";
        ctx.fillRect(tank.position().X() - 15, tank.position().Y() - 30, 30, 10);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = fillColour;
        ctx.fillRect(tank.position().X() - 14, tank.position().Y() - 29, 28 * tank.power(), 8);
        ctx.restore();

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
            ctx.fillStyle = "FF0000";
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, 50, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.translate(explosion.x, explosion.y);
            ctx.drawImage(img, frames[frame].x, 33, frames[frame].y, 32, -16, -16, 33, 32);
            ctx.restore();
            explosion.finish(frames.length);
        });
    }
}

function MissileRenderer(missiles) {

    var imgX = 30;
    var imgY = 30;

    this.render = function(ctx, img) {
        missiles.forEach(function(missile) {
            ctx.save();
            ctx.translate(missile.position().X(), missile.position().Y());
            ctx.rotate(angleFrom(missile.heading()));
            var scale = Math.max(1, ((missile.currentHeight() / missile.maxHeight()) * 4));
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