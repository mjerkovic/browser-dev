/*
vector length = modulus
dup = copy
inspect = toString

next step is to add friction
and ensure velocity remains between 0 and maxSpeed
 */

function start() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    vehicle = new Vehicle();
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

function update() {
    vehicle.move();
    render();
}

function Mud(x, y, r) {
    this.position = $V([x, y]);
    this.radius = r
}

function Vehicle() {
    var loc = $V([canvas.width / 2, canvas.height / 2]);
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
            var drag = velocity.multiply(-1).toUnitVector().multiply(0.07);
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

function render() {
    // Clear
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.strokeRect(0, 0, canvas.width, canvas.height);
    context.restore();

    // Compass
    context.save();
    context.translate(500, 50);
    context.rotate(vehicle.currentAngle());
    context.beginPath();
    context.moveTo(-25, 0);
    context.lineTo(25, 0);
    context.moveTo(25, 0);
    context.lineTo(15, -10);
    context.moveTo(25, 0);
    context.lineTo(15, 10);
    context.stroke();
    context.restore();

    // Vehicle
    context.save();
    context.translate(vehicle.location().x, vehicle.location().y);
    context.rotate(vehicle.currentAngle());
    context.beginPath();
    context.moveTo(10, 0);
    context.lineTo(-10, -5);
    context.lineTo(-10, 5);
    context.lineTo(10, 0);
    context.stroke();
    context.restore();

    // Circle    
    context.save();
    context.beginPath();
    context.arc(mud.position.e(1), mud.position.e(2), mud.radius, 0, 2.0 * Math.PI, true);
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
    context.restore();

    requestAnimationFrame(update);
}

