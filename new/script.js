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
		void main() {
			gl_Position = camera*transform*vec4(vertexCoord, 1.0);
		}`.trim();
vShader.type = "vertex";

let fShader = new Shader();
fShader.source =
	`	#version 300 es
		precision highp float;
		out vec4 FragColor;
		void main() {
		    FragColor = vec4(0.0, 0.5, 1.0, 1.0);
		}`;
fShader.type = "frag";

let sqrSize = 5;
let z = -15;
let scrSize = 30;
let near = 10;
let far  = 20;

let geometry = new Geometry();
let b = sqrSize*0.5;
let a = -b;
geometry.attrArray = new Float32Array([
	a, a, z,
	0, 0, 1,
	0, 0,
	b, a, z,
	1, 0, 1,
	1, 0,
	b, b, z,
	1, 1, 1,
	1, 1,
	a, b, z,
	0, 1, 1,
	0, 1
]);
geometry.element = new Uint8Array([0, 1, 2, 0, 2, 3]);

let program = new Program(vShader, fShader);
let material = new Material(program);
let mesh = new Mesh(geometry, material);

let camera = new Camera(scrSize, scrSize, near, far);
let ctx = new WebGL2Context();

function render() {
	ctx.clear();
	ctx.renderMesh(mesh, camera);
}

window.addEventListener("load", function(){
	ctx.bindCanvas(document.querySelector("canvas"));
	render();
});

