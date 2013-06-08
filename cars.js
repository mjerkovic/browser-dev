function start() {
    track = new Track([{ start: $V([50, 300]), end: $V([1150, 300]) }], 50);
    vehicle = new Vehicle(60, 320);
    renderer = new Renderer(track, [vehicle]);
    mud = new Mud(200, 200, 30);
    forward = false,
    left = false,
    right = false;
    document.addEventListener('keydown',function(ev) {
        switch(ev.keyCode) {
            case 87: forward = true; break;
            case 65: left = true; break;
            case 68: right = true; break;
        }
    });
    document.addEventListener('keyup',function(ev) {
        switch(ev.keyCode) {
            case 87: forward = false; break;
            case 65: left = false; break;
            case 68: right = false; break;
        }
    });

    requestAnimationFrame(update);
}

function Track(segments, radius) {
    this.forEach = function(fn) {
        segments.forEach(function(segment) {
            fn(segment, radius);
        });
    }
}

function update() {
    vehicle.move();
    renderer.render();
    requestAnimationFrame(update);
}

function Mud(x, y, r) {
    this.position = $V([x, y]);
    this.radius = r
}

function Vehicle(x, y) {
    var loc = $V([x, y]);
    var velocity = $V([0, 0]);
    var mass = 10;
    var angle = 0;
    var maxSpeed = 1;

    var calculateForce = function() {
        var force = Vector.Zero(2);
        if (left) angle -= 0.04;
        if (right) angle += 0.04;
        if (forward) {
            force = force.add($V([Math.cos(angle), Math.sin(angle)]).multiply(maxSpeed));
        }
        return force.subtract(velocity);
    }

    var addDrag = function() {
        if (mud.position.distanceFrom(loc) <= (mud.radius + 10)) {
            var speed = velocity.modulus();
            var drag = velocity.multiply(-1).toUnitVector().multiply(0.5 * speed * speed);
            velocity = velocity.add(drag);
        }
    }

    return {
        move: function() {
            var acceleration = calculateForce().dividedBy(mass);
            velocity = velocity.add(acceleration);
            addDrag();
            console.log(velocity.modulus());
            loc = loc.add(velocity);
        },

        currentAngle: function() {
            return angle;
        },

        location: function() {
            return {
            x: loc.e(1),
            y: loc.e(2)
            };
        }
    };
}

function Renderer(track, cars) {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var clear = function() {
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.strokeRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }
    var drawTrack = function() {
        context.save();
        track.forEach(function(segment, radius) {
            context.beginPath();
            context.moveTo(segment.start.e(1), segment.start.e(2));
            context.lineTo(segment.end.e(1), segment.end.e(2));
            context.stroke();
        });
        context.restore();
    }
    var drawCars = function() {
        cars.forEach(function(car) {
            context.save();
            drawCar(car);
            context.restore();
        });
    }
    var drawCar = function(car) {
        context.translate(car.location().x, car.location().y);
        context.rotate(car.currentAngle());
        context.beginPath();
        context.moveTo(10, 0);
        context.lineTo(-10, -5);
        context.lineTo(-10, 5);
        context.lineTo(10, 0);
        context.stroke();
    }

    return {
        render: function() {
            clear();
            drawTrack();
            drawCars();
        }
    }
}

