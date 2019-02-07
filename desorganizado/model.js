class Shader {
	constructor(code, type) {
		this.code = code;
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
	}
	delete() {
		this.gl.deleteShader(this.buffer);
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
	}
	setFrag(fragShader) {
		this.fragShader = fragShader;
	}
	bind(gl) {
		let buffer = gl.createProgram();
		gl.attachShader(buffer, this.vertexShader.buffer);
		gl.attachShader(buffer, this.fragShader.buffer);
		gl.linkProgram(buffer);
		this.buffer = buffer;
		this.gl = gl;
	}
	use() {
		this.gl.useProgram(this.buffer);
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
	}
	setAttrArray(attrArray) {
		this.attrArray = attrArray;
	}
	setElement(element) {
		this.element = element;
	}
	bind(gl) {
		let vao = gl.createVertexArray();
		let vbo = gl.createBuffer();
		let attrArray = this.attrArray;
		gl.bindVertexArray(vao);
		let elementBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, attrArray, gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, attrArray.BYTES_PER_ELEMENT*8, 0);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, attrArray.BYTES_PER_ELEMENT*8, attrArray.BYTES_PER_ELEMENT*3);
		gl.vertexAttribPointer(2, 2, gl.FLOAT, false, attrArray.BYTES_PER_ELEMENT*8, attrArray.BYTES_PER_ELEMENT*6);
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.element, gl.STATIC_DRAW);
		this.gl = gl;
		this.vao = vao;
	}
	render() {
		let gl = this.gl;
		this.material.use();
		gl.bindVertexArray(this.vao);
		gl.drawElements(gl.TRIANGLES, this.element.length, gl.UNSIGNED_BYTE, 0);
	}
}
