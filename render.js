const P_SIZE = 4;
const P_DELT = P_SIZE*0.5;

class RenderContext {
	constructor(sx, sy, canvas) {
		this.ctx = null;
		this.sx = sx || 800;
		this.sy = sy || 600;
		this.bg = "#000";
		if (canvas) {
			this.setCanvas(canvas);
		}
	}
	setCanvas(canvas) {
		canvas.width = this.sx;
		canvas.height = this.sy;
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.clear();
		return this;
	}
	clear() {
		let color = this.bg;
		if (color) {
			let ctx = this.ctx;
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, this.sx, this.sy);
		} else {
			this.ctx.clearRect(0, 0, this.sx, this.sy);
		}
		return this;
	}
	renderPoint(point) {
		let x = point.x;
		let y = point.y;
		let z = point.z;
		let ctx = this.ctx;
		x = this.sx*0.5 + x;
		y = this.sy*0.5 - y;
		ctx.fillStyle = point.color || "#fff";
		ctx.fillRect(x - P_DELT, y - P_DELT, P_SIZE, P_SIZE);
		return this;
	}
}