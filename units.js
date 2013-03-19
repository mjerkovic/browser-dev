/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();

var Unit = Class.extend({
    init: function(spec) {
        this.radius = spec.radius || 16;
        this.position = spec.position || $V([spec.posX, spec.posY]);
        this.heading = spec.heading || $V([spec.headingX, spec.headingY]);
        this.side = this.heading.perp();
        this.health = 1;
    },

    intersects: function(entity) {
        return this.position.distanceFrom(entity.position) <= (this.radius + entity.radius);
    },

    intersectsPoint: function(point) {
        var distance = this.position.distanceFrom(point);
        console.log(distance);
        return distance <= this.radius;
    },

    hit: function() {
        this.health = Math.max(0, this.health - 0.25);
    }
});

MovableUnit = Unit.extend({
    init: function(spec) {
        this._super(spec);
        this.maxSpeed = spec.maxSpeed || 3;
        this.maxTurnRate = 1.57 / FRAMES_PER_SECOND; // 90 degrees per second
        this.mass = 1;
        this.velocity = spec.velocity || $V([0, 0]);
        this.steering = spec.steering;
        this.goal = spec.goal;
    },

    seekTo: function(pos) {
        this.steering.seekTo(pos);
        return this;
    },

    seekOff: function() {
        this.steering.seekOff();
        return this;
    },

    arriveAt: function(pos) {
        this.steering.arriveAt(pos);
        return this;
    },

    arriveOff: function() {
        this.steering.arriveOff();
        this.velocity = Vector.Zero(2);
        return this;
    },

    wander: function() {
        this.steering.wanderAround();
        return this;
    },

    wanderOff: function() {
        this.steering.wanderOff();
        return this;
    },

    wallAvoidance: function() {
        this.steering.wallAvoidance();
        return this;
    },

    interpose: function(a, b) {
        this.steering.interposeOn(a, b);
        return this;
    },

    interposeOff: function() {
        this.steering.interposeOff();
        return this;
    },

    pursue: function(target) {
        this.steering.pursue(target);
        return this;
    },

    pursueOff: function() {
        this.steering.pursueOff();
        return this;
    },

    update: function() {
        if (this.goal) {
            this.goal.process(this);
        }
        var steeringForce = this.steering.calculate(this);
        //steeringForce = this._restrictTurnRate(steeringForce);
        var acceleration = steeringForce.dividedBy(this.mass);
        this.velocity = this.velocity.add(acceleration).truncate(this.maxSpeed);
        this.position = this.position.add(this.velocity);
        if (steeringForce.modulus() > 0.000001) {
            this.heading = this.velocity.toUnitVector();
            this.side = this.heading.perp();
        }
    },

    _restrictTurnRate: function(steeringForce) {
        var newHeading = this.heading.add(steeringForce).toUnitVector();
        var angle = this.heading.dot(newHeading);
        if (angle < 0) {
            var direction = Math.atan2(newHeading.Y(), newHeading.X());
            var turnAngle = (direction > 0) ? this.maxTurnRate : -this.maxTurnRate;
            var adjustedHeading = this.heading.rotate(turnAngle, Vector.Zero(2));
            return adjustedHeading.subtract(this.heading).multiply(steeringForce.length());
        } else if (angle > this.maxTurnRate) {
            return steeringForce.multiply(this.maxTurnRate);
        } else {
            return steeringForce;
        }
    }

});

var Tank = MovableUnit.extend({
    init: function(spec) {
        this._super(spec);
        this.missileCapacity = spec.missiles || 6;
        this.missilesFired = 0;
        this.cannon = spec.cannon;
        this.cannon.owner = this;
    },

    update: function() {
        this._super();
        this.cannon.update();
    },

    missiles: function() {
        return this.missileCapacity - this.missilesFired;
    },

    elevateTo: function(angleInDegrees) {
        this.cannon.elevateTo(angleInDegrees);
    },

    aim: function() {
        return this.cannon.aim();
    },

    aimAt: function(mousePos) {
        this.cannon.aimAt($V([mousePos.x, mousePos.y]).subtract(this.position));
    },

    fireMissile: function() {
        if (this.missiles() > 0) {
            this.missilesFired++;
            return this.cannon.fireMissile(this);
        } else {
            return null;
        }
    },

    shootAt: function(target, completed) {
        var toTarget = target.position.subtract(this.position).toUnitVector();
        return Math.abs(this.heading.dot(toTarget)) <= 1;
    }

});

var AutoTank = Tank.extend({
    init: function(spec) {
        this._super(spec);
    },

    update: function() {
        this._super();
        this.cannon.update();
    }
});

