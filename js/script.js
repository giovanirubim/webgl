const toVec3 = [
	vec3(-1, -1, -1),
	vec3(-1, -1,  1),
	vec3(-1,  1, -1),
	vec3(-1,  1,  1),
	vec3( 1, -1, -1),
	vec3( 1, -1,  1),
	vec3( 1,  1, -1),
	vec3( 1,  1,  1)
];

const toBinStr = [
	"000",
	"001",
	"010",
	"011",
	"100",
	"101",
	"110",
	"111"
];

let loadImg = (src, handler) => {
	let img = document.createElement("img");
	img.addEventListener("load", _ => {
		handler(img);
	});
	img.src = src;
	return img;
};

let loadShader = (src, type, handler) => {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = _ => {
		if (xhttp.readyState === 4 && xhttp.status === 200) {
			shader = new Shader();
			shader.source = xhttp.responseText;
			shader.type = type;
			handler(shader);
		}
	};
	xhttp.open("GET", src, true);
	xhttp.send();
};

let createCubeGeometry = size => {
	let geometry = new Geometry();
	let n = 0;
	let vA = [];
	let vE = [];
	let addFace = (x, y, z) => {
		let m = vec4(x, y, z, 1).toEulerRotation();
		let normal = m.mul(vec4(0, 0, -1, 1));
		let s = size*0.5;
		let a = 0.3, b = 0.5;
		[
			vec4(-1, -1, -1, 1),
			vec4( 1, -1, -1, 1),
			vec4( 1,  1, -1, 1),
			vec4(-1,  1, -1, 1),
		].forEach(p => {
			let uv_x = (p.x + 1)*0.5;
			let uv_y = (p.y + 1)*0.5;
			p = m.mul(p);
			p = vec4(p);
			vA.push(p.x*s, p.y*s, p.z*s);
			vA.push(p.x*a + b, p.y*a + b, p.z*a + b);
			vA.push(uv_x, uv_y);
			vA.push(normal.x, normal.y, normal.z);
		});
		[0, 1, 2, 0, 2, 3].forEach(i => {
			vE.push(i + n);
		});
		n += 4;
	};
	addFace(0, 0, 0);
	addFace(Math.PI*1.5, 0, 0);
	addFace(Math.PI, 0, 0);
	addFace(Math.PI*0.5, 0, 0);
	addFace(0, Math.PI*0.5, 0);
	addFace(0, Math.PI*1.5, 0);
	geometry.attrArray = new Float32Array(vA);
	geometry.element = new Int8Array(vE);
	return geometry;
};

let render = _ => {
	ctx.clear();
	for (let i=0; i<8; ++i) {
		let item = vMsh[i];
		if (item) {
			ctx.renderMesh(item, camera);
		}
	}
};

let program;
let material;
let camera;
let ctx;
let vShader;
let fShader;
let texture;
let vMsh = new Array(8);
let vTex = new Array(8);
let vMat = new Array(8);

let nAsyncCalls = 11;
let ready = _ => {
	program = new Program(vShader, fShader);
	material = new Material(program);
	for (let i=0; i<8; ++i) {
		let mat = new Material(program);
		mat.addTexture(vTex[i]);
		let cub = new Mesh(createCubeGeometry(2), mat);
		let vec = toVec3[i].mul(vec3(4, 4, 4));
		cub.translate(vec);
		vMsh[i] = cub;
	}
	ctx = new WebGL2Context();
	ctx.bindCanvas(document.querySelector("canvas"));
	camera = new Camera(0.4, ctx.size_x/ctx.size_y, 1, 100);
	camera.lookAt(2, 2, 2);
	setInterval(render, 0);
};
let asyncCallFinish = _ => {
	if (--nAsyncCalls === 0) {
		ready();
	}
};

window.addEventListener("load", _ => {
	asyncCallFinish();
});

for (let i=0; i<8; ++i) {
	loadImg("img/" + toBinStr[i] + ".png", img => {
		vTex[i] = new Texture(img);
		asyncCallFinish();
	});
}

loadShader("shaders/vertex.glsl", "vertex", shader => {
	vShader = shader;
	asyncCallFinish();
});

loadShader("shaders/fragment.glsl", "fragment", shader => {
	fShader = shader;
	asyncCallFinish();
});