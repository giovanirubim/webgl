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
		let m = new Vec4(x, y, z).toEulerRotation();
		let normal = m.mul(new Vec4(0, 0, -1));
		let s = size*0.5;
		let a = 0.3, b = 0.5;
		[
			new Vec4(-1, -1, -1, 1),
			new Vec4( 1, -1, -1, 1),
			new Vec4( 1,  1, -1, 1),
			new Vec4(-1,  1, -1, 1),
		].forEach(p => {
			let uv_x = (p.x + 1)*0.5;
			let uv_y = (p.y + 1)*0.5;
			p = m.mul(p);
			p = new Vec4(...p.array);
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
	ctx.renderMesh(mesh, camera);
};

let program, material, mesh, camera, ctx, vShader, fShader, texture;
let nLoads = 4;

let ready = _ => {
	if (--nLoads) return;
	program = new Program(vShader, fShader);
	material = new Material(program);
	material.addTexture(texture);
	mesh = new Mesh(createCubeGeometry(4), material);
	mesh.translate(0, 0, 8);
	camera = new Camera(0.4, 16/9, 1, 100);
	ctx = new WebGL2Context();
	ctx.bindCanvas(document.querySelector("canvas"));
	ctx.bindTexture(texture);
	setInterval(render, 10);
	render();
};

window.addEventListener("load", _ => {
	ready();
	let start = null;
	let canvas = document.querySelector("canvas");
	let handleMousedown = (x, y) => {
		start = {x, y, m: mesh.transform};
	};
	let handleMouseup = (x, y) => {
		start = null;
	};
	let handleMousemove = (x, y) => {
		if (start) {
			let m = start.m;
			let dx = x - start.x;
			let dy = y - start.y;
			let r = new Vec4(dy*0.005, dx*0.005, 0, 0);
			let col = m.copy(0, 3, 3, 1);
			mesh.transform = r.toEulerRotation().mul(m);
			mesh.transform.paste(0, 3, col);
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
		camera.translate(0, 0, e.deltaY*0.001);
	});
});

loadImg("img/box.png", img => {
	texture = new Texture(img);
	ready();
});

loadShader("shaders/vertex.glsl", "vertex", shader => {
	vShader = shader;
	ready();
});

loadShader("shaders/fragment.glsl", "fragment", shader => {
	fShader = shader;
	ready();
});