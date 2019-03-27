var UNIFORM_INT   = (1 << 3);
var UNIFORM_FLOAT = (2 << 3);
var UNIFORM_MAT   = (3 << 3);

var TORAD = Math.PI/180;
var TODEG = 180/Math.PI;

const GL_ARRAY_BUFFER = WebGL2RenderingContext.ARRAY_BUFFER;
const GL_COLOR_BUFFER_BIT = WebGL2RenderingContext.COLOR_BUFFER_BIT;
const GL_DEPTH_BUFFER_BIT = WebGL2RenderingContext.DEPTH_BUFFER_BIT;
const GL_DEPTH_TEST = WebGL2RenderingContext.DEPTH_TEST;
const GL_ELEMENT_ARRAY_BUFFER = WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
const GL_FLOAT = WebGL2RenderingContext.FLOAT;
const GL_FRAGMENT_SHADER = WebGL2RenderingContext.FRAGMENT_SHADER;
const GL_FRONT = WebGL2RenderingContext.FRONT;
const GL_LINE = WebGL2RenderingContext.LINE;
const GL_LINE_STRIP = WebGL2RenderingContext.LINE_STRIP;
const GL_LINEAR = WebGL2RenderingContext.LINEAR;
const GL_LINEAR_MIPMAP_LINEAR = WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR;
const GL_LINES = WebGL2RenderingContext.LINES;
const GL_MAX_TEX = WebGL2RenderingContext.ACTIVE_TEXTURE - WebGL2RenderingContext.TEXTURE0;
const GL_NEAREST = WebGL2RenderingContext.NEAREST;
const GL_REPEAT = WebGL2RenderingContext.REPEAT;
const GL_RGBA = WebGL2RenderingContext.RGBA;
const GL_STATIC_DRAW = WebGL2RenderingContext.STATIC_DRAW;
const GL_TEXTURE0 = WebGL2RenderingContext.TEXTURE0;
const GL_TEXTURE_2D = WebGL2RenderingContext.TEXTURE_2D;
const GL_TEXTURE_BASE_LEVEL = WebGL2RenderingContext.TEXTURE_BASE_LEVEL;
const GL_TEXTURE_MAG_FILTER = WebGL2RenderingContext.TEXTURE_MAG_FILTER;
const GL_TEXTURE_MAX_LOD = WebGL2RenderingContext.TEXTURE_MAX_LOD;
const GL_TEXTURE_MIN_FILTER = WebGL2RenderingContext.TEXTURE_MIN_FILTER;
const GL_TEXTURE_WRAP_S = WebGL2RenderingContext.TEXTURE_WRAP_S;
const GL_TRIANGLES = WebGL2RenderingContext.TRIANGLES;
const GL_UNPACK_FLIP_Y_WEBGL = WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL;
const GL_UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE;
const GL_UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT;
const GL_VERTEX_SHADER = WebGL2RenderingContext.VERTEX_SHADER;
var GL_LOG = false;

function log() {
	if (GL_LOG) {
		console.log(...arguments);
	}
}

getSrc = img => {
	const array = img.src.split("/");
	return array[array.length - 1];
};

