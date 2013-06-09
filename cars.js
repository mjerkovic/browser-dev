function start() {
    CARS_FRAMES_PER_SECOND =  30;
    UPDATE_DELAY = (1000 / CARS_FRAMES_PER_SECOND) / 1000;
    var player = new PlayerCar(60, 380);
    track = new Track([
        { start: $V([50, 300]), end: $V([550, 300]) },
        { start: $V([550, 300]), end: $V([1150, 300]) }
    ], 20, [player]);
    renderer = new Renderer(track, [player]);
    mud = new Mud(-15, -15, 30);
    forward = false,
    left = false,
    right = false;
    showNormal = false;
    paused = false;
    tracker = {};
    document.addEventListener('keydown',function(ev) {
        switch(ev.keyCode) {
            case 87: forward = true; break;
            case 65: left = true; break;
            case 68: right = true; break;
            case 78: showNormal = !showNormal; break;
            case 80: paused = !paused; break;
        }
    });
    document.addEventListener('keyup',function(ev) {
        switch(ev.keyCode) {
            case 87: forward = false; break;
            case 65: left = false; break;
            case 68: right = false; break;
        }
    });
    document.addEventListener('mousemove', function(ev) {
        if (showNormal) {
            var pos = posFromMouseEvent(ev);
            tracker.mousePos = $V([pos.x, pos.y]);
        }
    });
    lastRun = new Date();
    update();
}

function posFromMouseEvent(ev) {
    var x = ev.pageX - canvas.offsetLeft;
    var y = ev.pageY - canvas.offsetTop;
    return { "x": x, "y": y };
}

function update() {
    if (!paused) {
        var step = new Date();
        var delta = (step - lastRun) / 1000;
        //console.log(delta);
        //if (delta >= UPDATE_DELAY) {
            lastRun = step;
            track.update(delta);
        //}
        renderer.render();
    }
    requestAnimationFrame(update);
}

function Track(segments, radius, cars) {
    segments.forEach(function(segment) {
        var segmentVector = segment.end.subtract(segment.start);
        segment.direction = segmentVector.toUnitVector();
        segment.length = segmentVector.modulus();
    });
    var calculateNormal = function() {
        for (var i = 1; i <= segments.length; i++) {
            var segment = segments[i - 1];
            var target = tracker.mousePos.subtract(segment.start);
            var targetAngle = target.angleFrom(segment.direction);
            var lengthToNormal = target.modulus() * Math.cos(targetAngle);
            if (lengthToNormal <= segment.length) {
                //console.log("Segment Length = " + segment.length + ", Normal Length =  " + lengthToNormal + ", Segment = " + i);
                tracker.normalPos = segment.start.add(segment.direction.multiply(lengthToNormal));
                tracker.currentSegment = segment;
                tracker.segmentNo = segments.indexOf(segment) + 1;
                break;
            }
        }
    }

    this.update = function(delta) {
        cars[0].move(delta);
        if (showNormal && tracker.mousePos) {
            calculateNormal();
        }
    }

    this.forEach = function(fn) {
        segments.forEach(function(segment) {
            fn(segment, radius);
        });
    }

}

function Mud(x, y, r) {
    this.position = $V([x, y]);
    this.radius = r
}

function PlayerCar(x, y) {
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
            return force.subtract(velocity);
        } else {
            return velocity.toUnitVector().multiply(-1); // * maxSpeed).subtract(velocity);
        }
    }

    var calculateDrag = function() {
        var drag = Vector.Zero(2);
        if (mud.position.distanceFrom(loc) <= (mud.radius + 10)) {
            var speed = velocity.modulus();
            drag = velocity.multiply(-1).toUnitVector().multiply(0.5 * speed * speed);
        }
        return drag;
    }

    return {
        move: function(delta) {
            var force = calculateForce();
            var acceleration = force.dividedBy(mass);
            velocity = velocity.add(acceleration);
            var drag = calculateDrag();
            velocity = velocity.add(drag);
            loc = loc.add(velocity);
            console.log("force=" + force.inspect() + " acceleration=" + acceleration.inspect() + " drag=" + drag +
                " velocity=" + velocity.inspect() + " location=" + loc.inspect());
        },

        currentAngle: function() {
            return angle;
        },

        position: function() {
            return loc.dup();
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
            var startX = segment.start.e(1);
            var startY = segment.start.e(2);
            var endX = segment.end.e(1);
            var endY = segment.end.e(2);
            context.beginPath();
            context.arc(startX, startY, 4, 0, 2.0 * Math.PI, true);
            context.fill();
            ///context.closePath();
            //context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.stroke();
            //context.closePath();
            //context.beginPath();
            context.arc(endX, endY, 4, 0, 2.0 * Math.PI, true);
            context.fill();
            context.rect(startX, startY - radius, endX - startX, radius * 2);
            context.stroke();
            context.closePath();
        });
        context.restore();
    }
    var drawNormal = function() {
        context.save();
        context.beginPath();
        context.moveTo(tracker.mousePos.x(), tracker.mousePos.y());
        context.lineTo(tracker.normalPos.x(), tracker.normalPos.y());
        context.stroke();
        context.closePath();
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
        function triangle() {
            context.moveTo(10, 0);
            context.lineTo(-10, -5);
            context.lineTo(-10, 5);
            context.lineTo(10, 0);
        }

        context.translate(car.position().x(), car.position().y());
        context.rotate(car.currentAngle());
        context.beginPath();
        triangle();
        context.fillStyle = "00FFFF";
        context.fill();
        triangle();
        context.strokeStyle = "black";
        context.lineWidth = 1.5;
        context.stroke();
        context.closePath();
    }
    var drawMousePos = function() {
        context.beginPath();
        context.arc(tracker.mousePos.x(), tracker.mousePos.y(), 4, 0, 2.0 * Math.PI, true);
        context.fillStyle = 'red';
        context.fillText(tracker.segmentNo, tracker.mousePos.x(), tracker.mousePos.y() - 10);
        context.fill();
        context.closePath();
    }
    return {
        render: function() {
            clear();
            drawTrack();
            drawCars();
            if (showNormal && tracker.mousePos) {
                drawMousePos();
                drawNormal();
            }
        }
    }
}

