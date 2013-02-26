Vector.prototype.X = function() {
	return this.e(1);
}
Vector.prototype.Y = function() {
	return this.e(2);
}

function Tank(spec) {

    var maxSpeed = 3;
	var pos = $V([spec.posX, spec.posY, 0]);
	var head = $V([spec.headingX, spec.headingY, 0]);
    var veloc = $V([0, 0, 0]);
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

	this.angleFrom = function(vector) {
		var result = head.angleFrom(vector);
		return (head.X() < 0) ? -result : result;
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
        var desiredVelocity = steering.calculate(this);
        var desiredVelociyNorm = desiredVelocity.toUnitVector();
        var dot = head.dot(desiredVelociyNorm);
        if (dot < 0) {
            return;
        } else if (dot > 0.35) {
            desiredVelocity = desiredVelocity.multiply(0.35);
        }
        veloc = desiredVelocity;
        pos = pos.add(veloc);
        if (desiredVelocity.modulus() > 0.000001) {
            head = desiredVelocity.toUnitVector();
        }
    },

    this.seekTo = function(pos) {
        steering.seekTo(pos);
    },

    this.arriveAt = function(pos) {
        steering.arriveAt(pos);
    }

}