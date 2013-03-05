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

Vector.prototype.perp = function() {
    return Vector.create([-this.Y(), this.X()]);
}

function pointToWorldSpace(tank, point) {
    var h = tank.heading();
    var s = $V([-h.Y(), h.X()]);
    var p = tank.position();

    var x = (h.X() * point.X()) + (s.X() * point.Y()) + p.X();
    var y = (h.Y() * point.X()) + (s.Y() * point.Y()) + p.Y();

    return $V([x, y]);
}

function createFeelersFor(entity) {
    var feelers = [];

    feelers.push(entity.position().add(entity.heading().multiply(30)));

    var left = entity.heading().rotate((Math.PI / 2) * 3.5, Vector.Zero(2));
    feelers.push(entity.position().add(left.multiply(30)));

    var right = entity.heading().rotate((Math.PI / 2) * 0.5, Vector.Zero(2));
    feelers.push(entity.position().add(right.multiply(30)));

    return feelers;
}