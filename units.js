Vector.prototype.X = function() {
	return this.e(1);
}
Vector.prototype.Y = function() {
	return this.e(2);
}

Vector.prototype.dividedBy = function(n) {
    return this.map(function(el, index) {
        return el / n;
    });
}

Vector.prototype.length = function() {
    return this.modulus()
}

Vector.prototype.truncate = function(n) {
    return this.modulus() > n ? this.toUnitVector().multiply(n) : this;
}

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

    this.angleTo = function(angleInDegrees) {
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

function Tank(spec) {

    var maxSpeed = 3;
    var maxTurnRate = 0.47
    var mass = 1;
	var pos = $V([spec.posX, spec.posY]);
	var head = $V([spec.headingX, spec.headingY]);
    var veloc = $V([0, 0]);
    var steering = new Steering();
    var health = 1;
    var missileCapacity = spec.missiles || 6;
    var missilesFired = 0;
    var cannon = spec.cannon;

    this.maxSpeed = function() {
        return maxSpeed;
    },

    this.position = function() {
        return pos.dup();
    },

    this.heading = function() {
        return head.dup();
    },

    this.velocity = function() {
        return veloc.dup();
    },

    this.firingAngle = function() {
        return cannon.elevation();
    },

    this.firingVelocity = function() {
        return cannon.velocity();
    }

    this.firingRange = function() {
        return cannon.range();
    }

    this.missiles = function() {
        return missileCapacity - missilesFired;
    },

    this.angleTo = function(angleInDegrees) {
        cannon.angleTo(angleInDegrees);
        xstat.innerHTML = cannon.elevation();
    }

    this.aim = function() {
        return cannon.aim();
    },

    this.power = function() {
        return health;
    }

    this.move = function() {
        pos = pos.setElements([pos.X() + 2, pos.Y()]);
    },

    this.pointTo = function(h) {
        var target = $V([h.x, h.y]);
        var result = target.subtract(pos);
        head = result.toUnitVector();
    },

    this.update = function() {
        var steeringForce = steering.calculate(this);
        steeringForce = restrictTurnRate(steeringForce);
        var acceleration = steeringForce.dividedBy(mass);
        veloc = veloc.add(acceleration).truncate(maxSpeed);
        pos = pos.add(veloc);
        if (steeringForce.modulus() > 0.000001) {
            head = veloc.toUnitVector();
        }

        function restrictTurnRate(steeringForce) {
            var angle = head.dot(head.add(steeringForce).toUnitVector());
            if (angle < 0) {
                return Vector.Zero(2);
            } else if (angle > maxTurnRate) {
                return steeringForce.multiply(maxTurnRate);
            } else {
                return steeringForce;
            }
        }
    },

    this.seekTo = function(pos) {
        steering.seekTo(pos);
    },

    this.arriveAt = function(pos) {
        steering.arriveAt(pos);
    },

    this.wander = function() {
        steering.wanderAround();
    },

    this.aimAt = function(mousePos) {
        cannon.aimAt($V([mousePos.x, mousePos.y]).subtract(pos));
    },

    this.fire = function() {
        if (this.missiles() > 0) {
            missilesFired++;
            return cannon.fire(pos);
        } else {
            return null;
        }
    },

    this.hit = function() {
        health = health - 0.25;
        console.log(health);
    }

}

var toRadians = function(angleInDegrees) {
    return (Math.PI / 180) * angleInDegrees;
}

function Missile(spec, callback) {
    var startingPos;
    var pos = startingPos = $V([spec.position.x, spec.position.y]);
    var head = $V([spec.heading.x, spec.heading.y]);
    var angle = toRadians(spec.firingAngle);
    var initialHeight = spec.initialHeight || 2;
    var currHeight = spec.currentHeight || 2;
    var veloc = spec.velocity || 20;
    var xVelocity = (veloc) * Math.cos(angle);
    var yVelocity = (veloc) * Math.sin(angle);
    var time = 0;
    var maxH = spec.maxHeight || (Math.pow(yVelocity, 2) + initialHeight) / 19.6;
    var impactTime = ((veloc * Math.sin(angle)) + Math.sqrt(Math.pow((veloc * Math.sin(angle)),2))) / 9.81;

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

    this.update = function() {
        time = time + 0.1;
        currHeight = yVelocity * time + 0.5 * -9.81 * time * time;
        if (currHeight < 0) {
            callback(this, { x: pos.X(), y: pos.Y() });
        } else {
            pos = pos.add(head.multiply(xVelocity * 0.1));
        }
    }
}

function Explosion(pos, endFunction) {
    this.x = pos.x;
    this.y = pos.y;
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