var Bullet = MovableUnit.extend({
    init: function(spec) {
        this.firedBy = spec.firedBy;
        this.target = spec.target;
        spec.velocity = spec.heading.multiply(9);
        spec.maxSpeed = 9;
        spec.radius = 3;
        this._super(spec);
        this.startingPosition = spec.position;
        this.completed = spec.completed;
        this.range = 300;
        this.hitTest = spec.hitTest;
    },

    update: function() {
        var victim = this.hitTest(this);
        if (victim) {
            victim.hit();
            this.completed(this, true);
        }
        else if (this.position.subtract(this.startingPosition).length() > this.range) {
            this.completed(this, false);
        } else {
            this.position = this.position.add(this.velocity);
        }
    }
});

function Cannon(spec) {

    var aimVector = $V([spec.headingX, spec.headingY]);
    var veloc = spec.velocity || 20;
    var angle = spec.angle || 45;
    var rangeInMetres = Math.floor((2 * Math.pow(veloc, 2) * Math.sin(toRadians(angle)) * Math.cos(toRadians(angle))) / 19.621);
    var targetingSys = spec.targetingSystem;
    var steering = spec.steering;
    var goal = spec.goal;

    this.aim = function() {
        return aimVector.dup();
    }

    this.elevation = function() {
        return angle;
    }

    this.velocity = function() {
        return veloc;
    }

    this.range = function() {
        return rangeInMetres;
    }

    this.targetingSystem = function() {
        return targetingSys;
    }

    this.aimAt = function(pos) {
        aimVector = pos.dup().toUnitVector()
    }

    this.elevateTo = function(angleInDegrees) {
        angle = Math.min(Math.max(0, angle + angleInDegrees), 90);
        rangeInMetres = Math.floor((2 * Math.pow(veloc, 2) * Math.sin(toRadians(angle)) * Math.cos(toRadians(angle))) / 19.621);
    }

    this.fireMissile = function(firedBy) {
        return {
            position: { x: firedBy.position.X() + ((Math.cos(toRadians(angle)) * aimVector.X()) * 20),
                y: firedBy.position.Y() + ((Math.sin(toRadians(angle)) * aimVector.Y()) * 20) },
            heading: { x: aimVector.X(), y: aimVector.Y() },
            firingAngle: angle,
            velocity: veloc,
            firedBy: firedBy
        };
    }

    this.update = function() {
        if (goal) {
            goal.process(this);
        }
    }

    this.pursue = function(target) {
        steering.pursue(target);
    }

    this.pursueOff = function() {
        steering.pursueOff();
    }

}

var AutoCannon = MovableUnit.extend({

    init: function(spec) {
        this._super(spec);
        this.firingVelocity = spec.firingVelocity || 20;
        this.elevation = spec.angle || 45;
        //this.rangeInMetres = Math.floor((2 * Math.pow(veloc, 2) * Math.sin(toRadians(angle)) * Math.cos(toRadians(angle))) / 9.81);
        this.targetingSystem = spec.targetingSystem;
        this.owner = spec.owner;
    },

    update: function() {
        this._super();
        this.position = this.owner.position.dup();
    },

    alignHeading: function() {
        this.heading = this.owner.heading.dup();
    }

});

var toRadians = function(angleInDegrees) {
    return (Math.PI / 180) * angleInDegrees;
}

function Missile(spec, callback) {
    var startingPos;
    var pos = startingPos = $V([spec.position.x, spec.position.y]);
    var head = $V([spec.heading.x, spec.heading.y]);
    var angle = spec.firingAngle;
    var angleInRadians = toRadians(angle);
    var initHeight = spec.initialHeight || 0;
    var currHeight = spec.currentHeight || 0;
    var newHeight  = 99999999;
    var veloc = spec.velocity || 20;
    var xVelocity = (veloc) * Math.cos(angleInRadians);
    var yVelocity = (veloc) * Math.sin(angleInRadians);
    var time = 0;
    var maxH = Trajectory.maxHeight(veloc, angle, initHeight);
    var impactTime = Trajectory.impactTime(veloc, angle);
    var mirv = spec.mirv || false;
    var bomblet = spec.bomblet || false;

    this.currentHeight = function() {
        return currHeight;
    },

    this.maxHeight = function() {
        return maxH;
    },

    this.position = function() {
        return pos.dup();
    },

    this.heading = function() {
        return head.dup();
    },

    this.flightTime = function() {
        return time;
    }

    this.timeToImpact = function() {
        return impactTime - time;
    }

    this.isMirv = function() {
        return mirv;
    }

    this.firingAngle = function() {
        return angle;
    }

    this.velocity = function() {
        return veloc;
    }

    this.initialHeight = function() {
        return initHeight;
    }

    this.isBomblet = function() {
        return bomblet;
    }

    this.update = function() {
        time = time + 0.1;
        newHeight = yVelocity * time + 0.5 * -19.62 * time * time;
        var done = (mirv) ? newHeight <= currHeight : currHeight < 0;
        currHeight = newHeight;
        if (done) {
            callback(this);
        } else {
            pos = pos.add(head.multiply(xVelocity * 0.1));
        }
    }
}

