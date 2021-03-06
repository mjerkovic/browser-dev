const APP_WIDTH = 1000;
const APP_HEIGHT = 800;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 2400;
const BATTLEFIELD_WIDTH = 800;
const BATTLEFIELD_HEIGHT = 800;
const INFO_PANEL_WIDTH = 200;
const INFO_PANEL_HEIGHT = 800;

function GameRenderer(ctx, width, height, imageLibrary, viewPort, renderers) {
    this.render = function() {
        ctx.clearRect(0, 0, height, width);
        renderers.forEach(function(renderer) {
            renderer.render(ctx, imageLibrary, viewPort);
        });
    }
}

var Renderer = Class.extend({

    _angleFrom: function(vector) {
        var result = vector.angleFrom($V([0, -1]));
        return (vector.X() < 0) ? -result : result;
    },

    _drawHealthBar: function(ctx, viewPort, entity, offset) {
        var fillColour;
        if (entity.health <= 0.33) {
            fillColour = "FF0000";
        } else if (entity.health <= 0.66) {
            fillColour = "FFFF00";
        } else {
            fillColour = "00EE00";
        }
        ctx.save();
        ctx.fillStyle = "000000";
        var posX = entity.position.X() - viewPort.position.X();
        var posY = entity.position.Y() - viewPort.position.Y();
        ctx.fillRect(posX - 15, posY - offset, 30, 10);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = fillColour;
        ctx.fillRect(posX - 14, posY - (offset - 1), 28 * entity.health, 8);
        ctx.restore();

    },

    _visibleEntities: function(viewPort, collection) {
        return collection.filter(function(entity) {
            return viewPort.contains(entity);
        });

    }

});

var WorldRenderer = Renderer.extend({

    init: function(tank, craterz) {
        this.playerTank = tank;
        this.craters = craterz;
    },

    render: function(ctx, imageLibrary, viewPort) {
        this._drawBackground(ctx, imageLibrary, viewPort);
        this._drawCraters(ctx, imageLibrary);
        this._drawSidePanel(ctx, imageLibrary);
        this._drawMap(ctx, viewPort);
    },

    _drawBackground: function(ctx, imageLibrary, viewPort) {
        ctx.save();
        var numXTiles = Math.ceil(BATTLEFIELD_WIDTH / 31) + 1;
        var numYTiles = Math.ceil(BATTLEFIELD_HEIGHT / 31) + 1;
        var imgX, imgY, sizeX, sizeY;
        imgX = imgY = sizeX = sizeY = 0;
        var screenX, screenY;
        screenX = screenY = 0;
        for (var x=0; x < numXTiles; x = x + 1) {
            if (x == 0) {
                imgX = sizeX = viewPort.position.X() % 31;
                screenX = 0;
            } else {
                sizeX = 0;
                screenX = (imgX == 0) ? screenX + 31 : screenX + (31 - imgX);
                imgX = 0;
            }
            for (var y=0; y < numYTiles; y = y + 1) {
                if (y == 0) {
                    imgY = sizeY = viewPort.position.Y() % 31;
                    screenY = 0;
                } else {
                    sizeY = 0;
                    screenY = (imgY == 0) ? screenY + 31 : screenY + (31 - imgY);
                    imgY = 0;
                }
                ctx.drawImage(imageLibrary.mainImg, 165 + imgX, 132 + imgY,
                    31 - sizeX, 31 - sizeY,
                    screenX, screenY, 31 - sizeX, 31 - sizeY);
            }
        }
        ctx.restore();
    },

    _drawCraters: function(ctx, imageLibrary) {
        ctx.save();
        this.craters.forEach(function(crater) {
            ctx.drawImage(imageLibrary.mainImg, 264, 165, 31, 31, crater.X() - 15, crater.Y() - 15, 31, 31);
        });
        ctx.restore();
    },

    _drawSidePanel: function(ctx, imageLibrary) {
        this._drawFiringAngle(ctx);
        //this._drawMissiles(ctx, imageLibrary);
    },

    _drawFiringAngle: function(ctx) {
        ctx.save();
        ctx.fillRect(BATTLEFIELD_WIDTH + 5, 0, 195, BATTLEFIELD_HEIGHT);
        ctx.fillStyle = "FFFF00";
        ctx.strokeStyle = "FFFF00";
        ctx.strokeRect(BATTLEFIELD_WIDTH + 5, 0, 195, 102);
        ctx.translate(BATTLEFIELD_WIDTH + 5, 100);
        var angleOfTurret = (Math.PI / 180) * -this.playerTank.cannon.elevation;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, angleOfTurret, true);
        ctx.stroke();
        ctx.rotate(angleOfTurret);
        ctx.fillRect(0, 0, 100, 2);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "yellow";
        ctx.font = "bold 48px Arial";
        ctx.fillText(this.playerTank.cannon.elevation + "\u00B0", BATTLEFIELD_WIDTH + 115, 65);
        ctx.restore();
    },

    _drawMissiles: function(ctx, imageLibrary) {
        ctx.save();
        ctx.translate(BATTLEFIELD_WIDTH + 5, 302);
        var missileY = 0;
        for (var i = 0; i < this.playerTank.missiles(); i++) {
            ctx.drawImage(imageLibrary.mainImg, 132, 33, 30, 30, 0, missileY, 60, 60);
            missileY = missileY + 60;
        }
        ctx.restore();
    },

    _drawMap: function(ctx, viewPort) {
        ctx.save();
        ctx.strokeStyle = "FFFF00";
        ctx.strokeRect(BATTLEFIELD_WIDTH + 5, 0, 195, 102);
        ctx.translate(BATTLEFIELD_WIDTH + 5, 312);
        ctx.strokeRect(0, 0, 200, WORLD_HEIGHT * (200 / WORLD_WIDTH));
        var scaledX = INFO_PANEL_WIDTH / WORLD_WIDTH;
        var scaledY = (WORLD_HEIGHT * (200 / WORLD_WIDTH)) / WORLD_HEIGHT;
        ctx.scale(scaledX, scaledY);
        ctx.lineWidth = 7;
        ctx.strokeRect(viewPort.position.X(), viewPort.position.Y(), BATTLEFIELD_WIDTH, BATTLEFIELD_HEIGHT);
        ctx.restore();
    }


});

