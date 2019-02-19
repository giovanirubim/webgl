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
class Program {
	constructor(vShader, fShader) {
		this.id = Symbol();
		this.vShader = vShader;
		this.fShader = fShader;
	}
}
class Material {
	constructor(program, uniforms) {
		this.program = program;
		let array = [];
		for (let name in uniforms) {
			let obj = uniforms[name];
			let value = obj.value;
			let type = obj.type;

			/* Set proper type and value */
			if (type === undefined) {
				if (value instanceof Mat) {
					value = value.v;
					type = UNIFORM_MAT | 4;
				} else if (value instanceof Vec) {
					value = value.v;
					type = UNIFORM_FLOAT | 4;
				} else if (Number.isInteger(value)) {
					type = UNIFORM_INT | 1;
				} else {
					type = UNIFORM_FLOAT | 1;
				}
			}

			array.push({name, type, value});
		}
		this.uniforms = array;
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
		this.transform = new Mat([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}
}
class WebGL2Context {
	constructor() {
		this.gl = null;
		this.glRefMap = {};
		this.locationMap = {};
		this.start_x = null;
		this.start_y = null;
		this.size_x = null;
		this.size_y = null;
		this.current_program_id = null;
		this.current_material_id = null;
	}
	compileShader(shader) {
		let gl = this.gl;
		let glRef = gl.createShader(shader.enumType);
		gl.shaderSource(glRef, shader.source);
		gl.compileShader(glRef);
		let info = gl.getShaderInfoLog(glRef);
		if (info) {
			throw new Error(info);
		}
		console.log("shader compiled");
		return this.glRefMap[shader.id] = glRef;
	}
	bindProgram(program) {
		let {gl, glRefMap} = this;
		let glRef = gl.createProgram();
		let {vShader, fShader} = program;
		vShader = glRefMap[vShader.id] || this.compileShader(vShader);
		fShader = glRefMap[fShader.id] || this.compileShader(fShader);
		gl.attachShader(glRef, vShader);
		gl.attachShader(glRef, fShader);
		gl.linkProgram(glRef);
		console.log("program created");
		return this.glRefMap[program.id] = glRef;
	}
	bindGeometry(geometry) {
		let gl = this.gl;
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
		console.log("geometry created");
		return this.glRefMap[geometry.id] = vao;
	}
	setUniforms(material) {
	}
	useMaterial(material) {
		let {gl, current_program_id, current_material_id, glRefMap} = this;
		if (material.id === current_material_id) return;
		let program = material.program;
		let progGlRef = glRefMap[program.id] || this.bindProgram(program);
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
	renderMesh(mesh) {
		let {gl, glRefMap} = this;
		let {geometry, material} = mesh;
		this.useMaterial(material);
		let gGlRef = glRefMap[geometry.id] || this.bindGeometry(geometry);
	}
}