Array.prototype.isEmpty = function() {
    return this.length == 0;
};

Array.prototype.peek = function() {
    return  this.isEmpty() ? null : this[0];
}

function World(ctx) {

    var singleImage = new Image();
    singleImage.src = 'images/tankbrigade2.png';
    var greenTurretImage = new Image();
    greenTurretImage.src = 'images/green_turret.png';
    var blueTurretImage = new Image();
    blueTurretImage.src = 'images/blue_turret.png';
    var tankerImage = new Image();
    tankerImage.src = 'images/vehicles.png';
    var imageLibrary = {
        mainImg: singleImage,
        playerTurretImg: greenTurretImage,
        enemyTurretImg: blueTurretImage,
        tankerImg: tankerImage,
        playerImgPos: [
        { x: 726, y: 34, w: 31, h: 31 },
        { x: 693, y: 34, w: 31, h: 31 },
        { x: 660, y: 34, w: 31, h: 31 },
        { x: 627, y: 34, w: 31, h: 31 },
        { x: 594, y: 34, w: 31, h: 31 },
        { x: 561, y: 34, w: 31, h: 31 },
        { x: 528, y: 34, w: 31, h: 31 },
        { x: 495, y: 34, w: 31, h: 31 }
        ],
        enemyImgPos: [
            { x: 726, y: 330, w: 31, h: 31 },
            { x: 693, y: 330, w: 31, h: 31 },
            { x: 660, y: 330, w: 31, h: 31 },
            { x: 627, y: 330, w: 31, h: 31 },
            { x: 594, y: 330, w: 31, h: 31 },
            { x: 561, y: 330, w: 31, h: 31 },
            { x: 528, y: 330, w: 31, h: 31 },
            { x: 594, y: 165, w: 31, h: 31 }
        ]
    };
    var missiles = [];
    var tanks = [];
    var explosions = [];
    var craters = [];
    var bulletsFired = [];
    var vehicles = [];
    var walls = [
        new Wall($V([0, 0]), $V([800, 0])),
        new Wall($V([800, 0]), $V([800, 700])),
        new Wall($V([800, 700]), $V([0, 700])),
        new Wall($V([0, 700]), $V([0, 0]))
    ];
    var playerTank = new Tank({
        posX: 400,
        posY: 400,
        headingX: 1,
        headingY: 0,
        missiles: 6,
        cannon: Armoury.simpleCannon(1, 0),
        steering: new Steering(walls)
    });
    var enemyTank = new AutoTank({
        posX: 700,
        posY: 200,
        headingX: -0.7071,
        headingY: -0.7071,
        missiles: 6,
        cannon: Armoury.simpleCannon(-0,7071, -0,7071),
        steering: new Steering(walls)
    });
    tanks.push(enemyTank, playerTank);
    playerTank.wallAvoidance();
    enemyTank.wander().wallAvoidance();
    vehicles = vehicles.concat(tanks);
    var playerHeadQuarters = new HeadQuarters({
        posX: 48,
        posY: 48,
        radius: 48
    });
    var headquarters = [playerHeadQuarters];
    var playerMine = new Mine({
        posX: 45,
        posY: 600,
        radius: 45,
        tonnes: 10000,
        bays: [
            { reserved: false, approach: { inbound: [ {x: 72, y: 520}, {x: 72, y: 570}, {x: 72, y: 600} ], outbound: {x: 72, y: 470 } } },
            { reserved: false, approach: { inbound: [ {x: 45, y: 520}, {x: 45, y: 570}, {x: 45, y: 600} ], outbound: {x: 45, y: 500 } } }
        ]
    });
    var mines = [playerMine];
    var playerTanker= new Tanker({
        posX: 120,
        posY: 40,
        headingX: 0,
        headingY: 1,
        steering: new Steering(walls),
        width: 30,
        length: 60,
        capacity: 100,
        transferRate: 1,
        goal: new TankerThinkGoal({mine: playerMine, hq: playerHeadQuarters})
    });
    var tankers = [playerTanker];
    vehicles = vehicles.concat(tankers);
    var playerArmy = new Army({
        hq: playerHeadQuarters,
        mines: [playerMine],
        tanks: [playerTank],
        tankers: [playerTanker]
    });
    var enemyArmy = new Army({
        hq: {},
        mines: [],
        tanks: [enemyTank],
        tankers: []
    });
    var playerTankRenderer = new PlayerTankRenderer(playerTank);
    var trajectoryRenderer = new TrajectoryRenderer(playerTank);
    var enemyTankRenderer = new EnemyTankRenderer(enemyTank);
    var worldRenderer = new WorldRenderer(playerTank, craters);
    var missileRenderer = new MissileRenderer(missiles);
    var bulletRenderer = new BulletRenderer(bulletsFired);
    var explosionRenderer = new ExplosionRenderer(explosions);
    var headQuartersRenderer = new HeadQuartersRenderer(headquarters);
    var tankerRenderer = new TankerRenderer(tankers);
    var mineRenderer = new MineRenderer(mines);
    var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, imageLibrary,
        [worldRenderer, headQuartersRenderer, mineRenderer, trajectoryRenderer, playerTankRenderer, enemyTankRenderer,
            tankerRenderer, bulletRenderer, explosionRenderer, missileRenderer]);

    this.movePlayerTankTo = function(pos) {
        playerTank.arriveAt(pos);
    }

    this.performAction = function(pos) {
        var targetPos = $V([pos.x, pos.y]);
        var targets = vehicles.filter(function(vehicle) {
            return vehicle != playerTank && vehicle.intersectsPoint(targetPos);
        });
        if (targets.length == 1) {
            var target = targets.shift();
            if (playerTank.shootAt(target)) {
                var bullet = Armoury.bullet(playerTank, target, function(bullet) {
                    for (var i=0; i < vehicles.length; i++) {
                        if (vehicles[i] != bullet.firedBy && vehicles[i].intersects(bullet)) {
                            return vehicles[i];
                        }
                    }
                    return null;
                }, function(bullet, hit) {
                    bulletsFired.splice(bulletsFired.indexOf(bullet), 1);
                    if (hit) {
                        createExplosion(bullet.position, false);
                    }
                });
                bulletsFired.push(bullet);
            }
        } else {
            this.movePlayerTankTo(pos);
        }

    }

    this.adjustFiringAngle = function(angleDelta) {
        playerTank.elevateTo(angleDelta);
    }

    this.fireMissile = function(pos) {
        var firePos = playerTank.fireMissile();
        if (firePos) {
            var missile = (fireMirv) ? Armoury.mirvMissile(firePos, onImpact) : Armoury.missile(firePos, onImpact);
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
            createExplosion(miss.position(), true);
            explosion(miss.position());
        }
    }


    var createExplosion = function(position, showBlastRange) {
        explosions.push(new Explosion(position, showBlastRange, function(exp) {
            explosions.splice(explosions.indexOf(exp), 1);
        }));
    }

    var explosion = function(point) {
        craters.push(point);
        tanks.forEach(function(tank) {
            if (tank.position.distanceFrom(point) < 50) {
                tank.hit();
            }
        });
    }

    this.aimAt = function(pos) {
        playerTank.aimAt(pos);
    }

    this.update = function() {
        playerArmy.update();
        enemyArmy.update();
        missiles.forEach(function(entity) {
            entity.update();
        });
        bulletsFired.forEach(function(bullet) {
            bullet.update();
        });
    }

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
    },

    mirvMissile: function(pos, callback) {
        pos.mirv = true;
        return this.missile(pos, callback);
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
            bomblet: true
        }, callback);
    },

    bullet: function(firedBy, firedAt, hitTest, onCompletion) {
        return new Bullet({
            firedBy: firedBy,
            target: firedAt,
            position: firedBy.position,
            heading: firedBy.heading,
            hitTest: hitTest,
            completed: onCompletion
        });
    }
}