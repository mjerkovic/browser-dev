const APP_WIDTH = 1300;
const APP_HEIGHT = 700;
const BATTLEFIELD_WIDTH = 1100;
const BATTLEFIELD_HEIGHT = 700;
const INFO_PANEL_WIDTH = 200;
const INFO_PANEL_HEIGHT = 700;

function GameRenderer(ctx, width, height, imageLibrary, renderers) {
    this.render = function() {
        ctx.clearRect(0, 0, height, width);
        renderers.forEach(function(renderer) {
            renderer.render(ctx, imageLibrary);
        });
    }
}

function WorldRenderer(playerTank, craters) {

    this.render = function(ctx, img) {
        drawBackground(ctx, img);
        drawCraters(ctx, img);
        drawSidePanel(ctx, img);
    }

    var drawBackground = function(ctx, imageLibrary) {
        ctx.save();
        var numXTiles = Math.ceil(BATTLEFIELD_WIDTH / 31);
        var numYTiles = Math.ceil(BATTLEFIELD_HEIGHT / 31);
        for (var x=0; x < numXTiles; x = x + 1) {
            for (var y=0; y < numYTiles; y = y + 1) {
                ctx.drawImage(imageLibrary.mainImg, 165, 132, 31, 31, x*31, y*31, 31, 31);
            }
        }
        ctx.restore();
    }

    var drawCraters = function(ctx, imageLibrary) {
        ctx.save();
        craters.forEach(function(crater) {
            ctx.drawImage(imageLibrary.mainImg, 264, 165, 31, 31, crater.X() - 15, crater.Y() - 15, 31, 31);
        });
        ctx.restore();
    }

    drawMissiles = function(ctx, imageLibrary) {
        ctx.save();
        ctx.translate(BATTLEFIELD_WIDTH + 5, 302);
        var missileY = 0;
        for (var i = 0; i < playerTank.missiles(); i++) {
            ctx.drawImage(imageLibrary.mainImg, 132, 33, 30, 30, 0, missileY, 60, 60);
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
        var angleOfTurret = (Math.PI / 180) * -playerTank.cannon.elevation();
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, angleOfTurret, true);
        ctx.stroke();
        ctx.rotate(angleOfTurret);
        ctx.fillRect(0, 0, 100, 2);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "yellow";
        ctx.font = "bold 48px Arial";
        ctx.fillText(playerTank.cannon.elevation() + "\u00B0", BATTLEFIELD_WIDTH + 115, 65);
        ctx.restore();
    }

    var drawSidePanel = function(ctx, imageLibrary) {
        drawFiringAngle(ctx);
        drawMissiles(ctx, imageLibrary);
    }

}

function Renderable() {
    angleFrom = function(vector) {
        var result = vector.angleFrom($V([0, -1]));
        return (vector.X() < 0) ? -result : result;

    }
}

function PlayerTankRenderer(tank) {
	
	var frame = 0;

	this.render = function(ctx, imageLibrary) {
		ctx.save();
		ctx.translate(tank.position.X(), tank.position.Y());
		ctx.rotate(angleFrom(tank.heading));
        var tankImgPos = imageLibrary.playerImgPos;
        var imgPos = (tank.velocity.length() >= 0 && tank.velocity.length() < 0.4) ? tankImgPos.length - 1 : frame % tankImgPos.length;
        var img = tankImgPos[imgPos];
        ctx.drawImage(imageLibrary.mainImg, img.x, img.y, img.w, img.h, -img.w/2, -img.h/2, img.w, img.h);
        ctx.restore();
        frame = (frame == tankImgPos.length - 1) ? 0 : frame + 1;

        ctx.save();
        ctx.translate(tank.position.X(), tank.position.Y());
        ctx.rotate(angleFrom(tank.aim()));
        ctx.drawImage(imageLibrary.playerTurretImg, 0, 0, 32, 32, -16, -16, 32, 32);
        ctx.restore();

        var fillColour;
        if (tank.health <= 0.33) {
            fillColour = "FF0000";
        } else if (tank.health <= 0.66) {
            fillColour = "FFFF00";
        } else {
            fillColour = "00EE00";
        }
        ctx.save();
        ctx.fillStyle = "000000";
        ctx.fillRect(tank.position.X() - 15, tank.position.Y() - 30, 30, 10);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = fillColour;
        ctx.fillRect(tank.position.X() - 14, tank.position.Y() - 29, 28 * tank.health, 8);
        ctx.restore();

        if (showFeelers) {
            ctx.save();
            var feelers = createFeelersFor(tank);
            feelers.forEach(function(feeler) {
                ctx.beginPath();
                ctx.moveTo(tank.position.X(), tank.position.Y());
                ctx.lineTo(feeler.X(), feeler.Y());
                ctx.stroke();
            });
            ctx.restore();
        }
	}
	
}

