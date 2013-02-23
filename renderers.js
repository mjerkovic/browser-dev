function WorldRenderer() {

    this.render = function(ctx) {
        ctx.save();
        for (var i = 100; i <= 800; i = i + 100) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (var j = 100; j <= 700; j = j + 100) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
        }
        ctx.restore();
    }
}

function TankRenderer(tank) {
	
	var frame = 0;
	var tankImgPos = [726, 693, 660, 627, 594, 561, 528, 495];

	this.render = function(ctx, img) {
		ctx.save();
		//ctx.translate(0, canvas.height);
		//ctx.scale(1.0, -1.0);
		ctx.translate(tank.position().x, tank.position().y);
		ctx.rotate(tank.angleFrom($V([0, -1, 0])));
		ctx.drawImage(img, tankImgPos[frame % tankImgPos.length], 34, 30, 31, -16, -15, 30, 31);
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tank.position().x, tank.position().y);
        ctx.lineTo(tank.position().x + (tank.heading().x * 100), tank.position().y + (tank.heading().y * 100));
		ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tank.position().x, tank.position().y);
        ctx.lineTo(tank.position().x + -(tank.heading().y * 100), tank.position().y + (tank.heading().x * 100));
        ctx.stroke();
        ctx.restore();
		frame = (frame == tankImgPos.length - 1) ? 0 : frame + 1;
	}
	
}

function GameRenderer(ctx, width, height, img, renderers) {
	this.render = function() {
		ctx.clearRect(0, 0, height, width);		
		renderers.forEach(function(renderer) {
			renderer.render(ctx, img);
		});
	}
}