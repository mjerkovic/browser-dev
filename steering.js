function Steering(walls) {

    var seekOn = false;
    var seekPos;
    var arriveOn = false;
    var arrivePos;
    var wanderOn = false;
    var wallAvoidanceOn = false;
    var interposeOn = false;
    var interposeA;
    var interposeB;
    var pursueOn = false;
    var evader;
    var stalkOn = false;
    var stalkTarget;
    var stalkRange;
    var offsetPursuitOn = false;
    var offsetLeader;
    var offsetPosition;

    this.calculate = function(entity) {
        var steeringForce = Vector.Zero(2);
        if (seekOn) {
            steeringForce = steeringForce.add(seek(entity));
        }
        if (arriveOn) {
            steeringForce = steeringForce.add(arrive(entity));
        }
        if (wanderOn) {
            steeringForce = steeringForce.add(wander(entity));
        }
        if (wallAvoidanceOn) {
            steeringForce = steeringForce.add(wallAvoidance(entity));
        }
        if (interposeOn) {
            steeringForce = steeringForce.add(interpose(entity));
        }
        if (pursueOn) {
            steeringForce = steeringForce.add(pursuit(entity));
        }
        if (offsetPursuitOn) {
            steeringForce = steeringForce.add(offsetPursuit(entity));
        }
        return steeringForce;
    }

    var seek = function(entity) {
        var desiredVelocity = seekPos.subtract(entity.position).toUnitVector().multiply(entity.maxSpeed);
        return desiredVelocity.subtract(entity.velocity);
    }

    var arrive = function(entity) {
        var toTarget = arrivePos.subtract(entity.position);
        var dist = toTarget.length();
        if (dist > 0) {
            var speed = dist / 20; // decel=3 * tweaker=20
            speed = Math.min(speed, entity.maxSpeed);
            var desiredVelocity = toTarget.multiply(speed / dist);
            return desiredVelocity.subtract(entity.velocity);
        }
        return Vector.Zero(2);
    }

    var stalk = function(entity) {
        var desiredVelocity = stalkTarget.position.subtract(entity.position);
        var desiredDistance = desiredVelocity.length() - stalkTarget.radius;
        if (desiredDistance > stalkRange) {
            arrivePos = desiredVelocity.toUnitVector().multiply(desiredDistance);
            return arrive(entity);
        }
        return Vector.Zero(2);
    }

    var wander = function(entity) {
        var wanderTarget = $V([random(), random()]).toUnitVector().multiply(10); // wander radius
        var targetLocal = wanderTarget.add($V([20, 0])); // wander distance
        var targetWorld = pointToWorldSpace(entity, targetLocal);
        return targetWorld.subtract(entity.position);
    }

    var wallAvoidance = function(entity) {
        var feelers = createFeelersFor(entity);
        var distanceToClosestIP = 9999999999;
        var closestWall;
        var steeringForce = Vector.Zero(2);
        var closestPoint = Vector.Zero(2);

        for (var flr = 0; flr < feelers.length; flr++) {
            for (var wallIdx = 0; wallIdx < walls.length; wallIdx++) {
                var intersection = lineIntersects(entity.position, feelers[flr], walls[wallIdx].getFrom(), walls[wallIdx].getTo());
                if (intersection.intersects) {
                    if (intersection.distance < distanceToClosestIP) {
                        distanceToClosestIP = intersection.distance;
                        closestWall = walls[wallIdx];
                        closestPoint = intersection.intersectionPoint;
                    }
                }
            }
            if (closestWall) {
                var overShoot = feelers[flr].subtract(closestPoint);
                steeringForce = closestWall.getNormal().toUnitVector().multiply(overShoot.length());
            }
        }
        return steeringForce;
    }

    var pursuit = function(entity) {
        var toEvader = evader.position.subtract(entity.position);
        var relativeHeading = entity.heading.dot(evader.heading);
        if ((toEvader.dot(entity.heading) > 0) && (relativeHeading < 0.95)) {
            seekPos = evader.position;
            return seek(entity);
        }
        var lookAheadTime = toEvader.length() / (entity.maxSpeed + evader.velocity.length());
        seekPos = evader.position.add(evader.velocity.toUnitVector().multiply(lookAheadTime));
        return seek(entity);
    }

    var offsetPursuit = function(entity) {
        var worldOffsetPos = pointToWorldSpace(offsetLeader, offsetPosition);
        var toOffset = worldOffsetPos.subtract(entity.position);
        var lookAheadTime = toOffset.length() / (entity.maxSpeed + offsetLeader.velocity.length());
        arrivePos = worldOffsetPos.add(offsetLeader.velocity.toUnitVector().multiply(lookAheadTime));
        return arrive(entity);
    }

    function interpose(entity) {
        var midPoint = interposeA.position.add(interposeB.position).dividedBy(2);
        var timeToReachMidPoint = midPoint.subtract(entity.position).length() / entity.maxSpeed;
        var aPos = interposeA.position.add(interposeA.velocity.toUnitVector().multiply(timeToReachMidPoint));
        var bPos = interposeB.position.add(interposeB.velocity.toUnitVector().multiply(timeToReachMidPoint));
        midPoint = aPos.add(bPos).dividedBy(2);
        arrivePos = midPoint;
        return arrive(entity);
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

    this.arriveOff = function() {
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

    this.interposeOn = function(a, b) {
        interposeA = a;
        interposeB = b;
        interposeOn = true;
    }

    this.interposeOff = function() {
        interposeA = null;
        interposeB = null;
        interposeOn = false;
    }

    this.pursue = function(target) {
        evader = target;
        pursueOn = true;
    }

    this.pursueOff = function() {
        pursueOn = false;
    }

    this.stalkTarget = function(target, range) {
        stalkTarget = target;
        stalkRange = range;
        stalkOn = true;
    }

    this.stalkOff = function() {
        stalkOn = false;
    }

    this.offsetPursuit = function(leader, offset) {
        offsetLeader = leader;
        offsetPosition = offset;
        offsetPursuitOn = true;
    }

    this.offsetPursuitOff = function() {
        offsetPursuitOn = false;
    }

}

function random() {
    return (Math.random() - Math.random()) * 80.0;
}