function Explosion(pos, showBlastRange, endFunction) {
    this.x = pos.X();
    this.y = pos.Y();
    this.blastRange = showBlastRange;
    var frame = 0;

    this.currentFrame = function() {
        frame++;
        return frame;
    },

    this.finish = function(frameCount) {
        if (frame == frameCount - 1) {
            endFunction(this);
        }
    }

}

var HeadQuarters = Unit.extend({
    init: function(spec) {
        this._super(spec);
        this.energy = spec.energy || 0;
    },

    storeEnergy: function(amount) {
        this.energy = this.energy + amount;
    }

});

var Mine = Unit.extend({
    init: function(spec) {
        this._super(spec);
        this.tonnes = spec.tonnes;
        this.bays = spec.bays;
    },

    requestBay: function() {
        var availableBays = this.bays.filter(function(bay) {
            return bay.reserved == false;
        });
        if (availableBays.isEmpty()) {
            return null;
        } else {
            availableBays[0].reserved = true;
            return availableBays[0];
        }
    },

    mineForEnergy: function()  {
        if (this.tonnes > 0) {
            this.tonnes--;
            return 1;
        } else {
            return 0;
        }
    }
});

var Tanker = MovableUnit.extend({
    init: function(spec) {
        this._super(spec);
        this.width = spec.width;
        this.length = spec.length;
        this.capacity = spec.capacity;
        this.transferRate = spec.transferRate / FRAMES_PER_SECOND;
        this.loadingBay;
        this.goal = spec.goal;
        this.load = 0;
        this.loading = false;
    },

    update: function() {
        this.goal.process(this);
        this._super();
    },

    intersects: function(entity) {
        var entityLocal = pointToLocalSpace(entity.position, this.heading, this.side, this.position);
        var ax1 = -this.length / 2;
        var ay1 = -this.width / 2
        var ax2 = this.length / 2;
        var ay2 = this.width / 2;
        var bx1 = entityLocal.X() - entity.radius / 2;
        var by1 = entityLocal.Y() - entity.radius / 2;
        var bx2 = entityLocal.X() + entity.radius / 2;
        var by2 = entityLocal.Y() + entity.radius  / 2;
        return (
            ax1 <= bx2 &&
            bx1 <= ax2 &&
            ay1 <= by2 &&
            by1 <= ay2
        );
    },

    intersectsPoint: function(point) {
        var localPoint = pointToLocalSpace(point, this.heading, this.side, this.position);
        return (
            localPoint.X() >= -(this.length / 2) &&
            localPoint.X() <= (this.length / 2) &&
            localPoint.Y() >= -(this.width / 2) &&
            localPoint.Y() <= (this.width / 2)
        );
    },

    assignBay: function(bay) {
        bay.reserved = true;
        this.loadingBay = bay;
    },

    loadEnergy: function(energy) {
        this.load = this.load + energy;
    },

    capacityUsed: function() {
        return this.load / this.capacity;
    },

    unload: function() {
        var result = 0;
        if (this.load < this.transferRate) {
            result = this.load;
            this.load = 0;
            return result
        } else {
            result = this.transferRate;
            this.load = this.load - this.transferRate;
        }
        return result;
    }
});

var Army = Class.extend({

    init: function(spec) {
        this.hq =  spec.hq;
        this.mines = spec.mines;
        this.tanks =  spec.tanks;
        this.tankers = spec.tankers;
    },

    update: function() {
        this.tanks.forEach(function(tank) {
            tank.update();
        });
        this.tankers.forEach(function(tanker) {
            tanker.update();
        });
    },

    getClosestMine: function(point) {
        var closestMine = { distance: 99999999, mine: null };
        this.mines.forEach(function(mine) {
            var distanceToMine = point.distanceFrom(mine);
            if (distanceToMine < closestMine.distance) {
                closestMine.distance = distanceToMine;
                closestMine.mine = mine;
            }
        });
        return closestMine.mine;
    }
});

var TargetingSystem = Class.extend({

    init: function(w) {
        this.world = w;
        this.target;
    },

    findTargets: function(position, owner, range) {
        return this.world.vehicles.filter(function(entity) {
            return entity != owner && position.distanceFrom(entity.position) <= range;
        });
    },

    track: function(targetToTrack) {
        this.target = targetToTrack;
    },

    stopTracking: function() {
        this.target = null;
    },

    targetInRange: function(position, range) {
        return this.target != null &&
            position.distanceFrom(this.target.position) <= range;
    }

});
