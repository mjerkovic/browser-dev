function Steering(track) {
        var wanderOn = false;
        var wallAvoidanceOn = false;

    this.calculate = function(car) {
        var steeringForce = Vector.Zero(2);
        if (wanderOn) {
            steeringForce = steeringForce.add(wander(car));
        }
        if (wallAvoidanceOn) {
            steeringForce = steeringForce.add(wallAvoidance(car));
        }
        return steeringForce;
    }

    this.wander = function() {
        wanderOn = true;
        return this;
    }

    this.wanderOff = function() {
        wanderOn = false;
        return this;
    }

    this.wallAvoidance = function() {
        wallAvoidanceOn = true;
        return this;
    }

    this.wallAvoidanceOff = function() {
        wallAvoidanceOn = false;
        return this;
    }

    var wallAvoidance = function(car) {
        var lineIntersects = function(position, feeler, from, to) {
            var AyCy = position.y() - from.y();
            var DxCx = to.x() - from.x();
            var AxCx = position.x() - from.x();
            var DyCy = to.y() - from.y();

            var rTop = (AyCy * DxCx) - (AxCx * DyCy);

            var BxAx = feeler.x() - position.x();
            var ByAy = feeler.y() - position.y();

            var rBot = BxAx * DyCy - ByAy * DxCx;
            var sTop = AyCy * BxAx - AxCx * ByAy;
            var sBot = BxAx * DyCy - ByAy * DxCx;

            if (rBot == 0 || sBot == 0) {
                return null;
            }

            var r = rTop / rBot;
            var s = sTop / sBot;

            if (r > 0 && r < 1 && s > 0 && s < 1) {
                var point = feeler.subtract(position);
                point = point.toUnitVector().multiply(r);
                point = position.add(point);
                return { distance: position.subtract(feeler).modulus() * r, intersectionPoint: point };
            }

            return null;
        }

        var distanceToClosestIP = Number.MAX_VALUE;
        var closestWall = null;

        var steeringForce = Vector.Zero(2);
        var closestPoint = Vector.Zero(2);
        var feelers = car.createFeelers();

        for (var flr = 0; flr < feelers.length; flr++) {
            track.walls(function(wall) {
                var intersection = lineIntersects(car.position(), feelers[flr], wall.start(), wall.end());
                if (intersection) {
                    if (intersection.distance < distanceToClosestIP) {
                        distanceToClosestIP = intersection.distance;
                        closestWall = wall;
                        closestPoint = intersection.intersectionPoint;
                    }
                }
            });
            if (closestWall) {
                var overShoot = feelers[flr].subtract(closestPoint);
                steeringForce = closestWall.normal().toUnitVector().multiply(overShoot.modulus());
            }
        }
        return steeringForce;
    }

    var wander = function(car) {
        var wanderTarget = $V([random(), random()]).toUnitVector().multiply(10); // wander radius
        var targetLocal = wanderTarget.add($V([20, 0])); // wander distance
        var targetWorld = localToWorld(targetLocal, car.position(), $V([Math.cos(car.currentAngle()), Math.sin(car.currentAngle())]));
        return targetWorld.subtract(car.position());
    }

    var random = function() {
        return (Math.random() - Math.random()) * 80.0;
    }

}