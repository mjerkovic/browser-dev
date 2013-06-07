function start() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    vehicle = new Vehicle();
    document.addEventListener("mousemove", function(ev) {
        vehicle.changeDirection(ev.clientX, ev.clientY);
    });
    requestAnimationFrame(update);
}

function update() {
    vehicle.move();
    render();
}

function Vehicle() {
    var loc = $V([canvas.width / 2, canvas.height / 2]);
    var velocity = $V([0, 0]);
    var mass = 10;
    var angle = 0;
    var maxSpeed = 0.5;

    return {
        changeDirection: function(mouseX, mouseY) {
            var target = $V([mouseX - loc.e(1), mouseY - loc.e(2)]).toUnitVector();
            angle = Math.atan2(target.e(2), target.e(1));
            console.log("X = " + target.e(1) + ", Y = " + target.e(2), ", angleInRadians = " + angle);
            velocity = $V([Math.cos(angle), Math.sin(angle)]).multiply(maxSpeed);
        },

        move: function() {
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
    //context.fillStyle = "FFFFFF";
    //context.fillRect(0, 0, canvas.width, canvas.height);
    //context.strokeStyle = "black";
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
    console.log(vehicle.location().x + " " + vehicle.location().y);
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
/*    context.save();
    context.beginPath();
    context.arc(300, 300, 10, 0, 2.0 * Math.PI, true);
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
*//*    context.beginPath();
    context.fillArc(300, 300, 9, 0, 2.0 * Math.PI, true);
    context.fillStyle = 'red';
    context.stroke();
    context.restore();
*/
    requestAnimationFrame(update);
}

