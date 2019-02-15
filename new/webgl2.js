let SHADER_LAST_ID   = 0;
let MATERIAL_LAST_ID = 0;
let MESH_LAST_ID     = 0;
let TEXTURE_LAST_ID  = 0;

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
		this.id = ++ SHADER_LAST_ID;
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
		this.id = ++ MATERIAL_LAST_ID;
		this.vShader = vShader;
		this.fShader = fShader;
	}
}
class Mesh {
	constructor() {
		this.id = ++ MESH_LAST_ID;
		this.attrArray = null;
		this.material = null;
		this.element = null;
	}
}
class WebGL2Context {
	/* Private */
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
	wrapShader(shader) {
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
	bindMaterial(obj) {
		let gl = this.gl;
		let map = this.shaderMap;
		let material = obj.target;
		let vShader = material.vShader;
		let vObj = map[vShader.id] || this.wrapShader(vShader);
		let vGlRef = vObj.glRef || this.compileShader(vObj);
		let fShader = material.fShader;
		let fObj = map[fShader.id] || this.wrapShader(fShader);
		let fGlRef = fObj.glRef || this.compileShader(fObj);
		let glRef = gl.createProgram();
		gl.attachShader(glRef, vGlRef);
		gl.attachShader(glRef, fGlRef);
		gl.linkProgram(glRef);
		return obj.glRef = glRef;
	}
	wrapMaterial(material) {
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
	bindMesh(obj) {
		let gl = this.gl;
		let mesh = obj.target;
		let vao = gl.createVertexArray();
		let vbo = gl.createBuffer();
		let ebo = gl.createBuffer();
		let bpe = mesh.attrArray.BYTES_PER_ELEMENT;
		gl.bindVertexArray(vao);
		gl.bindBuffer(GL_ARRAY_BUFFER, vbo);
		gl.bufferData(GL_ARRAY_BUFFER, mesh.attrArray, GL_STATIC_DRAW);
		gl.vertexAttribPointer(0, 3, GL_FLOAT, false, bpe*8, 0);
		gl.vertexAttribPointer(1, 3, GL_FLOAT, false, bpe*8, bpe*3);
		gl.vertexAttribPointer(2, 2, GL_FLOAT, false, bpe*8, bpe*6);
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);
		gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
		gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, mesh.element, GL_STATIC_DRAW);
		return obj.vao = vao;
	}
	wrapMesh(mesh) {
		let obj = this.meshMap[mesh.id];
		if (obj === undefined) {
			obj = {
				target: mesh,
				vao: null,
			};
			this.meshMap[mesh.id] = obj;
			this.meshArray.push(obj);
		}
		if (obj.vao === null && this.gl !== null) {
			this.bindMesh(obj);
		}
		return obj;
	}
	/* Public */
	constructor() {
		this.shaderMap = {};
		this.shaderArray = [];
		this.materialMap = {};
		this.materialArray = [];
		this.meshMap = {};
		this.meshArray = [];
		this.locationMap = {};
		this.gl = null;
		this.start_x = null;
		this.start_y = null;
		this.size_x = null;
		this.size_y = null;
		this.currentMaterial = null;
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
		let gl = this.gl;
		gl.useProgram((this.materialMap[mesh.material.id]
			|| this.wrapMaterial(mesh.material)).glRef);
		let vao = this.wrapMesh(mesh).vao;
		gl.bindVertexArray(vao);
		gl.drawElements(GL_TRIANGLES, mesh.element.length, GL_UNSIGNED_BYTE, 0);
	}
}