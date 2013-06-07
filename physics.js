function start() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    var centrePoint = $V([canvas.width / 2, canvas.height / 2]);
    angle = 0;
    speed = 0.5;
    velocity = $V([1, 0]).multiply(speed);
    document.addEventListener("mousemove", function(ev) {
        var heading = $V([Math.cos(angle), Math.sin(angle)]);
        var target = $V([ev.clientX - vehicleLocation.e(1), ev.clientY - vehicleLocation.e(2)]).toUnitVector();
        angle = Math.atan2(target.e(2), target.e(1)); //angleToTarget;
        console.log("X = " + target.e(1) + ", Y = " + target.e(2), ", angleInRadians = " + angle);
        velocity = $V([Math.cos(angle), Math.sin(angle)]).multiply(speed);
    });
    vehicleLocation = $V([canvas.width / 2, canvas.height / 2]);
    requestAnimationFrame(update);
}

function update() {
    vehicleLocation = vehicleLocation.add(velocity);
    render();
}

function render() {
    // Clear
    context.save();
    context.fillStyle = "FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    //context.strokeStyle = "black";
    context.strokeRect(0, 0, canvas.width, canvas.height);
    context.restore();

    // Compass
    context.save();
    context.translate(500, 50);
    context.rotate(angle);
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
    context.translate(vehicleLocation.e(1), vehicleLocation.e(2));
    context.rotate(angle);
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

