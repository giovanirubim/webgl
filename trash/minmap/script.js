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
		"    gl_Position = model*vec4(aPos, 1.0); \n" +
		"}                                        \n",
		"vertex");

	let fragShader = new Shader(
		"#version 300 es                          \n" +
		"precision highp float;                   \n" +
		"uniform sampler2D tex;                   \n" +
		"in vec3 aColor2;                         \n" +
		"in vec2 uv;                              \n" +
		"out vec4 FragColor;                      \n" +
		"void main() {                            \n" +
		"    FragColor = texture(tex, uv);        \n" +
		"}                                        \n",
		"frag");

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

	let texture = new Texture();
	ctx.add(texture);

	let r = new EulerRotation(0, 0, 0.01).toMatrix();
	let m = new EulerRotation(0, 0, 0).toMatrix();
	let u = m;

	square.setUniform("tex", texture.index);

	ctx.gTick = _ => square.model = u.mul(m);
	ctx.cTick = t => {
		m = r.mul(m);
		let s = 0.25 + (Math.sin(t*0.005) + 1)*1;
		u = new Vec(s, s, 1).toScale();
	};

	let waiting = 2;
	let img1, img2;
	let countDown = _ => {
		texture.push(img1);
		texture.push(img2);
		ctx.init();
		ctx.start();
	};

	let newImg = (size) => {
		let canvas = document.createElement("canvas");
		let mid = size*0.5;
		canvas.width = canvas.height = size;
		let ctx = canvas.getContext("2d");
		let f = n=>n?f(n-1)+Math.floor(Math.random()*16).toString(16):"#";
		ctx.fillStyle = f(6);
		ctx.fillRect(0, 0, size, size);
		ctx.fillStyle = f(6);
		ctx.beginPath();
		ctx.arc(mid, mid, mid*0.75, 0, Math.PI*2);
		ctx.fill();
		let img = document.createElement("img");
		img.src = canvas.toDataURL();
		img.onload = _ => !(--waiting) ? countDown() : 0;
		return img;
	};

	img1 = newImg(128);
	img2 = newImg(64);

});