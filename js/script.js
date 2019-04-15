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

function colorToArray(str) {
	str = str.trim();
	if (str[0] === "#") {
		if (str.length === 4) {
			str = "#" + str[1].repeat(2) + str[2].repeat(2) + str[3].repeat(2);
		}
		if (str.length === 7) {
			r = parseInt(str.substr(1, 2), 16)/255;
			g = parseInt(str.substr(3, 2), 16)/255;
			b = parseInt(str.substr(5, 2), 16)/255;
			return [r, g, b];
		}
	}
}

class cylinderCreator {
	constructor(nFrags) {
		this.nFrags = nFrags;
		this.attrArray = [];
		this.element = [];
		this.last_y = null;
		this.lastRad = null;
	}
	moveTo(y, rad) {
		this.last_y = y;
		this.lastRad = rad;
	}
	extTo(y, rad, r, g, b) {
		let start = Math.round(this.attrArray.length/11);
		let n = this.nFrags;
		let y0 = this.last_y;
		let y1 = y;
		let r0 = this.lastRad;
		let r1 = rad;
		let add = (x, y, z) => {
			this.attrArray.push(x, y, z, r, g, b, 0, 0, 0, 0, 0);
		};
		let delta = Math.PI*2/n;
		for (let i=0; i<n; ++i) {
			let x = Math.cos(i*delta)*r0;
			let z = Math.sin(i*delta)*r0;
			add(x, y0, z);
		}
		for (let i=0; i<n; ++i) {
			let x = Math.cos(i*delta)*r1;
			let z = Math.sin(i*delta)*r1;
			add(x, y1, z);
		}
		for (let i=0; i<n; ++i) {
			let a = start + i;
			let b = a + n;
			let c = start + (i + 1)%n;
			let d = c + n;
			this.element.push(a, b, c, b, c, d);
		}
		this.last_y = y1;
		this.lastRad = r1;
	}
	toGeometry() {
		let geometry = new Geometry();
		geometry.attrArray = new Float32Array(this.attrArray);
		let {element} = this;
		if (element.length <= (1 << 8)) {
			element = new Uint8Array(element);
		} else if (element.length <= (1 << 16)) {
			element = new Uint16Array(element);
		} else {
			element = new Uint32Array(element);
		}
		geometry.element = element;
		return geometry;
	}
};

let vMesh = [];
let camera, material, ratio;
let rot = 5, dist = 100, open = 3;

function resetCamera() {
	camera = new Camera(open*TORAD, ratio, 0.5, dist*2);
	camera.translate(0, 0, -dist);
	camera.rotate(0, rot*TORAD, 0);
	camera.translate(-2, 0, 0);
	camera.rotate(0, 0, TORAD*-10);
	camera.updateWorld();
}

function addCylinder(color) {
	color = colorToArray(color);
	let color2 = color.slice();
	color2[0] = 1 - color2[0];
	color2[1] = 1 - color2[1];
	color2[2] = 1 - color2[2];
	let obj = new cylinderCreator(72);
	obj.moveTo(1, 1);
	obj.extTo( 1, 0.95, ...color);
	obj.extTo(-1, 0.95, ...color2);
	obj.extTo(-1,    1, ...color);
	obj.extTo( 1,    1, ...color2);
	vMesh.push(new Mesh(obj.toGeometry(), material));
}

function line(x0, y0, z0, x1, y1, z1, r, g, b) {
	let attrArray = [];
	let element = [];
	let add = (x, y, z) => {
		attrArray.push(x, y, z, r, g, b, 0, 0, 0, 0, 0);
		element.push(element.length);
	}
	add(x0, y0, z0);
	add(x1, y1, z1);
	let geometry = new Geometry();
	geometry.attrArray = new Float32Array(attrArray);
	geometry.element = new Uint8Array(element);
	vMesh.push(new Mesh(geometry, material));
}

function addCircle() {
	let nFrags = 72;
	let geometry = new Geometry();
	let attrArray = [];
	let element = [];
	for (let i=0; i<nFrags; ++i) {
		let ang = Math.PI*2/nFrags*i;
		let x = 0;
		let y = Math.cos(ang);
		let z = Math.sin(ang);
		attrArray.push(x, y, z, 1, 1, 1, 0, 0, 0, 0, 0);
		element.push(i);
	}
	element.push(0);
	geometry.attrArray = new Float32Array(attrArray);
	if (element.length <= (1 << 8)) {
		element = new Uint8Array(element);
	} else if (element.length <= (1 << 16)) {
		element = new Uint16Array(element);
	} else {
		element = new Uint32Array(element);
	}
	geometry.element = element;
	vMesh.push(new Mesh(geometry, material));
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
	ratio = canvas.width/canvas.height;
	sync = _ => {
		ctx.clear();
		let program = new Program(vShader, fShader);
		material = new Material(program);
		resetCamera();
		const rand = x => x*(Math.random()*2 - 1);
		readValues();
		createLines();
		setInterval(_=>{
			ctx.clear();
			vMesh.forEach(mesh => ctx.renderMesh(mesh, camera));
		}, 10);
	};
	let startClick;
	canvas.addEventListener("mousedown", function(e){
		startClick = {
			x: e.offsetX,
			y: e.offsetY,
			rot, open, dist
		};
	});
	canvas.addEventListener("mousemove", function(e){
		if (e.buttons&1) {
			let x = e.offsetX;
			let y = e.offsetY;
			let dy = startClick.y - y;
			let dx = startClick.x - x;
			if (e.shiftKey) {
				let aux = Math.log(startClick.dist);
				dist = Math.exp(aux + dy*0.01);
			} else{
				rot = startClick.rot + dx*0.1;
			}
			resetCamera();
		}
	});
});

