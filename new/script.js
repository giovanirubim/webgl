let vShader = new Shader();
vShader.source =
	`	#version 300 es
		precision highp float;
		layout (location = 0) in vec3 vertexCoord;
		layout (location = 1) in vec3 vertexColor;
		layout (location = 2) in vec2 vertexUV;
		uniform mat4 projection;
		uniform mat4 camera;
		uniform mat4 transform;
		out vec4 vertex_color;
		void main() {
			vertex_color = vec4(vertexColor, 1.0);
			gl_Position = camera*transform*vec4(vertexCoord, 1.0);
		}`.trim();
vShader.type = "vertex";

let fShader = new Shader();
fShader.source =
	`	#version 300 es
		precision highp float;
		out vec4 FragColor;
		in vec4 vertex_color;
		void main() {
		    FragColor = vertex_color;
		}`;
fShader.type = "frag";

let sqrSize = 5;
let z = 0;
let scrSize = 30;
let near = 10;
let far  = 20;

let geometry = new Geometry();
let p1 = sqrSize*0.5;
let p0 = -p1;
let c0 = 0.2, c1 = 0.8;
let u0 = 0.0, u1 = 1.0;
geometry.attrArray = new Float32Array([

	p0, p0, p0,
	c0, c0, c0,
	u0, u0,

	p0, p1, p0,
	c0, c1, c0,
	u0, u1,

	p1, p1, p0,
	c1, c1, c0,
	u1, u1,

	p1, p0, p0,
	c1, c0, c0,
	u1, u0,

	p0, p0, p1,
	c0, c0, c1,
	u0, u0,

	p0, p1, p1,
	c0, c1, c1,
	u0, u1,

	p1, p1, p1,
	c1, c1, c1,
	u1, u1,

	p1, p0, p1,
	c1, c0, c1,
	u1, u0

]);
geometry.element = new Uint8Array([
	0, 1, 2, 0, 2, 3,
	4, 5, 6, 4, 6, 7,
	0, 1, 5, 0, 5, 4,
	3, 2, 6, 3, 6, 7,
	0, 4, 7, 0, 7, 3,
	1, 5, 6, 1, 6, 2
]);

let program = new Program(vShader, fShader);
let material = new Material(program);
let mesh = new Mesh(geometry, material);
mesh.localRotate(0, 0, Math.PI/4);
mesh.localRotate(Math.PI/4, 0, 0);

let camera = new Camera(scrSize, scrSize, near, far);
let ctx = new WebGL2Context();

function render() {
	ctx.clear();
	ctx.renderMesh(mesh, camera);
}

window.addEventListener("load", function(){
	ctx.bindCanvas(document.querySelector("canvas"));
	mesh.translate(0, 0, -15);
	setInterval(function(){
		mesh.localRotate(0, 0.02, 0);
		render();
	}, 10);
});

