function start() {
    CARS_FRAMES_PER_SECOND =  30;
    UPDATE_DELAY = (1000 / CARS_FRAMES_PER_SECOND) / 1000;
    track = new Track([
        // Bottom Straight
        new Segment($V([250, 600]), $V([600, 600]), $V([0, -1])),
        new Segment($V([600, 600]), $V([950, 600]), $V([0, -1])),
        // Bottom Right Corner
        new Segment($V([950, 600]), $V([1050, 550]), $V([-50, -100]).toUnitVector()),
        new Segment($V([1050, 550]), $V([1150, 450]), $V([-100, -100]).toUnitVector()),
        new Segment($V([1150, 450]), $V([1200, 350]), $V([-100, -50]).toUnitVector()),
        // Right Straight
        new Segment($V([1200, 350]), $V([1200, 250]), $V([-1, 0])),
        // Top Right Corner
        new Segment($V([1200, 250]), $V([1150, 150]), $V([-100, 50]).toUnitVector()),
        new Segment($V([1150, 150]), $V([1050, 50]), $V([-100, 100]).toUnitVector()),
        new Segment($V([1050, 50]), $V([950, 0]), $V([-50, 100]).toUnitVector()),
        // Top Straight
        new Segment($V([950, 0]), $V([600, 0]), $V([0, 1])),
        new Segment($V([600, 0]), $V([250, 0]), $V([0, 1])),
        // Top Left Corner
        new Segment($V([250, 0]), $V([150, 50]), $V([50, 100]).toUnitVector()),
        new Segment($V([150, 50]), $V([50, 150]), $V([100, 100]).toUnitVector()),
        new Segment($V([50, 150]), $V([0, 250]), $V([100, 50]).toUnitVector()),
        // Left Straight
        new Segment($V([0, 250]), $V([0, 350]), $V([1, 0])),
        // Bottom Left Straight
        new Segment($V([0, 350]), $V([50, 450]), $V([100, -50]).toUnitVector()),
        new Segment($V([50, 450]), $V([150, 550]), $V([100, -100]).toUnitVector()),
        new Segment($V([150, 550]), $V([250, 600]), $V([50, -100]).toUnitVector())

    ], 20);
    var player = new PlayerCar(60, 220, track);
    var cpu = new Car(260, 500, track);
    //var cpu2 = new Car(360, 500, track);
    renderer = new Renderer(track, [player, cpu]);
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

function Segment(startPos, endPos, norm) {
    var segmentVector = endPos.subtract(startPos);
    var dir = segmentVector.toUnitVector();
    var len = segmentVector.modulus();
    var wallNorm = norm || $V([-dir.y(), dir.x()]);
    var vectorTo = function(target) {
        return target.subtract(startPos);
    }

    this.wallNormal = function() {
        return wallNorm.dup();
    }

    this.angleTo = function(target) {
        return target.angleFrom(dir);
    }

    this.direction = function() {
        return dir;
    }

    this.length = function() {
        return len;
    }

    this.start = function() {
        return startPos;
    }

    this.end = function() {
        return endPos;
    }

    this.normalAtLength = function(normalLength) {
        return startPos.add(dir.multiply(normalLength));
    }

    this.normal = function(pos, heading) {
        var target = vectorTo(pos);
        console.log("Start = " + startPos.inspect() + "Dir = " + dir.inspect() + " Target = " + target.toUnitVector().inspect() + " Dot = " + dir.dot(target.toUnitVector()));
        if (dir.dot(target.toUnitVector() < 0) || dir.dot(heading) < 0) {
            return null;
        }
        var targetAngle = this.angleTo(target);
        var lengthToNormal = target.modulus() * Math.cos(targetAngle);
        console.log("lengthToNormal = " + lengthToNormal + " len = " + len);
        return (lengthToNormal > len) ? null : this.normalAtLength(lengthToNormal);
    }

}

function Track(segments, radius) {
    var cars = [];
    var calculateNormal = function() {
        track.forEach (function(segment, segmentNo, radius) {
            var target = tracker.mousePos.subtract(segment.start()); //segment.vectorTo(tracker.mousePos);
            var targetAngle = segment.angleTo(target);
            var lengthToNormal = target.modulus() * Math.cos(targetAngle);
            if (lengthToNormal <= segment.length()) {
                //console.log("Segment Length = " + segment.length + ", Normal Length =  " + lengthToNormal + ", Segment = " + segmentNo);
                tracker.normalPos = segment.normalAtLength(lengthToNormal);
                tracker.currentSegment = segment;
                tracker.segmentNo = segmentNo;
            }
        });
    }

    this.add = function(car) {
        cars.push(car);
    }

    this.update = function(delta) {
        cars.forEach(function(car) {
            car.move(delta);
        });
        if (showNormal && tracker.mousePos) {
            calculateNormal();
        }
    }

    this.forEach = function(fn) {
        for (var i = 0; i < segments.length; i++) {
            fn(segments[i], i + 1, radius);
        }
    }

}

function Mud(x, y, r) {
    this.position = $V([x, y]);
    this.radius = r
}

function PlayerCar(x, y, track) {
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

    var result = {
        move: function(delta) {
            var force = calculateForce();
            var acceleration = force.dividedBy(mass);
            velocity = velocity.add(acceleration);
            var drag = calculateDrag();
            velocity = velocity.add(drag);
            loc = loc.add(velocity);
            //console.log("force=" + force.inspect() + " acceleration=" + acceleration.inspect() + " drag=" + drag +
            //    " velocity=" + velocity.inspect() + " location=" + loc.inspect());
        },

        currentAngle: function() {
            return angle;
        },

        position: function() {
            return loc.dup();
        },

        render: function(context) {

        }
    };
    track.add(result);
    return result;
}

function Car(x, y, track) {
    var loc = $V([x, y]);
    var velocity = $V([0, 0]);
    var mass = 10;
    var angle = 0;
    var maxSpeed = 1;
    var normalPos = null;
    var seekPos = null;
    var calculateForce = function() {
        var closestNormal = Number.MAX_VALUE;
        var closestSegment = null;
        var segmentRadius = null;
        var segmentNumber = null;
        normalPos = null;
        track.forEach(function(segment, segmentNo, radius) {
            var futureLocation = loc.add(velocity.toUnitVector().multiply(30));
            var pos = segment.normal(futureLocation, $V([Math.cos(angle), Math.sin(angle)]));
            segmentRadius = radius;
            if (pos) {
                var distanceToNormal = pos.distanceFrom(futureLocation);
                if (distanceToNormal < closestNormal) {
                    normalPos = pos;
                    closestNormal = distanceToNormal;
                    closestSegment = segment;
                    segmentNumber = segmentNo;
                }
            }
        });
        seekPos = (closestNormal > segmentRadius * 2) ? normalPos.add(closestSegment.direction().multiply(50)) :
            loc.add(closestSegment.direction().multiply(50));
        return seekPos.subtract(loc).toUnitVector().multiply(maxSpeed).subtract(velocity);
    }

    var calculateDrag = function() {
        var drag = Vector.Zero(2);
        if (mud.position.distanceFrom(loc) <= (mud.radius + 10)) {
            var speed = velocity.modulus();
            drag = velocity.multiply(-1).toUnitVector().multiply(0.5 * speed * speed);
        }
        return drag;
    }

    var result = {
        move: function(delta) {
            var force = calculateForce();
            var acceleration = force.dividedBy(mass);
            velocity = velocity.add(acceleration);
            var drag = calculateDrag();
            velocity = velocity.add(drag);
            var angleVec = velocity.toUnitVector();
            angle = Math.atan2(angleVec.y(), angleVec.x());
            loc = loc.add(velocity);
        },

        currentAngle: function() {
            return angle;
        },

        position: function() {
            return loc.dup();
        },

        render: function(context) {
            if (normalPos && seekPos) {
                context.save();
                context.beginPath();
                context.arc(normalPos.x(), normalPos.y(), 4, 0, 2.0 * Math.PI, true);
                context.fillStyle = "FFFF00"; // yellow
                context.fill();
                context.closePath();
                context.beginPath();
                context.arc(seekPos.x(), seekPos.y(), 4, 0, 2.0 * Math.PI, true);
                context.fillStyle = "green"; //999966";  // grey
                context.fill();
                context.closePath();
                context.beginPath();
                var futureLocation = loc.add(velocity.toUnitVector().multiply(20));
                context.arc(futureLocation.x(), futureLocation.y(), 4, 0, 2.0 * Math.PI, true);
                context.fillStyle = "cyan"; //999966";  // grey
                context.fill();
                context.restore();
            }
        }
    };
    track.add(result);
    return result;
}

function Renderer(track, cars) {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var clear = function() {
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }
    var drawTrack = function() {
        var drawCircleAt = function(x, y) {
            context.arc(x, y, 4, 0, 2.0 * Math.PI, true);
            context.fill();
        }
        context.save();
        track.forEach(function(segment, radius) {
            var startX = segment.start().x();
            var startY = segment.start().y();
            var endX = segment.end().x();
            var endY = segment.end().y();
            context.beginPath();
            drawCircleAt(startX, startY);
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.stroke();
            drawCircleAt(endX, endY);
            var midPoint = segment.start().add(segment.end()).dividedBy(2);
            context.moveTo(midPoint.x(), midPoint.y());
            context.lineTo(midPoint.x() + (segment.wallNormal().x() * 50), midPoint.y() + (segment.wallNormal().y() * 50));
            context.stroke();
            //context.rect(startX, startY - radius, endX - startX, radius * 2);
            //context.stroke();
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
            car.render(context);
/*
            if (normalPos && seekPos) {
                context.save();
                drawProgressOf();
                context.restore();
            }
*/
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

