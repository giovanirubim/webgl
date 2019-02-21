var TO_RAD = Math.PI/180;
var TO_DEG = 180/Math.PI;

function vZero(length) {
	return new Array(length).fill(0);
}

function mZero(nrows, ncols) {
	let m = new Array(nrows);
	for (let i=nrows; i; m[--i] = vZero(ncols));
	return m;
}

class EulerRotation {
	constructor(x, y, z, order) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.order = (order || "XYZ").trim().toUpperCase();
	}
	toMatrix() {
		let cx = Math.cos(this.x);
		let sx = Math.sin(this.x);
		let cy = Math.cos(this.y);
		let sy = Math.sin(this.y);
		let cz = Math.cos(this.z);
		let sz = Math.sin(this.z);
		if (this.order === "XYZ") return new Matrix([
			[ cz*cy, sz*cx + cz*sy*sx, sz*sx - cz*sy*cx, 0],
			[-sz*cy, cz*cx - sz*sy*sx, cz*sx + sz*sy*cx, 0],
			[    sy,           -cy*sx,            cy*cx, 0],
			[     0,                0,                0, 1]
		]);
		if (this.order === "XZY") return new Matrix([
			[cy*cz, sy*sx + cy*sz*cx, cy*sz*sx - sy*cx, 0],
			[  -sz,            cz*cx,            cz*sx, 0],
			[sy*cz, sy*sz*cx - sx*cy, cy*cx + sy*sz*sx, 0],
			[    0,                0,                0, 1]
		]);
		if (this.order === "YXZ") return new Matrix([
			[sz*sx*sy + cz*cy, sz*cx, sz*sx*cy - sy*cz, 0],
			[cz*sx*sy - sz*cy, cz*cx, cz*sx*cy + sz*sy, 0],
			[           cx*sy,   -sx,            cx*cy, 0],
			[               0,     0,                0, 1]
		]);
		if (this.order === "YZX") return new Matrix([
			[           cz*cy,     sz,           -sy*cz, 0],
			[sx*sy - sz*cy*cx,  cx*cz, sx*cy + cx*sz*sy, 0],
			[cx*sy + sx*sz*cy, -sx*cz, cx*cy - sx*sz*sy, 0],
			[               0,      0,                0, 1]
		]);
		if (this.order === "ZXY") return new Matrix([
			[cy*cz - sy*sx*sz, sy*sx*cz + cy*sz, -sy*cx, 0],
			[          -sz*cx,            cx*cz,     sx, 0],
			[cy*sx*sz + sy*cz, sy*sz - sx*cz*cy,  cy*cx, 0],
			[               0,                0,      0, 1]
		]);
		if (this.order === "ZYX") return new Matrix([
			[           cy*cz,            cy*sz,   -sy, 0],
			[sx*sy*cz - sz*cx, sx*sy*sz + cx*cz, sx*cy, 0],
			[cx*sy*cz + sx*sz, cx*sy*sz - sx*cz, cx*cy, 0],
			[               0,                0,     0, 1]
		]);
	}
	toQuaternion() {
		let ax = this.x;
		let ay = this.y;
		let az = this.z;
		let order = this.order;
		var cx = Math.cos(ax*0.5);
		var cy = Math.cos(ay*0.5);
		var cz = Math.cos(az*0.5);
		var sx = Math.sin(ax*0.5);
		var sy = Math.sin(ay*0.5);
		var sz = Math.sin(az*0.5);
		let x, y, z, w;
		if (order === "XYZ") {
			x = sx*cy*cz + cx*sy*sz;
			y = cx*sy*cz - sx*cy*sz;
			z = cx*cy*sz + sx*sy*cz;
			w = cx*cy*cz - sx*sy*sz;
		} else if (order === "YXZ") {
			x = sx*cy*cz + cx*sy*sz;
			y = cx*sy*cz - sx*cy*sz;
			z = cx*cy*sz - sx*sy*cz;
			w = cx*cy*cz + sx*sy*sz;
		} else if (order === "ZXY") {
			x = sx*cy*cz - cx*sy*sz;
			y = cx*sy*cz + sx*cy*sz;
			z = cx*cy*sz + sx*sy*cz;
			w = cx*cy*cz - sx*sy*sz;
		} else if (order === "ZYX") {
			x = sx*cy*cz - cx*sy*sz;
			y = cx*sy*cz + sx*cy*sz;
			z = cx*cy*sz - sx*sy*cz;
			w = cx*cy*cz + sx*sy*sz;
		} else if (order === "YZX") {
			x = sx*cy*cz + cx*sy*sz;
			y = cx*sy*cz + sx*cy*sz;
			z = cx*cy*sz - sx*sy*cz;
			w = cx*cy*cz - sx*sy*sz;
		} else if (order === "XZY") {
			x = sx*cy*cz - cx*sy*sz;
			y = cx*sy*cz - sx*cy*sz;
			z = cx*cy*sz + sx*sy*cz;
			w = cx*cy*cz + sx*sy*sz;
		}
		return new QuaternionRotation(x, y, z, w);
	}
}