PlayerTankRenderer.prototype = new Renderable();

function EnemyTankRenderer(tank) {

    var frame = 0;

    this.render = function(ctx, imageLibrary) {
        ctx.save();
        ctx.translate(tank.position.X(), tank.position.Y());
        ctx.rotate(angleFrom(tank.heading));
        var tankImgPos = imageLibrary.enemyImgPos;
        var imgPos = (tank.velocity.length() >= 0 && tank.velocity.length() < 0.4) ? tankImgPos.length - 1 : frame % tankImgPos.length;
        var img = tankImgPos[imgPos];
        ctx.drawImage(imageLibrary.mainImg, img.x, img.y, img.w, img.h, -img.w/2, -img.h/2, img.w, img.h);
        ctx.restore();
        frame = (frame == tankImgPos.length - 1) ? 0 : frame + 1;

        ctx.save();
        ctx.translate(tank.position.X(), tank.position.Y());
        ctx.rotate(angleFrom(tank.aim()));
        ctx.drawImage(imageLibrary.enemyTurretImg, 0, 0, 32, 32, -16, -16, 32, 32);
        ctx.restore();

        var fillColour;
        if (tank.health <= 0.33) {
            fillColour = "FF0000";
        } else if (tank.health <= 0.66) {
            fillColour = "FFFF00";
        } else {
            fillColour = "00EE00";
        }
        ctx.save();
        ctx.fillStyle = "000000";
        ctx.fillRect(tank.position.X() - 15, tank.position.Y() - 30, 30, 10);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = fillColour;
        ctx.fillRect(tank.position.X() - 14, tank.position.Y() - 29, 28 * tank.health, 8);
        ctx.restore();

        if (showFeelers) {
            ctx.save();
            var feelers = createFeelersFor(tank);
            feelers.forEach(function(feeler) {
                ctx.beginPath();
                ctx.moveTo(tank.position.X(), tank.position.Y());
                ctx.lineTo(feeler.X(), feeler.Y());
                ctx.stroke();
            });
            ctx.restore();
        }
    }

}

EnemyTankRenderer.prototype = new Renderable();

function TrajectoryRenderer(tank) {

    this.render = function(ctx) {
        ctx.save();
        ctx.translate(BATTLEFIELD_WIDTH + 5, 302);
        ctx.strokeStyle = "yellow";
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(1, 0);
        ctx.lineTo(1, -200);
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 0);
        ctx.stroke();
        ctx.moveTo(0, 0);

        var firingVelocity = tank.cannon.velocity();
        var elevation = tank.cannon.elevation();
        var maxHeight = Trajectory.maxHeight(firingVelocity, elevation);
        var impactTime = Trajectory.impactTime(firingVelocity, elevation);
        var firingRange = tank.cannon.range();
        var scaleX = (firingRange > 200) ? 200 / firingRange : 1;
        var scaleY = (maxHeight > 200) ? 200 / maxHeight : 1;
        ctx.scale(scaleX, scaleY);
        impactTime = parseFloat(impactTime.toFixed(1));
        var xVelocity = firingVelocity * Math.cos(toRadians(elevation));
        var yVelocity = firingVelocity * Math.sin(toRadians(elevation));
        var xPos = 1;
        var yPos = 0;
        var maxX;
        var maxY;
        var previousHeight = -maxHeight;
        for (var time = 0.1; time < impactTime; time = time + 0.1) {
            ctx.beginPath();
            ctx.moveTo(xPos, -yPos);
            xPos = xPos + (xVelocity * 0.1);
            yPos = Math.max(0, yVelocity * time + 0.5 * -9.81 * time * time);
            ctx.lineTo(xPos, -yPos);
            ctx.stroke();
            if (typeof maxY == 'undefined' && yPos < previousHeight) {
                maxY = yPos;
                maxX = xPos;
            } else {
                previousHeight = yPos;
            }
        }
        ctx.font = "bold 10px Arial";
        ctx.fillText(maxHeight.toFixed(0) + "m", (maxX < 30) ? maxX + 30 : maxX - 10, -maxY - 8);
        ctx.font = "bold 14px Arial";
        //ctx.fillText(firingRange + "m", 120, -160);
        ctx.fillText(firingRange + "m", (maxX < 30) ? maxX + 50 : maxX - 10, -20);
        ctx.restore()
    }

}

