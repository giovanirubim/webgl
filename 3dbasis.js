class Matrix {
	constructor(nrows, ncols) {
		this.nrows = nrows;
		this.ncols = ncols;
		this.array = new Float32Array(nrows*ncols);
	}
	get(row, col) {
		return this.array[row*this.ncols + col];
	}
	set(row, col, val) {
		this.array[row*this.ncols + col] = val;
		return this;
	}
	add(row, col, val) {
		this.array[row*this.ncols + col] += val;
		return this;
	}
	transposed() {
		let {nrows, ncols, array} = this;
		let m = new Matrix(ncols, nrows);
		for (let i=0; i<array.length; i++) {
			let row = Math.floor(i / ncols);
			let col = i % ncols;
			m.set(col, row, array[i]);
		}
		return m;
	}
	mul(other) {
		let nrows = this.nrows;
		let ncols = other.ncols;
		let n = this.ncols;
		let res = new Matrix(nrows, ncols);
		for (let i=0; i<nrows; i++) {
			for (let j=0; j<ncols; j++) {
				for (let k=0; k<n; k++) {
					res.add(i, j, this.get(i, k)*other.get(k, j));
				}
			}
		}
		return res;
	}
	copy(row, col, nrows, ncols) {
		let res = new Matrix(nrows, ncols);
		for (let i=0; i<nrows; i++) {
			for (let j=0; j<ncols; j++) {
				res.set(i, j, this.get(row + i, col + j));
			}
		}
		return res;
	}
	paste(row, col, m) {
		let {nrows, ncols} = m;
		for (let i=0; i<nrows; i++) {
			for (let j=0; j<ncols; j++) {
				this.set(row + i, col + j, m.get(i, j));
			}
		}
		return this;
	}
	place(array) {
		this.array = new Float32Array(array);
		return this;
	}
	toString() {
		let str = "";
		let n = this.ncols;
		let {nrows, array} = this;
		for (let i=0; i<nrows; i++) {
			if (str) {
				str += ",\n";
			}
			str += array.slice(n*i, n*(i + 1)).join(", ");
		}
		return str;
	}
}
class Vec4 extends Matrix {
	constructor(arg1, arg2, arg3, arg4) {
		super(4, 1);
		this.array[0] = arg1 || 0;
		this.array[1] = arg2 || 0;
		this.array[2] = arg3 || 0;
		this.array[3] = arg4 || 0;
	}
	set x(val) {this.array[0] = val;}
	set r(val) {this.array[0] = val;}
	set y(val) {this.array[1] = val;}
	set g(val) {this.array[1] = val;}
	set z(val) {this.array[2] = val;}
	set b(val) {this.array[2] = val;}
	set w(val) {this.array[3] = val;}
	set a(val) {this.array[3] = val;}
	get x() {return this.array[0];}
	get r() {return this.array[0];}
	get y() {return this.array[1];}
	get g() {return this.array[1];}
	get z() {return this.array[2];}
	get b() {return this.array[2];}
	get w() {return this.array[3];}
	get a() {return this.array[3];}
	toEulerRotation(order) {
		order = (order || "").trim().toUpperCase() || "XYZ";
		let cx = Math.cos(this.x);
		let sx = Math.sin(this.x);
		let cy = Math.cos(this.y);
		let sy = Math.sin(this.y);
		let cz = Math.cos(this.z);
		let sz = Math.sin(this.z);
		if (order === "XYZ") return new Mat4([
			 cz*cy, sz*cx + cz*sy*sx, sz*sx - cz*sy*cx, 0,
			-sz*cy, cz*cx - sz*sy*sx, cz*sx + sz*sy*cx, 0,
			    sy,           -cy*sx,            cy*cx, 0,
			     0,                0,                0, 1
		]);
		if (order === "XZY") return new Mat4([
			cy*cz, sy*sx + cy*sz*cx, cy*sz*sx - sy*cx, 0,
			  -sz,            cz*cx,            cz*sx, 0,
			sy*cz, sy*sz*cx - sx*cy, cy*cx + sy*sz*sx, 0,
			    0,                0,                0, 1
		]);
		if (order === "YXZ") return new Mat4([
			sz*sx*sy + cz*cy, sz*cx, sz*sx*cy - sy*cz, 0,
			cz*sx*sy - sz*cy, cz*cx, cz*sx*cy + sz*sy, 0,
			           cx*sy,   -sx,            cx*cy, 0,
			               0,     0,                0, 1
		]);
		if (order === "YZX") return new Mat4([
			           cz*cy,     sz,           -sy*cz, 0,
			sx*sy - sz*cy*cx,  cx*cz, sx*cy + cx*sz*sy, 0,
			cx*sy + sx*sz*cy, -sx*cz, cx*cy - sx*sz*sy, 0,
			               0,      0,                0, 1
		]);
		if (order === "ZXY") return new Mat4([
			cy*cz - sy*sx*sz, sy*sx*cz + cy*sz, -sy*cx, 0,
			          -sz*cx,            cx*cz,     sx, 0,
			cy*sx*sz + sy*cz, sy*sz - sx*cz*cy,  cy*cx, 0,
			               0,                0,      0, 1
		]);
		if (order === "ZYX") return new Mat4([
			           cy*cz,            cy*sz,   -sy, 0,
			sx*sy*cz - sz*cx, sx*sy*sz + cx*cz, sx*cy, 0,
			cx*sy*cz + sx*sz, cx*sy*sz - sx*cz, cx*cy, 0,
			               0,                0,     0, 1
		]);
	}
	toTranslation() {
		let {x, y, z} = this;
		return new Matrix(4, 4).place([
			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1,
		]);
	}
	toScale() {
		let {x, y, z} = this;
		return new Matrix(4, 4).place([
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1,
		]);
	}
}
class Mat4 extends Matrix {
	constructor(array) {
		super(4, 4);
		if (array) {
			this.place(array);
		}
	}
}
