function loadShaders(array, callback) {
	let stack = 0;
	const res = new Array(array.length);
	function request(index) {
		const obj = new XMLHttpRequest();
		obj.onreadystatechange = _ => {
			if (obj.readyState === 4 && obj.status === 200) {
				const shader = new Shader();
				const src = obj.responseText;
				shader.src = src;
				if (src.indexOf("@fragment") >= 0) {
					shader.type = "fragment";
				} else if (src.indexOf("@vertex") >= 0) {
					shader.type = "vertex";
				}
				res[index] = shader;
				if (++ stack === array.length) {
					callback(res);
				}
			}
		};
		obj.open("GET", array[index], true);
		obj.send();
	}
	array.forEach((url, index) => request(index));
}

function cubeGeometry() {
	let nVertices = 0;
	const attrArray = [], element = [];
	const res = new Geometry();
	const colorMin = 0.2, colorMax = 0.8;
	const c1 = (colorMax - colorMin)*0.5;
	const c2 = c1 + colorMin;
	const toColor = val => val*c1 + c2;
	function addFace(rx, ry, row, col) {
		rx *= Math.PI/2;
		ry *= Math.PI/2;
		const m = vec3(rx, ry, 0).toEulerRotation();
		const array = [
			vec4(-1, +1, -1, +1),
			vec4(+1, +1, -1, +1),
			vec4(-1, -1, -1, +1),
			vec4(+1, -1, -1, +1)
		];
		const n = vec4(0, 0, -1, 1);
		for (let i=0; i<4; ++i) {
			const {x, y, z} = array[i];
			const r = toColor(x);
			const g = toColor(y);
			const b = toColor(z);
			attrArray.push(x, y, z, r, g, b, col/3, row/4, n.x, n.y, n.z);
		}
		const a = nVertices;
		const b = a + 1;
		const c = b + 1;
		const d = c + 1;
		element.push(a, b, c, b, c, d);
	}
	addFace(-1, +0, 3, 1);
	addFace(+0, +0, 2, 1);
	addFace(+0, -1, 2, 0);
	addFace(+0, +1, 2, 2);
	addFace(+1, +0, 1, 1);
	addFace(+2, +0, 0, 1);
	res.attrArray = new Float32Array(attrArray);
	res.element = new Uint8Array(element);
	return res;
}

window.addEventListener("load", function(){
	ctx = new WebGL2Context();
	ctx.bindCanvas(document.querySelector("canvas"));
	ctx.clear();
	loadShaders([
		"shaders/vertex.glsl",
		"shaders/fragment.glsl",
	], shaders => {
		const program = new Program(shaders[0], shaders[1]);
		cube = new Mesh(cubeGeometry(), new Material(program));
	});
});