function ExplosionRenderer(explosions) {

    var frames = [{"x": 33, "y": 31}, {"x": 66, "y": 31}, {"x": 99, "y": 30}];

    this.render = function(ctx, imageLibrary) {
        explosions.forEach(function(explosion) {
            var frame = explosion.currentFrame();
            if (explosion.blastRange) {
                ctx.save();
                ctx.fillStyle = "FF0000";
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.arc(explosion.x, explosion.y, 50, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.save();
            ctx.translate(explosion.x, explosion.y);
            ctx.drawImage(imageLibrary.mainImg, frames[frame].x, 33, frames[frame].y, 32, -16, -16, 33, 32);
            ctx.restore();
            explosion.finish(frames.length);
        });
    }
}

function MissileRenderer(missiles) {

    this.render = function(ctx, imageLibrary) {
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
                ctx.drawImage(imageLibrary.mainImg, 277, 45, 7, 7, -scaledImgX / 2, -scaledImgY / 2, scaledImgX, scaledImgY);
            } else {
                ctx.drawImage(imageLibrary.mainImg, 132, 33, 30, 30, -scaledImgX / 2, -scaledImgY / 2, scaledImgX, scaledImgY);
            }
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "yellow";
            ctx.font = "bold 10px Arial";
            ctx.translate(BATTLEFIELD_WIDTH + 5, 302);
            ctx.fillText("Time to impact: " + Math.max(0, missile.timeToImpact()).toFixed(1) + "s", 70, idx * 60 + 30);
            ctx.restore();
        });
    }

}

MissileRenderer.prototype = new Renderable();

function BulletRenderer(bullets) {

    this.render = function(ctx, imageLibrary) {
        bullets.forEach(function(bullet) {
            ctx.save();
            ctx.translate(bullet.position.X(), bullet.position.Y());
            ctx.drawImage(imageLibrary.mainImg, 277, 45, 8, 8, -4, -4, 8, 8);
            ctx.restore();
        });
    }
}

function HeadQuartersRenderer(headquarters) {

    this.render = function(ctx, imageLibrary) {
        headquarters.forEach(function(hq) {
            var numTiles = Math.ceil((hq.radius * 2) / 32);
            ctx.save();
            ctx.translate(hq.position.X() - hq.radius, hq.position.Y() - hq.radius);
            for (var y = 0; y < numTiles; y++) {
                for (var x = 0; x < numTiles; x++) {
                    ctx.drawImage(imageLibrary.mainImg, 132, 66, 32, 32, x * 32, y * 32, 32, 32);
                }
            }
            ctx.restore();
        });
    }

}

function MineRenderer(mines) {

    this.render = function(ctx, imageLibrary) {
        mines.forEach(function(mine) {
            var numTiles = Math.ceil((mine.radius * 2) / 30);
            ctx.save();
            ctx.translate(mine.position.X() - mine.radius, mine.position.Y() - mine.radius);
            for (var y = 0; y < numTiles; y++) {
                for (var x = 0; x < numTiles; x++) {
                    ctx.drawImage(imageLibrary.mainImg, 100, 166, 29, 30, x * 29, y * 30, 29, 30);
                }
            }
            ctx.restore();
        });
    }

}

function TankerRenderer(tankers) {

    this.render = function(ctx, imageLibrary) {
        tankers.forEach(function(tanker) {
            ctx.save();
            ctx.translate(tanker.position.X(), tanker.position.Y());
            ctx.rotate(angleFrom(tanker.heading));
            ctx.drawImage(imageLibrary.tankerImg, 220, 6, 20, 40, -tanker.width / 2, -tanker.length / 2, 30, 60);
            ctx.restore();
        });
    }

}
TankerRenderer.prototype = new Renderable();

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