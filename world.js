function World(ctx) {

    var singleImage = new Image();
    singleImage.src = 'images/tankbrigade.png';
    var missiles = [];
    var tanks = [];
    var explosions = [];
    var playerTank = new Tank({posX: 400, posY: 400, headingX: 1, headingY: 0});
    tanks.push(playerTank);
    var playerTankRenderer = new TankRenderer(playerTank);
    var worldRenderer = new WorldRenderer(playerTank);
    var missileRenderer = new MissileRenderer(missiles);
    var explosionRenderer = new ExplosionRenderer(explosions);
    var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, singleImage,
        [worldRenderer, playerTankRenderer, explosionRenderer, missileRenderer]);

    this.movePlayerTankTo = function(pos) {
        playerTank.seekTo(pos);
    },

    this.adjustFiringAngle = function(angleDelta) {
        playerTank.angleTo(angleDelta);
    }

    this.fireMissile = function() {
        var missile = new Missile(playerTank.fire(), function(miss, point) {
            missiles.splice(missiles.indexOf(miss), 1);
            explosions.push(new Explosion(point, function(exp) {
                explosions.splice(explosions.indexOf(exp), 1);
            }));
        });
        missiles.push(missile);
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