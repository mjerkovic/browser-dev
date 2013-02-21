function TankRenderer(tank) {
	
	var frame = 0;
	var tankImgPos = [726, 693, 660, 627, 594, 562, 528, 495];

	this.render = function(ctx, img) {
		ctx.save();
		ctx.translate(0, canvas.height);
		ctx.scale(1.0, -1.0);
		ctx.translate(tank.position().x, tank.position().y);
		ctx.rotate(tank.angleFrom($V([0, 1, 0])));
		ctx.drawImage(img, tankImgPos[frame % tankImgPos.length], 34, 30, 31, -16, -15, 30, 31);
		ctx.restore();
		frame = (frame == tankImgPos.length - 1) ? 0 : frame + 1;
	}
	
}

function GameRenderer(ctx, img, renderers) {
	this.render = function() {
		renderers.map(function(renderer) {
			renderer.render(ctx, img);
		});
	}
}