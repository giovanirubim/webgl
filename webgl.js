const UNIFORM_INT   = 0b01000;
const UNIFORM_FLOAT = 0b10000;
const UNIFORM_MAT   = 0b11000;

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
	constructor() {
		this.index = null;
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
		gl.activeTexture(gl.TEXTURE0 + this.index);
		gl.bindTexture(gl.TEXTURE_2D, buffer);
		let usingMipmap = false;
		let n = images.length;
		for (let i=0; i<n; ++i) {
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
		this.model = new Mat([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
		this.setUniform("model", this.model);
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
	static uniformObject(value, obj) {
		let callId = null;
		if (value instanceof Mat) {
			value = value.v;
			callId = UNIFORM_MAT | 4;
		} else if (value instanceof Vec) {
			value = value.v;
			callId = UNIFORM_FLOAT | 4;
		} else if (typeof value === "number") {
			if (Number.isInteger(value)) {
				callId = UNIFORM_INT | 1;
			} else {
				callId = UNIFORM_FLOAT | 1;
			}
		}
		obj.value = value;
		obj.callId = callId;
		return obj;
	}
	setUniform(name, value, callId) {
		// Se passado o parâmetro "callId" o parâmetro value será o valor sem tratamento passado
		// para a GPU.
		let map = this.uniformMap;
		let array = this.vUniform;
		let obj = map[name];
		if (obj === undefined) {
			if (callId === undefined) {
				obj = Mesh.uniformObject(value, {
					name: name,
					location: null,
					value: null,
					callId: null
				});
			} else {
				obj = {
					name: name,
					location: null,
					value: value,
					callId: callId
				};
			}
			array.push(obj);
			map[name] = obj;
		} else if (callId === undefined) {
			obj = Mesh.uniformObject(value, obj);
		}
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
		let program = this.material.buffer;
		gl.useProgram(program);
		let array = this.vUniform;
		this.uniformMap.model.value = this.model.v;
		for (let i=array.length; i;) {
			let item = array[--i];
			let location = item.location;
			if (location === null) {
				location = gl.getUniformLocation(program, item.name);
			}
			switch (item.callId) {
				case UNIFORM_INT | 1: {
					gl.uniform1i(location, item.value);
				} break;
				case UNIFORM_MAT | 4: {
					gl.uniformMatrix4fv(location, false, item.value);
				} break;
			}
		}
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
		this.vTexture = [];
		this.tps = 30;
		this.renderUpdated = false;
		this.gTick = null;
		this.cTick = null;
		this.gCode = null;
		this.cCode = null;
		this.initialized = false;
		this.nextTexIndex = 0;
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
		} else if (arg instanceof Texture) {
			arg.index = this.vTexture.push(arg) - 1;
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
		this.vTexture.forEach(a => a.glInit(gl));
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
			while (now >= nextTick) {
				let tick = this.cTick;
				if (tick) tick(now - ini);
				nextTick += delta;
				this.renderUpdated = false;
			}
		}, 0);
		return this;
	}
}