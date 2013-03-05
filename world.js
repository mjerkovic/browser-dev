function World(ctx) {

    var singleImage = new Image();
    singleImage.src = 'images/tankbrigade.png';
    var missiles = [];
    var tanks = [];
    var explosions = [];
    var craters = [];
    var walls = [
        new Wall($V([0, 0]), $V([800, 0])),
        new Wall($V([0, 0]), $V([0, 700])),
        new Wall($V([800, 0]), $V([800, 700])),
        new Wall($V([0, 700]), $V([800, 700]))
    ];
    var playerTank = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0, missiles: 6, cannon: Armoury.simpleCannon(1, 0), steering: new Steering(walls)});
    var enemyTank = new Tank({posX: 700, posY: 200, headingX: -0.7071, headingY: -0.7071, missiles: 6, cannon: Armoury.simpleCannon(-0,7071, -0,7071), steering: new Steering(walls)});
    tanks.push(playerTank, enemyTank);
    enemyTank.wander();
    enemyTank.wallAvoidance();
    var playerTankRenderer = new TankRenderer(playerTank);
    var enemyTankRenderer = new TankRenderer(enemyTank);
    var worldRenderer = new WorldRenderer(playerTank, craters);
    var missileRenderer = new MissileRenderer(missiles);
    var explosionRenderer = new ExplosionRenderer(explosions);
    var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, singleImage,
        [worldRenderer, playerTankRenderer, enemyTankRenderer, explosionRenderer, missileRenderer]);

    this.movePlayerTankTo = function(pos) {
        playerTank.seekTo(pos);
    },

    this.adjustFiringAngle = function(angleDelta) {
        playerTank.angleTo(angleDelta);
    },

    this.fireMissile = function() {
        var firePos = playerTank.fire();
        if (firePos) {
            var missile = Armoury.missile(firePos, onImpact);
            missiles.push(missile);
        }
    }

    var onImpact = function(miss) {
        missiles.splice(missiles.indexOf(miss), 1);
        if (miss.isMirv()) {
            missiles.push(
                Armoury.rainMissile(miss, miss.heading(), onImpact),
                Armoury.rainMissile(miss, miss.heading().rotate((Math.PI / 2) * 0.5, Vector.Zero(2)), onImpact),
                Armoury.rainMissile(miss, miss.heading().rotate((Math.PI / 2), Vector.Zero(2)), onImpact),
                Armoury.rainMissile(miss, miss.heading().rotate((Math.PI / 2) * 3, Vector.Zero(2)), onImpact),
                Armoury.rainMissile(miss, miss.heading().rotate((Math.PI / 2) * 3.5, Vector.Zero(2)), onImpact)
            );
        } else {
            explosions.push(new Explosion(miss.position(), function(exp) {
                explosions.splice(explosions.indexOf(exp), 1);
            }));
            explosion(miss.position());
        }
    }

    var explosion = function(point) {
        craters.push(point);
        tanks.forEach(function(tank) {
            if (tank.position().distanceFrom(point) < 50) {
                tank.hit();
            }
        });
    }

    this.aimAt = function(pos) {
        playerTank.aimAt(pos);
    },

    this.update = function() {
        tanks.forEach(function(entity) {
            entity.update();
        });
        missiles.forEach(function(entity) {
            entity.update();
        });
    },

    this.render = function() {
        gameRenderer.render();
    }
}

var Armoury = {
    simpleCannon: function(hx, hy) {
        return new Cannon({
            headingX: hx,
            headingY: hy,
            angle: 45,
            velocity: 50
        });
    },

    missile: function(pos, callback) {
        pos.mirv = true;
        return new Missile(pos, callback);
    },

    rainMissile: function(missile, heading, callback) {
        return new Missile({
            position: { x: missile.position().X(), y: missile.position().Y()  },
            "heading": { x: heading.X(), y: heading.Y() },
            firingAngle: missile.firingAngle(),
            velocity: missile.velocity(),
            initialHeight: missile.initialHeight(),
            currentHeight: missile.currentHeight(),
            maxHeight: missile.maxHeight(),
        }, callback);
    }
}