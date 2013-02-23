Vector.prototype.X = function() {
	return this.e(1);
}
Vector.prototype.Y = function() {
	return this.e(2);
}

function Tank(spec) {
	
	var position = $V([spec.posX, spec.posY, 0]);
	var head = $V([spec.headingX, spec.headingY, 0]);
	
	this.position = function() {
		return { x: position.X(), y: position.Y() };
	},

	this.heading = function() {
		return { x: head.X(), y: head.Y() };
	},

	this.angleFrom = function(vector) {
		var result = head.angleFrom(vector);
		return (head.X() < 0) ? -result : result;
	},

	this.move = function() {
		position = position.setElements([position.X() + 2, position.Y(), 0]);
	},

    this.pointTo = function(h) {
        var target = $V([h.x, h.y, 0]);
        var result = target.subtract(position);
        console.log(
            " Position ", { "x": position.X(), "y": position.Y() },
            " Clicked ", { "x": target.X(), "y": target.Y() },
            " Target ", { "x": result.X(), "y": result.Y() }
        );
        head = result.toUnitVector();
    }

}