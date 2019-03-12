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

let createCylinder = size => {};

let createSphere = (n1, n2) => {
	let geometry = new Geometry();
	let attrArray = [];
	let element = [];
	let nPoints = 0;
	let vArcs = [];
	let r = _ => Math.random();
	let addPoint = (x, y, z, uv_x, uv_y) => {
		let m = 1/Math.sqrt(x*x + y*y + z*z);
		let nx = x*m;
		let ny = y*m;
		let nz = z*m;
		let cx = (nx + 1)*0.5;
		let cy = (ny + 1)*0.5;
		let cz = (nz + 1)*0.5;
		attrArray.push(x, y, z, cx, cy, cz, uv_x, uv_y, nx, ny, nz);
		return nPoints ++;
	};
	let addFace = (a, b, c, d) => {
		element.push(a, b, c, b, c, d);
	};
	let addArc = n => {
		let array = [];
		let p = n/n1;
		let angle = p*Math.PI;
		let y = Math.cos(angle);
		let rad = Math.sin(angle);
		let delta = Math.PI*2/n2;
		for (let i=0; i<n2; ++i) {
			let dx = Math.cos(i*delta);
			let dz = Math.sin(i*delta);
			let x = dx*rad;
			let z = dz*rad;
			let uv_x = 0.5 + dx*p*0.5;
			let uv_y = 0.5 + dz*p*0.5;
			array.push(addPoint(x, y, z, uv_x, uv_y));
		}
		vArcs.push(array);
		return array;
	};
	let closeArc = (array, y) => {
		let p = addPoint(0, y, 0, 0.5, 0.5);
		for (let i=0; i<array.length; ++i) {
			let a = array[i];
			let b = array[(i + 1)%array.length];
			element.push(a, b, p);
		}
	};
	let connectArcs = (a1, a2) => {
		for (let i=0; i<n2; ++i) {
			let a = a1[i];
			let b = a1[(i + 1)%n2];
			let c = a2[i];
			let d = a2[(i + 1)%n2];
			addFace(a, b, c, d);
		}
	};
	for (let i=1; i<=n1; ++i) {
		addArc(i);
	}
	closeArc(vArcs[0], 1);
	for (let i=1; i<vArcs.length; ++i) {
		let a = vArcs[i-1];
		let b = vArcs[i];
		connectArcs(a, b);
	}
	geometry.attrArray = new Float32Array(attrArray);
	geometry.element = new Uint16Array(element);
	return geometry;
};

let createCube = size => {
	const geometry = new Geometry();
	const vA = [];
	const vE = [];
	let n = 0;
	let addFace = (x, y, z, row, col) => {
		const m = vec4(x, y, z, 1).toEulerRotation();
		const normal = m.mul(vec4(0, 0, -1, 1));
		const s = size*0.5;
		const a = 0.3, b = 0.5;
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
			vA.push(p.x*a + b, p.y*a + b, p.z*a + b);
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
	camera.transform = mat4(mTemp2);
	camera.translate(0, 0, -camDist);
	camera.rotate(camAngle, 0, 0);
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
let mTemp2;

let camDist = 5, camAngle = Math.PI*-0.15;

let nAsyncCalls = 3 + vTex.length;
let ready = _ => {
	mTemp = vec3(0, -6, 7).toTranslation();
	mTemp = vec3(0.7, 0, 0).toEulerRotation().mul(mTemp);
	program = new Program(vShader, fShader);
	material = new Material(program);
	vMsh[0] = new Mesh(createSphere(32, 64), material);
	let mat = new Material(program);
	for (let i=0; i<vTex.length; ++i) {
		material.addTexture(vTex[i]);
	}
	ctx = new WebGL2Context();
	ctx.bindCanvas(document.querySelector("canvas"));
	camera = new Camera(0.4, ctx.size_x/ctx.size_y, 1, 210);
	mTemp2 = camera.transform;
	setInterval(render, 0);
};

let asyncCallFinish = _ => {
	if (--nAsyncCalls === 0) {
		ready();
	}
};

window.addEventListener("load", asyncCallFinish);

for (let i=0; i<vTex.length; ++i) {
	loadImg("img/tex5.png", img => {
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
