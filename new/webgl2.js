var UNIFORM_INT   = (1 << 3);
var UNIFORM_FLOAT = (2 << 3);
var UNIFORM_MAT   = (3 << 3);

const GL_ARRAY_BUFFER = WebGL2RenderingContext.ARRAY_BUFFER;
const GL_COLOR_BUFFER_BIT = WebGL2RenderingContext.COLOR_BUFFER_BIT;
const GL_DEPTH_BUFFER_BIT = WebGL2RenderingContext.DEPTH_BUFFER_BIT;
const GL_DEPTH_TEST = WebGL2RenderingContext.DEPTH_TEST;
const GL_ELEMENT_ARRAY_BUFFER = WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
const GL_FLOAT = WebGL2RenderingContext.FLOAT;
const GL_FRAGMENT_SHADER = WebGL2RenderingContext.FRAGMENT_SHADER;
const GL_STATIC_DRAW = WebGL2RenderingContext.STATIC_DRAW;
const GL_TRIANGLES = WebGL2RenderingContext.TRIANGLES;
const GL_UNPACK_FLIP_Y_WEBGL = WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL;
const GL_UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE;
const GL_VERTEX_SHADER = WebGL2RenderingContext.VERTEX_SHADER;

class Shader {
	constructor() {
		this.id = Symbol();
		this.source = "";
		this.enumType = null;
	}
	set type(value) {
		value = value.toString().toLowerCase();
		if (value === "vertex") {
			this.enumType = GL_VERTEX_SHADER;
		} else if (value === "frag" || value === "fragment") {
			this.enumType = GL_FRAGMENT_SHADER;
		}
	}
	get type() {
		if (this.enumType === GL_VERTEX_SHADER) {
			return "vertex";
		} else if (this.enumType === GL_FRAGMENT_SHADER) {
			return "fragment";
		}
	}
}
class Material {
	constructor(vShader, fShader) {
		this.id = Symbol();
		this.vShader = vShader;
		this.fShader = fShader;
	}
}
class Geometry {
	constructor() {
		this.id = Symbol();
		this.attrArray = null;
		this.element = null;
	}
}
class Mesh {
	constructor(geometry, material) {
		this.id = Symbol();
		this.geometry = geometry;
		this.material = material;
	}
}
class WebGL2Context {
	constructor() {
		this.shaderMap = {};
		this.shaderArray = [];
		this.materialMap = {};
		this.materialArray = [];
		this.geometryMap = {};
		this.geometryArray = [];
		this.uniformMap = {};
		this.gl = null;
		this.start_x = null;
		this.start_y = null;
		this.size_x = null;
		this.size_y = null;
		this.currentMaterial = null;
	}
	addShader(shader) {
		let obj = this.shaderMap[shader.id];
		if (obj === undefined) {
			obj = {
				target: shader,
				glRef: null
			};
			this.shaderMap[shader.id] = obj;
			this.shaderArray.push(obj);
		}
		if (obj.glRef === null && this.gl !== null) {
			this.compileShader(obj);
		}
		return obj;
	}
	addMaterial(material) {
		let obj = this.materialMap[material.id];
		if (obj === undefined) {
			obj = {
				target: material,
				glRef: null
			};
			this.materialMap[material.id] = obj;
			this.materialArray.push(obj);
		}
		if (obj.glRef === null && this.gl !== null) {
			this.bindMaterial(obj);
		}
		return obj;
	}
	addGeometry(geometry) {
		let obj = this.geometryMap[geometry.id];
		if (obj === undefined) {
			obj = {
				target: geometry,
				vao: null,
			};
			this.geometryMap[geometry.id] = obj;
			this.geometryArray.push(obj);
		}
		if (obj.vao === null && this.gl !== null) {
			this.bindGeometry(obj);
		}
		return obj;
	}
	compileShader(obj) {
		let gl = this.gl;
		let shader = obj.target;
		let glRef = gl.createShader(shader.enumType);
		gl.shaderSource(glRef, shader.source);
		gl.compileShader(glRef);
		let info = gl.getShaderInfoLog(glRef);
		if (info) {
			throw new Error(info);
		}
		return obj.glRef = glRef;
	}
	bindMaterial(obj) {
		const {gl, shaderMap} = this;
		let material = obj.target;
		let vShader = material.vShader;
		let vObj = shaderMap[vShader.id] || this.addShader(vShader);
		let vGlRef = vObj.glRef || this.compileShader(vObj);
		let fShader = material.fShader;
		let fObj = shaderMap[fShader.id] || this.addShader(fShader);
		let fGlRef = fObj.glRef || this.compileShader(fObj);
		let glRef = gl.createProgram();
		gl.attachShader(glRef, vGlRef);
		gl.attachShader(glRef, fGlRef);
		gl.linkProgram(glRef);
		return obj.glRef = glRef;
	}
	bindGeometry(obj) {
		let gl = this.gl;
		let geometry = obj.target;
		let vao = gl.createVertexArray();
		let vbo = gl.createBuffer();
		let ebo = gl.createBuffer();
		let bpe = geometry.attrArray.BYTES_PER_ELEMENT;
		gl.bindVertexArray(vao);
		gl.bindBuffer(GL_ARRAY_BUFFER, vbo);
		gl.bufferData(GL_ARRAY_BUFFER, geometry.attrArray, GL_STATIC_DRAW);
		gl.vertexAttribPointer(0, 3, GL_FLOAT, false, bpe*8, 0);
		gl.vertexAttribPointer(1, 3, GL_FLOAT, false, bpe*8, bpe*3);
		gl.vertexAttribPointer(2, 2, GL_FLOAT, false, bpe*8, bpe*6);
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);
		gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
		gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geometry.element, GL_STATIC_DRAW);
		return obj.vao = vao;
	}
	setUniform(material, name, value, type) {
		let map = this.uniformMap;
		map = map[material.id] || (map[material.id] = {});
		let obj = map[name];
		if (type === undefined) {
			if (value instanceof Mat) {
				
			}
		}
		if (obj === null) {
			obj = {
				location: null,
				updated: false,
			};
		}
	}
	bindCanvas(canvas) {
		this.start_x = 0;
		this.start_y = 0;
		this.size_x = canvas.width;
		this.size_y = canvas.height;
		let gl = this.gl = canvas.getContext("webgl2");
		gl.enable(GL_DEPTH_TEST);
		gl.viewport(this.start_x, this.start_y, this.size_x, this.size_y);
		gl.clearColor(0, 0, 0, 1);
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
		return this;
	}
	clear() {
		this.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
		return this;
	}
}