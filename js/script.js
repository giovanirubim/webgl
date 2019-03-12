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

let createCylinderGeometry = (radius, width, nSegments) => {
	const dRad = Math.PI*2/nSegments;
	const z1 = width*0.5;
	const z0 = - z1;
	const vE = [];
	const vA = [];
	const colorMax = 0.8;
	const colorMin = 0.2;
	const f = x => (x + 1)*0.5*(colorMax - colorMin) + colorMin;
	const addPoint = (dx, dy, p) => {
		let x = dx*radius;
		let y = dy*radius;
		vA.push(x, y, z0, f(dx), f(dy), f(-1), 0, p, 0, 0, 0);
		vA.push(x, y, z1, f(dx), f(dy), f(+1), 1, p, 0, 0, 0);
	};
	for (let i=0; i<=nSegments; ++i) {
		const rad = dRad*i;
		addPoint(Math.cos(rad), Math.sin(rad), i/nSegments);
	}
	const p1 = nSegments*2;
	const p2 = p1 + 1;
	for (let i=0; i<nSegments; ++i) {
		let a = i + i;
		let b = a + 1;
		let c = a + 2;
		let d = a + 3;
		vE.push(a, b, c, b, c, d);
	}
	const geometry = new Geometry();
	geometry.attrArray = new Float32Array(vA);
	geometry.element = new Uint8Array(vE);
	return geometry;
};

let createCubeGeometry = size => {
	const geometry = new Geometry();
	const vA = [];
	const vE = [];
	let n = 0;
	let addFace = (x, y, z, row, col) => {
		const m = vec4(x, y, z, 1).toEulerRotation();
		const normal = m.mul(vec4(0, 0, -1, 1));
		const s = size*0.5;
		const a = 0.5, b = 0.5;
		[
			vec4(-1, -1, -1, 1),
			vec4( 1, -1, -1, 1),
			vec4( 1,  1, -1, 1),
			vec4(-1,  1, -1, 1),
		].forEach(p => {
			const uv_x = (p.x + 1)*0.5*(1/3) + col*(1/3);
			const uv_y = (p.y + 1)*0.5*(1/4) + row*(1/4);
			p = m.mul(p);
			p = vec4(p);
			vA.push(p.x*s, p.y*s, p.z*s);
			// vA.push(p.x*a + b, p.y*a + b, p.z*a + b);
			vA.push(0.5, 0.5, 0.5);
			vA.push(uv_x, uv_y);
			vA.push(normal.x, normal.y, normal.z);
		});
		[0, 1, 2, 0, 2, 3].forEach(i => {
			vE.push(i + n);
		});
		n += 4;
	};
	addFace(0, 0, 0,           2, 1);
	addFace(Math.PI*1.5, 0, 0, 3, 1);
	addFace(Math.PI, 0, 0,     0, 1);
	addFace(Math.PI*0.5, 0, 0, 1, 1);
	addFace(0, Math.PI*0.5, 0, 2, 2);
	addFace(0, Math.PI*1.5, 0, 2, 0);
	geometry.attrArray = new Float32Array(vA);
	geometry.element = new Uint8Array(vE);
	return geometry;
};

let render = _ => {
	let r = new Date() * 0.001;
	r = r%(Math.PI*2);
	ctx.clear();
	vMsh[0].transform = vec3(0, r, 0).toEulerRotation();
	for (let i=0; i<vMsh.length; ++i) {
		let item = vMsh[i];
		if (item) {
			ctx.renderMesh(item, camera);
		}
	}
};

let ctx;
let program, material, camera;
let vShader, fShader;
const vMsh = new Array(1);
const vTex = new Array(1);
const vMat = new Array(1);

let nAsyncCalls = 3 + vTex.length;
let ready = _ => {
	mTemp = vec3(0, -6, 7).toTranslation();
	mTemp = vec3(0.7, 0, 0).toEulerRotation().mul(mTemp);
	program = new Program(vShader, fShader);
	material = new Material(program);
	vMsh[0] = new Mesh(createCubeGeometry(2), material);
	let mat = new Material(program);
	for (let i=0; i<vTex.length; ++i) {
		material.addTexture(vTex[i]);
	}
	ctx = new WebGL2Context();
	ctx.bindCanvas(document.querySelector("canvas"));
	camera = new Camera(0.4, ctx.size_x/ctx.size_y, 1, 210);
	camera.translate(0, 2, -10);
	camera.localRotate(-0.1, 0, 0);
	setInterval(render, 0);
};

let asyncCallFinish = _ => {
	if (--nAsyncCalls === 0) {
		ready();
	}
};

window.addEventListener("load", asyncCallFinish);

for (let i=0; i<vTex.length; ++i) {
	loadImg("img/tex3.png", img => {
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