class QuaternionRotation {
	constructor(x, y, z, w) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
	}
	toMatrix() {
		let w = this.w;
		let x = this.x;
		let y = this.y;
		let z = this.z;
		let a = w*w;
		let b = x*x;
		let c = y*y;
		let d = z*z;
		let e = 1/(b + c + d + a);
		let f = x*y;
		let g = z*w;
		let h = x*z;
		let i = y*w;
		let j = y*z;
		let k = x*w;
		return new Matrix([
			[(b - c - d + a)*e, 2*(f + g)*e,        2*(h - i)*e,        0],
			[2*(f - g)*e,       (-b + c - d + a)*e, 2*(j + k)*e,        0],
			[2*(h + i)*e,       2*(j - k)*e,        (-b - c + d + a)*e, 0],
			[0,                 0,                  0,                  1]
		]);
	}
	toEuler() {
		let w = this.w;
		let x = this.x;
		let y = this.y;
		let z = this.z;
		let a = 2*(w*x + y*z);
		let b = 1 - 2*(x*x + y*y);
		let ax = Math.atan2(a, b);
		let c = 2*(w*y - z*x);
		let ay;
		if (Math.abs(c) >= 1) {
			ay = c < 0 ? Math.PI*-0.5 : Math.PI*0.5; // copysign
		} else {
			ay = Math.asin(c);
		}
		let az = Math.atan2(2*(w*z + x*y), 1 - 2*(y*y + z*z));
		return new EulerRotation(ax, ay, az);
	}
}