var PlayerTankRenderer = Renderer.extend({
	
    init: function(t) {
        this.frame = 0;
        this.tank = t;
    },

	render: function(ctx, imageLibrary, viewPort) {
        if (!viewPort.contains(this.tank)) {
            return;
        }
		ctx.save();
		ctx.translate(this.tank.position.X() - viewPort.position.X(),
            this.tank.position.Y() - viewPort.position.Y());
		ctx.rotate(this._angleFrom(this.tank.heading));
        var tankImgPos = imageLibrary.playerImgPos;
        var imgPos = (this.tank.velocity.length() >= 0 && this.tank.velocity.length() < 0.4) ? tankImgPos.length - 1 : this.frame % tankImgPos.length;
        var img = tankImgPos[imgPos];
        ctx.drawImage(imageLibrary.mainImg, img.x, img.y, img.w, img.h, -img.w/2, -img.h/2, img.w, img.h);
        ctx.restore();
        this.frame = (this.frame == tankImgPos.length - 1) ? 0 : this.frame + 1;

        ctx.save();
        ctx.translate(this.tank.position.X() - viewPort.position.X(),
            this.tank.position.Y() - viewPort.position.Y());
        ctx.rotate(this._angleFrom(this.tank.aim()));
        ctx.drawImage(imageLibrary.playerTurretImg, 0, 0, 32, 32, -16, -16, 32, 32);
        ctx.restore();

        this._drawHealthBar(ctx, viewPort, this.tank, 30);

        if (showFeelers) {
            ctx.save();
            var feelers = createFeelersFor(this.tank);
            feelers.forEach(function(feeler) {
                ctx.beginPath();
                ctx.moveTo(this.tank.position.X(), this.tank.position.Y());
                ctx.lineTo(feeler.X(), feeler.Y());
                ctx.stroke();
            });
            ctx.restore();
        }
	}
	
});

