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

function Tank(spec) {

    var maxSpeed = 3;
    var maxTurnRate = 0.47
    var mass = 1;
	var pos = $V([spec.posX, spec.posY, 0]);
	var head = $V([spec.headingX, spec.headingY, 0]);
    var aimVector = $V([spec.headingX, spec.headingY, 0]);
    var veloc = $V([0, 0, 0]);
    var angle = spec.angle || 45;
    var steering = new Steering();

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
        return angle;
    },

    this.angleTo = function(angleInDegrees) {
        angle = Math.min(Math.max(0, angle + angleInDegrees), 90);
        xstat.innerHTML = angle;
    }

    this.aim = function() {
        return aimVector.dup();
    },

    this.move = function() {
        pos = pos.setElements([pos.X() + 2, pos.Y()]);
    },

    this.pointTo = function(h) {
        var target = $V([h.x, h.y, 0]);
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
                return Vector.Zero(3);
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

    this.aimAt = function(mousePos) {
        aimVector = $V([mousePos.x, mousePos.y, 0]).subtract(pos).toUnitVector();
    },

    this.fire = function() {
        return {
            position: { x: pos.X() + (aimVector.X() * 20), y: pos.Y() + (aimVector.Y() * 20) },
            heading: { x: aimVector.X(), y: aimVector.Y() },
            range: 200,
            firingAngle: angle
        };
    }

}

function Missile(spec, callback) {
    var startingPos;
    var pos = startingPos = $V([spec.position.x, spec.position.y, 0]);
    var head = $V([spec.heading.x, spec.heading.y, 0]);
    var veloc = 20;
    var range = spec.range;
    var angle = (Math.PI / 180) * spec.firingAngle;
    var xVelocity = veloc * Math.cos(angle);
    var yVelocity = veloc * Math.sin(angle);
    var time = 0;
    var initialHeight = currHeight = 2;
    var maxH = (Math.pow(yVelocity, 2) + initialHeight) / 19.6;

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

    this.update = function() {
        time = time + 0.1;
        currHeight = yVelocity * time + 0.5 * -9.81 * time * time;
        if (currHeight < 0) {
            callback(this, { x: pos.X(), y: pos.Y() });
        } else {
            pos = pos.add(head.multiply(xVelocity));
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
