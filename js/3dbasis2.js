class Matrix {

	constructor(nRows, nCols, array) {
		let size = nRows*nCols;
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

	mul(other) {
		if (other instanceof Matrix) {
			let res = new Matrix(this.nRows, other.nCols);
			Matrix.mul(this.array, this.nRows, this.nCols, other.array, other.nCols, res.array);
			return res;
		}
		let res = new Matrix(this.nRows, this.nCols);
		for (let src=this.array, dst=res.array, i=this.size; i--;) {
			dst[i] = src[i]*other;
		}
		return res;
	}

	/* Only use tMul when the number of elements in the matrix doesn't change with the
	 * multiplication */
	tMul(other) {
		if (other instanceof Matrix) {
			const array = this.array;
			const buffer = this.buffer || (this.buffer = new Float32Array(this.size));
			Matrix.mul(array, this.nRows, this.nCols, other.array, other.nCols, buffer);
			this.array = buffer;
			this.buffer = array;
			this.nCols = other.nCols;
			return this;
		}
		for (let a=this.array, i=this.size; i; a[--i] *= other);
		return this;
	}

	transposed() {
		const {nRows, nCols} = this;
		const res = new Matrix(nCols, nRows);
		Matrix.transpose(this.array, nRows, nCols, res.array);
		return res;
	}

	transpose() {
		const buffer = this.buffer || (this.buffer = new Float32Array(this.size));
		const {nRows, nCols, array} = this;
		Matrix.transpose(array, nRows, nCols, buffer);
		this.nRows = nCols;
		this.nCols = nRows;
		this.array = buffer;
		this.buffer = array;
		return this;
	}

	toString() {
		let str = "";
		for (let i=this.nRows, c=0; i--;) {
			for (let j=this.nCols; j--; ++c) {
				str += this.array[c];
				if (j) str += ", ";
			}
			if (i) str += "\n";
		}
		return str;
	}

}

class Vector extends Matrix {
	constructor(arg) {
		if (arg instanceof Float32Array || arg instanceof Array) {
			super(arg.length, 1, arg);
		} else if (arg instanceof Vector) {
			super(arg.size, 1, arg.array.slice());
		} else {
			super(arg, 1);
		}
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
}

class Vec2 extends Vec {
	constructor(arg1, arg2) {
		const nArgs = arguments.length;
	}
}

let m1 = new Matrix(3, 3, [
	19, 20, 21,
	22, 23, 24,
	25, 26, 27
]);

let m2 = new Matrix(3, 4, [
	10, 11, 12, 13,
	14, 15,	16, 17,
	18, 19, 20, 21
]);