let mode = "s";
let axis = "x";
function getValues() {
	let res = [];
	vMesh.forEach(mesh => {
		x = mesh.transform[0][3];
		s = Math.max(mesh.transform.array[5]);
		res.push([x, s]);
	});
	return JSON.stringify(res);
}
function readValues() {
	values.forEach(value => {
		addCircle();
		let mesh = vMesh[vMesh.length - 1];
		let [x, s] = value;
		mesh.scale(1, s, s);
		mesh.translate(x, 0, 0);
	});
}

function createLines() {
	let x0 = 0;
	let y0 = 0;
	let z0 = 0;
	let add = (x, y, z, color) => {
		line(x0, y0, z0, x, y, z, ...colorToArray(color));
		mov(x, y, z);
	};
	let mov = (x, y, z) => {
		x0 = x;
		y0 = y;
		z0 = z;
	};
	mov(-5.29, 0.97, 0);
	add(-4.2, 0.97, 0, "#03f");
	add(-4.2, 0.32, 0, "#03f");
	add(0.5, 0.23, 0.23, "#03f");
	add(0.5, 0.38, 0.38, "#03f");
	add(1.42, 0.38, 0.38, "#03f");
	add(1.42, -0.38, -0.38, "#03f");
	add(0.5, -0.38, -0.38, "#aa0");
	add(0.5, -0.23, -0.23, "#aa0");
	add(-4.2, -0.32, 0, "#aa0");
	add(-4.2, -0.97, 0, "#aa0");
	add(-5.29, -0.97, 0, "#aa0");
	mov(-5.29, 0, 0.97);
	add(-4.2, 0, 0.97, "#f00");
	add(-4.2, 0, 0.32, "#f00");
	add(0.5, -0.23, 0.23, "#f00");
	add(0.5, -0.38, 0.38, "#f00");
	add(1.42, -0.38, 0.38, "#f00");
	add(1.42, 0.38, -0.38, "#f00");
	add(0.5, 0.38, -0.38, "#700");
	add(0.5, 0.23, -0.23, "#700");
	add(-4.2, 0.0, -0.32, "#700");
	add(-4.2, 0.0, -0.97, "#700");
	add(-5.29, 0.0, -0.97, "#700");
}

let values = [
	[-5.2999978, 0.9699730],
	[-4.6999984, 0.9699730],
	[-4.1999989, 0.9699730],
	[-4.1999989, 0.3248819],
	[-5.2999978, 0.3248819],
	[-5.3499990, 0.3248819],
	[-5.9499984, 0.3248819],
	[-6.0099974, 0.3248819],
	[-5.9099975, 0.2863746],
	[-5.3999977, 0.2863746],
	[-3.5999904, 0.3194671],
	[-1.8999918, 0.3194671],
	[+0.0000085, 0.3194671],
	[+0.5000085, 0.3194671],
	[+0.5000085, 0.5491461],
	[+0.9000086, 0.5488167],
	[+1.0000000, 0.5488167],
	[+1.4200085, 0.5488167]
];

window.addEventListener("keyup", function(e){
	let key = e.key.toLowerCase().replace("arrow", "");
	if (key === "s" || key === "t") {
		mode = key;
	} else if (key === "x" || key === "y" || key === "z") {
		axis = key;
	} else if (key === "\n" || key === "enter") {
		let x, y, z, s;
		if (vMesh.length) {
			let mesh = vMesh[vMesh.length - 1];
			x = mesh.transform[0][3];
			s = Math.max(mesh.transform.array[5]);
			addCircle();
			mesh = vMesh[vMesh.length - 1];
			mesh.scale(1, s, s);
			mesh.translate(x, 0, 0);
		} else {
			addCircle();
		}
	}
});

window.addEventListener("wheel", function(e){
	let val, inv;
	if (e.altKey) {
		val = (e.deltaY + 10000)/10000;
		inv = (e.deltaY - 10000)/10000;
	} else {
		val = (e.deltaY + 1000)/1000;
		inv = (e.deltaY - 1000)/1000;
	}
	if (e.shiftKey) {
		open *= val;
		if (open > 45) {
			open = 45;
		}
		resetCamera();
	} else {
		let mesh = vMesh[vMesh.length - 1];
		if (mode === "s") {
			mesh.scale(1, inv, inv);
		} else if (mode === "t") {
			if (e.altKey) {
				mesh.translate(e.deltaY*0.0001, 0, 0);
			} else {
				mesh.translate(e.deltaY*0.001, 0, 0);
			}
		}
	}
});
