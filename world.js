function World(ctx) {

    var singleImage = new Image();
    singleImage.src = 'images/tankbrigade.png';
    var missiles = [];
    var tanks = [];
    var explosions = [];
    var craters = [];
    var playerTank = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0, missiles: 6, cannon: Armoury.simpleCannon(1, 0)});
    var enemyTankSteering = new Steering();
    var enemyTank = new Tank({posX: 700, posY: 200, headingX: -0.7071, headingY: -0.7071, missiles: 6, cannon: Armoury.simpleCannon(-0,7071, -0,7071)});
    tanks.push(playerTank, enemyTank);
    enemyTank.wander();
    var walls = [];
    walls.push(
            new Wall($V([0, 0]), $V([800, 0])),
            new Wall($V([0, 0]), $V([0, 700])),
            new Wall($V([800, 0]), $V([800, 700])),
            new Wall($V([0, 700]), $V([800, 700]))
    );
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
            var missile = Armoury.missile(firePos, function(miss, point) {
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
                if (tank.position().distanceFrom($V([point.x, point.y])) < 50) {
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
        return new Missile(pos, callback);
    }
}