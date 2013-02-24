Vector.prototype.X = function() {
	return this.e(1);
}
Vector.prototype.Y = function() {
	return this.e(2);
}

function Tank(spec) {
	
	var pos = $V([spec.posX, spec.posY, 0]);
	var head = $V([spec.headingX, spec.headingY, 0]);
    var steering = new Steering();
	
	this.position = function() {
		return { x: pos.X(), y: pos.Y() };
	},

	this.heading = function() {
		return { x: head.X(), y: head.Y() };
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
        console.log(
            " Position ", { "x": pos.X(), "y": pos.Y() },
            " Clicked ", { "x": target.X(), "y": target.Y() },
            " Target ", { "x": result.X(), "y": result.Y() }
        );
        head = result.toUnitVector();
    },

    this.update = function() {
        var desiredVelocity = steering.calculate(this);
        head = desiredVelocity.toUnitVector();
        pos = pos.add(desiredVelocity);
    },

    this.seekTo = function(pos) {
        steering.seekTo(pos);
    },

    this.arriveAt = function(pos) {
        steering.arriveAt(pos);
    }

}