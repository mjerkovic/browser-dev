Vector.prototype.X = function() {
	return this.e(1);
}
Vector.prototype.Y = function() {
	return this.e(2);
}

function Tank(posX, posY, headingX, headingY) {
	
	var position = $V([posX, posY, 0]);
	var heading = $V([headingX, headingY, 0]);
	
	this.position = function() {
		return { x: position.X(), y: position.Y() };
	},

	this.heading = function() {
		return { x: heading.X(), y: heading.Y() };
	},

	this.angleFrom = function(vector) {
		var result = heading.angleFrom(vector);
		return (heading.X() < 0) ? -result : result;
	},

	this.move = function() {
		position = position.setElements([position.X() + 1, position.Y(), 0]);
	}

}