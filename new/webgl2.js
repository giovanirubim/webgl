var SHADER_LAST_ID   = 0;
var MATERIAL_LAST_ID = 0;
var MESH_LAST_ID     = 0;
var TEXTURE_LAST_ID  = 0;

class Mat4 {
	constructor(arg) {
		if (arg instanceof Array) {
			if (arg[0] instanceof Array) {
				let v = new Float32Array(16);
				let k = 0;
				for (let i=0; i<4; ++i) {
					let row = arg[i];
					for (let j=0; j<4; ++j) {
						this.v[k++] = row[j];
					}
				}
				this.v = v;
				return;
			}
			this.v = new Float32Array(arg);
			return;
		}
		this.v = new Float32Array(16);
	}
}

class Shader {
	constructor() {
		this.id = ++ SHADER_LAST_ID;
		this.source = "";
		this.enumType = null;
	}
	set type(value) {
		value = value.toString().toLowerCase();
		if (value === "vertex") {
			this.enumType = WebGL2RenderingContext.VERTEX_SHADER;
		} else if (value === "frag" || value === "fragment") {
			this.enumType = WebGL2RenderingContext.VERTEX_SHADER;
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

class WebGL2Context {
	constructor() {
		this.shaderArray = [];
		this.shaderMap   = {};
		this.materialArray = [];
		this.materialMap   = {};
		this.gl = null;
	}
	addShader(shader) {
		let obj = {
			target: shader,
			glRef: null
		};
		this.shaderMap[shader.id] = obj;
		this.shaderArray.push(obj);
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
	addMaterial(material) {
		let obj = {
			target: material,
			glRef: null
		};
		this.materialMap[material.id] = obj;
		this.materialArray.push(obj);
		return this;
	}
	prepareMaterial(obj) {
		let material = obj.target;
		let sMap = this.shaderMap;
		let vShader = material.vShader;
		let vObj = sMap[vShader.id] || this.addShader(vShader);
		let vGlRef = vObj.glRef;
		if (vGlRef === null) {
			vGlRef = this.compileShader(vObj);
		}
		let fShader = material.fShader;
		let fObj = sMap[fShader.id] || this.addShader(fShader);
		let fGlRef = fObj.glRef;
		if (fGlRef === null) {
			fGlRef = this.compileShader(fObj);
		}
		let gl = this.gl;
		let glRef = gl.createProgram();
		gl.attachShader(glRef, vGlRef);
		gl.attachShader(glRef, fGlRef);
		gl.linkProgram(glRef);
		obj.glRef = glRef;
	}
	bindCanvas(canvas) {
		this.gl = canvas.getContext("webgl2");
		for (let a=this.materialArray, i=a.length; i;) {
			let obj = a[--i];
			if (obj.glRef === null) {
				this.prepareMaterial(obj);
			}
		}
		return this;
	}
}