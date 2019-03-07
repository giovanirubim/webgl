class Mat {

	constructor(nRows, nCols, array) {
		const size = nRows*nCols;
		this.nRows = nRows;
		this.nCols = nCols;
		this.size = size;
		if (array instanceof Float32Array) {
			this.array = array;
		} else if (array instanceof Array) {
			this.array = new Float32Array(array);
		} else {
			this.array = new Float32Array(size);
		}
		this.buffer = null;
	}

	static mul(src1, nRows1, nCols1, src2, nCols2, dst) {
		for (let i=0, c=0; i<nRows1; i++) {
			const a = nCols1*i;
			for (let j=0; j<nCols2; j++, c++) {
				dst[c] = 0;
				for (let k=0; k<nCols1; k++) {
					dst[c] += src1[a + k]*src2[nCols2*k + j];
				}
			}
		}
	}

	static transpose(src, nRows, nCols, dst) {
		for (let i=0, a=0; i<nRows; i++, a+=nCols) {
			for (let j=0, b=0; j<nCols; j++, b+=nRows) {
				dst[b + i] = src[a + j];
			}
		}
	}

	place(args) {
		if (args.length === 1 && typeof args[0] === "number") {
			this.array.fill(args[0]);
			return this;
		}
		const {array, size} = this;
		let l = 0;
		for (let i=0, n=args.length; i<n && l<size; ++i) {
			let item = args[i];
			if (item instanceof Mat) {
				item = item.array;
			}
			if (item instanceof Float32Array || item instanceof Array) {
				for (let i=0, n=item.length; i<n && l<size; ++i) {
					array[l++] = item[i];
				}
			} else {
				array[l++] = item;
			}
		}
		if (l < size) {
			throw new Error("Bad arguments: missing values");
		}
		if (l > size) {
			throw new Error("Bad arguments: too many values");
		}
		return this;
	}

	add(other) {
		if (typeof other === "number") {
			const dst = this.array.slice();
			const res = new Mat(this.nRows, this.nCols, dst);
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] += other;
			}
			return res;
		}
		if (other.size === this.size) {
			const dst = this.array.slice();
			const src = other.array;
			const res = new Mat(this.nRows, this.nCols, dst);
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] += src[i];
			}
			return res;
		}
		throw new Error();
	}

	sadd(other) {
		if (typeof other === "number") {
			const dst = this.array;
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] += other;
			}
			return this;
		}
		if (other.size === this.size) {
			const dst = this.array;
			const src = other.array;
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] += src[i];
			}
			return this;
		}
		throw new Error();
	}

	mul(other) {
		if (typeof other === "number") {
			const res = new Mat(this.nRows, this.nCols);
			const src = this.array;
			const dst = res.array;
			for (let i=this.size; i--;) {
				dst[i] = src[i]*other;
			}
			return res;
		}
		if (this.nCols === other.nRows) {
			const res = new Mat(this.nRows, other.nCols);
			Mat.mul(this.array, this.nRows, this.nCols, other.array, other.nCols, res.array);
			return res;
		}
		if (this.nRows === other.nCols) {
			return other.mul(this);
		}
		if (other.size === this.size) {
			const src = other.array;
			const dst = this.array.slice();
			const res = new Mat(this.nRows, this.nCols, dst);
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] *= src[i];
			}
			return res;
		}
		throw new Error();
	}

	smul(other) {
		if (typeof other === "number") {
			const dst = this.array;
			for(let i=0, n=this.size; i<n; ++i) {
				dst[i] *= other;
			}
			return this;
		}
		if (this.nCols === other.nRows) {
			const array = this.array;
			let buffer = this.buffer;
			if (buffer === null) {
				this.buffer = buffer = new Float32Array(this.size);
			}
			Mat.mul(array, this.nRows, this.nCols, other.array, other.nCols, buffer);
			this.array = buffer;
			this.buffer = array;
			return this;
		}
		if (this.nRows === other.nCols) {
			const array = this.array;
			let buffer = this.buffer;
			if (buffer === null) {
				this.buffer = buffer = new Float32Array(this.size);
			}
			Mat.mul(other, other.nRows, other.nCols, array, this.nCols, buffer);
			this.array = buffer;
			this.buffer = array;
			return this;
		}
		if (other.size === this.size) {
			const src = other.array;
			const dst = this.array;
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] *= src[i];
			}
			return this;
		}
		throw new Error();
	}

	div(other) {
		if (typeof other === "number") {
			return this.mul(1/other);
		} else if (other.size === this.size) {
			const src = other.array;
			const dst = this.array.slice();
			const res = new Mat(this.nRows, this.nCols, dst);
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] /= src[i];
			}
			return res;
		}
		throw new Error();
	}

	sdiv(other) {
		if (typeof other === "number") {
			return this.smul(1/other);
		}
		if (other.size === this.size) {
			const src = other.array;
			const dst = this.array;
			for (let i=0, n=this.size; i<n; ++i) {
				dst[i] /= src[i];
			}
			return this;
		}
		throw new Error();
	}

	length() {
		const {array, size} = this;
		const res = new Mat(this.nRows, this.nCols, this.array.slice());
		const dst = res.array;
		let t = 0;
		for (let i=0; i<size; ++i) {
			const x = dst[i];
			t += x*x;
		}
		return Math.sqrt(t);
	}

	normalized() {
		const {array, size} = this;
		const res = new Mat(this.nRows, this.nCols, this.array.slice());
		const dst = res.array;
		let t = 0;
		for (let i=0; i<size; ++i) {
			const x = dst[i];
			t += x*x;
		}
		t = 1/Math.sqrt(t);
		for (let i=0; i<size; ++i) {
			dst[i] *= t;
		}
		return res;
	}

	transposed() {
		const {nRows, nCols} = this;
		const res = new Mat(nCols, nRows);
		Mat.transpose(this.array, nRows, nCols, res.array);
		return res;
	}

	transpose() {
		const {nRows, nCols, array} = this;
		let buffer = this.buffer;
		if (buffer === null) {
			buffer = new Float32Array(this.size);
		}
		Mat.transpose(this.array, nRows, nCols, buffer);
		this.buffer = array;
		this.array = buffer;
		this.nRows = nCols;
		this.nCols = nRows;
		return this;
	}

	copy(row, col, nRows, nCols) {
		const res = new Mat(nRows, nCols);
		const src = this.array;
		const dst = res.array;
		const mul = this.nCols;
		let a = row*mul;
		let b = a + col;
		for (let i=0, c=0; i<nRows; ++i, a+=mul, b+=mul) {
			for (let j=b, e=b+nCols; j<e; ++j, ++c) {
				dst[c] = src[j];
			}
		}
		return res;
	}

	paste(other, row, col) {
		const {nRows, nCols} = other;
		const res = new Mat(this.nRows, this.nCols, this.array.slice());
		const dst = res.array, src = other.array;
		const a = this.nCols;
		const d = nRows*nCols;
		let b = a*row + col;
		for (let c=0; c<d; b+=a, c+=nCols) {
			for (let j=0; j<nCols; ++j) {
				dst[b + j] = src[c + j];
			}
		}
		return res;
	}

	toEulerRotation(order) {
		order = (order || "").trim().toUpperCase() || "XYZ";
		let cx = Math.cos(this.x);
		let sx = Math.sin(this.x);
		let cy = Math.cos(this.y);
		let sy = Math.sin(this.y);
		let cz = Math.cos(this.z);
		let sz = Math.sin(this.z);
		if (order === "XYZ") return new Mat(4, 4, new Float32Array([
			 cz*cy, sz*cx + cz*sy*sx, sz*sx - cz*sy*cx, 0,
			-sz*cy, cz*cx - sz*sy*sx, cz*sx + sz*sy*cx, 0,
			    sy,           -cy*sx,            cy*cx, 0,
			     0,                0,                0, 1
		]));
		if (order === "XZY") return new Mat(4, 4, new Float32Array([
			cy*cz, sy*sx + cy*sz*cx, cy*sz*sx - sy*cx, 0,
			  -sz,            cz*cx,            cz*sx, 0,
			sy*cz, sy*sz*cx - sx*cy, cy*cx + sy*sz*sx, 0,
			    0,                0,                0, 1
		]));
		if (order === "YXZ") return new Mat(4, 4, new Float32Array([
			sz*sx*sy + cz*cy, sz*cx, sz*sx*cy - sy*cz, 0,
			cz*sx*sy - sz*cy, cz*cx, cz*sx*cy + sz*sy, 0,
			           cx*sy,   -sx,            cx*cy, 0,
			               0,     0,                0, 1
		]));
		if (order === "YZX") return new Mat(4, 4, new Float32Array([
			           cz*cy,     sz,           -sy*cz, 0,
			sx*sy - sz*cy*cx,  cx*cz, sx*cy + cx*sz*sy, 0,
			cx*sy + sx*sz*cy, -sx*cz, cx*cy - sx*sz*sy, 0,
			               0,      0,                0, 1
		]));
		if (order === "ZXY") return new Mat(4, 4, new Float32Array([
			cy*cz - sy*sx*sz, sy*sx*cz + cy*sz, -sy*cx, 0,
			          -sz*cx,            cx*cz,     sx, 0,
			cy*sx*sz + sy*cz, sy*sz - sx*cz*cy,  cy*cx, 0,
			               0,                0,      0, 1
		]));
		if (order === "ZYX") return new Mat(4, 4, new Float32Array([
			           cy*cz,            cy*sz,   -sy, 0,
			sx*sy*cz - sz*cx, sx*sy*sz + cx*cz, sx*cy, 0,
			cx*sy*cz + sx*sz, cx*sy*sz - sx*cz, cx*cy, 0,
			               0,                0,     0, 1
		]));
	}

	toTranslation() {
		const {x, y, z} = this;
		return new Mat(4, 4, [
			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1,
		]);
	}

	toScale() {
		const {x, y, z} = this;
		return new Mat(4, 4, [
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		]);
	}

	set x(val) {
		this.array[0] = val;
	}
	set r(val) {
		this.array[0] = val;
	}
	set y(val) {
		this.array[1] = val;
	}
	set g(val) {
		this.array[1] = val;
	}
	set z(val) {
		this.array[2] = val;
	}
	set b(val) {
		this.array[2] = val;
	}
	set w(val) {
		this.array[3] = val;
	}
	set a(val) {
		this.array[3] = val;
	}
	get x() {
		return this.array[0];
	}
	get r() {
		return this.array[0];
	}
	get y() {
		return this.array[1];
	}
	get g() {
		return this.array[1];
	}
	get z() {
		return this.array[2];
	}
	get b() {
		return this.array[2];
	}
	get w() {
		return this.array[3];
	}
	get a() {
		return this.array[3];
	}
	get xy() {
		return new Mat(2, 1, this.array.slice(0, 2));
	}
	get xyz() {
		return new Mat(3, 1, this.array.slice(0, 3));
	}

	toString() {
		let str = "";
		const {nRows, nCols, array} = this;
		for (let i=0; i<nRows; ++i) {
			if (i) str += ",\n";
			for (let j=0; j<nCols; ++j) {
				if (j) {
					str += ", ";
				}
				str += array[i*nCols + j];
			}
		}
		return str;
	}

	get str() {
		return this.toString();
	}
	get tstr() {
		return this.transposed().toString();
	}
	get vstr() {
		return this.array.join(", ");
	}

}

function vec2() {
	return new Mat(2, 1).place(arguments);
}

function vec3() {
	return new Mat(3, 1).place(arguments);
}

function vec4() {
	return new Mat(4, 1).place(arguments);
}

function mat2() {
	return new Mat(2, 2).place(arguments);
}

function mat3() {
	return new Mat(3, 3).place(arguments);
}

function mat4() {
	return new Mat(4, 4).place(arguments);
}

function mat2x3() {
	return new Mat(2, 3).place(arguments);
}

function mat2x4() {
	return new Mat(2, 4).place(arguments);
}

function mat3x2() {
	return new Mat(3, 2).place(arguments);
}

function mat3x4() {
	return new Mat(3, 4).place(arguments);
}

function mat4x2() {
	return new Mat(4, 2).place(arguments);
}

function mat4x3() {
	return new Mat(4, 3).place(arguments);
}
