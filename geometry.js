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
    var h = tank.heading;
    var s = $V([-h.Y(), h.X()]);
    var p = tank.position;

    var x = (h.X() * point.X()) + (s.X() * point.Y()) + p.X();
    var y = (h.Y() * point.X()) + (s.Y() * point.Y()) + p.Y();

    return $V([x, y]);
}

function pointToLocalSpace(point, heading, side, position) {
    var posX = -position.X();
    var posY = -position.Y();

    var x = (heading.X() * point.X()) + (heading.Y() * point.Y()) + posX;
    var y = (side.X() * point.X()) + (side.Y() * point.Y()) + posY;

    return $V([x, y]);
}

function createFeelersFor(entity) {
    var feelers = [];

    feelers.push(entity.position.add(entity.heading.multiply(30)));

    var left = entity.heading.rotate((Math.PI / 2) * 3.5, Vector.Zero(2));
    feelers.push(entity.position.add(left.multiply(30)));

    var right = entity.heading.rotate((Math.PI / 2) * 0.5, Vector.Zero(2));
    feelers.push(entity.position.add(right.multiply(30)));

    return feelers;
}

function lineIntersects(position, feeler, from, to) {
    var AyCy = position.Y() - from.Y();
    var DxCx = to.X() - from.X();
    var AxCx = position.X() - from.X();
    var DyCy = to.Y() - from.Y();

    var rTop = (AyCy * DxCx) - (AxCx * DyCy);

    var BxAx = feeler.X() - position.X();
    var ByAy = feeler.Y() - position.Y();

    var rBot = BxAx * DyCy - ByAy * DxCx;
    var sTop = AyCy * BxAx - AxCx * ByAy;
    var sBot = BxAx * DyCy - ByAy * DxCx;

    if (rBot == 0 || sBot == 0) {
        return { intersects: false, distance: 0, intersectionPoint: Vector.Zero(2) };  // lines are parallel
    }

    var r = rTop / rBot;
    var s = sTop / sBot;

    if (r > 0 && r < 1 && s > 0 && s < 1) {
        var point = feeler.subtract(position);
        point = point.multiply(r);
        point = position.add(point);
        return { intersects: true, distance: position.subtract(feeler).modulus() * r, intersectionPoint: point };
    }

    return { intersects: false, distance: 0, intersectionPoint: Vector.Zero(2) };
}

var Trajectory = {
    maxHeight: function(velocity, angleInDegrees, initialHeight) {
        var yVelocity = velocity * Math.sin(toRadians(angleInDegrees));
        return (Math.pow(yVelocity, 2) + (initialHeight || 0)) / 19.6;
    },

    impactTime: function(velocity, angleInDegrees) {
        return ((velocity * Math.sin(toRadians(angleInDegrees))) +
            Math.sqrt(Math.pow((velocity * Math.sin(toRadians(angleInDegrees))),2))) / 9.81;
    }
}