class Matrix {
	constructor(arg1, arg2) {
		if (typeof arg1 === "number") {
			if (arg2 === undefined) {
				let m = mZero(arg1, arg1);
				for (let i=arg1; i--; m[i][i] = 1);
				this.m = m;
				this.nrows = arg1;
				this.ncols = arg1;
				return;
			}
			this.m = mZero(arg1, arg2);
			this.nrows = arg1;
			this.ncols = arg2;
			return;
		}
		if (arg1 instanceof Array) {
			if (arg1.length > 0 && (arg1[0] instanceof Array)) {
				let nrows = arg1.length;
				let ncols = arg1[0].length;
				let m = mZero(nrows, ncols);
				for (let i=nrows; i--;) {
					for (let j=ncols; j--; m[i][j] = arg1[i][j]);
				}
				this.m = m;
				this.nrows = nrows;
				this.ncols = ncols;
				return;
			}
			this.m = arg1.slice(0, arg1.length);
			this.nrows = 1;
			this.ncols = arg1.length;
			return;
		}
		throw new Error("Bad arguments");
	}
	mul(other) {
		let nrows = this.nrows;
		let ncols = other.ncols;
		let res = new Matrix(nrows, ncols);
		let n = this.ncols;
		let m1 = this.m, m2 = other.m, m3 = res.m;
		for (let i=nrows; i--;) {
			for (let j=ncols; j--;) {
				for (let k=n; k--;) {
					m3[i][j] += m1[i][k]*m2[k][j];
				}
			}
		}
		return res;
	}
	smul(other) {
		let nrows = this.nrows;
		let ncols = other.ncols;
		let res = new Matrix(nrows, ncols);
		let n = this.ncols;
		let m1 = this.m, m2 = other.m, m3 = res.m;
		let neg = a => typeof a === "string" && a[0] === "-";
		let abs = a => neg(a) ? a.substr(1) : a;
		let sum = (a, b) => {
			if (a == 0) return b;
			if (b == 0) return a;
			if (neg(b)) {
				return a + " - " + abs(b);
			} else if (neg(a)) {
				return b + " - " + abs(a);
			}
			return a + " + " + b;
		};
		let mul = (a, b) => {
			if (!a || !b) return 0;
			if (a == 1) return b;
			if (b == 1) return a;
			if (neg(a) && neg(b)) return abs(a) + "*" + abs(b);
			if (neg(b)) return b + "*" + a;
			return a + "*" + b;
		};
		for (let i=nrows; i--;) {
			for (let j=ncols; j--;) {
				for (let k=n; k--;) {
					m3[i][j] = sum(m3[i][j], mul(m1[i][k], m2[k][j]));
				}
			}
		}
		return res;
	}
	transposed() {
		let res = new Matrix(this.ncols, this.nrows);
		let m1 = this.m, m2 = res.m;
		for (let i=this.nrows; i--;) {
			for (let j=this.ncols; j--;) {
				m2[j][i] = m1[i][j];
			}
		}
		return res;
	}
	toPoint(point) {
		let m = this.m;
		let x = m[0][0];
		let y = m[1][0];
		let z = m[2][0];
		if (!point) return new Point(x, y, z);
		point.x = x;
		point.y = y;
		point.z = z;
		return this;
	}
	toString() {
		let s = new Matrix(this.m);
		let m = s.m;
		let colSize = vZero(this.ncols);
		for (let i=this.nrows; i--;) {
			for (let j=this.ncols; j--;) {
				let len = (m[i][j] = m[i][j].toString()).length;
				colSize[j] = Math.max(colSize[j], len);
			}
		}
		let align = (s, n) => {
			while (s.length < n) s = " " + s;
			return s;
		};
		for (let i=this.nrows; i--;) {
			for (let j=this.ncols; j--;) {
				m[i][j] = align(m[i][j], colSize[j]);
			}
			m[i] = m[i].join(", ");
		}
		return "[" + m.join("],\n[") + "]";
	}
	toEuler() {
		let m = this.m;
		let x, y, z;
        if (m[0][0] === 1) {
            x = 0;
            y = 0;
            z = Math.atan2(m[0][2], m[2][3]);
        } else if (m[0][0] === -1) {
            x = 0;
            y = 0;
            z = Math.atan2(m[0][2], m[2][3]);
        } else {
            x = Math.atan2(-m[1][2], m[1][1]);
            y = Math.asin(m[1][0]);
            z = Math.atan2(-m[2][0], m[0][0]);
        }
        return new EulerRotation(x, y, z);
	}
}

class Point {
	constructor(x, y, z, color) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.color = color || "#fff";
	}
	toMatrix() {
		return new Matrix([
			[this.x], 
			[this.y], 
			[this.z],
			[1]
		]);
	}
}

class Vector {
	constructor(x, y, z, w) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
	toMatrix(w) {
		return new Matrix([[this.x], [this.y], [this.z], [w]]);
	}
	toScale() {
		return new Matrix([
			[this.x, 0, 0, 0],
			[0, this.y, 0, 0],
			[0, 0, this.z, 0],
			[0, 0, 0, 1],
		]);
	}
	toTranslation() {
		return new Matrix([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[this.x, this.y, this.z, 1],
		]);
	}
	dotProd(other) {
		let t = 0;
		t += this.x*other.x;
		t += this.y*other.y;
		t += this.z*other.z;
		return t;
	}
	crossProd(other) {
		let x = this.y*other.z - other.y*this.z;
		let y = this.z*other.x - other.z*this.x;
		let z = this.x*other.y - other.x*this.y;
		return new Vector(x, y, z);
	}
}
