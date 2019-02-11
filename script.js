let ctx = new WebglContext(512, 512);
let square;

window.addEventListener("load", function(){

	ctx.setCanvas(document.querySelector("canvas"));

	let vertexShader = new Shader(
		"#version 300 es                          \n" +
		"precision highp float;                   \n" +
		"layout (location = 0) in vec3 aPos;      \n" +
		"layout (location = 1) in vec3 aColor1;   \n" +
		"layout (location = 2) in vec2 aUv;       \n" +
		"out vec3 aColor2;                        \n" +
		"out vec2 uv;                             \n" +
		"uniform mat4 model;                      \n" +
		"void main() {                            \n" +
		"    aColor2 = aColor1;                   \n" +
		"    uv = aUv;                            \n" +
		"    vec4 coord = vec4(aPos, 1.0);        \n" +
		// "    coord = model*coord;                 \n" +
		"    gl_Position = coord;                 \n" +
		"}                                        \n",
		"vertex");

	let fragShader = new Shader(
		"#version 300 es\n" +
		"precision highp float;\n" +
		"in vec3 aColor2;\n" +
		"in vec2 uv;\n" +
		"out vec4 FragColor;\n" +
		"void main() {\n" +
		"    FragColor = vec4(uv, 1.0, 1.0);\n" +
		"}\n", "frag");

	ctx.add(vertexShader);
	ctx.add(fragShader);

	let mat = new Material();
	mat.setVertex(vertexShader);
	mat.setFrag(fragShader);
	ctx.add(mat);

	square = new Mesh();
	let cx = 0;
	let cy = 0;
	let size = 1;
	let vattr = [];
	for (let i=0; i<2; i++) {
		for (let j=0; j<2; j++) {
			let x = cx + (i - 0.5)*size;
			let y = cy + (j - 0.5)*size;
			vattr.push(x);
			vattr.push(y);
			vattr.push(0);
			vattr.push(x);
			vattr.push(y);
			vattr.push(0);
			vattr.push(i);
			vattr.push(j);
		}
	}

	square.setMaterial(mat);
	square.setAttrArray(new Float32Array(vattr));
	square.setElement(new Uint8Array([0, 1, 2, 1, 2, 3]));

	ctx.add(square);

	let r = new EulerRotation(0, 0, 0.005).toMatrix();
	let m = new EulerRotation(0, 0, 0).toMatrix();
	// mat.setUniform("model", m);

	ctx.init();

	ctx.start();

	ctx.gTick = _ => {
		// mat.setUniform("model", m);
	};

	ctx.cTick = t => {
		m = r.mul(m);
	};

});