var EnemyTankRenderer = Renderer.extend({

    init: function(t) {
        this.frame = 0;
        this.tank = t;
    },

    render: function(ctx, imageLibrary, viewPort) {
        if (!viewPort.contains(this.tank)) {
            return;
        }
        ctx.save();
        ctx.translate(this.tank.position.X() - viewPort.position.X(),
            this.tank.position.Y() - viewPort.position.Y());
        ctx.rotate(this._angleFrom(this.tank.heading));
        var tankImgPos = imageLibrary.enemyImgPos;
        var imgPos = (this.tank.velocity.length() >= 0 && this.tank.velocity.length() < 0.4) ? tankImgPos.length - 1 : this.frame % tankImgPos.length;
        var img = tankImgPos[imgPos];
        ctx.drawImage(imageLibrary.mainImg, img.x, img.y, img.w, img.h, -img.w/2, -img.h/2, img.w, img.h);
        ctx.restore();
        this.frame = (this.frame == tankImgPos.length - 1) ? 0 : this.frame + 1;

        ctx.save();
        ctx.translate(this.tank.position.X() - viewPort.position.X(),
            this.tank.position.Y() - viewPort.position.Y());
        ctx.rotate(this._angleFrom(this.tank.cannon.heading));
        ctx.drawImage(imageLibrary.enemyTurretImg, 0, 0, 32, 32, -16, -16, 32, 32);
        ctx.restore();

        this._drawHealthBar(ctx, viewPort, this.tank, 30);

        if (showFeelers) {
            ctx.save();
            var feelers = createFeelersFor(this.tank);
            feelers.forEach(function(feeler) {
                ctx.beginPath();
                ctx.moveTo(this.tank.position.X(), this.tank.position.Y());
                ctx.lineTo(feeler.X(), feeler.Y());
                ctx.stroke();
            });
            ctx.restore();
        }
    }

});

