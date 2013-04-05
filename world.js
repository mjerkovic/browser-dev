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
    var arrowsImage = new Image();
    arrowsImage.src = 'images/arrows-sprite.png';
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
        ],
        arrowsImg: arrowsImage
    };
    var missiles = [];
    var tanks = [];
    var explosions = [];
    var craters = [];
    var bulletsFired = [];
    this.vehicles = [];
    var walls = [
        new Wall($V([0, 0]), $V([WORLD_WIDTH, 0])),
        new Wall($V([WORLD_WIDTH, 0]), $V([WORLD_WIDTH, WORLD_HEIGHT])),
        new Wall($V([WORLD_WIDTH, WORLD_HEIGHT]), $V([0, WORLD_HEIGHT])),
        new Wall($V([0, WORLD_HEIGHT]), $V([0, 0]))
    ];
    var playerTank = new Tank({
        posX: 400,
        posY: 400,
        headingX: 1,
        headingY: 0,
        missiles: 1000,
        cannon: Armoury.simpleCannon(1, 0, this),
        steering: new Steering(walls)
    });
    var escortCannon = Armoury.autoCannon(-0.7071, -0.7071, this)
    var escortTank = new AutoTank({
        posX: 150,
        posY: 90,
        headingX: 0,
        headingY: 1,
        missiles: 1000,
        cannon: escortCannon,
        steering: new Steering(walls)
    });
    escortCannon.owner = escortTank;
    var enemyCannon = Armoury.autoCannon(-0.7071, -0.7071, this)
    var enemyTank = new AutoTank({
        posX: 700,
        posY: 200,
        headingX: -0.7071,
        headingY: -0.7071,
        missiles: 1000,
        cannon: enemyCannon,
        steering: new Steering(walls),
        goal: new EnemyTankGoal()
    });
    enemyCannon.owner = enemyTank;
    tanks.push(enemyTank, playerTank, escortTank);
    playerTank.wallAvoidance();
    enemyTank.wallAvoidance();
    escortTank.wallAvoidance();
    this.vehicles = this.vehicles.concat(tanks);
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
        radius: 15,
        headingX: 0,
        headingY: 1,
        steering: new Steering(walls),
        width: 30,
        length: 60,
        capacity: 100,
        transferRate: 10,
        goal: new TankerThinkGoal({mine: playerMine, hq: playerHeadQuarters})
    });
    var tankers = [playerTanker];
    this.vehicles = this.vehicles.concat(tankers);
    var playerArmy = new Army({
        hq: playerHeadQuarters,
        mines: [playerMine],
        tanks: [playerTank, escortTank],
        tankers: [playerTanker]
    });
    var enemyArmy = new Army({
        hq: {},
        mines: [],
        tanks: [enemyTank],
        tankers: []
    });
    var nwQuadrant = new Quadrant(1, 0, 0, {"E": 2, "S": 4, "SE": 5});
    var nQuadrant = new Quadrant(2, 800, 0, {"W": 1, "E": 3, "SW": 4, "S": 5, "SE": 6});
    var neQuadrant = new Quadrant(3, 1600, 0, {"W": 2, "SW": 5, "S": 6});
    var wQuadrant = new Quadrant(4, 0, 800, {"N": 1, "NE": 2, "E": 5, "S": 7, "SE": 8});
    var cQuadrant = new Quadrant(5, 800, 800, {"NW": 1, "N": 2, "NE": 3, "W": 4, "E": 6, "SW": 7, "S": 8, "SE": 9});
    var eQuadrant = new Quadrant(6, 1600, 800, {"NW": 2, "N": 3, "W": 5, "SW": 8, "S": 9});
    var swQuadrant = new Quadrant(7, 0, 1600, {"N": 4, "NE": 5, "E": 8});
    var sQuadrant = new Quadrant(8, 800, 1600, {"NW": 4, "N": 5, "NE": 6, "W": 7, "E": 9});
    var seQuadrant = new Quadrant(9, 1600, 1600, {"NW": 5, "N": 6, "W": 8});
    var quadrants = new Quadrants([nwQuadrant, nQuadrant, neQuadrant, wQuadrant, cQuadrant, eQuadrant, swQuadrant,
        sQuadrant, seQuadrant]);
    var viewPort = new Viewport({ currentQuadrant: nwQuadrant, quadrants: quadrants });
    var playerTankRenderer = new PlayerTankRenderer(playerTank);
    var escortTankRenderer = new PlayerTankRenderer(escortTank);
    var trajectoryRenderer = new TrajectoryRenderer(playerTank);
    var enemyTankRenderer = new EnemyTankRenderer(enemyTank);
    var worldRenderer = new WorldRenderer(playerTank, craters);
    var missileRenderer = new MissileRenderer(missiles);
    var bulletRenderer = new BulletRenderer(bulletsFired);
    var explosionRenderer = new ExplosionRenderer(explosions);
    var headQuartersRenderer = new HeadQuartersRenderer(headquarters);
    var tankerRenderer = new TankerRenderer(tankers);
    var mineRenderer = new MineRenderer(mines);
    var arrowRenderer = new ArrowRenderer();
    var gameRenderer = new GameRenderer(ctx, canvas.width, canvas.height, imageLibrary, viewPort,
        [worldRenderer, headQuartersRenderer, mineRenderer, trajectoryRenderer, playerTankRenderer, escortTankRenderer,
            enemyTankRenderer, tankerRenderer, bulletRenderer, explosionRenderer, missileRenderer, arrowRenderer]);
    var userEvents = [];

    this.movePlayerTankTo = function(pos) {
        playerTank.arriveAt(pos);
    }

    this.addUserEvent = function(ev) {
        userEvents.push(ev);
    }

    this.performAction = function(pos) {
        var that = this;
        var targetPos = $V([pos.x - viewPort.position.X(), pos.y - viewPort.position.Y()]);
        var direction = Arrows.directionFor(pos.x, pos.y);
        if (direction) {
            console.log(direction);
            viewPort.move(direction);
        } else {
            var targets = this.vehicles.filter(function(vehicle) {
                return vehicle != playerTank && vehicle.intersectsPoint(targetPos);
            });
            if (targets.length == 1) {
                var target = targets.shift();
                if (playerTank.shootAt(target)) {
                    var bullet = Armoury.bullet(playerTank, playerTank.aim(), target, function(bullet) {
                        for (var i=0; i < that.vehicles.length; i++) {
                            if (that.vehicles[i] != bullet.firedBy && that.vehicles[i].intersects(bullet)) {
                                return that.vehicles[i];
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
    }

    this.enemyFireBullet = function(enemyTank, heading, target) {
        var that = this;
        var bullet = Armoury.bullet(enemyTank, heading, target, function(bullet) {
            for (var i=0; i < that.vehicles.length; i++) {
                if (that.vehicles[i] != bullet.firedBy && that.vehicles[i].intersects(bullet)) {
                    return that.vehicles[i];
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
            explosion(miss.position(), miss.firedBy(), miss.damage());
        }
    }


    var createExplosion = function(position, showBlastRange) {
        explosions.push(new Explosion(position, showBlastRange, function(exp) {
            explosions.splice(explosions.indexOf(exp), 1);
        }));
    }

    var explosion = function(point, firedBy, damage) {
        craters.push(point);
        tanks.forEach(function(tank) {
            if (tank.position.distanceFrom(point) < 50) {
                tank.hit(firedBy, damage);
            }
        });
    }

    this.aimAt = function(pos) {
        playerTank.aimAt(pos);
    }

    this.update = function() {
        while (!userEvents.isEmpty()) {
            var event = userEvents.shift();
            event.fire();
        }
        viewPort.update();
        playerArmy.update(this);
        enemyArmy.update(this);
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
    simpleCannon: function(hx, hy, world) {
        return new Cannon({
            headingX: hx,
            headingY: hy,
            angle: 45,
            firingVelocity: 50,
            targetingSystem: new TargetingSystem(world),
            steering: new Steering()
        });
    },

    autoCannon: function(hx, hy, world) {
        return new AutoCannon({
            headingX: hx,
            headingY: hy,
            angle: 45,
            firingVelocity: 50,
            targetingSystem: new TargetingSystem(world),
            steering: new Steering(),
            goal: new LaserCannonThinkGoal()
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
            bomblet: true,
            damage: 0.1
        }, callback);
    },

    bullet: function(firedBy, heading, firedAt, hitTest, onCompletion) {
        return new Bullet({
            firedBy: firedBy,
            target: firedAt,
            position: firedBy.position,
            heading: heading,
            damage: 0.1,
            hitTest: hitTest,
            completed: onCompletion
        });
    }
}