class Mat {
	constructor(arg) {
		if (typeof arg === "number") {
			(this.v = new Float32Array(16)).fill(arg);
			return;
		}
		if (!arg) {
			this.v = new Float32Array(16);
			return;
		}
		if (arg instanceof Array) {
			if (arg[0] instanceof Array) {
				let v = this.v = new Float32Array(16);
				for (let i=0; i<4; ++i) {
					let c = i << 2;
					let row = arg[i];
					for (let j=0; j<4; ++j) {
						v[c|j] = row[j];
					}
				}
				return;
			}
			this.v = new Float32Array(arg);
			return;
		}
	}
	mul(arg) {
		let res = new Mat(0);
		let v1 = this.v;
		let v2 = arg.v;
		let v3 = res.v;
		let f1 = (i, j) => v1[i*4 + j];
		let f2 = (i, j) => v2[i*4 + j];
		let f3 = (i, j, v) => v3[i*4 + j] += v;
		for (let i=0; i<4; ++i) {
			for (let j=0; j<4; ++j) {
				for (let k=0; k<4; ++k) {
					f3(i, j, f1(i, k)*f2(k, j));
				}
			}
		}
		return res;
	}
	toString() {
		let res = "";
		for (let i=0; i<4; ++i) {
			let c = i << 2;
			if (i) res += "\n"
			for (let j=0; j<4; ++j) {
				if (j) res += ", ";
				res += this.v[c|j];
			}
		}
		return res;
	}
	get m00() {return this.v[0];}
	set m00(val) {this.v[0] = value;}
	get m01() {return this.v[1];}
	set m01(val) {this.v[1] = value;}
	get m02() {return this.v[2];}
	set m02(val) {this.v[2] = value;}
	get m03() {return this.v[3];}
	set m03(val) {this.v[3] = value;}
	get m10() {return this.v[4];}
	set m10(val) {this.v[4] = value;}
	get m11() {return this.v[5];}
	set m11(val) {this.v[5] = value;}
	get m12() {return this.v[6];}
	set m12(val) {this.v[6] = value;}
	get m13() {return this.v[7];}
	set m13(val) {this.v[7] = value;}
	get m20() {return this.v[8];}
	set m20(val) {this.v[8] = value;}
	get m21() {return this.v[9];}
	set m21(val) {this.v[9] = value;}
	get m22() {return this.v[10];}
	set m22(val) {this.v[10] = value;}
	get m23() {return this.v[11];}
	set m23(val) {this.v[11] = value;}
	get m30() {return this.v[12];}
	set m30(val) {this.v[12] = value;}
	get m31() {return this.v[13];}
	set m31(val) {this.v[13] = value;}
	get m32() {return this.v[14];}
	set m32(val) {this.v[14] = value;}
	get m33() {return this.v[15];}
	set m33(val) {this.v[15] = value;}
}

class Vec {
	constructor(arg1, arg2, arg3, arg4) {
		this.v = new Float32Array([
			arg1 || 0, arg2 || 0, arg3 || 0, arg4 || 0
		]);
	}
	toScale() {
		return new Mat([
			this.x, 0, 0, 0,
			0, this.y, 0, 0,
			0, 0, this.z, 0,
			0, 0, 0, 1
		]);
	}
	toTranslation() {
		return new Mat([
			1, 0, 0, this.x,
			0, 1, 0, this.y,
			0, 0, 1, this.z,
			0, 0, 0, 1
		]);
	}
	get x() {return this.v[0];}
	set x(val) {this.v[0] = val;}
	get y() {return this.v[1];}
	set y(val) {this.v[1] = val;}
	get z() {return this.v[2];}
	set z(val) {this.v[2] = val;}
	get w() {return this.v[3];}
	set w(val) {this.v[3] = val;}
	get r() {return this.v[0];}
	set r(val) {this.v[0] = val;}
	get g() {return this.v[1];}
	set g(val) {this.v[1] = val;}
	get b() {return this.v[2];}
	set b(val) {this.v[2] = val;}
	get a() {return this.v[3];}
	set a(val) {this.v[3] = val;}
}

class EulerRotation {
	constructor(x, y, z, order) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.order = (order || "XYZ").trim().toUpperCase();
	}
	toMatrix() {
		let cx = Math.cos(this.x);
		let sx = Math.sin(this.x);
		let cy = Math.cos(this.y);
		let sy = Math.sin(this.y);
		let cz = Math.cos(this.z);
		let sz = Math.sin(this.z);
		if (this.order === "XYZ") return new Mat([
			 cz*cy, sz*cx + cz*sy*sx, sz*sx - cz*sy*cx, 0,
			-sz*cy, cz*cx - sz*sy*sx, cz*sx + sz*sy*cx, 0,
			    sy,           -cy*sx,            cy*cx, 0,
			     0,                0,                0, 1
		]);
		if (this.order === "XZY") return new Mat([
			cy*cz, sy*sx + cy*sz*cx, cy*sz*sx - sy*cx, 0,
			  -sz,            cz*cx,            cz*sx, 0,
			sy*cz, sy*sz*cx - sx*cy, cy*cx + sy*sz*sx, 0,
			    0,                0,                0, 1
		]);
		if (this.order === "YXZ") return new Mat([
			sz*sx*sy + cz*cy, sz*cx, sz*sx*cy - sy*cz, 0,
			cz*sx*sy - sz*cy, cz*cx, cz*sx*cy + sz*sy, 0,
			           cx*sy,   -sx,            cx*cy, 0,
			               0,     0,                0, 1
		]);
		if (this.order === "YZX") return new Mat([
			           cz*cy,     sz,           -sy*cz, 0,
			sx*sy - sz*cy*cx,  cx*cz, sx*cy + cx*sz*sy, 0,
			cx*sy + sx*sz*cy, -sx*cz, cx*cy - sx*sz*sy, 0,
			               0,      0,                0, 1
		]);
		if (this.order === "ZXY") return new Mat([
			cy*cz - sy*sx*sz, sy*sx*cz + cy*sz, -sy*cx, 0,
			          -sz*cx,            cx*cz,     sx, 0,
			cy*sx*sz + sy*cz, sy*sz - sx*cz*cy,  cy*cx, 0,
			               0,                0,      0, 1
		]);
		if (this.order === "ZYX") return new Mat([
			           cy*cz,            cy*sz,   -sy, 0,
			sx*sy*cz - sz*cx, sx*sy*sz + cx*cz, sx*cy, 0,
			cx*sy*cz + sx*sz, cx*sy*sz - sx*cz, cx*cy, 0,
			               0,                0,     0, 1
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
		return new Mat([
			(b - c - d + a)*e, 2*(f + g)*e,        2*(h - i)*e,        0,
			2*(f - g)*e,       (-b + c - d + a)*e, 2*(j + k)*e,        0,
			2*(h + i)*e,       2*(j - k)*e,        (-b - c + d + a)*e, 0,
			0,                 0,                  0,                  1
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