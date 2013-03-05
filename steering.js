function Steering() {

    var seekOn = false;
    var seekPos;
    var arriveOn = false;
    var arrivePos;
    var wanderOn = false;

    this.calculate = function(entity) {

        if (seekOn) {
            return seek();
        }
        if (arriveOn) {
            return arrive();
        }
        if (wanderOn) {
            return wander();
        }
        return Vector.Zero(2);

        function seek() {
            return seekPos.subtract($V([entity.position().X(), entity.position().Y()])).toUnitVector().multiply(entity.maxSpeed());
        }

        function arrive() {
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

        function wander() {
            /*
             Vector wanderTarget = new Vector(randomNumber(), randomNumber()).normalise().scale(WANDER_RADIUS);
             Vector targetLocal = wanderTarget.add(new Vector(WANDER_DISTANCE, 0));
             Vector targetWorld = pointToWorldSpace(targetLocal, entity.heading(), entity.side(),
             entity.position());
             return targetWorld.subtract(entity.position());
             */
            var wanderTarget = $V([random(), random()]).toUnitVector().multiply(10);
            var targetLocal = wanderTarget.add($V([20, 0]));
            var targetWorld = pointToWorldSpace(entity, targetLocal);
            return targetWorld.subtract(entity.position());
        }
    },

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

}

function random() {
    return (Math.random() - Math.random()) * 80.0;
}