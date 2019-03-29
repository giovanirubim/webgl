class Mat {
	
	constructor(nRows, nCols, values) {
		if (nCols === undefined) {
			nCols = nRows;
		}
		this.nRows = nRows;
		this.nCols = nCols;
		this.buffer = null;
		const size = nRows*nCols;
		this.size = size;
		if (values !== undefined) {
			if (values.length === size) {
				this.array = new Float32Array(values);
			} else {
				const a = this.array = new Float32Array(size);
				const n = Math.min(values.length, size);
				for (let i=0; i<n; ++i) {
					a[i] = values[i];
				}
			}
		} else {
			this.array = new Float32Array(size);
		}
		this.row = {};
		this.col = {};
		for (let i=0, rowShift=0; i<nRows; ++i, rowShift+=nCols) {
			const getSetObj = {};
			const row = i;
			for (let j=0; j<nCols; ++j) {
				const shift = rowShift + j;
				const args = {
					get: _ => {
						return this.array[shift];
					},
					set: value => {
						this.array[shift] = value;
					}
				};
				Object.defineProperty(this, "r" + i + "c" + j, args);
				Object.defineProperty(this, "c" + j + "r" + i, args);
				Object.defineProperty(getSetObj, j, args);
			}
			this[i] = getSetObj;
			Object.defineProperty(this.row, row, {
				get: _ => {
					return this.array.slice(rowShift, rowShift + nCols);
				},
				set: values => {
					const {nCols, array} = this
					if (typeof values === "number") {
						for (let i = nCols; i--;) {
							array[i + rowShift] = values;
						}
					} else {
						for (let i = Math.min(values.length, nCols); i--;) {
							array[i + rowShift] = values[i];
						}
					}
				}
			});
		}
		for (let i=0; i<nCols; ++i) {
			const col = i;
			Object.defineProperty(this.col, col, {
				get: _ => {
					const {nRows, array} = this;
					const res = array.slice(0, nRows);
					for (let i=0, j=col; i<nRows; ++i, j+=nRows) {
						res[i] = array[j];
					}
					return res;
				},
				set: values => {
					const {nRows, array} = this;
					if (typeof values === "number") {
						for (let i=nRows; i--;) {
							array[nCols*i + col] = values;
						}
					} else {
						for (let i=Math.min(nRows, values.length); i--;) {
							array[nCols*i + col] = values[i];
						}
					}
				}
			});
		}
	}

	static selfTransposeSquared(src, n) {
		const e = n - 1;
		for (let i=0; i<e; ++i) {
			for (let j=1; j<n; ++j) {
				const a = i*n + j;
				const b = j*n + i;
				const aux = src[a];
				src[a] = src[b];
				src[b] = aux;
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

	static safeInvert(src, n, dst, aux) {
		const l = src.length;
		const d = n + 1;
		for (let i=0; i<l; i++) {
			aux[i] = src[i];
			dst[i] = 0 | (i%d===0);
		}
		for (let i=0, a=0; i<n; i++, a+=n) {
			let b = a + i;
			let c = aux[b];
			if (c === 0) {
				for (let j=b+n; j<l; j+=n) {
					if (aux[j] !== 0) {
						for (let k=a, l=j-i, end=k+n; k<end; ++k, ++l) {
							c = aux[k];
							aux[k] = aux[l];
							aux[l] = c;
							c = dst[k];
							dst[k] = dst[l];
							dst[l] = c;
						}
						break;
					}
				}
				c = aux[b];
				if (c === 0) {
					throw new Error("Fail to invert matrix");
				}
			}
			const m = 1/c;
			for (let j=a+n; --j>=a;) {
				aux[j] *= m;
				dst[j] *= m;
			}
			for (let j=0, c=0; j<n; j++, c+=n) {
				if (j === i) {
					continue;
				}
				const d = aux[c + i];
				for (let k=c, j=a, end=k+n; k<end; ++k, ++j) {
					aux[k] -= d*aux[j];
					dst[k] -= d*dst[j];
				}
			}
		}
		return dst;
	}

	static invert(src, n, dst) {
		const l = src.length;
		const d = n + 1;
		for (let i=0; i<l; i++) {
			dst[i] = 0 | (i%d === 0);
		}
		for (let i=0, a=0; i<n; i++, a+=n) {
			let b = a + i;
			let c = src[b];
			if (c === 0) {
				for (let j=b+n; j<l; j+=n) {
					if (src[j] !== 0) {
						for (let k=a, l=j-i, end=k+n; k<end; ++k, ++l) {
							c = src[k];
							src[k] = src[l];
							src[l] = c;
							c = dst[k];
							dst[k] = dst[l];
							dst[l] = c;
						}
						break;
					}
				}
				c = src[b];
				if (c === 0) {
					throw new Error("Fail to invert matrix");
				}
			}
			const m = 1/c;
			for (let j=a+n; --j>=a;) {
				src[j] *= m;
				dst[j] *= m;
			}
			for (let j=0, c=0; j<n; j++, c+=n) {
				if (j === i) {
					continue;
				}
				const d = src[c + i];
				for (let k=c, j=a, end=k+n; k<end; ++k, ++j) {
					src[k] -= d*src[j];
					dst[k] -= d*dst[j];
				}
			}
		}
		return dst;
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

	cpMul(other) {
		const {nRows, nCols, array} = this;
		const res = new Mat(nRows, other.nCols);
		Mat.mul(array, nRows, nCols, other.array, other.nCols, res.array);
		return res;
	}

	mul(other) {
		const {nRows, nCols, array} = this;
		let buffer = this.buffer;
		if (buffer === null) {
			this.buffer = buffer = new Float32Array(this.size);
		}
		Mat.mul(array, nRows, nCols, other.array, other.nCols, buffer);
		this.array = buffer;
		this.buffer = array;
	}

	inverted() {
		const {nRows, array} = this;
		const res = new Mat(nRows, nRows);
		let buffer = this.buffer;
		if (buffer === null) {
			buffer = this.buffer = new Float32Array(this.size);
		}
		Mat.safeInvert(array, nRows, res.array, buffer);
		return res;
	}

	invert() {
		const {nRows, array} = this;
		let buffer = this.buffer;
		if (buffer === null) {
			buffer = this.buffer = new Float32Array(this.size);
		}
		Mat.invert(array, nRows, buffer);
		this.array = buffer;
		this.buffer = array;
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

	get str() {
		const {nRows, nCols, array} = this;
		const col_len = new Array(nCols).fill(0);
		for (let i=0; i<nRows; ++i) {
			for (let j=0; j<nCols; ++j) {
				const len = array[i*nCols + j].toString().length;
				col_len[j] = Math.max(col_len[j], len);
			}
		}
		let res = "";
		for (let i=0; i<nRows; ++i) {
			if (res) {
				res += ",\n";
			}
			for (let j=0; j<nCols; ++j) {
				if (j) {
					res += ", ";
				}
				const str = array[i*nCols + j].toString();
				res += " ".repeat(col_len[j] - str.length) + str;
			}
		}
		return res;
	}

}

function recursivePush(array, item) {
	if (item instanceof Mat) {
		item.array.forEach(i => recursivePush(array, i));
	} else if (item && item.length !== undefined) {
		const n = item.length;
		for (let i=0; i<n; ++i) {
			recursivePush(array, item[i]);
		}
	} else {
		array.push(item);
	}
	return array.length;
}

function mat4() {
	const array = [];
	recursivePush(array, arguments);
	return new Mat(4, 4, array);
};

function vec4() {
	const array = [];
	recursivePush(array, arguments);
	return new Mat(4, 1, array);
};
