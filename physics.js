function start() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    angle = 0;
    document.addEventListener("mousemove", function(ev) {
        var heading = $V([Math.cos(angle), Math.sin(angle)]);
        var target = $V([ev.clientX - 300, ev.clientY - 300]).toUnitVector();
        angle = Math.atan2(target.e(2), target.e(1)); //angleToTarget;
        console.log("X = " + target.e(1) + ", Y = " + target.e(2), ", angleInRadians = " + angle);
    });
    requestAnimationFrame(render);
}

function update() {
    render();
}

function render() {
    context.save();
    context.fillStyle = "FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(-25, 0);
    context.lineTo(25, 0);
    //context.stroke();
    context.moveTo(25, 0);
    context.lineTo(15, -10);
    context.moveTo(25, 0);
    context.lineTo(15, 10);
    context.stroke();
    //context.fillRect(-25, -25, 50, 50);
    context.restore();
    requestAnimationFrame(render);
}