var TrajectoryRenderer = Renderer.extend({

    init: function(t) {
        this.tank = t;
    },
    
    render: function(ctx) {
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

        var firingVelocity = this.tank.cannon.firingVelocity;
        var elevation = this.tank.cannon.elevation;
        var maxHeight = Trajectory.maxHeight(firingVelocity, elevation);
        var impactTime = Trajectory.impactTime(firingVelocity, elevation);
        var firingRange = Trajectory.rangeInMetres(firingVelocity, elevation);
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
            yPos = Math.max(0, yVelocity * time + 0.5 * -19.62 * time * time);
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

});

var ExplosionRenderer = Renderer.extend({

    init: function(explns) {
        this.explosions = explns;
        this.frames = [{"x": 33, "y": 31}, {"x": 66, "y": 31}, {"x": 99, "y": 30}];
    },

    render: function(ctx, imageLibrary, viewPort) {
        var that = this;
        this._visibleEntities(viewPort, this.explosions).forEach(function(explosion) {
            var frame = explosion.currentFrame();
            if (explosion.blastRange) {
                ctx.save();
                ctx.fillStyle = "FF0000";
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.arc(explosion.position.X() - viewPort.position.X(),
                    explosion.position.Y() - viewPort.position.Y(), 50, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.save();
            ctx.translate(explosion.x, explosion.y);
            ctx.drawImage(imageLibrary.mainImg, that.frames[frame].x, 33, that.frames[frame].y, 32, -16, -16, 33, 32);
            ctx.restore();
            explosion.finish(that.frames.length);
        });
    }
});

var MissileRenderer = Renderer.extend({

    init: function(miss) {
        this.missiles = miss;
    },

    render: function(ctx, imageLibrary, viewPort) {
        var that = this;
        this.missiles.forEach(function(missile, idx) {
            ctx.save();
            ctx.translate(missile.position().X(), missile.position().Y());
            ctx.rotate(that._angleFrom(missile.heading()));
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

});

var BulletRenderer = Renderer.extend({

    init: function(blts) {
        this.bullets = blts;
    },

    render: function(ctx, imageLibrary, viewPort) {
        this._visibleEntities(viewPort, this.bullets).forEach(function(bullet) {
            ctx.save();
            ctx.translate(bullet.position.X() - viewPort.position.X(),
                bullet.position.Y() - viewPort.position.Y());
            ctx.drawImage(imageLibrary.mainImg, 277, 45, 8, 8, -4, -4, 8, 8);
            ctx.restore();
        });
    }
});

var HeadQuartersRenderer = Renderer.extend({

    init: function(hq) {
        this.headquarters = hq;
    },

    render: function(ctx, imageLibrary, viewPort) {
        this._visibleEntities(viewPort, this.headquarters).forEach(function(hq) {
            var numTiles = Math.ceil((hq.radius * 2) / 32);
            ctx.save();
            ctx.translate(hq.position.X() - viewPort.position.X() - hq.radius,
                hq.position.Y() - viewPort.position.Y() - hq.radius);
            for (var y = 0; y < numTiles; y++) {
                for (var x = 0; x < numTiles; x++) {
                    ctx.drawImage(imageLibrary.mainImg, 132, 66, 32, 32, x * 32, y * 32, 32, 32);
                }
            }
            ctx.restore();
        });
    }

});

var MineRenderer = Renderer.extend({

    init: function(m) {
        this.mines = m;
    },

    render: function(ctx, imageLibrary, viewPort) {
        this._visibleEntities(viewPort, this.mines).forEach(function(mine) {
            var numTiles = Math.ceil((mine.radius * 2) / 30);
            ctx.save();
            ctx.translate(mine.position.X() - viewPort.position.X() - mine.radius,
                mine.position.Y() - viewPort.position.Y() - mine.radius);
            for (var y = 0; y < numTiles; y++) {
                for (var x = 0; x < numTiles; x++) {
                    ctx.drawImage(imageLibrary.mainImg, 100, 166, 29, 30, x * 29, y * 30, 29, 30);
                }
            }
            ctx.restore();
        });
    }

});

var TankerRenderer = Renderer.extend({

    init: function(tnkrs) {
        this.tankers = tnkrs;
    },

    render: function(ctx, imageLibrary, viewPort) {
        var that = this;
        this._visibleEntities(viewPort, this.tankers).forEach(function(tanker) {
            ctx.save();
            var posX = tanker.position.X() - viewPort.position.X();
            var posY = tanker.position.Y() - viewPort.position.Y();
            ctx.translate(posX, posY);
            ctx.rotate(that._angleFrom(tanker.heading));
            ctx.drawImage(imageLibrary.tankerImg, 220, 6, 20, 40, -tanker.width / 2, -tanker.length / 2, 30, 60);
            ctx.restore();
            that._drawHealthBar(ctx, viewPort, tanker, 45);
            if (tanker.loading) {
                var radians = (2 * Math.PI) * tanker.capacityUsed();
                ctx.save();
                ctx.translate(posX, posY);
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.lineTo(0, -15);
                ctx.arc(0, -15, 15, -(Math.PI/2), -(Math.PI/2) + radians, false);
                ctx.fill();
                ctx.restore();
            }
        });
    }

});

var ArrowRenderer = Renderer.extend({

    render: function(ctx, imageLibrary, viewPort) {
        ctx.save();
        for (var prop in Arrows) {
            if (Arrows.hasOwnProperty(prop)) {
                var arrow = Arrows[prop];
                ctx.drawImage(imageLibrary.arrowsImg, arrow.imgX, arrow.imgY, 27, 28, arrow.x, arrow.y, 27, 28);
            }
        }
        ctx.restore();
    }

});

var Arrows = {

    NW: {x: 0, y: 0, imgX: 1, imgY: 1, orientation: $V([-1, -1]) },
    N:  {x: BATTLEFIELD_WIDTH / 2 - 14, y: 0, imgX: 31, imgY: 1, orientation: $V([0, -1]) },
    NE: {x: BATTLEFIELD_WIDTH - 28, y: 0, imgX: 61, imgY: 1, orientation: $V([1, -1]) },
    W:  {x: 0, y: BATTLEFIELD_HEIGHT / 2 - 14, imgX: 1, imgY: 30, orientation: $V([-1, 0]) },
    E:  {x: BATTLEFIELD_WIDTH - 28, y: BATTLEFIELD_HEIGHT / 2 - 14, imgX: 61, imgY: 30, orientation: $V([1, 0]) },
    SW: {x: 0, y: BATTLEFIELD_HEIGHT - 28, imgX: 1, imgY: 60, orientation: $V([-1, 1]) },
    S:  {x: BATTLEFIELD_WIDTH / 2 - 14, y: BATTLEFIELD_HEIGHT - 28, imgX: 31, imgY: 60, orientation: $V([0, 1]) },
    SE: {x: BATTLEFIELD_WIDTH - 28, y: BATTLEFIELD_HEIGHT - 28, imgX: 61, imgY: 60, orientation: $V([1, 1]) },

    directionFor: function(x, y) {
        for (var prop in Arrows) {
            if (Arrows.hasOwnProperty(prop)) {
                var arrow = Arrows[prop];
                if (pointInRectangle(arrow.x, arrow.y, 27, 28, x, y, 14)) {
                    return prop;
                }
            }
        }
    },

    orientation: function(direction) {
        return this[direction].orientation;
    }

}