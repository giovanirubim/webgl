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
	ctx.renderMesh(cube, camera);
};

let program;
let material;
let cube;
let camera;
let ctx;
let vShader;
let fShader;
let texture;
let vTex = new Array(8);
let vMat = new Array(8);

let nAsyncCalls = 11;
let ready = _ => {
	program = new Program(vShader, fShader);
	material = new Material(program);
	material.addTexture(vTex[0]);
	cube = new Mesh(createCubeGeometry(4), material);
	cube.translate(0, 0, 8);
	camera = new Camera(0.4, 16/9, 1, 100);
	ctx = new WebGL2Context();
	ctx.bindCanvas(document.querySelector("canvas"));
	setInterval(render, 10);
	render();
};
let asyncCallFinish = _ => {
	if (--nAsyncCalls === 0) {
		ready();
	}
};

window.addEventListener("load", _ => {
	asyncCallFinish();
	let start = null;
	let canvas = document.querySelector("canvas");
	let handleMousedown = (x, y) => {
		start = {x, y, m: cube.transform};
	};
	let handleMouseup = (x, y) => {
		start = null;
	};
	let handleMousemove = (x, y) => {
		if (start) {
			let m = start.m;
			let dx = x - start.x;
			let dy = y - start.y;
			let r = vec4(dy*0.005, dx*0.005, 0, 0);
			let col = m.copy(0, 3, 3, 1);
			cube.transform = r.toEulerRotation().mul(m);
			cube.transform = cube.transform.paste(col, 0, 3);
		}
	};
	canvas.addEventListener("mousedown", e => {
		handleMousedown(e.offsetX, e.offsetY);
	});
	canvas.addEventListener("mouseup", e => {
		handleMouseup(e.offsetX, e.offsetY);
		start = null;
	});
	canvas.addEventListener("mousemove", e => {
		if (start && !(e.buttons & 1)) {
			handleMouseup(e.offsetX, e.offsetY);
		}
		handleMousemove(e.offsetX, e.offsetY);
	});
	canvas.addEventListener("wheel", e => {
		cube.localRotate(0, 0, e.deltaY*0.001);
	});
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