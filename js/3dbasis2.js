class Mat {

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
		if (other instanceof Mat) {
			let res = new Mat(this.nRows, other.nCols);
			Mat.mul(this.array, this.nRows, this.nCols, other.array, other.nCols, res.array);
			return res;
		}
		let res = new Mat(this.nRows, this.nCols);
		for (let src=this.array, dst=res.array, i=this.size; i--;) {
			dst[i] = src[i]*other;
		}
		return res;
	}

	transposed() {
		const {nRows, nCols} = this;
		const res = new Mat(nCols, nRows);
		Mat.transpose(this.array, nRows, nCols, res.array);
		return res;
	}

	toString() {
		let str = "";
		const {nRows, nCols, array} = this;
		for (let i=0; i<nRows; ++i) {
			if (i) str += ",\n";
			for (let j=0; j<nCols; ++j) {
				if (j) str += ", ";
				str += array[i*nCols + j];
			}
		}
		return str;
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
		return new Vec(this.array.slice(0, 2));
	}
	get xyz() {
		return new Vec(this.array.slice(0, 3));
	}

}

class Vec extends Mat {

	constructor(arg1, arg2, arg3, arg4) {
		let size = 0;
	}
	
	toString() {
		return this.array.join(", ");
	}

}
