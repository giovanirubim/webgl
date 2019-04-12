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
const cylinderGeometry = (r1, r2, height, color) => {
	let colorR = color*0.8 + Math.random()*0.2;
	let colorG = color*0.8 + Math.random()*0.2;
	let colorB = color*0.8 + Math.random()*0.2;
	let nFrags = 72;
	let geometry = new Geometry();
	let element = [];
	let attrArray = [];
	let triangles = [];
	let lastIndex = 0;
	let circles = [];
	let newCircle = (y, rad) => {
		let array = [];
		let delta = Math.PI*2/nFrags;
		for (let i=0; i<nFrags; ++i) {
			let ang = delta*i;
			let vertex = new Mat(4, 1, [
				rad*Math.cos(ang),
				y,
				rad*Math.sin(ang),
				1
			]);
			vertex.index = lastIndex ++;
			array.push(vertex);
		}
		circles.push(array);
		return array;
	};
	let face = (a, b, c, d) => {
		a = a.index;
		b = b.index;
		c = c.index;
		d = d.index;
		element.push(a, b, c, b, c, d);
	};
	let bridge = (c1, c2) => {
		for (let i=0; i<nFrags; ++i) {
			let j = (i + 1)%nFrags;
			let a = c1[i];
			let b = c2[i];
			let c = c1[j];
			let d = c2[j];
			face(a, b, c, d);
		}
	};
	let c1 = newCircle(-height*0.5, r2);
	let c2 = newCircle( height*0.5, r2);
	let c3 = newCircle( height*0.5, r1);
	let c4 = newCircle(-height*0.5, r1);
	bridge(c1, c2);
	bridge(c2, c3);
	bridge(c3, c4);
	bridge(c4, c1);
	let r = _ => Math.random();
	for (let i=0; i<circles.length; ++i) {
		let array = circles[i];
		for (let j=0; j<array.length; ++j) {
			let vertex = array[j];
			let c = vertex.index*11;
			attrArray[c +  0] = vertex.x;
			attrArray[c +  1] = vertex.y;
			attrArray[c +  2] = vertex.z;
			attrArray[c +  3] = colorR;
			attrArray[c +  4] = colorG;
			attrArray[c +  5] = colorB;
			attrArray[c +  6] = 0;
			attrArray[c +  7] = 0;
			attrArray[c +  8] = 0;
			attrArray[c +  9] = 0;
			attrArray[c + 10] = 0;
		}
	}
	geometry.attrArray = new Float32Array(attrArray);
	if (element.length <= (1 << 8)) {
		geometry.element = new Uint8Array(element);
	} else if (element.length <= (1 << 16)) {
		geometry.element = new Uint16Array(element);
	} else {
		geometry.element = new Uint32Array(element);
	}
	return geometry;
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

const meshes = [];
function createMeshes(material) {
	let f = (r1, r2, h, c, dy) => {
		let mesh = new Mesh(cylinderGeometry(r1, r2, h, c), material);
		mesh.translate(0, dy || 0, 0);
		return mesh;
	};
	let v0 = 0.75;
	let v1 = 0.02;
	let v2 = 0.3;
	let v3 = 5.0;
	let v4 = 0.04;
	let v5 = 1.5;
	let c0 = 0.3;
	let c1 = 0.8;
	let r1 = 1.00;
	let r2 = r1 - v1;
	let r3 = r2 - v2;
	let r4 = r3 - v1;
	let r5 = 0.15;
	let r6 = r5 - v1;
	let r7 = r6 - v4;
	let r8 = r7 - v1;
	let m1 = f(r1, r2, v0, c0, v5);
	let m2 = f(r2, r3, v0, c1, v5);
	let m3 = f(r3, r4, v0, c0, v5);
	let m4 = f(r5, r6, v3, c0);
	let m5 = f(r6, r7, v3, c1);
	let m6 = f(r7, r8, v3, c0);
	meshes.push(m1);
	meshes.push(m2);
	meshes.push(m3);
	meshes.push(m4);
	meshes.push(m5);
	meshes.push(m6);
}

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
	const ratio = canvas.width/canvas.height;
	let camera = new Camera(45*TORAD, ratio, 1, 100);
	window.camera = camera;
	camera.translate(0, 0, -4);
	camera.rotate(-20*TORAD, 22.5*TORAD, 0);
	camera.reset();
	camera.translate(1.438419222831726, 1.368080496788025, -3.4726510047912598);
	camera.lookAt(0, 0, 0);
	camera.updateWorld();
	sync = _ => {
		ctx.clear();
		let program = new Program(vShader, fShader);
		let material = new Material(program);
		createMeshes(material);
		const rand = x => x*(Math.random()*2 - 1);
		const m = mat4(camera.transform);
		const start = new Date();
		setInterval(_=>{
			var t = new Date()/1000;
			ctx.clear();
			camera.transform = mat4(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 5,
				0, 0, 0, 1
			);
			camera.lookAt(0, 0, 0);
			camera.rotate((Math.sin(t) + 1)*0.2 + 0.5, 0, 0);
			camera.updateWorld();
			meshes.forEach(mesh => ctx.renderMesh(mesh, camera));
		}, 10);
	};
});
