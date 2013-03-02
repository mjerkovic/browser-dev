function World(ctx) {

    var singleImage = new Image();
    singleImage.src = 'images/tankbrigade.png';
    var missiles = [];
    var tanks = [];
    var explosions = [];
    var craters = [];
    var playerTankSteering = new Steering();
    var playerTank = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0, missiles: 3, steering: playerTankSteering});
    var enemyTankSteering = new Steering();
    var enemyTank = new Tank({posX: 700, posY: 200, headingX: -0.7071, headingY: -0.7071, missiles: 3, steering: enemyTankSteering});
    tanks.push(playerTank, enemyTank);
    enemyTank.wander();
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
            var missile = new Missile(firePos, function(miss, point) {
                missiles.splice(missiles.indexOf(miss), 1);
                explosions.push(new Explosion(point, function(exp) {
                    explosions.splice(explosions.indexOf(exp), 1);
                }));
                explosion(point);
            });
            missiles.push(missile);
        }

        function explosion(point) {
            craters.push(point);
            tanks.forEach(function(tank) {
                if (tank.position().distanceFrom($V([point.x, point.y, 0])) < 50) {
                    tank.hit();
                }
            });
        }
    },

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

function pointToWorldSpace(tank, point) {
    var h = tank.heading();
    var s = $V([-h.Y(), h.X(), 0]);
    var p = tank.position();

    var x = (h.X() * point.X()) + (s.X() * point.Y()) + p.X();
    var y = (h.Y() * point.X()) + (s.Y() * point.Y()) + p.Y();

    return $V([x, y, 0]);
}