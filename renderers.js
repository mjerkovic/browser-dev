const APP_WIDTH = 1300;
const APP_HEIGHT = 700;
const BATTLEFIELD_WIDTH = 1100;
const BATTLEFIELD_HEIGHT = 700;
const INFO_PANEL_WIDTH = 200;
const INFO_PANEL_HEIGHT = 700;

function GameRenderer(ctx, width, height, img, renderers) {
    this.render = function() {
        ctx.clearRect(0, 0, height, width);
        renderers.forEach(function(renderer) {
            renderer.render(ctx, img);
        });
    }
}

function WorldRenderer(playerTank, craters) {

    this.render = function(ctx, img) {
        drawBackground(ctx, img);
        drawCraters(ctx, img);
        drawSidePanel(ctx, img);
    }

    var drawBackground = function(ctx, img) {
        ctx.save();
        var numXTiles = Math.ceil(BATTLEFIELD_WIDTH / 31);
        var numYTiles = Math.ceil(BATTLEFIELD_HEIGHT / 31);
        for (var x=0; x < numXTiles; x = x + 1) {
            for (var y=0; y < numYTiles; y = y + 1) {
                ctx.drawImage(img, 165, 132, 31, 31, x*31, y*31, 31, 31);
            }
        }
        ctx.restore();
    }

    var drawCraters = function(ctx, img) {
        ctx.save();
        craters.forEach(function(crater) {
            ctx.drawImage(img, 264, 165, 31, 31, crater.X() - 15, crater.Y() - 15, 31, 31);
        });
        ctx.restore();
    }

    drawMissiles = function(ctx, img) {
        ctx.save();
        ctx.translate(BATTLEFIELD_WIDTH + 5, 102);
        var missileY = 0;
        for (var i = 0; i < playerTank.missiles(); i++) {
            ctx.drawImage(img, 132, 33, 30, 30, 0, missileY, 60, 60);
            missileY = missileY + 60;
        }
        ctx.restore();
    }

    drawFiringAngle = function(ctx) {
        ctx.save();
        ctx.fillRect(BATTLEFIELD_WIDTH + 5, 0, 195, BATTLEFIELD_HEIGHT);
        ctx.fillStyle = "FFFF00";
        ctx.strokeStyle = "FFFF00";
        ctx.strokeRect(BATTLEFIELD_WIDTH + 5, 0, 195, 102);
        ctx.translate(BATTLEFIELD_WIDTH + 5, 100);
        var angleOfTurret = (Math.PI / 180) * -playerTank.firingAngle();
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, angleOfTurret, true);
        ctx.stroke();
        ctx.rotate(angleOfTurret);
        ctx.fillRect(0, 0, 100, 2);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "yellow";
        ctx.font = "bold 48px Arial";
        ctx.fillText(playerTank.firingAngle() + "\u00B0", BATTLEFIELD_WIDTH + 115, 65);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "yellow";
        ctx.font = "bold 10px Arial";
        ctx.fillText(playerTank.firingRange() + "m", BATTLEFIELD_WIDTH + 115, 90);
        ctx.restore();
    }

    var drawSidePanel = function(ctx, img) {
        drawFiringAngle(ctx);
        drawMissiles(ctx, img);
    }

}

function Renderable() {
    angleFrom = function(vector) {
        var result = vector.angleFrom($V([0, -1]));
        return (vector.X() < 0) ? -result : result;

    }
}

function TankRenderer(tank) {
	
	var frame = 0;
	var tankImgPos = [726, 693, 660, 627, 594, 561, 528, 495];

	this.render = function(ctx, img) {
		ctx.save();
		ctx.translate(tank.position().X(), tank.position().Y());
		ctx.rotate(angleFrom(tank.heading()));
        var imgPos = (tank.velocity().length() >= 0 && tank.velocity().length() < 0.4) ? tankImgPos.length - 1 : frame % tankImgPos.length;
		ctx.drawImage(img, tankImgPos[imgPos], 34, 30, 31, -16, -15, 30, 31);
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

        if (showFeelers) {
            ctx.save();
            var feelers = createFeelersFor(tank);
            feelers.forEach(function(feeler) {
                ctx.beginPath();
                ctx.moveTo(tank.position().X(), tank.position().Y());
                ctx.lineTo(feeler.X(), feeler.Y());
                ctx.stroke();
            });
            ctx.restore();
        }
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

    this.render = function(ctx, img) {
        missiles.forEach(function(missile, idx) {
            ctx.save();
            ctx.translate(missile.position().X(), missile.position().Y());
            ctx.rotate(angleFrom(missile.heading()));
            var scale = Math.max(1, ((missile.currentHeight() / missile.maxHeight()) * 4));
            var imgX = (missile.isBomblet()) ? 7 : 30;
            var imgY = (missile.isBomblet()) ? 7 : 30;
            var scaledImgX = imgX * scale;
            var scaledImgY = imgY * scale;
            if (missile.isBomblet()) {
                ctx.drawImage(img, 277, 45, 7, 7, -scaledImgX / 2, -scaledImgY / 2, scaledImgX, scaledImgY);
            } else {
                ctx.drawImage(img, 132, 33, 30, 30, -scaledImgX / 2, -scaledImgY / 2, scaledImgX, scaledImgY);
            }
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "yellow";
            ctx.font = "bold 10px Arial";
            ctx.translate(BATTLEFIELD_WIDTH + 5, 102);
            ctx.fillText("Time to impact: " + Math.max(0, missile.timeToImpact()).toFixed(1) + "s", 70, idx * 60 + 30);
            ctx.restore();
        });
    }

}

MissileRenderer.prototype = new Renderable();

//0.39 rad = 22.5 degrees
var Compass = {
    directions:  [
        { name: "N", x: 0, y: -1 },
        { name: "NE", x: Math.cos(toRadians(45)), y: -Math.sin(toRadians(45)) },
        { name: "E", x: 1, y: 0 },
        { name: "SE", x: Math.cos(toRadians(45)), y: Math.sin(toRadians(45)) },
        { name: "S", x: 0, y: 1 },
        { name: "SW", x: -Math.cos(toRadians(45)), y: Math.sin(toRadians(45)) },
        { name: "W", x: -1, y: 0 },
        { name: "NW", x: -Math.cos(toRadians(45)), y: -Math.sin(toRadians(45)) }
    ],

    directionOf: function(heading) {
        console.log(this.directions[0]);
        for (var i = 0; i < this.directions.length; i++) {
            var direction = this.directions[i];
            var dot = Math.abs(heading.dot($V([direction.x, direction.y])));
            if (dot >= 0 && dot <= 0.39) {
                return direction.name;
            }
        }
    }
}