class Shader {
	constructor() {
		this.id = Symbol();
		this.src = "";
		this.enumType = null;
	}
	set type(value) {
		value = value.toString().trim().toLowerCase();
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
		this.vShader = null;
		this.fShader = null;
		if (vShader) {
			this.addShader(vShader);
		}
		if (fShader) {
			this.addShader(fShader);
		}
	}
	addShader(shader) {
		if (shader.enumType === GL_VERTEX_SHADER) {
			this.vShader = shader;
		} else if (shader.enumType === GL_FRAGMENT_SHADER) {
			this.fShader = shader;
		} else {
			throw new Error("Untyped shader");
		}
		return this;
	}
}
class Material {
	constructor(program, uniforms) {
		this.program = program;
		this.uniforms = [];
		for (let name in uniforms) {
			this.addUniform(name, uniforms[name]);
		}
		this.textures = [];
	}
	addUniform(name, uniform) {
		let value = uniform.value;
		let type = uniform.type;
		if (type === undefined) {
			if (value instanceof Mat) {
				if (value.nCols === 1) {
					type = UNIFORM_FLOAT | 4;
				} else {
					type = UNIFORM_MAT | 4;
				}
				value = value.array;
			} else if (Number.isInteger(value)) {
				type = UNIFORM_INT | 1;
			} else {
				type = UNIFORM_FLOAT | 1;
			}
		}
		this.uniforms.push({name, type, value});
		return this;
	}
	addTexture(texture, uniformName) {
		let src = texture.img.src.split("/");
		src = src[src.length - 1];
		if (uniformName === undefined) {
			uniformName = "texture_" + (this.textures.length + 1);
		}
		this.textures.push({texture, uniformName});
		return this;
	}
}
class Transformable {
	constructor() {
		this.transform = mat4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
	}
	translate(x, y, z) {
		if (x instanceof Mat) {
			[x, y, z] = x.array;
		}
		this.transform.array[3] += x;
		this.transform.array[7] += y;
		this.transform.array[11] += z;
		return this;
	}
	rotate(x, y, z, order) {
		if (x instanceof Mat) {
			order = y;
			[x, y, z] = x.array;
		}
		this.transform = vec4(x, y, z, 1).toEulerRotation(order).mul(this.transform);
		return this;
	}
	localRotate(x, y, z, order) {
		const col = this.transform.copy(0, 3, 3, 1);
		this.rotate(x, y, z, order);
		this.transform = this.transform.paste(col, 0, 3);
		return this;
	}
	reset() {
		this.transform = mat4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		return this;
	}
}
class Geometry {
	constructor() {
		this.id = Symbol();
		this.attrArray = null;
		this.element = null;
	}
}
class Mesh extends Transformable {
	constructor(geometry, material) {
		super();
		this.id = Symbol();
		this.geometry = geometry;
		this.material = material;
	}
}
class Camera extends Transformable {
	constructor(angle, ratio, near, far) {
		super();
		this.a = angle;
		this.r = ratio;
		this.n = near;
		this.f = far;
		this.world = mat4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		this.projection = null;
		this.updateProjection();
	}
	updateProjection() {
		const {a, r, n, f} = this;
		const my = Math.tan(a)*n;
		const mx = r*my;
		this.projection = mat4(
			n/mx, 0, 0, 0,
			0, n/my, 0, 0,
			0, 0, (f+n)/(f-n), 2*n*f/(n-f),
			0, 0, 1, 0
		);
		return this;
	}
	srcRotate(x, y, z, order) {
		const m = mat4(this.transform.array);
		this.reset();
		this.rotate(x, y, z, order);
		this.transform = this.transform.mul(m);
		return this;
	}
	updateWorld() {
		this.world = this.transform.inverted();
		return this;
	}
}
class Texture {
	constructor(img) {
		this.id = Symbol();
		this.img = img;
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
		this.current_program = null;
		this.current_material_id = null;
		this.texIdToIndex = {};
		this.texIndexToId = new Array(16);
		this.nextTexIndex = 0;
	}
	compileShader(shader) {
		log("Compiling shader", shader);
		const gl = this.gl;
		const glRef = gl.createShader(shader.enumType);
		gl.shaderSource(glRef, shader.src);
		gl.compileShader(glRef);
		const info = gl.getShaderInfoLog(glRef);
		if (info) {
			throw new Error(info);
		}
		log("Shader compiled");
		return this.glRefMap[shader.id] = glRef;
	}
	bindProgram(program) {
		log("Binding program ", program);
		const {gl, glRefMap} = this;
		const glRef = gl.createProgram();
		let {vShader, fShader} = program;
		vShader = glRefMap[vShader.id] || this.compileShader(vShader);
		fShader = glRefMap[fShader.id] || this.compileShader(fShader);
		gl.attachShader(glRef, vShader);
		gl.attachShader(glRef, fShader);
		gl.linkProgram(glRef);
		return this.glRefMap[program.id] = glRef;
	}
	bindGeometry(geometry) {
		log("Binding geometry ", geometry);
		const gl = this.gl;
		const vao = gl.createVertexArray();
		const vbo = gl.createBuffer();
		const ebo = gl.createBuffer();
		const bpe = geometry.attrArray.BYTES_PER_ELEMENT;
		gl.bindVertexArray(vao);
		gl.bindBuffer(GL_ARRAY_BUFFER, vbo);
		gl.bufferData(GL_ARRAY_BUFFER, geometry.attrArray, GL_STATIC_DRAW);
		const stride = bpe*11;
		gl.vertexAttribPointer(0, 3, GL_FLOAT, false, stride, 0);
		gl.vertexAttribPointer(1, 3, GL_FLOAT, false, stride, bpe*3);
		gl.vertexAttribPointer(2, 2, GL_FLOAT, false, stride, bpe*6);
		gl.vertexAttribPointer(3, 3, GL_FLOAT, false, stride, bpe*8);
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);
		gl.enableVertexAttribArray(3);
		gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
		gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geometry.element, GL_STATIC_DRAW);
		return this.glRefMap[geometry.id] = vao;
	}
	bindTexture(texture) {
		log("Binding texture ", texture);
		const {gl, texIdToIndex, texIndexToId} = this;
		const glRef = gl.createTexture();
		const id = texture.id;
		const index = this.activeTexture(id, glRef);
		let temp = texture.img.src.split("/");
		temp = temp[temp.length - 1];
		gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, GL_RGBA, GL_UNSIGNED_BYTE, texture.img);
		gl.generateMipmap(GL_TEXTURE_2D);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_BASE_LEVEL, 0);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAX_LOD, 2);
		return this.glRefMap[id] = glRef;
	}
	activeTexture(id, glRef) {
		const {gl, texIdToIndex, texIndexToId} = this;
		let index = texIdToIndex[id];
		let binded = true;
		if (index === undefined) {
			index = this.nextTexIndex ++;
			this.nextTexIndex %= GL_MAX_TEX;
			const other = texIndexToId[index];
			if (other !== undefined) {
				texIdToIndex[other] = undefined;
			}
			texIndexToId[index] = id;
			texIdToIndex[id] = index;
			binded = false;
		}
		gl.activeTexture(GL_TEXTURE0 + index);
		if (!binded) {
			gl.bindTexture(GL_TEXTURE_2D, glRef);
		}
		return index;
	}
	useMaterial(material) {
		const {gl, current_program, current_material_id, glRefMap, locationMap} = this;
		if (material.id === current_material_id) {
			return locationMap[program.id];
		}
		const program = material.program;
		const progGlRef = glRefMap[program.id] || this.bindProgram(program);
		if (program !== current_program) {
			gl.useProgram(progGlRef);
			this.current_program = program;
		}
		const map = locationMap[program.id] || (locationMap[program.id] = {});
		const textures = material.textures;
		const n = textures.length;
		let logs = [];
		for (let i=0; i<n; ++i) {
			const {texture, uniformName} = textures[i];
			let glRef = glRefMap[texture.id];
			if (glRef === undefined) {
				glRef = this.bindTexture(texture);
			}
			let location = map[name] || (map[name] = gl.getUniformLocation(progGlRef, uniformName));
			const index = this.activeTexture(texture.id, glRef);
			logs.push(uniformName + " is " + index);
			gl.uniform1i(location, index);
		}
		for (let a=material.uniforms, i=a.length; i;) {
			let {name, type, value} = a[--i];
			let location = map[name] || (map[name] = gl.getUniformLocation(progGlRef, name));
			switch (type) {
				case (UNIFORM_INT | 1): gl.uniform1i(location, value); break;
				case (UNIFORM_INT | 2): gl.uniform2iv(location, value); break;
				case (UNIFORM_INT | 3): gl.uniform3iv(location, value); break;
				case (UNIFORM_INT | 4): gl.uniform4iv(location, value); break;
				case (UNIFORM_FLOAT | 1): gl.uniform1f(location, value); break;
				case (UNIFORM_FLOAT | 2): gl.uniform2fv(location, value); break;
				case (UNIFORM_FLOAT | 3): gl.uniform3fv(location, value); break;
				case (UNIFORM_FLOAT | 4): gl.uniform4fv(location, value); break;
				case (UNIFORM_MAT | 2): gl.uniformMatrix2fv(location, true, value); break;
				case (UNIFORM_MAT | 3): gl.uniformMatrix3fv(location, true, value); break;
				case (UNIFORM_MAT | 4): gl.uniformMatrix4fv(location, true, value); break;
			}
		}
		if (map.transform === undefined) {
			map.transform = gl.getUniformLocation(progGlRef, "transform");
		}
		if (map.camera === undefined) {
			map.camera = gl.getUniformLocation(progGlRef, "camera");
		}
		if (map.world === undefined) {
			map.world = gl.getUniformLocation(progGlRef, "world");
		}
		if (map.projection === undefined) {
			map.projection = gl.getUniformLocation(progGlRef, "projection");
		}
		return map;
	}
	bindCanvas(canvas) {
		this.start_x = 0;
		this.start_y = 0;
		this.size_x = canvas.width;
		this.size_y = canvas.height;
		const gl = this.gl = canvas.getContext("webgl2");
		gl.enable(GL_DEPTH_TEST);
		gl.viewport(this.start_x, this.start_y, this.size_x, this.size_y);
		gl.clearColor(0.2, 0.2, 0.2, 1);
		gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
		return this;
	}
	clear() {
		log("Clearing canvas");
		this.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
		return this;
	}
	renderMesh(mesh, camera) {
		const {gl, glRefMap} = this;
		const {geometry, material} = mesh;
		const map = this.useMaterial(material);
		gl.uniformMatrix4fv(map.transform, true, mesh.transform.array);
		gl.uniformMatrix4fv(map.camera, true, camera.transform.array);
		gl.uniformMatrix4fv(map.world, true, camera.world.array);
		gl.uniformMatrix4fv(map.projection, true, camera.projection.array);
		const vao = glRefMap[geometry.id] || this.bindGeometry(geometry);
		gl.bindVertexArray(vao);
		const element = geometry.element;
		if (element instanceof Uint8Array) {
			gl.drawElements(GL_TRIANGLES, element.length, GL_UNSIGNED_BYTE, 0);
		} else if (element instanceof Uint16Array) {
			gl.drawElements(GL_TRIANGLES, element.length, GL_UNSIGNED_SHORT, 0);
		}
		return this;
	}
}