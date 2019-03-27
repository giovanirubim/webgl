let sync;
let nCalls = 0;
function loadImg(url, callback) {
	++ nCalls;
	const img = document.createElement("img");
	img.src = url;
	setTimeout(_=>{
		img.onload = _ => {
			img.remove();
			if (callback) {
				callback(img);
			}
			if (-- nCalls === 0) {
				sync();
			}
		};
		img.style.display = "none";
		document.body.appendChild(img);
	}, 0);
}
function loadText(url, callback) {
	++ nCalls;
	const obj = new XMLHttpRequest();
	obj.onreadystatechange = _ => {
		if (obj.readyState === 4 && obj.status === 200) {
			if (callback) {
				callback(obj.responseText);
			}
			if (-- nCalls === 0) {
				sync();
			}
		}
	};
	obj.open("GET", url, true);
	setTimeout(_=>obj.send(), 0);
}
const arrowGeometry = (color, axisIndex) => {
	const push = (array, stuff) => {
		if (stuff.array) {
			return push(array, stuff.array);
		}
		if (!stuff || stuff.length === undefined) {
			return array.push(stuff);
		}
		stuff.forEach(e => push(array, e));
		return array.length;
	};
	const attrArray = [];
	const element = [];
	const addPoint = coord => {
		push(attrArray, [coord, color, 0, 0, 0, 0, 0]); // Parei aqui
	}
	const addFace = (a, b, c, d) => {

	};
};
const sphereGeometry = (n1, n2) => {
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

window.addEventListener("load", function(){
	const canvas = document.querySelector("canvas");
	const ctx = new WebGL2Context();
	ctx.bindCanvas(canvas);
	let vShader, fShader;
	loadText("shaders/vertex.glsl", src => {
		vShader = new Shader();
		vShader.src = src;
		vShader.type = "vertex";
	});
	loadText("shaders/fragment.glsl", src => {
		fShader = new Shader();
		fShader.src = src;
		fShader.type = "fragment";
	});
	const tex = new Texture();
	loadImg("img/tex5.png", img => {
		tex.img = img;
	});
	const ratio = canvas.width/canvas.height;
	let camera = new Camera(45*TORAD, ratio, 1, 100);
	window.camera = camera;
	camera.reset();
	camera.translate(0, 0, -4);
	camera.rotate(-45*TORAD, 1, 0);
	camera.updateWorld();
	sync = _ => {
		ctx.clear();
		let program = new Program(vShader, fShader);
		let material = new Material(program);
		material.addTexture(tex);
		let mesh = new Mesh(sphereGeometry(32, 64), material);
		ctx.renderMesh(mesh, camera);
		const rand = x => x*(Math.random()*2 - 1);
		setInterval(_=>{
			ctx.clear();
			ctx.renderMesh(mesh, camera);
		}, 10);
	};
});
