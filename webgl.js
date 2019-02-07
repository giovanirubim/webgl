class Shader {
	constructor(code, type) {
		this.code = code;
		if (type === "vertex") {
			type = WebGL2RenderingContext.VERTEX_SHADER;
		} else if (type === "frag" || type === "fragment") {
			type = WebGL2RenderingContext.FRAGMENT_SHADER;
		}
		this.type = type;
		this.buffer = null;
		this.gl = null;
	}
	bind(gl) {
		let buffer = gl.createShader(this.type);
		gl.shaderSource(buffer, this.code);
		gl.compileShader(buffer);
		let log = gl.getShaderInfoLog(buffer);
		if (log) throw new Error(log);
		this.buffer = buffer;
		return this;
	}
	delete() {
		this.gl.deleteShader(this.buffer);
		return this;
	}
}

class Material {
	constructor() {
		this.vertexShader = null;
		this.fragShader = null;
		this.buffer = null;
		this.gl = null;
	}
	setVertex(vertexShader) {
		this.vertexShader = vertexShader;
		return this;
	}
	setFrag(fragShader) {
		this.fragShader = fragShader;
		return this;
	}
	bind(gl) {
		let buffer = gl.createProgram();
		gl.attachShader(buffer, this.vertexShader.buffer);
		gl.attachShader(buffer, this.fragShader.buffer);
		gl.linkProgram(buffer);
		this.buffer = buffer;
		this.gl = gl;
		return this;
	}
	use() {
		this.gl.useProgram(this.buffer);
		return this;
	}
}

class Texture {
	constructor() {
		this.images = [];
		this.buffer = null;
		this.gl = null;
	}
	push(img) {
		this.images.push(img);
		return this;
	}
	bind(gl) {
		let images = this.images;
		let buffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, buffer);
		let usingMipmap = false;
		for (let i=0, n=images.length; i<n; ++i) {
			if (i === 1) {
				gl.generateMipmap(gl.TEXTURE_2D);
				usingMipmap = true;
			}
			let img = images[i];
			gl.texImage2D(gl.TEXTURE_2D, i, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		let temp = usingMipmap ? gl.NEAREST_MIPMAP_NEAREST : gl.NEAREST;
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, temp);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LOD, n - 1);
		this.buffer = buffer;
		this.gl = gl;
		return this;
	}
}

class Mesh {
	constructor() {
		this.material = null;
		this.attrArray = null;
		this.element = null;
		this.vao = null;
		this.gl = null;
	}
	setMaterial(material) {
		this.material = material;
		return this;
	}
	setAttrArray(attrArray) {
		this.attrArray = attrArray;
		return this;
	}
	setElement(element) {
		this.element = element;
		return this;
	}
	bind(gl) {
		let vao = gl.createVertexArray();
		let vbo = gl.createBuffer();
		let ebo = gl.createBuffer();
		let attrArray = this.attrArray;
		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, attrArray, gl.STATIC_DRAW);
		let bpe = attrArray.BYTES_PER_ELEMENT;
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, bpe*8, 0);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, bpe*8, bpe*3);
		gl.vertexAttribPointer(2, 2, gl.FLOAT, false, bpe*8, bpe*6);
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.element, gl.STATIC_DRAW);
		this.gl = gl;
		this.vao = vao;
		return this;
	}
	render() {
		let gl = this.gl;
		this.material.use();
		gl.bindVertexArray(this.vao);
		gl.drawElements(gl.TRIANGLES, this.element.length, gl.UNSIGNED_BYTE, 0);
		return this;
	}
}

class WebglContext {
	constructor(sx, sy) {
		this.sx = sx || 800;
		this.sy = sy || 600;
		this.gl = null;
		this.bg = new Vec(0.5, 0.5, 0.5, 1.0);
		this.vShader = [];
		this.vMaterial = [];
		this.vMesh = [];
		this.fps = 30;
		this.tps = 30;
		this.code = null;
		this.tick = _ => {};
	}
	setTick(tick) {
		this.tick = tick;
		return this;
	}
	add(arg) {
		if (arg instanceof Shader) {
			this.vShader.push(arg);
		} else if (arg instanceof Material) {
			this.vMaterial.push(arg);
		} else if (arg instanceof Mesh) {
			this.vMesh.push(arg);
		}
		arg.bind(this.gl);
		return this;
	}
	setCanvas(canvas) {
		this.canvas = canvas;
		canvas.width = this.sx;
		canvas.height = this.sy;
		this.gl = canvas.getContext("webgl2");
		return this;
	}
	init() {
		let gl = this.gl;
		let bg = this.bg;
		gl.enable(gl.DEPTH_TEST);
		gl.viewport(0, 0, this.sx, this.sy);
		gl.clearColor(bg.r, bg.g, bg.b, bg.a);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		return this;
	}
	render() {
		let gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.vMesh.forEach(m => m.render());
		let error = gl.getError();
		if (error) {
			stop();
			console.log(error);
			return this;
		}
		return this;
	}
	stop() {
		let code = this.code;
		if (code !== null) {
			clearInterval(code);
			this.code = null;
		}
		return this;
	}
	start() {
		stop();
		let ini = new Date() - 0;
		let nxtr = ini;
		let nxtt = ini;
		let dr = 1000/this.fps;
		let dt = 1000/this.tps;
		this.code = setInterval(_=>{
			let now = new Date() - 0;
			if (now >= nxtt) {
				this.tick(this);
				nxtt += dt;
			}
			if (now >= nxtr) {
				this.render();
				nxtr = now + dr;
			}
		}, 0);
		return this;
	}
}