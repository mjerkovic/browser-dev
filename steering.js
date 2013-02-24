function Steering() {

    var seekOn = false;
    var seekPos;
    var arriveOn = false;
    var arrivePos;

    this.calculate = function(entity) {

        if (seekOn) {
            return seek();
        }
        if (arriveOn) {
            return arrive();
        }
        return Vector.Zero(3);

        function seek() {
            var desiredVelocity = seekPos.subtract($V([entity.position().x, entity.position().y, 0])).toUnitVector().multiply(3);
            console.log("Seeking to " + desiredVelocity.X() + ", " + desiredVelocity.Y());
            return desiredVelocity;
        }

        function arrive() {
            var toTarget = arrivePos.subtract($V([entity.position().x, entity.position().y, 0]));
            var dist = toTarget.modulus();
            if (dist > 0) {
                var speed = dist / 60; // decel=3 * tweaker=20
                //speed = Math.min(speed, entity.getMaxSpeed());
                var desiredVelocity = toTarget.multiply(speed / dist);
                return desiredVelocity.subtract(entity.velocity());
            }
            return Vector.Zero(3);

        }
    },

    this.seekTo = function(pos) {
        seekPos = $V([pos.x, pos.y, 0]);
        seekOn = true;
    },

    this.seekOff = function() {
        seekOn = false;
    },

    this.arriveAt = function(pos) {
        arrivePos = $V([pos.x, pos.y, 0]);
        arriveOn = true;
    },

    this.arriveOff = function(pos) {
        arriveOn = false;
    }

}