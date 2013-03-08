var Unit = function(spec) {
    this.radius = spec.radius || 16;
    this.position = $V([spec.posX, spec.posY]);
    this.heading = $V([spec.headingX, spec.headingY]);
    this.health = 1;

    this.intersects = function(entity) {
        return this.position.distanceFrom(entity.position) <= (this.radius + entity.radius);
    }

    this.hit = function() {
        this.health = this.health - 0.25;
    }

}

MovableUnit = function(spec) {
    Unit.call(this, spec);
    this.maxSpeed = spec.maxSpeed || 3;
    this.maxTurnRate = 0.44; // 25 degrees
    this.mass = 1;
    this.velocity = $V([0, 0]);
    this.steering = spec.steering;

    this.update = function() {
        var steeringForce = this.steering.calculate(this);
        steeringForce = this._restrictTurnRate(steeringForce);
        var acceleration = steeringForce.dividedBy(this.mass);
        this.velocity = this.velocity.add(acceleration).truncate(this.maxSpeed);
        this.position = this.position.add(this.velocity);
        if (steeringForce.modulus() > 0.000001) {
            this.heading = this.velocity.toUnitVector();
        }
    }

    this.seekTo = function(pos) {
        this.steering.seekTo(pos);
        return this;
    }

    this.arriveAt = function(pos) {
        this.steering.arriveAt(pos);
        return this;
    }

    this.wander = function() {
        this.steering.wanderAround();
        return this;
    }

    this.wallAvoidance = function() {
        this.steering.wallAvoidance();
        return this;
    }

    this._restrictTurnRate = function(steeringForce) {
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
}

MovableUnit.prototype = Object.create(Unit.prototype);

var Tank = function(spec) {
    MovableUnit.call(this, spec);
    this.missileCapacity = spec.missiles || 6;
    this.missilesFired = 0;
    this.cannon = spec.cannon;

    this.missiles = function() {
        return this.missileCapacity - this.missilesFired;
    }

    this.elevateTo = function(angleInDegrees) {
        this.cannon.elevateTo(angleInDegrees);
    }

    this.aim = function() {
        return this.cannon.aim();
    }

    this.aimAt = function(mousePos) {
        this.cannon.aimAt($V([mousePos.x, mousePos.y]).subtract(this.position));
    }

    this.fire = function() {
        if (this.missiles() > 0) {
            this.missilesFired++;
            return this.cannon.fire(this.position);
        } else {
            return null;
        }
    }

}

Tank.prototype = Object.create(MovableUnit.prototype);

function Cannon(spec) {

    var aimVector = $V([spec.headingX, spec.headingY]);
    var veloc = spec.velocity || 20;
    var angle = spec.angle || 45;
    var rangeInMetres = Math.floor((2 * Math.pow(veloc, 2) * Math.sin(toRadians(angle)) * Math.cos(toRadians(angle))) / 9.81);

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

    this.aimAt = function(pos) {
        aimVector = pos.dup().toUnitVector()
    }

    this.elevateTo = function(angleInDegrees) {
        angle = Math.min(Math.max(0, angle + angleInDegrees), 90);
        rangeInMetres = Math.floor((2 * Math.pow(veloc, 2) * Math.sin(toRadians(angle)) * Math.cos(toRadians(angle))) / 9.81);
    }

    this.fire = function(firingPosition) {
        return {
            position: { x: firingPosition.X() + ((Math.cos(toRadians(angle)) * aimVector.X()) * 20),
                y: firingPosition.Y() + ((Math.sin(toRadians(angle)) * aimVector.Y()) * 20) },
            heading: { x: aimVector.X(), y: aimVector.Y() },
            firingAngle: angle,
            velocity: veloc
        };
    }

}

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
        newHeight = yVelocity * time + 0.5 * -9.81 * time * time;
        var done = (mirv) ? newHeight <= currHeight : currHeight < 0;
        currHeight = newHeight;
        if (done) {
            callback(this);
        } else {
            pos = pos.add(head.multiply(xVelocity * 0.1));
        }
    }
}

function Explosion(pos, endFunction) {
    this.x = pos.X();
    this.y = pos.Y();
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
