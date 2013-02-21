function Tank(posX) {
	var x = posX;
	var y = 34;
	var w = 30;
	var h = 31;
	
	this.x = function() {
		return x;
	},

	this.y = function() {
		return y;
	},

	this.w = function() {
		return w;
	},

	this.h = function() {
		return h;
	}
}
