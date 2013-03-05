function Steering(walls) {

    var seekOn = false;
    var seekPos;
    var arriveOn = false;
    var arrivePos;
    var wanderOn = false;
    var wallAvoidanceOn = false;

    this.calculate = function(entity) {
        if (seekOn) {
            return seek(entity);
        }
        if (arriveOn) {
            return arrive(entity);
        }
        if (wanderOn) {
            return wander(entity);
        }
        if (wallAvoidanceOn) {
            wallAvoidance(entity)
        }
        return Vector.Zero(2);
    }

    var seek = function(entity) {
        return seekPos.subtract($V([entity.position().X(), entity.position().Y()])).toUnitVector().multiply(entity.maxSpeed());
    }

    var arrive = function(entity) {
        var toTarget = arrivePos.subtract($V([entity.position().X(), entity.position().Y()]));
        var dist = toTarget.modulus();
        if (dist > 0) {
            var speed = dist / 60; // decel=3 * tweaker=20
            //speed = Math.min(speed, entity.getMaxSpeed());
            var desiredVelocity = toTarget.multiply(speed / dist);
            return desiredVelocity.subtract($V([entity.heading().x, entity.heading().y]));
        }
        return Vector.Zero(2);

    }

    var wander = function(entity) {
        var wanderTarget = $V([random(), random()]).toUnitVector().multiply(10); // wander radius
        var targetLocal = wanderTarget.add($V([20, 0])); // wander distance
        var targetWorld = pointToWorldSpace(entity, targetLocal);
        return targetWorld.subtract(entity.position());
    }

    var wallAvoidance = function(entity) {
        var feelers = createFeelersFor(entity);
        var distanceToThisIP = 0.0;
        var distanceToClosestIP = 9999999999;
        var closestWall;

        var steeringForce = Vector.Zero(2);
        var closestPoint = Vector.Zero(2);

        for (var flr = 0; flr < feelers.length; flr++) {
            for (var wallIdx = 0; wallIdx < walls.length; wallIdx++) {
                var intersection = lineIntersects(entity.position(), feelers[flr], walls[wallIdx].from(), walls[wallIdx].to());
                if (intersection.intersects) {
                    if (intersection.distance < distanceToClosestIP) {
                        distanceToClosestIP = intersection.distance;
                        closestWall = walls[wallIdx];
                        closestPoint = intersection.intersectionPoint;
                    }
                }
            }
            if (closestWall != null) {
                var overShoot = feelers[flr].subtract(closestPoint);
                steeringForce = closestWall.toUnitVector().multiply(overShoot.length());
            }
        }
        return steeringForce;
    }

    this.seekTo = function(pos) {
        seekPos = $V([pos.x, pos.y]);
        seekOn = true;
    },

    this.seekOff = function() {
        seekOn = false;
    },

    this.arriveAt = function(pos) {
        arrivePos = $V([pos.x, pos.y]);
        arriveOn = true;
    },

    this.arriveOff = function(pos) {
        arriveOn = false;
    },

    this.wanderAround = function() {
        wanderOn = true;
    },

    this.wanderOff = function() {
        wanderOn = false;
    }

    this.wallAvoidance = function() {
        wallAvoidanceOn = true;
    }

    this.wallAvoidanceOff = function() {
        wallAvoidanceOn = false;
    }

}

function random() {
    return (Math.random() - Math.random()) * 80.0;
}