class Shader {
	constructor(src, type) {
		this.src = src;
		if (type === "vertex") {
			type = WebGL2RenderingContext.VERTEX_SHADER;
		} else if (type === "frag" || type === "fragment") {
			type = WebGL2RenderingContext.FRAGMENT_SHADER;
		}
		this.type = type;
		this.buffer = null;
		this.gl = null;
	}
	glInit(gl) {
		let buffer = gl.createShader(this.type);
		gl.shaderSource(buffer, this.src);
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
	glInit(gl) {
		let buffer = gl.createProgram();
		gl.attachShader(buffer, this.vertexShader.buffer);
		gl.attachShader(buffer, this.fragShader.buffer);
		gl.linkProgram(buffer);
		this.buffer = buffer;
		this.gl = gl;
		return this;
	}
}

class Texture {
	constructor(id) {
		this.id = id;
		this.images = [];
		this.buffer = null;
		this.gl = null;
	}
	push(img) {
		this.images.push(img);
		return this;
	}
	glInit(gl) {
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
		this.uniformMap = {};
		this.vUniform = [];
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
	// Uniform call id:
	// 01 001 = uniform1i
	// 01 010 = uniform2iv
	// 01 011 = uniform3iv
	// 01 100 = uniform4iv
	// 10 001 = uniform1f
	// 10 010 = uniform2fv
	// 10 011 = uniform3fv
	// 10 100 = uniform4fv
	// 11 010 = uniformMatrix2v
	// 11 011 = uniformMatrix3v
	// 11 100 = uniformMatrix4v
	static get UNIFORM_INT()   {return 0b0100;}
	static get UNIFORM_FLOAT() {return 0b1000;}
	static get UNIFORM_MAT()   {return 0b1100;}
	toUniformObject(value) {
		let callId;
		if (value instanceof Mat) {
			callId = Mesh.UNIFORM_MAT | 4;
			value = value.v;
		} else if (value instanceof Vec) {
			callId = Mesh.UNIFORM_VEC | 4;
			value = value.v;
		} else if (typeof value === "number") {
			callId = Mesh.UNIFORM_FLOAT | 1;
		}
		return {
			location: null,
			callId: callId,
			value: value
		};
	}
	setUniform(name, value, callId) {
		let map = this.uniformMap;
		let array = this.vUniform;
		let obj = map[name];
		if (obj === undefined) {
			if (callId === undefined) {
				// obj = this.toUniformObject
			}
			array.push(obj);
		}
		obj.value = value;
		obj.callId = callId;
		return this;
	}
	glInit(gl) {
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
		gl.useProgram(this.material.buffer);
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
		this.tps = 30;
		this.renderUpdated = false;
		this.gTick = null;
		this.cTick = null;
		this.gCode = null;
		this.cCode = null;
		this.initialized = false;
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
		if (this.initialized) return this;
		let gl = this.gl;
		let bg = this.bg;
		gl.enable(gl.DEPTH_TEST);
		gl.viewport(0, 0, this.sx, this.sy);
		gl.clearColor(bg.r, bg.g, bg.b, bg.a);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		this.vShader.forEach(a => a.glInit(gl));
		this.vMaterial.forEach(a => a.glInit(gl));
		this.vMesh.forEach(a => a.glInit(gl));
		this.initialized = true;
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
		let code;
		code = this.gCode;
		if (code !== null) cancelAnimationFrame(code);
		code = this.cCode;
		if (code !== null) clearInterval(code);
		return this;
	}
	start() {
		let loop = _ => {
			let tick = this.gTick;
			if (tick) tick();
			if (!this.renderUpdated) {
				this.render();
				this.renderUpdated = true;
			}
			this.gCode = requestAnimationFrame(loop);
		};
		this.gCode = requestAnimationFrame(loop);
		let ini = new Date() - 0;
		let nextTick = ini;
		this.cCode = setInterval(_=>{
			let delta = 1000/this.tps;
			let now = new Date() - 0;
			if (now >= nextTick) {
				let tick = this.cTick;
				if (tick) tick(now - ini);
				nextTick += delta;
				this.renderUpdated = false;
			}
		}, 0);
		return this;
	}
}